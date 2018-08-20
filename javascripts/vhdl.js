// This file generates the VHDL code of the logic circuit as an export option.

function generateCode(filename) {
    var content = "";

    // import library ieee to use 
    content = content.concat("library ieee; use ieee.std_logic_1164.all; ");
    
    // create an entity of the gates with I/O-ports
    for(let index = 0; index < gates.length; index++) {
        switch(caption){
            case "and":
                break;
            case "or":
                break;
            case "xor":
                break;
            default: 
                content = content;
        }
    }
}