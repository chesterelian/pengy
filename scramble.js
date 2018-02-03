var scramble = {
    type : 3, // initialize, puzzle type

    current : "", // declare an empty variable to hold scramble strings later on

    isMonospace : false, // initialize
    setMonospace : function() {
        this.isMonospace = document.getElementById("isMonospace").selectedIndex;
        document.getElementById("curScramble").innerHTML = this.isMonospace ? ("<span class='monospaceFont'>" + this.current + "<\/span>") : this.current;
    },
        
    cube : {
        notation : { // for >= 2-layered turns
            wide : 0, // for 2 layers
            lowerCase : 1, // for 2 layers
            prefix : 2, // for >= 2 layers
            lowerCasePrefix : 3, // for >= 3 layers
            
            fat45 : 0, // initialize (to wide), preferred notation for 2-layered 4x4x4/5x5x5 turns
            fat : 2, // initialize (to prefix), preferred notation for 2-layered >= 6x6x6 turns
            multiLayer : 2, // initialize (to prefix), preferred notation for multiple-layered >= 6x6x6 turns
            
            setFat45 : function() {
                this.fat45 = document.getElementById("fat45").selectedIndex;
                if (scramble.type == 4 || scramble.type == 5)
                    scramble.puzzle(scramble.type, scramble.len);
            },
            setFat : function() {
                this.fat = 2 - document.getElementById("fat").selectedIndex; // 0 -> 2, 1 -> 1, 2 -> 0
                if (scramble.type == 6 || scramble.type == 7)
                    scramble.puzzle(scramble.type, scramble.len);
            },
            setMultiLayer : function() {
                this.multiLayer = document.getElementById("multiLayer").selectedIndex + 2; // 0 -> 2, 1 -> 3
                if (scramble.type == 6 || scramble.type == 7)
                    scramble.puzzle(scramble.type, scramble.len);
            }
        },
        
        whatLen : function(size) { // given the cube size, return the scramble length
            switch (size) {
                case 3: return 25;
                case 4: return 40;
                case 5: return 60;
                case 6: return 80;
                case 7: return 100;
            }
        },
        
        translate : function(plane, size) { // translate plane number to cube notation
            var level = Math.floor(plane / 3) + 1, // on a 3x3x3, the breaks between U/E, R/M, and F/S are level 1, the rest are level 2, etc.
                whichHalf = level <= size / 2 ? 0 : 3, // if it's on the U/R/F-half of the cube, it's 0, otherwise 3, we'll see why in the next var

                layer = "URFDLB".charAt(plane % 3 + whichHalf), // in mod 3, if plane % 3 == 0, then it's parallel to U, if 1, then R, if 2, then F
                prefix = !whichHalf ? level : size - level, // !whichHalf means whichHalf == 0 means it's on the U/R/F-half of the cube
                suffix = ["", "'", "2"][Math.floor(Math.random() * 3)];
            
            if (prefix == 1)
                prefix = "";
            
            else if (prefix == 2) {
                whichFat = size <= 5 ? this.notation.fat45 : this.notation.fat; // if cube size <= 5, use fat45 as reference, otherwise use fat
                if (whichFat != this.notation.prefix) { // if the preferred notation is prefix, there's nothing to be done
                    prefix = ""; // if it's not, get rid of the prefix
                    whichFat ? layer = layer.toLowerCase() : suffix = "w" + suffix; // if whichFat is true, it must be 1, so lowerCase, otherwise 0, so wide
                }
            }
            
            else if (this.notation.multiLayer == this.notation.lowerCasePrefix) // implied: if prefix >= 3
                layer = layer.toLowerCase(); // just convert to lower case because the prefix is already there

            return prefix + layer + suffix;
        },

        generate : function(size) {
            var len = this.whatLen(size), // scramble length
                numPlanes = 3 * (size - 1), // number of breaks in the cube
                usedPlanes = [Math.floor(Math.random() * numPlanes)], // pick the first break, store it in usedPlanes
                code = this.translate(usedPlanes[0], size); // add it to the scramble
            for (var i = 1; i < len; i++) { // pick remaining breaks
                var plane = Math.floor(Math.random() * numPlanes), // pick a random break
                    isUsed = false, // we still don't know if it's used
                    usedPlanesLen = usedPlanes.length;
                for (var j = 0; j < usedPlanesLen; j++) // compare plane with every element in usedPlanes
                    if (plane == usedPlanes[j]) {
                        isUsed = true;
                        break;
                    }
                if (isUsed) // if it's in usedPlanes, go back and pick another plane
                    i--;
                else {
                    if ((plane - usedPlanes[0]) % 3) // if plane is not parallel to the plane(s) in usedPlanes (if it's parallel then difference % 3 must be 0)
                        usedPlanes = [];
                    usedPlanes.push(plane);
                    code += " " + this.translate(plane, size);
                }
            }
            return code;
        }
    },
    
    square1 : {
        generate : function() {
            return "";
        }
    },

    megaminx : {
        generate : function() {
            var code = "";
            // for(var i=1;i<78;i++)code+=i%11?"DR"[i%11%2]+(Math.random()<.5?"++ ":"-- "):(Math.random()<.5?"U":"U'")+"<br \/>";
            for (var i = 0; i < 7; i++) {
                for (var j = 0; j < 10; j++)
                    code += "RD".charAt(j % 2) + (Math.floor(Math.random() * 2) ? "++ " : "-- ");
                code += (Math.floor(Math.random() * 2) ? "U"  : "U'") + "<br \/>";
            }
            return code;
        }
    },
    
    pyraminx : {
        generate : function() {
            return "";
        }
    },
    
    puzzle : function(type) {
        this.type = type;

        if (type == 1)
            this.current = scramblesquare1();
        else if (type == 2)
            this.current = scramble2x2x2();
        else if (type == 8)
            this.current = this.megaminx.generate();
        else if (type == 9)
            this.current = this.pyraminx.generate();
        else
            this.current = this.cube.generate(type);

        document.getElementById("curScramble").innerHTML = this.isMonospace ? ("<span class='monospaceFont'>" + this.current + "<\/span>") : this.current;
    }
};
