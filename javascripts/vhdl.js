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
                code = code.concat(" entity And_" + andCounter++ + " is");
                break;
            case "or":
                code = code.concat(" entity Or_" + orCounter++ + " is");
                break;
            case "xor":
                code = code.concat(" entity Xor_" + xorCounter++ + " is");
                break;
            default: 
                code = code;
        }
    }
}