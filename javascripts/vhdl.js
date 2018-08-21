// This file generates the VHDL code of the logic circuit as an export option.

function generateCode(filename) {
    var code = "";

    var andCounter = 0;
    var orCounter = 0;
    var xorCounter = 0;

    // import library ieee to use 
    code = code.concat("library ieee; use ieee.std_logic_1164.all;");
    
    // create an entity of the gates with I/O-ports
    for(let index = 0; index < gates.length; index++) {
        switch(caption){
            case "and":
                // begin entity description
                code = code.concat(" entity And_" + gates[index].inputCount + " is");
                code = code.concat(" ports(");

                /*  
                add input ports:
                count up until inputCount - 1 and then add the last 
                port, to then attach ": STD_LOGIC;" to it
                */
                for(let inputNumber = 0; inputNumber < inputCount; inputNumber++) {
                    if(inputNumber < inputCount - 1) {
                        code = code.concat(" in" + inputNumber + ", ");
                    } else {
                        code = code.concat(" in" + inputNumber + ": STD_LOGIC;");
                    }
                }

                /*  
                add output ports:
                count up until outputCount - 1 and then add the last 
                port, to then attach ": STD_LOGIC;" to it
                */
                for(let outputNumber = 0; outputNumber < outputCount; outputNumber++) {
                    if(outputNumber < inputCount - 1) {
                        code = code.concat(" out" + outputNumber + ", ");
                    } else {
                        code = code.concat(" out" + outputNumber + ": STD_LOGIC;");
                    }
                }
                
                // close entity description
                code = code.concat(" ); end And_" + gates[index].inputCount + ";");

                // add architecture part
                break;
            case "or":
                code = code.concat(" entity Or_" + gates[index].inputCount + " is");
                break;
            case "xor":
                code = code.concat(" entity Xor_" + gates[index].inputCount + " is");
                break;
            default: 
                code = code;
        }
    }
}