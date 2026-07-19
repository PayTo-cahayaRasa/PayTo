import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateCropGeometry, getCropAspectRatio } from './productImageCrop.ts';

test('portrait image keeps its original ratio and full composition by default', () => {
    const naturalSize = { width: 600, height: 1200 };
    const ratio = getCropAspectRatio(naturalSize);
    const crop = calculateCropGeometry(
        { width: 300, height: 300 / ratio },
        naturalSize,
        1,
        { x: 0, y: 0 },
    );

    assert.equal(crop.source.x, 0);
    assert.equal(crop.source.y, 0);
    assert.equal(crop.source.width, 600);
    assert.equal(crop.source.height, 1200);
});

test('landscape image keeps its original ratio', () => {
    assert.equal(getCropAspectRatio({ width: 1600, height: 900 }), 16 / 9);
});

test('repositioning is constrained so the crop never contains an empty area', () => {
    const crop = calculateCropGeometry(
        { width: 400, height: 225 },
        { width: 1200, height: 1200 },
        1,
        { x: 500, y: 500 },
    );

    assert.equal(crop.offset.x, 0);
    assert.equal(crop.offset.y, 87.5);
    assert.equal(crop.source.x, 0);
    assert.equal(crop.source.y, 0);
    assert.equal(crop.source.width, 1200);
    assert.equal(crop.source.height, 675);
});
