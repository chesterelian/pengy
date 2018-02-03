var infoBar = {
    clear : function() {
        document.getElementById("infoBar").innerHTML = "";
        document.getElementById("infoBar").className = "blank";
    },

    activeScramble : function() {
        document.getElementById("infoBar").innerHTML = allSolves.list[allSolves.active].scramble;
        document.getElementById("infoBar").className = "activeScramble";
    },

    info : function(text) {
        document.getElementById("infoBar").innerHTML = text;
        document.getElementById("infoBar").className = "info";
    },

    error : function(text) {
        document.getElementById("infoBar").innerHTML = text;
        document.getElementById("infoBar").className = "error";
    },

    isCheat : false, // initialize
    cheatSheet : "", // initialize
    setCheat : function() {
        this.isCheat = document.getElementById("isCheat").checked;
        this.cheatSheet = this.isCheat ? document.getElementById("cheatSheet").value : "";
    }
};
