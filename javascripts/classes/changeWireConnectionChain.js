/**
 * In this file the connection type of three or four wire segments, that are connected
 * in perpendicular form, as a "T" shape, or as a cross, changes with the
 * execution of its corresponding concrete class methods, in case the given connection
 * type fits the sublass. Otherwise the given connection point is passed to
 * the next member of the chain.
 * 
 * author: Christian Biasi
 * file created on 14.10.2019
 */

 /**
  * The parent class, that provides the needed functionality (interface) for
  * its subclasses to implement the Chain of responsibility pattern.
  * 
  */
class WireConnectionTypeChain {
    changeConnectionType(connectionPoint, connectionType) {
    }
    
    setNextChainMember(nextchainMember) {
    }
}

/**
 * The sublass, that changes the given connection point to a normal connection.
 * It represents a single dot, that connects the wires.
 */
class NormalConnection extends WireConnectionTypeChain {
    changeConnectionType(connectionPoint, connectionType) {
        if(connectionType === "diodeConnection") {
            console.log("create normal connection");
            // code to create normal connection
        } else {
            this.nextchainMember.changeConnectionType(connectionPoint, connectionType);
        }
    }
    
    setNextChainMember(nextchainMember) {
        this.nextchainMember = nextchainMember;
    }
}

/**
 * The sublass, that changes the given connection point to an empty connection.
 * It represents no symbol, so that the wires are not connected.
 */
class NoConnection extends WireConnectionTypeChain {
    changeConnectionType(connectionPoint, connectionType) {
        if(connectionType === "normalConnection") {
            console.log("delete any connection");
            // code to create normal connection
        } else {
            this.nextchainMember.changeConnectionType(connectionPoint, connectionType);
        }
    }
    
    setNextChainMember(nextchainMember) {
        this.nextchainMember = nextchainMember;
    }
}

/**
 * The sublass, that changes the given connection point to a diode connection.
 * It represents a diode symbol, where a horizontal wire also activates the
 * connected vertical wire.
 */
class DiodeConnection extends WireConnectionTypeChain {
    changeConnectionType(connectionPoint, connectionType) {
        if(connectionType === "emptyConnection") {
            console.log("create diode connection");
            // code to create normal connection
        } else {
            this.nextchainMember.changeConnectionType(connectionPoint, connectionType);
        }
    }
    
    setNextChainMember(nextchainMember) {
        this.nextchainMember = nextchainMember;
    }
}