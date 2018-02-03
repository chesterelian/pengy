var effects = {
    toRgb : function(arr) { return "rgb(" + arr[0] + "," + arr[1] + "," + arr[2] + ")"; },
    color : function(elementId, color) { document.getElementById(elementId).style.color = color; },
    bgColor : function(elementId, color) { document.getElementById(elementId).style.backgroundColor = color; },

    /* changeWhat: color or bgColor
       start/end: arrays of [r,g,b] values
       numSteps: 2 steps means 3 colors including start and end, etc.
       when: when to start the first color change (in millis)
       firstDur: how long the first change should last (in millis), gets its own duration because the first color should usually stay longer than the rest
       subsequentDur: how long each of the remaining colors should last */
    fade : function(changeWhat, elementId, start, end, numSteps, when, firstDur, subsequentDur) { // slower than manualFade, but more versatile
        var arr = [], // stores all the intermediate colors (excluding start and end)
            step = []; // length 3, stores the increment/decrement in [r,g,b] during each step

        for (var i = 0; i < 3; i++) // calculate increment/decrement for [r,g,b]
            step[i] = Math.round((end[i] - start[i]) / numSteps);

        for (var i = 0; i < numSteps - 1; i++) { // calculate intermediate colors (excluding start and end)
            arr[i] = []; // first declare that each intermediate color is itself an array
            for (var j = 0; j < 3; j++) // then calculate its individual [r,g,b] values
                arr[i][j] = start[j] + (i + 1) * step[j];
        }

        setTimeout(changeWhat, when, elementId, effects.toRgb(start)); // start color
        for (var i = 0; i < numSteps - 1; i++) // intermediate colors
            setTimeout(changeWhat, when + firstDur + i * subsequentDur, elementId, effects.toRgb(arr[i]));
        setTimeout(changeWhat, when + firstDur + (numSteps - 1) * subsequentDur, elementId, effects.toRgb(end)); // end color
    },

    /* explicitly declare all the colors you want to go through while fading, so no calculation of intermediate colors involved, faster
       colorArr uses color string literals, not [r,g,b] arrays, so fading from black to gray to white: colorArr = ["#000", "#808080", "#fff"] */
    manualFade : function(changeWhat, elementId, colorArr, when, firstDur, subsequentDur) {
        var arrLen = colorArr.length;
        setTimeout(changeWhat, when, elementId, colorArr[0]); // start color
        for (var i = 1; i < arrLen; i++) // remaining colors (including end color)
            setTimeout(changeWhat, when + firstDur + (i - 1) * subsequentDur, elementId, colorArr[i]);
    },

    width : function(elementId, width) { document.getElementById(elementId).style.width = width; },

    manualStretch : function(changeWhat, elementId, widthArr, when, dur) {
        var arrLen = widthArr.length;
        for (var i = 0; i < arrLen; i++)
            setTimeout(changeWhat, when + i * dur, elementId, widthArr[i] + "px"); // all widths in widthArr should be in px
    },
};
