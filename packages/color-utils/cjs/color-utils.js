'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Color = require('color');

function lightenToContrastThreshold(foreground, background, contrastThreshold) {
    const foregroundColor = Color(foreground);
    const backgroundColor = Color(background);

    const {h,s} = foregroundColor.hsl().object();

    let newColor = foregroundColor;

    while (newColor.contrast(backgroundColor) < contrastThreshold) {
        if (newColor.lightness() >= 100) {
            break;
        }

        newColor = Color({h, s, l: newColor.lightness() + 5});
    }

    return newColor;
}

function darkenToContrastThreshold(foreground, background, contrastThreshold) {
    const foregroundColor = Color(foreground);
    const backgroundColor = Color(background);

    const {h,s} = foregroundColor.hsl().object();

    let newColor = foregroundColor;

    while (newColor.contrast(backgroundColor) < contrastThreshold) {
        if (newColor.lightness() <= 0) {
            break;
        }

        newColor = Color({h, s, l: newColor.lightness() - 5});
    }

    return newColor;
}

function textColorForBackgroundColor(background) {
    const backgroundColor = Color(background);

    const white = Color({r: 255, g: 255, b: 255});
    const black = Color({r: 0, g: 0, b: 0});

    // shared with Portal https://github.com/TryGhost/Portal/blob/317876f20d22431df15e655ea6cc197fe636615e/src/utils/contrast-color.js#L26-L29
    const yiq = (
        backgroundColor.red() * 0.299 +
        backgroundColor.green() * 0.587 +
        backgroundColor.b() * 0.114
    );

    return (yiq >= 186) ? black : white;
}

exports.Color = Color;
exports.darkenToContrastThreshold = darkenToContrastThreshold;
exports.lightenToContrastThreshold = lightenToContrastThreshold;
exports.textColorForBackgroundColor = textColorForBackgroundColor;
