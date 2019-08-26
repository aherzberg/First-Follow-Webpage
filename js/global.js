function initializeSets() {
    var arrayOfLines = document.getElementById('inputGrammer').value.split("\n");
    rules = parseInput(arrayOfLines);
    var prevVar = null;
    for (var i = 0; i < rules.length; i++) {
        if (i - 1 < 0) {
            document.getElementById("displayRules").innerHTML += "<br>" + rules[i].variable + " -> " + rules[i].rhs;
        } else {
            if (rules[i - 1].variable == rules[i].variable) {
                document.getElementById("displayRules").innerHTML += " | " + rules[i].rhs;
            } else {
                document.getElementById("displayRules").innerHTML += "<br>" + rules[i].variable + " -> " + rules[i].rhs;
            }
        }



        prevVar = rules[i].variable;
    }
    changed = true;
    NonTerminals = findNonTerminals();
    console.log("NonTerminals: " + NonTerminals);


}

function followStep() {

    if (changed) {

        changed = false;
        stepStart:
            for (var i = 0; i < rules.length; i++) {

                updateRuleDisplay(i);
                //if first character is terminal, add it to first set,
                var rhsGoForward = true;
                rhsCounter = rules[i].rhs.length - 1;
                while (rhsGoForward) {

                    rhsGoForward = false;
                    if (!contains(NonTerminals, rules[i].rhs[rhsCounter])) //if it is a terminal
                    {

                    } else // if it is a non terminal
                    {
                        if (rhsCounter == rules[i].rhs.length - 1) {

                            var tempRhsCounter = rhsCounter;
                            var c = 0;
                            do //while the first set of the new symbol contains epsilon  
                            {
                                console.log(c + " " + rules[i].variable + " " + rules[i].rhs[tempRhsCounter]);
                                c++;

                                if (addSettoSet(rules[i].variable, rules[i].rhs[tempRhsCounter], followSet, followSet)) {
                                    console.log(rules[i].variable + " " + rules[i].rhs[tempRhsCounter] + " success");
                                    console.log("last non terminal follow to follow");
                                    changed = true;
                                    updateFollowSetExplanation(rules[i].variable,rules[i].rhs[tempRhsCounter]);
                                    updateFollowDisplay();
                                    break stepStart;
                                }
                                if (tempRhsCounter != 0) {
                                    tempRhsCounter--;
                                } else {
                                    break;
                                }
                            } while (contains(getSet(rules[i].rhs[tempRhsCounter + 1], firstSet), "#"))




                        } else {
                            if (!contains(NonTerminals, rules[i].rhs[rhsCounter + 1])) // is next symbol a terminal?
                            {
                                if (!isInSet(rules[i].rhs[rhsCounter], rules[i].rhs[rhsCounter + 1], followSet)) //it is not already in the follow set of this non terminal
                                {
                                    console.log("add next terminal to this non terminal");
                                    updateFollowDisplay();
                                    updateFirsttoFollowExplanation(rules[i].rhs[rhsCounter + 1],rules[i].rhs[rhsCounter]);
                                    changed = true;
                                    break stepStart;
                                }
                            } else //is non terminal
                            {

                                //loop forward till either new symbol is terminal or first set does not contain epsilon
                                var tempRhsCounter = rhsCounter + 1;

                                do //while the first set of the new symbol contains epsilon  
                                {
                                    if (addSettoSet(rules[i].rhs[tempRhsCounter], rules[i].rhs[rhsCounter], firstSet, followSet)) {
                                        console.log("two non terminals next to each other first to follow");
                                        updateFirsttoFollowExplanation(rules[i].rhs[tempRhsCounter],rules[i].rhs[rhsCounter]);
                                        changed = true;
                                        updateFollowDisplay();
                                        break stepStart;
                                    }
                                    if (tempRhsCounter != rules[i].rhs.length - 1) {
                                        tempRhsCounter++;
                                    } else {
                                        break;
                                    }
                                } while (contains(getSet(rules[i].rhs[tempRhsCounter - 1], firstSet), "#"))
                            }
                        }
                    }
                    if (rhsCounter > 0) {
                        rhsCounter--;
                        rhsGoForward = true;
                    }

                }
            }
    }
    updateFollowDisplay();
}

function firstStep() {
    if (changed) {
        changed = false;
        stepStart:
            for (var i = 0; i < rules.length; i++) {
                updateRuleDisplay(i);
                //if first character is terminal, add it to first set,
                var rhsGoForward = true;
                rhsCounter = 0;
                while (rhsGoForward) {
                    rhsGoForward = false;
                    if (!contains(NonTerminals, rules[i].rhs[rhsCounter])) //if it is a terminal
                    {

                        if (!isInSet(rules[i].variable, rules[i].rhs[rhsCounter], firstSet)) //it is not already in the first set of this non terminal
                        {
                            updateFirstDisplay();
                            updateTerminalExplanation(rules[i].variable, rules[i].rhs[rhsCounter], rhsCounter);
                            changed = true;
                            break stepStart;
                        }

                    } else // if it is a non terminal
                    {
                        if (addSettoSet(rules[i].rhs[rhsCounter], rules[i].variable, firstSet, firstSet)) //add nonterminal first to this first set
                        {
                            updateFirstDisplay();
                            if (rhsCounter > 0) {
                                var previousVar = [];
                                for (var k = rhsCounter - 1; k >= 0; k--) {
                                    previousVar.push(rules[i].rhs[k]);
                                }
                                updateFirstSetExpandedExplanation(rules[i].variable, rules[i].rhs[rhsCounter], previousVar);
                            } else {
                                updateFirstSetExplanation(rules[i].variable, rules[i].rhs[rhsCounter]);
                            }
                            changed = true;
                            break stepStart;

                        }
                        if (contains(getSet(rules[i].rhs[rhsCounter], firstSet), "#")) {
                            if (rhsCounter == rules[i].rhs.length - 1) //if this is the last 
                            {
                                if (!isInSet(rules[i].variable, "#", firstSet)) //it is not already in the first set of this non terminal
                                {
                                    updateFirstDisplay();
                                    updateLastEpsilonExplanation(rules[i].variable);
                                    changed = true;
                                    break stepStart;

                                }

                            } else {
                                rhsGoForward = true;
                                rhsCounter++;
                                //changed = true;
                            }
                        }
                    }
                }
            }
    }
    updateFirstDisplay();
}

function quickFirst() {
    while (changed) {
        changed = false;
        stepStart:
            for (var i = 0; i < rules.length; i++) {
                //if first character is terminal, add it to first set,
                var rhsGoForward = true;
                rhsCounter = 0;
                while (rhsGoForward) {
                    rhsGoForward = false;
                    if (!contains(NonTerminals, rules[i].rhs[rhsCounter])) //if it is a terminal
                    {

                        if (!isInSet(rules[i].variable, rules[i].rhs[rhsCounter], firstSet)) //it is not already in the first set of this non terminal
                        {
                            changed = true;
                            break stepStart;
                        }

                    } else // if it is a non terminal
                    {
                        if (addSettoSet(rules[i].rhs[rhsCounter], rules[i].variable, firstSet, firstSet)) //add nonterminal first to this first set
                        {

                            if (rhsCounter > 0) {
                                var previousVar = [];
                                for (var k = rhsCounter - 1; k >= 0; k--) {
                                    previousVar.push(rules[i].rhs[k]);
                                }
                            }

                            changed = true;
                            break stepStart;

                        }
                        if (contains(getSet(rules[i].rhs[rhsCounter], firstSet), "#")) {
                            if (rhsCounter == rules[i].rhs.length - 1) //if this is the last 
                            {
                                if (!isInSet(rules[i].variable, "#", firstSet)) //it is not already in the first set of this non terminal
                                {
                                    changed = true;
                                    break stepStart;

                                }

                            } else {
                                rhsGoForward = true;
                                rhsCounter++;
                                //changed = true;
                            }
                        }
                    }
                }
            }
    }
}
function ExplanationRule()
{
     document.getElementById("displayExplanation").innerHTML = rules[currentRule].variable+" -> "+rules[currentRule].rhs +"<br>";
}
function updateLastEpsilonExplanation(variable) {
    ExplanationRule();
    document.getElementById("displayExplanation").innerHTML += "# is added to " + variable + " because all non-terminals in this rule can be epsilon, therefore this rule can evaluate to epsilon <br><br>";

}

function updateTerminalExplanation(variable, terminal, counter) {
    ExplanationRule();
    document.getElementById("displayExplanation").innerHTML += terminal + " is added to " + variable + "<br><br>";

}

function updateFirstSetExpandedExplanation(toVariable, fromVariable, previousVariables) {
    ExplanationRule();
    document.getElementById("displayExplanation").innerHTML += "Everything in the first set of " + fromVariable + " goes into " + toVariable + ". Since ";
    for (var i = 0; i < previousVariables.length; i++) {
        document.getElementById("displayExplanation").innerHTML += previousVariables[i] + ", ";
    }
    document.getElementById("displayExplanation").innerHTML += "have # in their first set, it is possible that one of the first characters of " + fromVariable + " to be one of first characters of " + toVariable +"<br><br>";

}

function updateFirstSetExplanation(toVariable, fromVariable) {
    ExplanationRule();
    document.getElementById("displayExplanation").innerHTML += "Everything in the first set of " + fromVariable + " goes into " + toVariable + "<br><br>";

}

function updateFollowSetExplanation(fromVariable, toVariable) {
    ExplanationRule();
    document.getElementById("displayExplanation").innerHTML += "Everything in the follow set of " + fromVariable + " goes into the follow set of " + toVariable + ". Since " + toVariable + " could hold the last symbols of " + fromVariable + ", anything that comes after " + fromVariable + ", could also come after " + toVariable + "<br><br>";

}
function updateFirsttoFollowExplanation(fromVariable,toVariable)
{
    ExplanationRule();
    document.getElementById("displayExplanation").innerHTML += "Everything in the first set of " + fromVariable + " goes into the follow set of "+ toVariable +". Since the first terminals from "+fromVariable+" can come after "+toVariable+".";
}

function updateRuleDisplay(ruleNum) {
    document.getElementById("displayRules").innerHTML = null;
    currentRule=ruleNum;
    var arrayOfLines = document.getElementById('inputGrammer').value.split("\n");
    rules = parseInput(arrayOfLines);
    var prevVar = null;
    for (var i = 0; i < rules.length; i++) {
        if (i - 1 < 0) {
            if (i == ruleNum) {
                document.getElementById("displayRules").innerHTML += "<br>" + rules[i].variable + " -> <u><b>" + rules[i].rhs + "</b></u>";
            } else {
                document.getElementById("displayRules").innerHTML += "<br>" + rules[i].variable + " -> " + rules[i].rhs;
            }

        } else {
            if (rules[i - 1].variable == rules[i].variable) {
                if (i == ruleNum) {
                    document.getElementById("displayRules").innerHTML += " | <u><b>" + rules[i].rhs + "</b></u>";

                } else {
                    document.getElementById("displayRules").innerHTML += " | " + rules[i].rhs;

                }
            } else {
                if (i == ruleNum) {
                    document.getElementById("displayRules").innerHTML += "<br>" + rules[i].variable + " -> <u><b>" + rules[i].rhs + "</b></u>";

                } else {
                    document.getElementById("displayRules").innerHTML += "<br>" + rules[i].variable + " -> " + rules[i].rhs;
                }
            }
        }
        prevVar = rules[i].variable;
    }


    /*
    if (ruleNum == i) {
        document.getElementById("displayRules").innerHTML += "<span class='highlight'>" + rules[i].variable + " -> " + rules[i].rhs + "</span>" + "<br><br>";
    } else {
        document.getElementById("displayRules").innerHTML += rules[i].variable + " -> " + rules[i].rhs + "<br><br>";
    }*/

}

function updateFirstDisplay() {
    document.getElementById("displaySet").innerHTML = "";
    for (var i = 0; i < firstSet.length; i++) {
        document.getElementById("displaySet").innerHTML += "First("+firstSet[i].variable + ") = ";
        for (var j = 0; j < firstSet[i].rhs.length; j++) {
            document.getElementById("displaySet").innerHTML += firstSet[i].rhs[j] + ", ";
        }
        document.getElementById("displaySet").innerHTML += "<br>";
    }
}

function updateFollowDisplay() {
    document.getElementById("displaySet").innerHTML = "";
    for (var i = 0; i < followSet.length; i++) {
        document.getElementById("displaySet").innerHTML += "Follow("+followSet[i].variable+")"+ "= ";
        for (var j = 0; j < followSet[i].rhs.length; j++) {
            document.getElementById("displaySet").innerHTML += followSet[i].rhs[j] + ", ";
        }
        document.getElementById("displaySet").innerHTML += "<br>";
    }
}

function addSettoSet(startVariable, endVariable, fSet, secondSet) {
    var changed = false;
    var startSet = getSet(startVariable, fSet);
    var endSet = getSet(endVariable, secondSet);
    for (var i = 0; i < startSet.length; i++) {
        if (startSet[i] != "#" && !contains(endSet, startSet[i])) // if it isnt already in the set and isnt epsilon
        {
            endSet.push(startSet[i]);
            changed = true;
        }
    }
    if (changed == true) {

        return true;
    } else {
        return false;
    }
}

function getSet(variable, set) {

    for (var i = 0; i < set.length; i++) {
        if (set[i].variable == variable) {
            return set[i].rhs;
        }
    }
    return [];
}

function isInSet(Var, terminal, set) {
    for (var i = 0; i < set.length; i++) {
        if (set[i].variable == Var) //Nonterminals match
        {
            if (!contains(set[i].rhs, terminal)) {
                //console.log(terminal);
                set[i].rhs.push(terminal);

                return false;
            } else {
                return true;
            }

        }
    }
    return true;
}

function pushRulesSet() {
    var set = [];
    for (var i = 0; i < NonTerminals.length; i++) {
        set.push(new Rule(NonTerminals[i], []));
    }
    return set;
}

function findNonTerminals() {
    var nonTerminalList = [];

    for (var i = 0; i < rules.length; i++) {

        if (!contains(nonTerminalList, rules[i].variable)) {

            nonTerminalList.push(rules[i].variable);
        }
    }
    return nonTerminalList;
}

function contains(list, obj) {

    for (var i = 0; i < list.length; i++) {
        if (list[i] == obj) {
            return true;
        }
    }
    return false;
}

function parseInput(input) {

    var arrayOfRules = [];

    for (var i = 0; i < input.length; i++) {

        var parsedLine = input[i].split("->");

        if (parsedLine[0].trim().length > 1) {
            console.log("ERROR: LHS is > 1");
        } else {
            var parsedRHS = parsedLine[1].split("|");

            for (var j = 0; j < parsedRHS.length; j++) {
                arrayOfRules.push(new Rule(parsedLine[0].trim(), parsedRHS[j].trim()));
            }


        }



    }
    console.log("List of rules");
    console.log(arrayOfRules);
    return arrayOfRules;
}

function Rule(variable, rhs) {
    this.variable = variable;
    this.rhs = rhs;
}