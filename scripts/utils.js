export class Colors {
    constructor() {
        this.palette = [
            "#FF3838", "#FF9D97", "#FF701F", "#FFB21D", "#CFD231",
            "#48F90A", "#92CC17", "#3DDB86", "#1A9334", "#00D4BB",
            "#2C99A8", "#00C2FF", "#344593", "#6473FF", "#0018EC",
            "#8438FF", "#520085", "#CB38FF", "#FF95C8", "#FF37C7"
        ];
        this.n = this.palette.length;
    }

    get(i) {
        return this.palette[i % this.n];
    }

    static hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
            : null;
    }
}

export const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

export const getTouchPos = (canvas, touchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const touch = touchEvent.touches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
};