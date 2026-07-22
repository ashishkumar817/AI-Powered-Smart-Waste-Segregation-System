# ♻️ AI-Powered Smart Waste Segregation System

> An AI-powered web application that automatically detects and classifies waste materials using YOLO object detection, helping users dispose of waste responsibly and promote sustainable waste management.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Flask-Backend-black?logo=flask)
![YOLO](https://img.shields.io/badge/YOLO-v11-green)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 📖 Overview

The **AI-Powered Smart Waste Segregation System** is a full-stack web application that uses **YOLO object detection** to identify waste materials from uploaded images or captured photos. The system classifies waste into different categories and provides disposal recommendations, making waste management more efficient and environmentally friendly.

The application also includes secure user authentication, report generation, email notifications, analytics, and an admin dashboard for monitoring system usage.

---

## ✨ Features

- 🔍 AI-powered waste detection using YOLO
- 📷 Upload image or capture using camera
- ♻️ Waste classification into multiple categories
- 💡 Disposal recommendations
- 👤 User Registration & Login (JWT Authentication)
- 🔒 Forgot Password with OTP
- 📧 Email notifications using Gmail SMTP
- 📄 PDF Detection Reports
- 📊 Admin Dashboard & Analytics
- 📈 Detection History
- 🌙 Dark / Light Theme
- 📱 Fully Responsive UI

---

## 🧠 Waste Categories

- Biodegradable
- Cardboard
- Glass
- Metal
- Paper
- Plastic

---

# 🏗 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide Icons

## Backend

- Flask
- Python
- SQLite
- JWT Authentication
- SMTP Email Integration

## AI / Machine Learning

- Ultralytics YOLO
- OpenCV
- NumPy

---

# 📂 Project Structure

```text
AI-Powered-Smart-Waste-Segregation-System/
│
├── frontend/                 # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── services/                 # Backend Services
├── templates/
├── app.py
├── config.py
├── predict.py
├── train.py
├── evaluate.py
├── requirements.txt
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/ashishkumar817/AI-Powered-Smart-Waste-Segregation-System.git

cd AI-Powered-Smart-Waste-Segregation-System
```

---

## Backend Setup

Create Virtual Environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Run Flask Server

```bash
python app.py
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🤖 Model

This project uses **Ultralytics YOLO** for object detection.

The model detects waste objects and classifies them into six categories.

> **Note:** The trained model weights are not included in this repository if they exceed GitHub's file size limits.

---


# 🔮 Future Improvements

- Live Camera Detection
- Video Detection
- Mobile Application
- Cloud Deployment
- Multi-language Support
- Smart Bin Integration
- Real-time Analytics
- More Waste Categories

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Ashish Kumar**

- GitHub: https://github.com/ashishkumar817

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps others discover the project and supports future development.
