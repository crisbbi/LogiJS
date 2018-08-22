// This file generates the VHDL code of the logic circuit as an export option.

function generateCode(filename) {
    // store generated code in an array so saveStrings() can be used
    let codeArray = [];

    // import library ieee to use 
    codeArray.push("library ieee;"); 
    codeArray.push("use ieee.std_logic_1164.all;");
    
    // create an entity of the gates with I/O-ports
    for(let index = 0; index < gates.length; index++) {
        switch(caption){
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
                for(let inputNumber = 0; inputNumber < inputCount; inputNumber++) {
                    if(inputNumber < inputCount - 1) {
                        inputsString.concat("in" + inputNumber + ", ");
                    } else {
                        inputsString.concat(" in" + inputNumber + ": STD_LOGIC;");
                    }
                }
                codeArray.push(inputsString);

                /*  
                add output ports:
                count up until outputCount - 1 and then add the last 
                port, to then attach ": STD_LOGIC;" to it
                */
                let outputsString = "";
                for(let outputNumber = 0; outputNumber < inputCount; outputNumber++) {
                   if(outputNumber < inputCount - 1) {
                        outputsString.concat("out" + outputNumber + ", ");
                   } else {
                        outputsString.concat(" out" + outputNumber + ": STD_LOGIC;");
                   }
                }
                codeArray.push(outputsString);
                
                // close entity description
                codeArray.push(");"); 
                codeArray.push("end And_" + gates[index].inputCount + ";");

                // add architecture part
                break;
            case "or":
                
                break;
            case "xor":
                codeArray = codeArray.concat(" entity Xor_" + gates[index].inputCount + " is");
                break;
            default: 
                codeArray = codeArray;
        }
    }
    saveStrings(codeArray, filename, 'vhdl');
}