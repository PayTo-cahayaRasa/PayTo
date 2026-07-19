export type CropPoint = {
    x: number;
    y: number;
};

export type CropSize = {
    width: number;
    height: number;
};

export type CropGeometry = {
    offset: CropPoint;
    renderedSize: CropSize;
    scale: number;
    source: CropPoint & CropSize;
};

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}

export function getCropAspectRatio(naturalSize: CropSize): number {
    return naturalSize.width / naturalSize.height;
}

export function calculateCropGeometry(
    frameSize: CropSize,
    naturalSize: CropSize,
    zoom: number,
    requestedOffset: CropPoint,
): CropGeometry {
    const scale = Math.max(
        frameSize.width / naturalSize.width,
        frameSize.height / naturalSize.height,
    ) * zoom;
    const renderedSize = {
        width: naturalSize.width * scale,
        height: naturalSize.height * scale,
    };
    const maximumOffset = {
        x: Math.max(0, (renderedSize.width - frameSize.width) / 2),
        y: Math.max(0, (renderedSize.height - frameSize.height) / 2),
    };
    const offset = {
        x: clamp(requestedOffset.x, -maximumOffset.x, maximumOffset.x),
        y: clamp(requestedOffset.y, -maximumOffset.y, maximumOffset.y),
    };

    return {
        offset,
        renderedSize,
        scale,
        source: {
            x: (renderedSize.width / 2 - frameSize.width / 2 - offset.x) / scale,
            y: (renderedSize.height / 2 - frameSize.height / 2 - offset.y) / scale,
            width: frameSize.width / scale,
            height: frameSize.height / scale,
        },
    };
}
