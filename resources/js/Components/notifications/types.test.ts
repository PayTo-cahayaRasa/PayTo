import assert from 'node:assert/strict';
import test from 'node:test';
import { NOTIFICATION_DURATION } from './types.ts';

test('notifications use a five second default duration', () => {
    assert.equal(NOTIFICATION_DURATION, 5_000);
});
