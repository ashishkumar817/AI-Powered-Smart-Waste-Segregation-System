import email
import os
import base64
import numpy as np
import cv2
import time
import threading
import queue

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from ultralytics import YOLO
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
import json
from config import Config
from services.email_service import mail, send_email
from datetime import datetime, timedelta
from services.otp_service import generate_otp
from flask_mail import Message
from services.telegram_service import send_telegram_message
from collections import Counter
from werkzeug.utils import secure_filename
from collections import Counter
from flask import send_from_directory




app = Flask(__name__)
app.config.from_object(Config)
# Allow CORS for all domains for local development
CORS(app, resources={r"/api/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})



db = SQLAlchemy(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
mail.init_app(app)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# ----------------- Database Models -----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(50), unique=True, nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user')
    phone_number = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    history = db.relationship(
        'DetectionHistory',
        backref='user',
        lazy=True
    )

class PasswordOTP(db.Model):
    __tablename__ = "password_otps"

    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(
        db.String(120),
        nullable=False,
        index=True
    )

    otp = db.Column(
        db.String(6),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    expires_at = db.Column(
        db.DateTime,
        nullable=False
    )

    verified = db.Column(
        db.Boolean,
        default=False
    )

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

class DetectionHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    waste_type = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    method = db.Column(db.String(200), nullable=False)
    inference_time = db.Column(db.Float, nullable=True)  # milliseconds

# Initialize DB (creates tables if they don't exist)
with app.app_context():
    db.create_all()
    

    # Create default admin if it doesn't exist
    admin = User.query.filter_by(username="Ashish").first()

    if not admin:
        hashed_password = bcrypt.generate_password_hash("admin123").decode("utf-8")

        admin = User(
            username="Ashish",
            email="ashishkumarkaup@gmail.com",
            password_hash=hashed_password,
            role="admin"
        )

        db.session.add(admin)
        db.session.commit()

        print("✅ Default admin account created.")

        saved = PasswordOTP.query.all()
        print("Saved OTPs:", len(saved))
        for row in saved:
            print(row.id, row.email, row.otp)

# Load the YOLOv8 model
MODEL_PATH = "runs/detect/runs/waste_detection-3/weights/best.pt"
print(f"Loading model from {MODEL_PATH}...")
model = YOLO(MODEL_PATH)

# Class mappings based on dataset/data.yaml
CLASS_NAMES = {
    0: "Biodegradable",
    1: "Cardboard",
    2: "Glass",
    3: "Metal",
    4: "Paper",
    5: "Plastic"
}

# Disposal recommendations
DISPOSAL_RECOMMENDATIONS = {
    "Biodegradable": "Compost Bin - Suitable for composting or green waste.",
    "Cardboard": "Paper Recycle - Flatten before disposing in the recycling bin.",
    "Glass": "Glass Recycle - Rinse before recycling. Do not mix with normal trash.",
    "Metal": "Metal/Can Recycle - Rinse cans. Remove non-metal parts if possible.",
    "Paper": "Paper Recycle - Keep dry and clean. Do not recycle soiled paper (like greasy pizza boxes).",
    "Plastic": "Recycle Bin - Ensure it is empty and rinsed. Check local guidelines for plastic types."
}

# UI Color mappings
UI_COLORS = {
    "Biodegradable": {"color": "text-green-400", "borderColor": "border-green-400"},
    "Cardboard": {"color": "text-orange-400", "borderColor": "border-orange-400"},
    "Glass": {"color": "text-teal-400", "borderColor": "border-teal-400"},
    "Metal": {"color": "text-gray-400", "borderColor": "border-gray-400"},
    "Paper": {"color": "text-yellow-400", "borderColor": "border-yellow-400"},
    "Plastic": {"color": "text-blue-400", "borderColor": "border-blue-400"}
}

# ----------------- Auth Routes -----------------
@app.route('/api/register', methods=['POST'])
def register():

    data = request.json

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    try:

        send_email(
            recipient=email,
            subject="Welcome to Smart Waste Segregation",
            html_template="welcome_email.html",
            username=username
        )

        send_email(
            recipient="ashishkumarkaup@gmail.com",
            subject="New User Registration",
            html_template="admin_notification.html",
            username=username,
            email=email
        )

        send_telegram_message(
            f"🎉 New User Registered!\n"
            f"Username: {username}\n"
            f"Email: {email}"
        )

    except Exception as e:
        print("Email Error:", e)

    return jsonify({
        "message": "User registered successfully"
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        identity_str = json.dumps({'id': user.id, 'username': user.username, 'role': user.role})
        access_token = create_access_token(identity=identity_str)
        return jsonify({
            "access_token": access_token, 
            "user": {"id": user.id, "username": user.username, "email": user.email, "role": user.role}
        }), 200

    return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    identity = get_jwt_identity()
    if isinstance(identity, str):
        current_user = json.loads(identity)
    else:
        current_user = identity

    user = User.query.get(current_user['id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == 'GET':
        stats = {}
        if user.role == 'admin':
            stats['total_users'] = User.query.count()
            stats['total_predictions'] = DetectionHistory.query.count()
            
            # Active users (logged in within last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            stats['active_users'] = User.query.filter(User.last_login >= thirty_days_ago).count()
            stats['total_images_processed'] = stats['total_predictions']
        else:
            user_history = DetectionHistory.query.filter_by(user_id=user.id).all()
            stats['images_uploaded'] = len(user_history)
            stats['total_predictions'] = len(user_history)
            
            if user_history:
                # Sort by date/time
                last_record = max(user_history, key=lambda x: f"{x.date} {x.time}")
                stats['last_prediction'] = f"{last_record.date} {last_record.time}"
                stats['avg_confidence'] = round(sum(h.confidence for h in user_history) / len(user_history), 2)
            else:
                stats['last_prediction'] = "N/A"
                stats['avg_confidence'] = 0

        return jsonify({
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "phone_number": user.phone_number,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "stats": stats
        }), 200

    if request.method == 'PUT':
        data = request.json
        new_username = data.get('username')
        new_email = data.get('email')
        new_password = data.get('password')
        new_phone = data.get('phone_number')

        if new_username and new_username != user.username:
            if User.query.filter_by(username=new_username).first():
                return jsonify({"error": "Username already exists"}), 400
            user.username = new_username
            
        if new_email and new_email != user.email:
            if User.query.filter_by(email=new_email).first():
                return jsonify({"error": "Email already registered"}), 400
            user.email = new_email
            
        if new_phone is not None:
            user.phone_number = new_phone
            
        if new_password:
            user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
            
        db.session.commit()
        
        return jsonify({
            "message": "Profile updated successfully",
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "phone_number": user.phone_number
        }), 200

@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    print("🔥 Forgot Password API Called")
    data = request.json
    email = data.get("email", "").strip().lower()

    print("=" * 50)
    print("Received Email:", email)

    user = User.query.filter_by(email=email).first()

    print("User Found:", user)

    if not user:
        print("❌ User NOT Found")
        return jsonify({
            "message": "If an account exists, an OTP has been sent."
        }), 200

    print("✅ User Found")

    PasswordOTP.query.filter_by(email=email).delete()

    otp = generate_otp()

    print("Generated OTP:", otp)

    otp_record = PasswordOTP(
        email=email,
        otp=otp,
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )

    db.session.add(otp_record)
    db.session.commit()

    print("✅ OTP Saved")
    print("\n===== PASSWORD OTP TABLE =====")

    all_otps = PasswordOTP.query.all()

    for otp_item in all_otps:
        print(
            otp_item.id,
            otp_item.email,
            otp_item.otp,
            otp_item.verified
        )

    print("==============================")

    try:
        send_email(
            recipient=email,
            subject="Password Reset OTP",
            html_template="otp_email.html",
            username=user.username,
            otp=otp
        )

        print("✅ Email Sent")

    except Exception as e:
        print("❌ Email Error:", e)

    return jsonify({
        "message": "If an account exists, an OTP has been sent."
    }), 200

@app.route("/api/verify-otp", methods=["POST"])
def verify_otp():

    data = request.get_json()

    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({
            "error": "Email and OTP are required."
        }), 400

    otp_record = PasswordOTP.query.filter_by(
        email=email,
        otp=otp
    ).first()

    if not otp_record:
        return jsonify({
            "error": "Invalid OTP."
        }), 400

    # OTP already used or expired
    if datetime.utcnow() > otp_record.expires_at or otp_record.verified:
        return jsonify({
        "error": "OTP is invalid or has expired."
    }), 400
    otp_record.verified = True

    db.session.commit()

    return jsonify({
        "message": "OTP verified successfully."
    }), 200

@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()

    email = data.get("email")
    new_password = data.get("password")

    if not email or not new_password:
        return jsonify({
            "error": "Email and password are required."
        }), 400

    # Find user
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "error": "User not found."
        }), 404

    # Find latest verified OTP
    otp = (
        PasswordOTP.query
        .filter_by(email=email, verified=True)
        .order_by(PasswordOTP.created_at.desc())
        .first()
    )

    if not otp:
        return jsonify({
            "error": "OTP verification required."
        }), 400

    if datetime.utcnow() > otp.expires_at:
        return jsonify({
            "error": "OTP has expired."
        }), 400

    # Hash the new password using Flask-Bcrypt
    hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")

    user.password_hash = hashed_password

    # Delete all OTPs for this email after successful reset
    PasswordOTP.query.filter_by(email=email).delete()

    db.session.commit()

    return jsonify({
        "message": "Password reset successfully."
    }), 200

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    message = data.get("message", "").strip()
    phone = data.get("phone", "").strip()
    subject = data.get("subject", "").strip()

    # Validation
    if not name or not email or not phone or not subject or not message:
        return jsonify({
        "error": "All fields are required."
    }), 400

    try:
        send_email(
        recipient="ashishkumarkaup@gmail.com",
        subject=f"📩 {subject}",
        html_template="contact_email.html",
        name=name,
        email=email,
        phone=phone,
        subject_text=subject,
        message=message
    )

        send_telegram_message(
            f"📩 New Contact Message!\n\n"
            f"Name: {name}\n"
            f"Email: {email}\n"
            f"Phone: {phone}\n"
            f"Subject: {subject}\n\n"
            f"Message:\n{message}"
        )

        return jsonify({
            "message": "Your message has been sent successfully."
        }), 200

    except Exception as e:
        print("Contact Email Error:", e)

        return jsonify({
            "error": "Unable to send message."
        }), 500

@app.route("/api/email-report", methods=["POST"])
@jwt_required()
def email_report():
    try:
        current_user = json.loads(get_jwt_identity())

        user = User.query.get(current_user["id"])

        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()

        pdf_data = data.get("pdf")

        if not pdf_data:
            return jsonify({"error": "PDF missing"}), 400

        pdf_base64 = pdf_data.split(",")[1]

        pdf_bytes = base64.b64decode(pdf_base64)

        msg = Message(
            subject="Smart Waste AI Detection Report",
            recipients=[user.email]
        )

        msg.html = render_template("report_email.html", username=user.username)

        msg.attach(
            "SmartWaste_Report.pdf",
            "application/pdf",
            pdf_bytes
        )

        print("Sending email to:", user.email)
        print("Subject:", msg.subject)
        print("Attachment size:", len(pdf_bytes))
        mail.send(msg)
        print("Email sent successfully!")
        print("Recipient email:", user.email)

        return jsonify({"message": "Report emailed successfully."}), 200

    except Exception as e:
        print("EMAIL REPORT ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    current_user = get_jwt_identity()
    if isinstance(current_user, str):
        current_user = json.loads(current_user)
        
    user_id = current_user['id']
    role = current_user['role']

    if role == 'admin':
        # Admin sees everything
        histories = DetectionHistory.query.order_by(DetectionHistory.id.desc()).all()
    else:
        # User sees their own
        histories = DetectionHistory.query.filter_by(user_id=user_id).order_by(DetectionHistory.id.desc()).all()

    result = []
    for h in histories:
        result.append({
            "id": h.id,
            "username": h.user.username if role == 'admin' else current_user['username'],
            "type": h.waste_type,
            "conf": h.confidence,
            "date": h.date,
            "time": h.time,
            "method": h.method,
            "inferenceTime": h.inference_time  # ms, may be None for old records
        })
        
    return jsonify(result), 200

# ----------------- Prediction Route -----------------
@app.route('/api/history', methods=['DELETE'])
@jwt_required()
def clear_history():
    current_user = get_jwt_identity()
    if isinstance(current_user, str):
        current_user = json.loads(current_user)
    
    user_id = current_user['id']
    role = current_user['role']
    
    if role == 'admin':
        # Admin clears all history globally
        DetectionHistory.query.delete()
    else:
        # User clears their own history
        DetectionHistory.query.filter_by(user_id=user_id).delete()
        
    db.session.commit()
    return jsonify({"message": "History cleared successfully"}), 200

@app.route('/api/history/<int:history_id>', methods=['DELETE'])
@jwt_required()
def delete_history_item(history_id):
    current_user = get_jwt_identity()
    if isinstance(current_user, str):
        current_user = json.loads(current_user)
    
    user_id = current_user['id']
    role = current_user['role']
    
    item = DetectionHistory.query.get_or_404(history_id)
    
    if role != 'admin' and item.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user = get_jwt_identity()
    if isinstance(current_user, str):
        current_user = json.loads(current_user)
        
    if current_user['role'] != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    users = User.query.all()
    user_list = []
    for u in users:
        scans_count = DetectionHistory.query.filter_by(user_id=u.id).count()
        user_list.append({
            "id": u.id,
            "username": u.username,
            "role": u.role,
            "scans_count": scans_count
        })
    return jsonify(user_list), 200

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = get_jwt_identity()
    if isinstance(current_user, str):
        current_user = json.loads(current_user)
        
    if current_user['role'] != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    user = User.query.get_or_404(user_id)
    # Delete their history first
    DetectionHistory.query.filter_by(user_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200

@app.route('/api/user/password', methods=['PUT'])
@jwt_required()
def update_password():
    current_user = get_jwt_identity()
    if isinstance(current_user, str):
        current_user = json.loads(current_user)
        
    user_id = current_user['id']
    data = request.json
    new_password = data.get('password')
    
    if not new_password or len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200

@app.route('/api/predict', methods=['POST'])
@jwt_required(optional=True)
def predict():
        try:
            img = None
            if 'image' in request.files:
                file = request.files['image']
                img_bytes = file.read()
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            elif request.json and 'image_base64' in request.json:
                data = request.json['image_base64']
                header, encoded = data.split(",", 1)
                img_bytes = base64.b64decode(encoded)
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            else:
                return jsonify({"error": "No image provided"}), 400

            if img is None:
                return jsonify({"error": "Failed to decode image"}), 400

            results = model.predict(source=img, conf=0.25, save=False, show=False)
            
            predictions = []
            processed_image_b64 = None
            speed = 0
            
            for result in results:
                speed = sum(result.speed.values()) if hasattr(result, 'speed') else 30.0
                im_array = result.plot()
                _, buffer = cv2.imencode('.jpg', im_array)
                processed_image_b64 = base64.b64encode(buffer).decode('utf-8')
                
                boxes = result.boxes
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item()) * 100
                    category = CLASS_NAMES.get(cls_id, "Unknown")
                    
                    predictions.append({
                        "category": category,
                        "confidence": round(conf, 1),
                        "disposal": DISPOSAL_RECOMMENDATIONS.get(category, "Unknown"),
                        "color": UI_COLORS.get(category, {}).get("color", "text-white"),
                        "borderColor": UI_COLORS.get(category, {}).get("borderColor", "border-white")
                    })

            predictions.sort(key=lambda x: x['confidence'], reverse=True)

            if not predictions:
                return jsonify({"error": "No objects detected"}), 404

            # Save to history if logged in
            current_user = get_jwt_identity()
            if current_user:
                if isinstance(current_user, str):
                    current_user = json.loads(current_user)
                # Group predictions like we did in frontend
                type_counts = {}
                total_conf = 0
                for pred in predictions:
                    type_counts[pred['category']] = type_counts.get(pred['category'], 0) + 1
                    total_conf += pred['confidence']
                
                summary_type = ", ".join([f"{cat} (x{count})" if count > 1 else cat for cat, count in type_counts.items()])
                avg_conf = total_conf / len(predictions)
                
                unique_categories = list(type_counts.keys())
                if len(unique_categories) > 1:
                    method = " | ".join([f"{cat} → {DISPOSAL_RECOMMENDATIONS.get(cat, 'Unknown').split(' - ')[0].strip()}" for cat in unique_categories])
                else:
                    method = DISPOSAL_RECOMMENDATIONS.get(unique_categories[0], "Unknown")
                
                now = datetime.now()
                new_history = DetectionHistory(
                    user_id=current_user['id'],
                    waste_type=summary_type,
                    confidence=round(avg_conf, 1),
                    date=now.strftime("%Y-%m-%d"),
                    time=now.strftime("%H:%M:%S"),
                    method=method,
                    inference_time=round(speed, 1)  # save measured ms
                )
                db.session.add(new_history)
                db.session.commit()
                
            response_data = {
                "predictions": predictions,
                "processed_image": f"data:image/jpeg;base64,{processed_image_b64}",
                "time": f"{round(speed)}ms",
                "saved_to_history": bool(current_user)
                
            }
            
            return jsonify(response_data)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
        

@app.route("/api/detect-video", methods=["POST"])
@jwt_required(optional=True)
def detect_video():
    try:
        if "video" not in request.files:
            return jsonify({"error": "No video uploaded"}), 400

        video = request.files["video"]
        filename = secure_filename(video.filename)
        
        # Save the input video
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        video.save(input_path)

        # Ensure output filename is .mp4
        base_filename = os.path.splitext(filename)[0]
        out_filename = f"{base_filename}_out.mp4"
        
        video_out_dir = os.path.join(OUTPUT_FOLDER, "video_detection")
        os.makedirs(video_out_dir, exist_ok=True)
        output_path = os.path.join(video_out_dir, out_filename)

        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            return jsonify({"error": "Failed to open uploaded video"}), 500

        # Get original video properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)

        # 1. Resize to max width 640
        max_width = 640
        if width > max_width:
            scale = max_width / width
            new_width = max_width
            new_height = int(height * scale)
        else:
            new_width = width
            new_height = height

        # Setup VideoWriter using avc1 (H.264) via Microsoft Media Foundation (MSMF) to avoid openh264 dll issues
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, cv2.CAP_MSMF, fourcc, fps, (new_width, new_height))

        counter = Counter()

        # 3. Queue for threaded writing
        write_queue = queue.Queue(maxsize=128)
        stop_event = threading.Event()

        def writer_thread():
            while not stop_event.is_set() or not write_queue.empty():
                try:
                    frame = write_queue.get(timeout=0.1)
                    out.write(frame)
                    write_queue.task_done()
                except queue.Empty:
                    continue

        writer = threading.Thread(target=writer_thread)
        writer.start()

        frame_idx = 0
        processed_count = 0
        
        total_inference_time = 0.0
        start_time = time.time()
        
        unique_objects = {}  # track_id -> class_name
        total_conf = 0.0
        conf_count = 0

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                    
                # Resize frame
                if width > max_width:
                    frame = cv2.resize(frame, (new_width, new_height))
                    
                # Process using tracker
                inference_start = time.time()
                results = model.track(source=frame, imgsz=640, verbose=False, persist=True)
                inference_time = time.time() - inference_start
                total_inference_time += inference_time
                processed_count += 1
                
                if results and results[0].boxes is not None:
                    boxes = results[0].boxes
                    if boxes.id is not None:
                        # Object tracking successful
                        for i in range(len(boxes.id)):
                            track_id = int(boxes.id[i])
                            cls_id = int(boxes.cls[i])
                            conf = float(boxes.conf[i])
                            
                            unique_objects[track_id] = model.names[cls_id]
                            total_conf += conf
                            conf_count += 1
                    else:
                        # Fallback (shouldn't happen with persist=True, but just in case)
                        for i in range(len(boxes.cls)):
                            cls_id = int(boxes.cls[i])
                            conf = float(boxes.conf[i])
                            # Use a fake ID based on total count to at least register something
                            unique_objects[f"untracked_{conf_count}"] = model.names[cls_id]
                            total_conf += conf
                            conf_count += 1
                
                # Annotate frame natively via YOLO
                annotated_frame = results[0].plot() if results else frame

                write_queue.put(annotated_frame)
                frame_idx += 1
                
        finally:
            stop_event.set()
            writer.join()
            
            cap.release()
            out.release()
            
            if os.path.exists(input_path):
                try:
                    os.remove(input_path)
                except:
                    pass

        total_processing_time = time.time() - start_time
        avg_inference_time_ms = (total_inference_time / processed_count * 1000) if processed_count > 0 else 0
        effective_fps = frame_idx / total_processing_time if total_processing_time > 0 else 0
        
        # Calculate unique summary
        counter = Counter(unique_objects.values())
        primary = counter.most_common(1)[0][0] if counter else None
        avg_conf = (total_conf / conf_count) if conf_count > 0 else 0.0
        video_duration = frame_idx / fps if fps > 0 else 0.0
        
        # Save to history if logged in
        current_user = get_jwt_identity()
        if current_user:
            if isinstance(current_user, str):
                current_user = json.loads(current_user)
                
            summary_type = ", ".join([f"{cat} (x{count})" if count > 1 else cat for cat, count in counter.items()])
            
            unique_categories = list(counter.keys())
            if len(unique_categories) > 1:
                method = " | ".join([f"{cat.title()} → {DISPOSAL_RECOMMENDATIONS.get(cat.title(), 'Unknown').split(' - ')[0].strip()}" for cat in unique_categories])
            elif len(unique_categories) == 1:
                method = DISPOSAL_RECOMMENDATIONS.get(unique_categories[0].title(), "Unknown")
            else:
                method = "No Waste Detected"
                
            if not summary_type:
                summary_type = "No Waste Detected"
                
            # Truncate summary to avoid DB String(100) overflow error
            if len(summary_type) > 100:
                summary_type = summary_type[:97] + "..."
                
            now = datetime.now()
            new_history = DetectionHistory(
                user_id=current_user['id'],
                waste_type=summary_type,
                confidence=round(avg_conf * 100, 1),
                date=now.strftime("%Y-%m-%d"),
                time=now.strftime("%H:%M:%S"),
                method=method,
                inference_time=round(avg_inference_time_ms, 1)
            )
            db.session.add(new_history)
            db.session.commit()

        return jsonify({
            "success": True,
            "summary": dict(counter),
            "primary": primary,
            "video": f"http://127.0.0.1:5000/outputs/video_detection/{out_filename}",
            "stats": {
                "total_frames": frame_idx,
                "processed_frames": processed_count,
                "avg_inference_time_ms": round(avg_inference_time_ms, 2),
                "total_processing_time_sec": round(total_processing_time, 2),
                "effective_fps": round(effective_fps, 2),
                "avg_confidence": round(avg_conf, 2),
                "video_duration_sec": round(video_duration, 2),
                "unique_objects": len(unique_objects)
            }
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/outputs/video_detection/<path:filename>")
def serve_detected_video(filename):
    return send_from_directory(
        os.path.join(OUTPUT_FOLDER, "video_detection"),
        filename,
        conditional=True
    )

print("Database URI:", app.config["SQLALCHEMY_DATABASE_URI"])
if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000, debug=True)

