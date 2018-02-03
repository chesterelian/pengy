/* to do:
   credits for pengy
   video stylesheet
   pengy is tired from all the running
   konami code
   more efficient quickstats session average calculator
   both ctrl keys start timer
   pll log
   parity
   memo
*/

function formatTime(timeInCentis) {
    if (timeInCentis < 0)
        return "DNF";

    var centis, // int
        seconds, // int
        minutes = ""; // string

    centis = timeInCentis % 100;
    if (centis < 10) // adds leading zero if it's a single digit
        centis = "0" + centis; // becomes string

    seconds = (timeInCentis - centis) / 100 % 60;

    if (timeInCentis >= 6000) { // if >= 1 minute
        if (seconds < 10)
            seconds = "0" + seconds;
        minutes = ((timeInCentis - centis) / 100 - seconds) / 60 + ":"; // colon included here because it's unnecessary when it's still 0 minutes
    }

    return minutes + seconds + "." + centis;
}

function parseNonLazy(str) { // returns time in centiseconds if it's a legal time (including 0), returns 0 if blank, returns -1 if it's none of the above
    if (isFinite(str)) // if it's just ss.cc
        return Math.round(Number(str) * 100);
    else {
        indColon = str.indexOf(":"); // look for a colon in the string
        if (indColon >= 0) { // if there's a colon
            var mins = str.slice(0, indColon), // left of colon
                secs = str.slice(indColon + 1); // right of colon
            if (isFinite(mins) && isFinite(secs)) // if both sides of the colon are legal numbers
                return Math.round((Number(mins) * 60 + Number(secs)) * 100);
        }
    }
    return -1;
}

function solve(time, scramble) { // constructor for solve object
    this.time = time;
    this.plus2 = false;
    this.scramble = scramble;
    this.inspection = 0;
}

function raList(arr) { // constructor for array of rolling averages (ints)
    this.list = arr; // array of ints
    
    /* first assume this.list[0] is the minimum, if it's a DNF, then make this.list[1] the minimum, etc.
       keep going until this.list[m] is not a DNF, then compare it with all the this.list[i] after this.list[m] (ignoring DNFs)
       if all are DNFs, then the last DNF will be the minimum */
    this.minInd = function() { // to get the best average
        var arrLen = this.list.length,
            m = 0;
        for (var i = 1; i < arrLen; i++) {
            if (this.list[m] < 0) // if this.list[m] is a DNF
                m = i;
            else if (this.list[i] > 0 && this.list[i] < this.list[m]) // first condition ensures not DNF, so comparable
                m = i;
        }
        return m;
    };
}

function solveList(arr) { // constructor for array of solve objects
    this.list = arr; // array of solve objects
    
    this.active = -1; // initialize
    this.activate = function(ind, showScramble) { // showScramble is bool
        if (refresh.isSessionTimes && this.active >= 0 && this.active < this.list.length) // third condition to ensure "time" + this.active exists (because it doesn't after deleting the last solve)
            document.getElementById("time" + this.active).className = "inactiveTime";
        this.active = ind;
        if (refresh.isSessionTimes && ind >= 0) {
            document.getElementById("time" + ind).className = "activeTime";
            if (showScramble)
                infoBar.activeScramble();
        }
    };
    
    this.sumDnfLen = function() { // returns the sum, number of DNFs, and length of this.list in an array
        var sum = 0,
            numDnf = 0,
            arrLen = this.list.length;
        for (var i = 0; i < arrLen; i++)
            this.list[i].time > 0 ? sum += this.list[i].time : numDnf++; // if it's positive, then it's not a DNF (0.00 times are not allowed)
        return [sum, numDnf, arrLen];
    };

    this.minInd = function() { // only call if this.list.length >= 2
        var arrLen = this.list.length,
            m = 0; // m for minimum
        for (var i = 1; i < arrLen; i++) {
            if (this.list[m].time < 0)
                m = i;
            else if (this.list[i].time > 0 && this.list[i].time < this.list[m].time)
                m = i;
        }
        return m;
    };
    
    this.maxInd = function() { // only call if this.list.length >= 2
        var arrLen = this.list.length,
            m = 0; // m for maximum
        for (var i = 0; i < arrLen; i++) { // i starts from 0 so that if this.list[m] itself is a DNF, then we're done
            if (this.list[i].time < 0) { // if it's a DNF, let it be the worst time and don't bother checking the rest
                m = i;
                break;
            }
            if (this.list[i].time > this.list[m].time)
                m = i;
        }
        return m;
    };
    
    this.average = function() { // only call if this.list.length >= 3
        var sdl = this.sumDnfLen();
        if (sdl[1] > 1) // if there's > 1 DNF
            return -1;
        if (sdl[1]) // if there's exactly 1 DNF
            return Math.round((sdl[0] - this.list[this.minInd()].time) / (sdl[2] - 2));
        return Math.round((sdl[0] - this.list[this.minInd()].time - this.list[this.maxInd()].time) / (sdl[2] - 2)); // if there's no DNF
    };

    this.mean = function() { // only call if sdl[2] - sdl[1] > 0, i.e. there's at least one non-DNF
        var sdl = this.sumDnfLen();
        return Math.round(sdl[0] / (sdl[2] - sdl[1]));
    };

    this.stdDev = function() { // only call if this.list.length >= 3 && sdl[2] - sdl[1] >= 2, i.e. there's at least 2 non-DNFs
        var sdl = this.sumDnfLen(),
            bestInd = this.minInd(),
            worstInd = this.maxInd(),
            ave = this.average(),
            meanWithoutBest = Math.round((sdl[0] - this.list[bestInd].time) / (sdl[2] - 1 - sdl[1])), // sum all non-DNF times, minus best time, calculate mean
            total = 0, // for calculating SD later
            sd,
            sdPermil, // permil is actualy perthousand, look it up on wikipedia lol
            sdPercent;
        if (sdl[1] <= 1) { // if there's <= 1 DNF
            for (var i = 0; i < sdl[2]; i++) {
                if (i == bestInd || i == worstInd) // if it's the best/worst time, skip it
                    continue;
                total += Math.pow(ave - this.list[i].time, 2);
            }
            sd = Math.round(Math.sqrt(total / (sdl[2] - 2)));
            sdPermil = Math.round(sd * 1000 / ave);
        }
        else {
            for (var i = 0; i < sdl[2]; i++) {
                if (this.list[i].time < 0 || i == bestInd) // if it's a DNF or the best time, skip it
                    continue;
                total += Math.pow(meanWithoutBest - this.list[i].time, 2);
            }
            sd = Math.round(Math.sqrt(total / (sdl[2] - 1 - sdl[1]))); // denominator: number of times - 1 (best time) - number of DNFs
            sdPermil = Math.round(sd * 1000 / meanWithoutBest);
        }
        sdPercent = Math.floor(sdPermil / 10) + "." + (sdPermil % 10) + "%";
        return formatTime(sd) + " (" + sdPercent + ")";
    };
    
    this.numSub = function(n) { // only call if sdl[2] - sdl[1] > 0, i.e. there's at least one non-DNF
        var arrLen = this.list.length,
            num = 0;
        for (var i = 0; i < arrLen; i++)
            if (this.list[i].time > 0 && this.list[i].time < n)
                num++;
        return num;
    };

    this.bestAverage = function(n) { // only call if this.list.length >= n
        var numSolves = this.list.length;
        var arr = new raList([]); // to store all the RAs
        for (var i = 0; i <= numSolves - n; i++)
            arr.list.push(new solveList(this.list.slice(i, i + n)).average());
        var indBa = arr.minInd(), // the index of the BA in the list of RAs        
            baSlice = new solveList(this.list.slice(indBa, indBa + n)),
            baBestInd = baSlice.minInd(),
            baWorstInd = baSlice.maxInd(),
            dummyArr = []; // array of strings (to store the formatted times of baSlice)
        for (var i = 0; i < n; i++) // n is just baSlice.list.length
            dummyArr[i] = formatTime(baSlice.list[i].time);
        dummyArr[baBestInd] = "(" + dummyArr[baBestInd] + ")";
        dummyArr[baWorstInd] = "(" + dummyArr[baWorstInd] + ")";
        var code = "Best average of " + n + ": " + formatTime(arr.list[indBa]) + " = " + dummyArr[0];
        for (var i = 1; i < n; i++) // n is just baSlice.list.length
            code +=  ", " + dummyArr[i];
        
        var details = "";
        for (var i = 0; i < n; i++)
            details += "\n" + (i + 1) + ". " + dummyArr[i] + " - " + baSlice.list[i].scramble;
        
        return [code, "Standard deviation: " + baSlice.stdDev(), details];
    };
    
    this.reset = function() {
        if (confirm("Reset session?")) {
            this.list = [];
            refresh.all();
        }
    };

    this.delSolve = function(ind) {
        if (confirm("Delete?")) {
            this.list.splice(ind, 1);
            refresh.all();
        }
    };

    this.plus2Solve = function(ind) {
        if (this.list[ind].time > 0) { // so you can't +2 a DNF (to avoid conflict)
            this.list[ind].plus2 = this.list[ind].plus2 ? false : true;
            this.list[ind].time += this.list[ind].plus2 ? 200 : -200;
            refresh.all();
        }
        else
            alert("Were you really trying to +2 a DNF?");
    };

    this.dnfSolve = function(ind) {
        if (!this.list[ind].plus2) { // so you can't DNF a +2 (to avoid conflict)
            if (this.list[ind].time > 0) { // so you can't DNF a DNF lol
                if (confirm("DNF? (Can't be undone!)")) {
                    this.list[ind].time = -1;
                    refresh.all();
                }
            }
            else
                alert("Were you really trying to DNF a DNF?");
        }
        else
            alert("Can't DNF a +2! Please undo the +2 first.");
    };
    
    this.inspectMean = function() {
        var numSolves = this.list.length,
            sum = 0;
        for (var i = 0; i < numSolves; i++)
            sum += this.list[i].inspection;
        return Math.round(sum * 10 / numSolves) / 10;
    };
}

var pengy = {
    speed : 12,
    actionDur : 120,
    
    right : "http://www.chesterlian.com/pengy/img/pengy1.gif",
    left  : "http://www.chesterlian.com/pengy/img/pengy2.gif",
    sit   : "http://www.chesterlian.com/pengy/img/pengy3.png",
    stand : "http://www.chesterlian.com/pengy/img/pengy0.png",
    
    change : function(whichAction) { document.getElementById("pengy").innerHTML = "<img src='" + whichAction + "' alt='pengy' \/>"; },
    
    dance : function(actionList, numRepeats) {
        if (allSolves.list.length) {
            var numActions = actionList.length;
            for (var i = 0; i < numRepeats; i++)
                for (var j = 0; j < numActions; j++)
                    setTimeout(pengy.change, pengy.actionDur * (i * numActions + j), actionList[j]);
        }
    }
};

var refresh = {
    quickStats : function() {
        var numSolves = allSolves.list.length;
        var code = "[ " + numSolves;
        if (numSolves >= 3) {
            code += " | " + formatTime(allSolves.average());
            if (numSolves >= 5) {
                code += " | " + formatTime(new solveList(allSolves.list.slice(numSolves - 5)).average());
                if (numSolves >= 12)
                    code += " | " + formatTime(new solveList(allSolves.list.slice(numSolves - 12)).average());
            }
        }
        return code + " ]";
    },

    isSessionTimes : true,
    setSessionTimes : function() {
        this.isSessionTimes = document.getElementById("isSessionTimes").checked;
        this.all();
    },
    sessionTimes : function() {
        var numSolves = allSolves.list.length;
        var code = "<span id='time0' class='inactiveTime' "
                   + "onclick='allSolves.activate(0, true)' "
                   + "ondblclick='allSolves.delSolve(0)'>"
                   + formatTime(allSolves.list[0].time);
        if (allSolves.list[0].plus2)
            code += "+";
        code += "<\/span>";
        for (var i = 1; i < numSolves; i++) { // add the remaining times (with preceding commas) to sessionTimes
            code += ", <span id='time" + i + "' class='inactiveTime' "
                    + "onclick='allSolves.activate(" + i + ", true)' "
                    + "ondblclick='allSolves.delSolve(" + i + ")'>"
                    + formatTime(allSolves.list[i].time);
            if (allSolves.list[i].plus2)
                code += "+";
            code += "<\/span>";
        }
        return code;
    },

    all : function() {
        var numSolves = allSolves.list.length;
        if (numSolves) {
            infoBar.isCheat ? infoBar.info(infoBar.cheatSheet) : infoBar.clear();
            if (timer.mode == timer.idle) // to avoid conflict during manualPhase
                document.getElementById("timerDisplay").innerHTML = formatTime(allSolves.list[numSolves - 1].time);
            document.getElementById("quickStats").innerHTML = this.quickStats();
            document.getElementById("sessionTimes").innerHTML = this.isSessionTimes ? this.sessionTimes() : "";
            allSolves.activate(numSolves - 1, false);
        }
        else {
            infoBar.info("Spacebar: Start<br \/>Shift + O: Show/hide options<br \/>Shift + H: Show/hide help menu");
            // document.getElementById("pengy").innerHTML = "";
            pengy.change(pengy.stand);
            if (timer.mode == timer.idle) // so that manualPhase stays in manualPhase after reset/delete
                document.getElementById("timerDisplay").innerHTML = "&nbsp;";
            document.getElementById("quickStats").innerHTML = "";
            document.getElementById("sessionTimes").innerHTML = "";
            allSolves.activate(-1, false);
        }
        if (stats.isOn)
            stats.hide(); // hide stats after every refresh
    }
};

function keyUp(event) {
    if (event.keyCode == 32 && timer.mode == timer.idle && timer.isActive && !options.isOn) { // spacebar
        infoBar.isCheat ? infoBar.info(infoBar.cheatSheet) : infoBar.clear();
        if (stats.isOn)
            stats.hide();
        if (!timer.inspect.isOn)
            timer.run(new Date().getTime());
        else if (!timer.inspect.isRunning && timer.inspect.isActive)
            timer.inspect.run(new Date().getTime());
        else if (timer.inspect.isRunning) {
            timer.inspect.stop();
            timer.run(new Date().getTime());
        }
    }
}

function keyDown(event) {
    var whichKey = event.keyCode,
        numSolves = allSolves.list.length;
    
    if (timer.mode == timer.running)
        whichKey == 13 ? timer.stop(false) : timer.stop(true);

    else if (timer.mode == timer.idle && whichKey == 13) // enter
        scramble.puzzle(scramble.type);

    else if (whichKey == 45) // insert
        timer.switchMode();

    else if (whichKey == 72 && event.shiftKey)
        help.isOn ? help.hide() : help.show();

    else if (whichKey == 79 && event.shiftKey && !rightDiv.isMoving)
        options.isOn ? options.hide() : options.show(); // shift + O: show/hide options

    else if (whichKey == 49 && event.shiftKey) scramble.puzzle(1); // shift + 1: square-1
    else if (whichKey == 50 && event.shiftKey) scramble.puzzle(2); // shift + 2: optimal 2x2x2
    else if (whichKey == 51 && event.shiftKey) scramble.puzzle(3); // shift + 3
    else if (whichKey == 52 && event.shiftKey) scramble.puzzle(4); // shift + 4
    else if (whichKey == 53 && event.shiftKey) scramble.puzzle(5); // shift + 5
    else if (whichKey == 54 && event.shiftKey) scramble.puzzle(6); // shift + 6
    else if (whichKey == 55 && event.shiftKey) scramble.puzzle(7); // shift + 7
    else if (whichKey == 56 && event.shiftKey) scramble.puzzle(8); // shift + 8: megaminx
//    else if (whichKey == 57 && event.shiftKey) scramble.puzzle(9); // shift + 9: pyraminx

    else if (numSolves) {
        if (whichKey == 36 && !rightDiv.isMoving)
            stats.isOn? stats.hide() : stats.show(); // home: show/hide stats
        else if (whichKey == 82 && event.shiftKey)
            allSolves.reset();                       // shift + R: reset session
        else if ((whichKey == 46 || whichKey == 8) && event.shiftKey)
            allSolves.delSolve(allSolves.active);    // shift + delete/backspace: delete active solve
        else if (whichKey == 61 && event.shiftKey)
            allSolves.plus2Solve(allSolves.active);  // shift + =: +2 active solve
        else if (whichKey == 68 && event.shiftKey)
            allSolves.dnfSolve(allSolves.active);    // shift + D: DNF active solve
        else if (whichKey == 37)
            allSolves.active > 0 ? allSolves.activate(allSolves.active - 1, true) : allSolves.activate(numSolves - 1, true); // left
        else if (whichKey == 39)
            allSolves.active < numSolves - 1 ? allSolves.activate(allSolves.active + 1, true) : allSolves.activate(0, true); // right
    }
}

function init() {
    allSolves = new solveList([]);
    stats.clear(); // hack, to generate all divs within allStats
    
    if (document.cookie.charAt(0) == "g") {
        stats.threshold.good = cookies.between("gt=", "bt=");
        stats.threshold.bad = cookies.between("bt=", "sn=");
        scramble.cube.notation.fat45 = cookies.numAt("sn=", 3);
        scramble.cube.notation.fat = cookies.numAt("sn=", 4);
        scramble.cube.notation.multiLayer = cookies.numAt("sn=", 5);
        timer.inspect.isOn = cookies.numAt("in=", 3);
        timer.inspect.countup = cookies.numAt("in=", 4);
        timer.inspect.time = cookies.between("it=", "gl=");
        timer.inspect.greenLight = cookies.between("gl=", "rl=");
        timer.inspect.redLight = cookies.between("rl=", "li=");
        timer.isLazy = cookies.numAt("li=", 3);
        infoBar.isCheat = cookies.numAt("ic=", 3);
        infoBar.cheatSheet = cookies.between("cs=", "st=");
        scramble.type = cookies.numAt("st=", 3);
    }
    
    refresh.all();
    scramble.puzzle(scramble.type);
}
