from ultralytics import YOLO

def main():
    model = YOLO("yolov8s.pt") # Start fresh with YOLOv8 Small for higher accuracy

    model.train(
        data="dataset/data.yaml",
        epochs=25,          # total epochs
        imgsz=640,
        batch=8,
        device=0,
        workers=4,
        project="runs/detect",
        name="waste_detection_s",
        pretrained=True
    )

if __name__ == "__main__":
    main()