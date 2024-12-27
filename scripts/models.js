export const loadModel = async (path) => {
    const response = await fetch(path);
    const buffer = await response.arrayBuffer();
    return await ort.InferenceSession.create(buffer);
};

export const initializeSession = async () => {
    const paths = {
        preprocessing: 'onnx/preprocessing.onnx',
        detectionModel: 'onnx/model.onnx',
        nms: 'onnx/nms.onnx',
        postprocessing: 'onnx/postprocessing.onnx'
    };
    const session = {};
    for (const key in paths) {
        session[key] = await loadModel(paths[key]);
    }
    return session;
};

export const preprocessImageData = async (canvas, preprocessingSession) => {
    const src = cv.imread(canvas);
    const data = new Uint8Array(src.data);
    const inputTensor = new ort.Tensor('uint8', data, [src.rows, src.cols, 4]);

    const fillValue = new ort.Tensor("uint8", new Uint8Array([114]));
    const inputHeight = new ort.Tensor("int32", [256]);
    const inputWidth = new ort.Tensor("int32", [256]);

    const preprocessed = await preprocessingSession.run({
        image: inputTensor,
        input_h: inputHeight,
        input_w: inputWidth,
        fill_value: fillValue
    });
    src.delete();

    return {
        preprocessed_img: preprocessed.preprocessed_img,
        padding_tlbr: preprocessed.padding_tlbr
    };
};

export const performDetection = async (preprocessed_img, padding_tlbr, session, iouThreshold, scoreThreshold) => {
    const tensor_img = new ort.Tensor("float32", preprocessed_img.data, [1, 3, 256, 256]);
    const { output0 } = await session.detectionModel.run({ images: tensor_img });

    const { selected_boxes_xywh, selected_class_scores, selected_class_ids } = await session.nms.run({
        output0,
        max_output_boxes_per_class: new ort.Tensor("int32", new Int32Array([100])),
        iou_threshold: new ort.Tensor("float32", new Float32Array([iouThreshold])),
        score_threshold: new ort.Tensor("float32", new Float32Array([scoreThreshold]))
    });

    const numBoxes = selected_boxes_xywh.dims[0];
    const { boxes_xywhn } = await session.postprocessing.run({
        input_h: new ort.Tensor("int32", [256]),
        input_w: new ort.Tensor("int32", [256]),
        boxes_xywh: selected_boxes_xywh,
        padding_tlbr: padding_tlbr 
    });

    const boxes_xywhn_2d = Array.from({ length: numBoxes }, (_, idx) =>
        boxes_xywhn.data.slice(idx * 4, idx * 4 + 4)
    );

    const boxes = Array.from({ length: numBoxes }, (_, idx) => ({
        label: selected_class_ids.data[idx],
        conf: selected_class_scores.data[idx],
        box_xywhn: boxes_xywhn_2d[idx],
    }));

    return { boxes };
};