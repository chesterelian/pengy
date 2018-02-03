var cookies = {
    setCookie : function() {
        document.cookie = "gt=" + stats.threshold.good
                          + "bt=" + stats.threshold.bad
                          + "sn=" + scramble.cube.notation.fat45 + scramble.cube.notation.fat + scramble.cube.notation.multiLayer
                          + "in=" + Number(timer.inspect.isOn) + Number(timer.inspect.countup)
                          + "it=" + timer.inspect.time
                          + "gl=" + timer.inspect.greenLight
                          + "rl=" + timer.inspect.redLight
                          + "li=" + Number(timer.isLazy)
                          + "ic=" + Number(infoBar.isCheat)
                          + "cs=" + infoBar.cheatSheet
                          + "st=" + scramble.type;
    },
    
    between : function(str1, str2) { return document.cookie.slice(document.cookie.indexOf(str1) + 3, document.cookie.indexOf(str2)); },
    numAt : function(str, increment) { return Number(document.cookie.charAt(document.cookie.indexOf(str) + increment)); }
};
