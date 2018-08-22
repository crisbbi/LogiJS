// This file generates the VHDL code of the logic circuit as an export option.

function generateCode(filename) {
    // store generated code in an array so saveStrings() can be used
    let codeArray = [];

    // import library ieee to use 
    codeArray.push("library ieee;"); 
    codeArray.push("use ieee.std_logic_1164.all;");
    
    // create an entity of the gates with I/O-ports
    for(let index = 0; index < gates.length; index++) {
        let gateLogic = gates[index].logicFunction;
        switch(gateLogic){
            case "and":
                // begin entity description
                codeArray.push("entity And_" + gates[index].inputCount + " is");
                codeArray.push("ports(");

                /*  
                add input ports:
                count up until inputCount - 1 and then add the last 
                port, to then attach ": STD_LOGIC;" to it
                */
                let inputsString = "";
                for(let inputNumber = 0; inputNumber < gates[index].inputCount; inputNumber++) {
                    if(inputNumber < gates[index].inputCount - 1) {
                        inputsString += "in" + inputNumber + ", ";
                    } else {
                        inputsString += "in" + inputNumber + ": STD_LOGIC;";
                    }
                }
                codeArray.push(inputsString);

                /*  
                add output ports:
                count up until outputCount - 1 and then add the last 
                port, to then attach ": STD_LOGIC;" to it
                */
                let outputsString = "";
                for(let outputNumber = 0; outputNumber < gates[index].outputCount; outputNumber++) {
                   if(outputNumber < gates[index].outputCount - 1) {
                        outputsString += "out" + outputNumber + ", ";
                   } else {
                        outputsString += "out" + outputNumber + ": STD_LOGIC;";
                   }
                }
                codeArray.push(outputsString);
                
                // close entity description
                codeArray.push(");"); 
                codeArray.push("end And_" + gates[index].inputCount + ";");

                // add architecture part
                break;
            case "or":
                codeArray = codeArray;
                break;
            case "xor":
                codeArray = codeArray;
                break;
            default: 
                codeArray = codeArray;
        }
    }
    saveStrings(codeArray, filename, 'vhdl');
}