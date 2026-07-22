from ultralytics import YOLO

# Load your best model (50 epochs)
model = YOLO("runs/detect/runs/waste_detection-3/weights/best.pt")

# Test on one image
results = model.predict(
    source="test_images/image.png",  # change this to your image
    conf=0.25,
    save=True,
    show=True
)

print("Prediction completed!")