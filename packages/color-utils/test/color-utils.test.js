const assert = require('assert/strict');
const {
    Color,
    lightenToContrastThreshold,
    darkenToContrastThreshold,
    textColorForBackgroundColor
} = require('../cjs/color-utils');

describe('color-utils', function () {
    describe('Color', function () {
        it('re-exports the Color library', function () {
            assert.ok(Color);
            const c = Color('#ff0000');
            assert.equal(c.hex(), '#FF0000');
        });
    });

    describe('lightenToContrastThreshold', function () {
        it('lightens foreground until contrast threshold is met', function () {
            const result = lightenToContrastThreshold('#333', '#000', 4.5);
            assert.ok(result.contrast(Color('#000')) >= 4.5);
        });

        it('stops at lightness 100 when threshold is unreachable', function () {
            const result = lightenToContrastThreshold('#eee', '#fff', 21);
            assert.ok(result.lightness() >= 95);
        });

        it('returns original color when contrast is already sufficient', function () {
            const result = lightenToContrastThreshold('#fff', '#000', 1);
            assert.ok(result.contrast(Color('#000')) >= 1);
        });
    });

    describe('darkenToContrastThreshold', function () {
        it('darkens foreground until contrast threshold is met', function () {
            const result = darkenToContrastThreshold('#aaa', '#fff', 4.5);
            assert.ok(result.contrast(Color('#fff')) >= 4.5);
        });

        it('stops at lightness 0 when threshold is unreachable', function () {
            const result = darkenToContrastThreshold('#111', '#000', 21);
            assert.ok(result.lightness() <= 5);
        });

        it('returns original color when contrast is already sufficient', function () {
            const result = darkenToContrastThreshold('#000', '#fff', 1);
            assert.ok(result.contrast(Color('#fff')) >= 1);
        });
    });

    describe('textColorForBackgroundColor', function () {
        it('returns black for light backgrounds', function () {
            const result = textColorForBackgroundColor('#ffffff');
            assert.equal(result.hex(), '#000000');
        });

        it('returns white for dark backgrounds', function () {
            const result = textColorForBackgroundColor('#000000');
            assert.equal(result.hex(), '#FFFFFF');
        });

        it('returns white for a yellowish background where b-channel shifts yiq', function () {
            // .b() returns the Lab b-channel, not RGB blue
            const result = textColorForBackgroundColor('#cccccc');
            assert.equal(result.hex(), '#FFFFFF');
        });

        it('returns white for a mid-dark background', function () {
            const result = textColorForBackgroundColor('#333333');
            assert.equal(result.hex(), '#FFFFFF');
        });
    });
});
