class WireConnectionTypeChain {
    changeConnectionType(connectionPoint, connectionType) {
    }
    
    setNextChainMember(nextchainMember) {
    }
}

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