var timer = {
    idle    : 0,
    running : 1,
    manual  : 2,
    mode    : 0, // initialize (to idle)

    isActive : true, // initialize
    inactiveDur : 500, // initialize

    elapsed : null, // initialize
    engine : null, // initialize

    run : function(initTime) {
        this.mode = this.running;
        this.elapsed = Math.floor((new Date().getTime() - initTime) / 10);
        document.getElementById("timerDisplay").innerHTML = formatTime(this.elapsed);
        this.elapsed % (pengy.speed * 2) < pengy.speed ? pengy.change(pengy.right) : pengy.change(pengy.left);
        this.engine = setTimeout("timer.run(" + initTime + ")", 10);
    },

    stop : function(saveSolve) { // if saveSolve is false, it discards the solve
        if (this.elapsed > 9) { // timer won't stop if the time elapsed is < 0.10 seconds
            this.isActive = false;
            setTimeout("timer.isActive = true; timer.inspect.isActive = true", this.inactiveDur);
            this.mode = this.idle;
            clearTimeout(this.engine);

            if (saveSolve) {
                allSolves.list.push(new solve(this.elapsed, scramble.current));
                if (this.inspect.isOn)
                    allSolves.list[allSolves.list.length - 1].inspection = this.inspect.elapsed;

                if (allSolves.list.length > 1 && allSolves.minInd() == allSolves.list.length - 1) {
                    pengy.dance([pengy.right, pengy.sit, pengy.left, pengy.stand], 3);
                    effects.manualFade(effects.bgColor, "timerDisplay", ["#ffe233", "#ffffff", "#ffe233", "#ffffff", "#ffe233", "#ffffff", "#ffe233", "#ffe85c", "#ffee85", "#fff3ad", "#fff9d6", "#ffffff"], 0, 80, 80);
                }
                else if (this.elapsed < stats.threshold.good)
                    effects.manualFade(effects.bgColor, "timerDisplay", ["#e5ffd3", "#eaffdc", "#efffe5", "#f5ffed", "#fafff6", "#ffffff"], 0, 430, 80); // green
                else if (this.elapsed >= stats.threshold.bad)
                    effects.manualFade(effects.bgColor, "timerDisplay", ["#ffd3e5", "#ffdcea", "#ffe5ef", "#ffedf5", "#fff6fa", "#ffffff"], 0, 430, 80); // red
                else
                    effects.manualFade(effects.bgColor, "timerDisplay", ["#d3e5ff", "#dceaff", "#e5efff", "#edf5ff", "#f6faff", "#ffffff"], 0, 430, 80); // blue
            }

            refresh.all();
            scramble.puzzle(scramble.type);
        }
    },

    switchMode : function() {
        if (this.mode == this.idle) {
            this.mode = this.manual;
            document.getElementById("timerDisplay").innerHTML = "<input id='manualInput' type='text' size='5' onkeydown='timer.evalManual(event)' \/>";
            document.getElementById("manualInput").focus();
        }
        else if (this.mode == this.manual) {
            this.mode = this.idle;
        }
        refresh.all();
    },

    isLazy : true,
    setLazy : function() { this.isLazy = document.getElementById("isLazy").checked; },

    evalManual : function(event) {
        if (event.keyCode == 13) { // enter
            var rawTime = document.getElementById("manualInput").value;
            if (this.isLazy) {
                if (isFinite(rawTime)) { // if it's a number
                    rawTime = Number(rawTime); // hard conversion to number
                    if (rawTime) { // if it's not zero (or blank)
                        if (rawTime % 10000 >= 6000) { // if the seconds part >= 60
                            infoBar.error("Invalid time");
                            return;
                        }
                        else if (rawTime >= 10000) // if it's >= 1 minute
                            rawTime = (Math.floor(rawTime / 10000)) * 6000 + rawTime % 10000;
                        allSolves.list.push(new solve(rawTime, scramble.current));
                    }
                }
                else // if it's anything but a number, it's a DNF
                    allSolves.list.push(new solve(-1, scramble.current));
            }
            else { // nonLazy
                rawTime = parseNonLazy(rawTime);
                if (rawTime)
                    allSolves.list.push(new solve(rawTime, scramble.current));
            }
            document.getElementById("manualInput").value = "";
            refresh.all();
            scramble.puzzle(scramble.type);
        }
    },

    inspect : {
        isOn : false, // initialize
        time : 15, // initialize
        countup : false, // initialize

        greenLight : 8, // initialize
        redLight : 12, // initialize

        setInspect : function() {
            this.isOn = document.getElementById("isInspect").checked;

            var time = Number(document.getElementById("inspectionTime").value);
            if (time) // if it's a number, round it, if it's 0/blank/NaN, invalid
                this.time = Math.round(time);
            else {
                this.time = 15;
                if (this.isOn)
                    infoBar.error("Invalid inspection time");
            }

            this.countup = document.getElementById("countWhere").selectedIndex;

            var green = Number(document.getElementById("greenLight").value);
            if (green)
                this.greenLight = Math.round(green);
            else {
                this.greenLight = 8;
                if (this.isOn)
                    infoBar.error("Invalid green light time");
            }
            var red = Number(document.getElementById("redLight").value);
            if (red)
                this.redLight = Math.round(red);
            else {
                this.redLight = 12;
                if (this.isOn)
                    infoBar.error("Invalid red light time");
            }
        },

        isRunning : false,

        isActive : true,

        elapsed : null,
        engine: null,

        run : function(initTime) {
            this.isRunning = true;
            this.elapsed = Math.floor((new Date().getTime() - initTime) / 1000);
            document.getElementById("timerDisplay").innerHTML = this.countup ? this.elapsed : this.time - this.elapsed;
            if (this.elapsed == this.greenLight)
                document.getElementById("timerDisplay").style.backgroundColor = "#e5ffd3";
            if (this.elapsed == this.redLight)
                document.getElementById("timerDisplay").style.backgroundColor = "#ffd3e5";
            this.engine = setTimeout("timer.inspect.run(" + initTime + ")", 500);
        },

        stop : function() {
            this.isActive = false; // reactivate after whole solve is done, at timer.stop()
            this.isRunning = false;
            document.getElementById("timerDisplay").style.backgroundColor = "white";
            clearTimeout(this.engine);
        }
    }
};
