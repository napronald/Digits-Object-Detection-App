import { Colors, getMousePos, getTouchPos } from './utils.js';
import { initializeSession, preprocessImageData, performDetection } from './models.js';

(async () => {
    const id2label = {
        0: '0', 1: '1', 2: '2', 3: '3', 4: '4',
        5: '5', 6: '6', 7: '7', 8: '8', 9: '9'
    };

    const iouThresholdInput = document.getElementById('iouThreshold');
    const scoreThresholdInput = document.getElementById('scoreThreshold');
    const iouValueDisplay = document.getElementById('iouValue');
    const scoreValueDisplay = document.getElementById('scoreValue');
    const pencilSizeInput = document.getElementById('pencilSize');
    const pencilSizeDisplay = document.getElementById('pencilSizeValue');
    const clearButton = document.getElementById('clearButton');
    const sketchCanvas = document.getElementById('sketchCanvas');
    const boxesCanvas = document.getElementById('boxesCanvas');
    const loadingOverlay = document.getElementById('loadingOverlay');

    const sketchCtx = setupSketchCanvas(sketchCanvas);
    const boxesCtx = setupBoxesCanvas(boxesCanvas);
    const colors = new Colors();

    const disableInteractions = () => {
        document.body.classList.add('loading');
    };

    const enableInteractions = () => {
        document.body.classList.remove('loading');
        loadingOverlay.style.display = 'none';
    };

    disableInteractions();

    setTimeout(() => {
        enableInteractions();
    }, 1000);

    pencilSizeInput.addEventListener('input', () => {
        pencilSizeDisplay.textContent = `${pencilSizeInput.value} px`;
        sketchCtx.lineWidth = parseInt(pencilSizeInput.value, 10);
    });

    iouThresholdInput.addEventListener('input', () => {
        iouValueDisplay.textContent = iouThresholdInput.value;
        updateBoundingBoxes();
    });

    scoreThresholdInput.addEventListener('input', () => {
        scoreValueDisplay.textContent = scoreThresholdInput.value;
        updateBoundingBoxes();
    });

    clearButton.addEventListener('click', () => {
        sketchCtx.fillStyle = '#FFFFFF';
        sketchCtx.fillRect(0, 0, sketchCanvas.width, sketchCanvas.height);

        boxesCtx.clearRect(0, 0, boxesCanvas.width, boxesCanvas.height);
    });

    const session = await initializeSession();
    window.currentSession = session;
    setupEventListeners();

    function setupSketchCanvas(canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = parseInt(pencilSizeInput.value, 10);
        return ctx;
    }

    function setupBoxesCanvas(canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        return ctx;
    }

    function setupEventListeners() {
        let isDrawing = false;

        const startDrawing = (pos) => {
            isDrawing = true;
            sketchCtx.beginPath();
            sketchCtx.moveTo(pos.x, pos.y);
        };

        const draw = (pos) => {
            if (!isDrawing) return;
            sketchCtx.lineTo(pos.x, pos.y);
            sketchCtx.stroke();
        };

        const stopDrawing = () => {
            if (isDrawing) {
                isDrawing = false;
                runDetection();
            }
        };

        sketchCanvas.addEventListener('mousedown', (e) => {
            const pos = getMousePos(sketchCanvas, e);
            startDrawing(pos);
        });

        sketchCanvas.addEventListener('mousemove', (e) => {
            const pos = getMousePos(sketchCanvas, e);
            draw(pos);
        });

        sketchCanvas.addEventListener('mouseup', stopDrawing);
        sketchCanvas.addEventListener('mouseleave', stopDrawing);

        sketchCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const pos = getTouchPos(sketchCanvas, e);
            startDrawing(pos);
        }, { passive: false });

        sketchCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const pos = getTouchPos(sketchCanvas, e);
            draw(pos);
        }, { passive: false });

        sketchCanvas.addEventListener('touchend', stopDrawing);
    }

    async function runDetection() {
        boxesCtx.clearRect(0, 0, boxesCanvas.width, boxesCanvas.height);
        const session = window.currentSession;
        const iouThreshold = parseFloat(iouThresholdInput.value);
        const scoreThreshold = parseFloat(scoreThresholdInput.value);

        const preprocessed = await preprocessImageData(sketchCanvas, session.preprocessing);
        const padding_tlbr = preprocessed.padding_tlbr; 

        const result = await performDetection(preprocessed.preprocessed_img, padding_tlbr, session, iouThreshold, scoreThreshold);
        renderBoxes(result.boxes);
    }

    function renderBoxes(boxes) {
        boxes.forEach(box => {
            const label = id2label[box.label] || `Label ${box.label}`;
            const color = colors.get(box.label);
            const score = box.conf.toFixed(2);

            const [xn, yn, wn, hn] = box.box_xywhn;
            const x = xn * boxesCanvas.width - (wn * boxesCanvas.width) / 2;
            const y = yn * boxesCanvas.height - (hn * boxesCanvas.height) / 2;
            const w = wn * boxesCanvas.width;
            const h = hn * boxesCanvas.height;

            boxesCtx.fillStyle = Colors.hexToRgba(color, 0.2);
            boxesCtx.fillRect(x, y, w, h);

            boxesCtx.strokeStyle = color;
            boxesCtx.lineWidth = Math.max(Math.min(boxesCanvas.width, boxesCanvas.height) / 200, 2.5);
            boxesCtx.strokeRect(x, y, w, h);

            const labelTxt = `${label}: ${score}`;
            const textWidth = boxesCtx.measureText(labelTxt).width;
            const textHeight = parseInt(boxesCtx.font, 10);
            let textX = x;
            let textY = y - textHeight - 5;

            if (textY < 0) textY = y + h + textHeight;
            if (textX + textWidth > boxesCanvas.width) textX = boxesCanvas.width - textWidth;
            if (textX < 0) textX = 0;

            boxesCtx.fillStyle = color;
            boxesCtx.fillRect(textX - 5, textY - textHeight, textWidth + 10, textHeight + 5);

            boxesCtx.fillStyle = "#ffffff";
            boxesCtx.fillText(labelTxt, textX, textY);
        });
    }

    function updateBoundingBoxes() {
        if (window.currentSession) {
            runDetection();
        }
    }
})();