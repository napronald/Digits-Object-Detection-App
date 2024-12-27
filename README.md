# Digits Object Detection App
Digits Object Detection App is a web-based platform that allows users to draw digits on a canvas and instantly see bounding boxes and confidence scores for each recognized digit. It leverages a **custom YOLOv8 model** that has been converted to ONNX, enabling fast in-browser inference via **ONNX Runtime Web** and **OpenCV.js**.

**Live Demo**: [Digits Object Detection App](https://napronald.github.io/Digits-Object-Detection-App/)

## Video Demos
### 1. Real-Time Detection Demo
Showcases how bounding boxes update on the fly as you draw digits (e.g., changing a `0` into a `9`).

https://github.com/user-attachments/assets/abac4792-b7e8-4a86-885d-27fbd17a50fd

### 2. IoU & Score Threshold Sliders Demo
Demonstrates how adjusting IoU and confidence thresholds influences the appearance or disappearance of bounding boxes.

https://github.com/user-attachments/assets/358070cb-e594-492d-b4a1-d69fe826e22e

## How It Works
1. **Canvas Drawing**: Users draw digits on the `sketchCanvas`.  
2. **Preprocessing ONNX**: The drawn image is resized and normalized for the YOLO model.  
3. **YOLO ONNX**: Performs digit detection, outputting bounding boxes and confidence scores.  
4. **NMS ONNX**: Applies non-maximum suppression to filter overlapping detections.  
5. **Postprocessing ONNX**: Converts normalized coordinates back to the original canvas space.  
6. **Render**: Detected bounding boxes and labels are drawn onto the `boxesCanvas`.

## Tech Stack
- **HTML**, **CSS**, and **JavaScript**  
- **OpenCV.js** for image and canvas manipulation  
- **ONNX Runtime Web** for model inference in the browser  
- **YOLOv8** (trained and then exported to ONNX)

## Project Structure
```plaintext
Digits-Object-Detection-App/
├── index.html
├── styles/
│   └── style.css
├── scripts/
│   ├── main.js
│   ├── models.js
│   ├── utils.js
├── onnx/
│   ├── preprocessing.onnx
│   ├── model.onnx
│   ├── nms.onnx
│   └── postprocessing.onnx
└── README.md
```

## File & Folder Descriptions
- **index.html**: Main entry point  
- **styles/style.css**: Global styling  
- **scripts/main.js**: Contains canvas interactions, event listeners, and detection triggers  
- **scripts/models.js**: Loads and executes ONNX models  
- **scripts/utils.js**: Helper functions (color palette, mouse/touch position, etc.)  
- **onnx/**: ONNX models (preprocessing, YOLO, NMS, postprocessing)  
- **README.md**: Project documentation  
