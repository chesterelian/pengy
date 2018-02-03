var help = {
    list : [
        "Spacebar",            "Start timer (when released)",
        "Any key",             "Stop timer (when hit)",
        "Enter",               "Timer not running: Generate new scramble"
                               + "<br \/>Timer running: Stop timer > Discard time > Generate new scramble",
        "Home",                "Show/hide session stats",
        "Insert",              "Turn manual input on/off",
        "Left/right arrows",   "Scroll through time log",
        "Shift + R",           "Reset session",
        "Shift + =",           "Turn +2 on/off for highlighted time",
        "Shift + D",           "DNF highlighted time",
        "Shift + Delete"
        + "<br \/>"
        + "Shift + Backspace", "Delete highlighted time",
        "Click",               "Clicking on a time highlights it",
        "Double click",        "Double clicking on a time deletes it",
        "Shift + 1",           "Generate square-1 scramble",
        "Shift + 2",           "Generate random state 2x2x2 scramble",
        "Shift + [3-7]",       "Generate cube scramble",
        "Shift + 8",           "Generate megaminx scramble",
        "Shift + O",           "Show/hide options menu",
        "Shift + H",           "Show/hide help menu"
    ],

    isOn : false,

    show : function() {
        this.isOn = true;
        var arrLen = this.list.length,
            code = "<table id='helpTable'>";
        for (var i = 0; i < arrLen; i += 2)
            code += "<tr><td class='helpLeft'>" + this.list[i] + "<\/td><td class='helpRight'>" + this.list[i + 1] + "<\/td><\/tr>";
        code += "<\/table>";
        document.getElementById("helpMenu").innerHTML = code;
    },

    hide : function() {
        this.isOn = false;
        document.getElementById("helpMenu").innerHTML = "";
    },

    thresholds : function() {
        alert("When you stop the timer, pengy will give you a green light if your time is faster than \"good solve\", red if it's slower than \"bad solve\", "
              + "and blue if it's in between."
              + "\n\nIf you get a new best time, the timer flashes orange 3 times."
              + "\n\nSince pengy has a good memory, he keeps track of how many good/normal/bad solves you've had and reports them in the session stats.");
    },

    scrambleFont : function() {
        alert("Pengy highly recommends using monospace for megaminx scrambles.");
    },

    inspection : function() {
        alert("The inspection timer does NOT stop because pengy thinks it makes much more sense to find out what your inspection times are like "
              + "and improve from there than to DNF yourself at home."
              + "\n\nPengy will calculate your average inspection time for all your solves and report them in the session stats."
              + "\n\nIf you set an invalid inspection time, pengy gives you warning and resets it to 15.");
    },

    lazyInput : function() {
        alert("If lazy input is enabled, you only have to enter the digits of your time during manual input."
              + "\n\nFor example:\nIf your time is 7.08, you should enter \"708\"."
              + "\nIf your time is 1:23.45, you should enter \"12345\". "
              + "Pengy even takes care of the minutes-to-seconds conversion so you don't have to do it in your head!"
              + "\n\nPengy would like to remind you that if your time is 10.00, you *cannot* enter 10 - you must enter 1000. "
              + " The good news is, this only happens 1 in 100 times."
              + "\n\nIf lazy input is disabled, enter the time displayed on your stackmat, with colons and decimal points where necessary."
              + "\n\nTip 1:"
              + "\nIf you enter 0 (or leave it blank) and hit enter, the time is not saved and you get a new scramble. "
              + "Pengy does this when he messes up the first few moves of his solve or if he gets a time that's too embarrassing to save."
              + "\n\nTip 2:"
              + "\nIf pengy doesn't recognize what you entered as a legitimate time, he just gives you a DNF. "
              + "So entering \"a\" or \"1.23.45\" or will give you a DNF.");
    },

    showTimeLog : function() {
        alert("Disable if you feel like it's distracting you. (Like pengy isn't enough of a distraction...)");
    },

    cheatSheet : function() {
        alert("If you enable this, whatever you type in the textbox will be displayed below the timer whenever it's running."
              + "\n\nPengy found this handy when he was learning new OLL/PLL algorithms. "
              + "He also likes it for big cubes and square-1 because he's too lazy to memorize parity algorithms.");
    }
};
