var rightDiv = {
    isMoving : false,

    show : function(stopMoving) {
        this.isMoving = true;
        effects.manualStretch(effects.width, "everything", [550, 620, 690, 760, 830, 900], 0, 40);
        setTimeout("rightDiv.isMoving = false", stopMoving);
    },

    hide : function(stopMoving) {
        this.isMoving = true;
        effects.manualStretch(effects.width, "everything", [830, 760, 690, 620, 550, 480], 0, 40);
        setTimeout("rightDiv.isMoving = false", stopMoving);
    }
};

var stats = {
    isOn : false, // initialize

    list : [ // initialize
        "sessionAverage",
        "sessionMean",
        "standardDeviation",
        "bestTime",
        "worstTime",
        "numGood",
        "numNormal",
        "numBad",
        "numDnf",
        "inspectMean",
        "bestAverage5",
        "bestAverage12"
    ],

    threshold : {
        good : 1250, // initialize
        bad : 1400, // initialize

        setGood : function() {
            var time = parseNonLazy(document.getElementById("goodThreshold").value);
            this.good = time > 0 ? time : 0; // if it's a legal time, okay, if not, then all solves are not good (normal)
        },
        setBad : function() {
            var time = parseNonLazy(document.getElementById("badThreshold").value);
            this.bad = time > 0 ? time : Infinity; // if it's a legal time, okay, if not, then all solves are not bad (normal)
        }
    },

    write : function() {
        var sdl = allSolves.sumDnfLen();

        if (sdl[2] >= 3) // if there's at least 3 solves
            document.getElementById("sessionAverage").innerHTML = "Average of " + sdl[2] + ": " + formatTime(allSolves.average()) + "<br \/>";

        if (sdl[1] != sdl[2]) // if there's at least one non-DNF
            document.getElementById("sessionMean").innerHTML = "Mean of " + (sdl[2] - sdl[1]) + ": " + formatTime(allSolves.mean()) + "<br \/>";

        if (sdl[2] >= 3 && sdl[2] - sdl[1] >= 2) // if there's at least 3 solves and 2 non-DNFs
            document.getElementById("standardDeviation").innerHTML = "Standard deviation: " + allSolves.stdDev() + "<br \/>";

        if (sdl[2] >= 2) { // if there's at least 2 solves
            document.getElementById("bestTime").innerHTML = "Best time: " + formatTime(allSolves.list[allSolves.minInd()].time) + "<br \/>";
            document.getElementById("worstTime").innerHTML = "Worst time: " + formatTime(allSolves.list[allSolves.maxInd()].time) + "<br \/>";
        }

        var numGood = allSolves.numSub(this.threshold.good),
            numNormal = allSolves.numSub(this.threshold.bad) - numGood,
            numBad = sdl[2] - sdl[1] - numGood - numNormal;
        if (sdl[1] != sdl[2]) { // if there's at least one non-DNF
            document.getElementById("numGood").innerHTML = "<br \/>Sub-" + (this.threshold.good / 100) + " solves: " + numGood + "<br \/>";
            document.getElementById("numNormal").innerHTML = "Normal solves: " + numNormal + "<br \/>";
            document.getElementById("numBad").innerHTML = "Sup-" + (this.threshold.bad / 100) + " solves: " + numBad + "<br \/>";
        }
        document.getElementById("numDnf").innerHTML = sdl[1] ? "DNFs: " + sdl[1] + "<br \/>" : ""; // if there's at least one DNF

        document.getElementById("inspectMean").innerHTML = timer.inspect.isOn ? "<br \/>Inspection mean: " + allSolves.inspectMean() : "";

        if (sdl[2] >= 5) { // if there's at least 5 solves
            var ba5 = allSolves.bestAverage(5);
            document.getElementById("bestAverage5").innerHTML = "<br \/>" + ba5[0]
                                                                + "<br \/>" + ba5[1]
                                                                + "<br \/><textarea cols='20' rows='1' readonly='readonly'>"
                                                                + ba5[0] + "\n" + ba5[1] + "\n" + ba5[2] + "<\/textarea>";
            if (sdl[2] >= 12) { // if there's at least 12 solves
                var ba12 = allSolves.bestAverage(12);
                document.getElementById("bestAverage12").innerHTML = "<br \/>" + ba12[0]
                                                                     + "<br \/>" + ba12[1]
                                                                     + "<br \/><textarea cols='20' rows='1' readonly='readonly'>"
                                                                     + ba12[0] + "\n" + ba12[1] + "\n" + ba12[2] + "<\/textarea>";
            }
        }

        document.getElementById("allStats").className = "writeStats";
    },

    clear : function() {
        var arrLen = this.list.length,
            code = "";
        for (var i = 0; i < arrLen; i++)
            code += "<div id='" + this.list[i] + "'><\/div>";
        document.getElementById("allStats").innerHTML = code;
        document.getElementById("allStats").className = "clearStats";
    },

    show : function() {
        if (options.isOn) {
            options.isOn = false;
            options.clear();
        }
        this.isOn = true;
        rightDiv.show(800);
        setTimeout("stats.write()", 300);
        effects.manualFade(effects.color, "allStats", ["#fff", "#ccc", "#d3e5ff", "#666", "#333", "#000"], 300, 80, 80);
    },

    hide : function() {
        this.isOn = false;
        this.clear();
        rightDiv.hide(300);
    }
};

var options = {
    isOn : false, // initialize

    write : function() {
        var list = [
            "Good solve <a href=\"javascript:help.thresholds()\">[?]</a>",
                "Sub-<input id='goodThreshold' type='text' size='5' onchange='stats.threshold.setGood()' \/>",

            "Bad solve <a href=\"javascript:help.thresholds()\">[?]</a>",
                "Sup-<input id='badThreshold' type='text' size='5' onchange='stats.threshold.setBad()' \/>",

            "Scramble notation",
                "4x4x4/5x5x5 - 2 layers: "
                + "<select id='fat45' onchange='scramble.cube.notation.setFat45()'>"
                +   "<option>WCA (wide): Rw<\/option>"
                +   "<option>SiGN: r<\/option>"
                +   "<option>Prefix: 2R<\/option>"
                + "<\/select>"
                + "<br \/>6x6x6/7x7x7 - 2 layers: "
                + "<select id='fat' onchange='scramble.cube.notation.setFat()'>"
                +   "<option>WCA (prefix): 2R<\/option>"
                +   "<option>SiGN: r<\/option>"
                +   "<option>Wide: Rw<\/option>"
                + "<\/select>"
                + "<br \/>6x6x6/7x7x7 - 3 layers: "
                + "<select id='multiLayer' onchange='scramble.cube.notation.setMultiLayer()'>"
                +   "<option>WCA (prefix): 3R<\/option>"
                +   "<option>SiGN: 3r<\/option>"
                + "<\/select>",

            "Scramble font <a href=\"javascript:help.scrambleFont()\">[?]</a>",
                "<select id='isMonospace' onchange='scramble.setMonospace()'>"
                +   "<option>Normal<\/option>"
                +   "<option>Monospace<\/option>"
                + "<\/select>",

            "Inspection <a href=\"javascript:help.inspection()\">[?]</a>",
                "<input id='isInspect' type='checkbox' onchange='timer.inspect.setInspect()' \/> "
                + "Time: <input id='inspectionTime' type='text' size='2' onchange='timer.inspect.setInspect()' \/> "
                + "<select id='countWhere' onchange='timer.inspect.setInspect()'>"
                +   "<option>Countdown<\/option>"
                +   "<option>Count-up<\/option>"
                + "<\/select>"
                + "<br \/>Green light: <input id='greenLight' type='text' size='2' onchange='timer.inspect.setInspect()' \/> "
                + "Red light: <input id='redLight' type='text' size='2' onchange='timer.inspect.setInspect()' \/>",

            "Lazy input <a href=\"javascript:help.lazyInput()\">[?]</a>",
                "<input id='isLazy' type='checkbox' onchange='timer.setLazy()' \/>",

            "Show time log <a href=\"javascript:help.showTimeLog()\">[?]</a>",
                "<input id='isSessionTimes' type='checkbox' onchange='refresh.setSessionTimes()' \/>",

            "Cheat sheet <a href=\"javascript:help.cheatSheet()\">[?]</a>",
                "<input id='isCheat' type='checkbox' onchange='infoBar.setCheat()' \/>"
                + "<br \/><textarea id='cheatSheet' cols='20' rows='5' onchange='infoBar.setCheat()'><\/textarea>"
        ];

        var arrLen = list.length,
            code = "<table id='optionsTable'>";
        for (var i = 0; i < arrLen; i += 2)
            code += "<tr><td class='optionsLeft'>" + list[i] + "<\/td><td class='optionsRight'>" + list[i + 1] + "<\/td><\/tr>";
        document.getElementById("optionsMenu").innerHTML = code + "<\/table>";
        document.getElementById("optionsMenu").className = "writeOptions";

        document.getElementById("goodThreshold").value = stats.threshold.good / 100;
        document.getElementById("badThreshold").value = stats.threshold.bad / 100;
        document.getElementById("fat45").selectedIndex = scramble.cube.notation.fat45;
        document.getElementById("fat").selectedIndex = 2 - scramble.cube.notation.fat;
        document.getElementById("multiLayer").selectedIndex = scramble.cube.notation.multiLayer - 2;
        document.getElementById("isMonospace").selectedIndex = scramble.isMonospace;
        document.getElementById("isInspect").checked = timer.inspect.isOn;
        document.getElementById("inspectionTime").value = timer.inspect.time;
        document.getElementById("greenLight").value = timer.inspect.greenLight;
        document.getElementById("redLight").value = timer.inspect.redLight;
        document.getElementById("countWhere").selectedIndex = timer.inspect.countup;
        document.getElementById("isLazy").checked = timer.isLazy;
        document.getElementById("isSessionTimes").checked = refresh.isSessionTimes;
        document.getElementById("isCheat").checked = infoBar.isCheat;
        document.getElementById("cheatSheet").value = infoBar.cheatSheet;

        document.getElementById("goodThreshold").focus();

        infoBar.error("Timer won't start as long as options menu is on");
    },

    clear : function() {
        document.getElementById("optionsMenu").innerHTML = "";
        document.getElementById("optionsMenu").className = "clearOptions";
        infoBar.clear();
    },

    show : function() {
        if (stats.isOn) {
            stats.isOn = false;
            stats.clear();
        }
        this.isOn = true;
        rightDiv.show(400);
        setTimeout("options.write()", 300);
    },

    hide : function() {
        this.isOn = false;
        this.clear();
        rightDiv.hide(300);
    }
};
