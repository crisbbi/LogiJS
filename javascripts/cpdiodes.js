// File: cpdiodes.js

/*
    Deletes all diodes that are not connected to two or more segments
*/
function deleteInvalidDiodes() {
    for (let j = diodes.length - 1; j >= 0; j--) {
        if (!fullCrossing(diodes[j].x, diodes[j].y) && !tCrossing(diodes[j].x, diodes[j].y)) {
            console.log("not fullCrossing");
            diodes.splice(j, 1);
        }
    }
}

/*
    Deletes all conpoints that are not connected to three or more segments
*/
function deleteInvalidConpoints() {
    for (let j = conpoints.length - 1; j >= 0; j--) {
        if (!tCrossing(conpoints[j].x, conpoints[j].y) && !fullCrossing(conpoints[j].x, conpoints[j].y)) {
            conpoints.splice(j, 1);
        }
    }
}

/*
    Creates a new connection point for group g at position x, y
    Only creates if not existing and no diode at the point
*/
function createConpoint(x, y, state, g) {
    console.log("createConPoint");
    if (isConPoint(x, y) < 0) {
        conpoints.push(new ConPoint(x, y, state, g));
        return conpoints.length - 1;
    }
    return -1;
}

/*
    Determines, whether there is a vertical and a horizontal wire segment starting or ending in point (x, y)
*/
function rightAngle(x, y) {
    let hor = false;
    let ver = false;
    for (let i = 0; i < segments.length; i++) {
        if ((segments[i].startX === x && segments[i].startY === y) || (segments[i].endX === x && segments[i].endY === y)) {
            hor = (hor || segments[i].direction === 0);
            ver = (ver || segments[i].direction === 1);
        }
    }
    return (hor && ver);
}

function fullCrossing(x, y) {
    let horFound = false;
    let verFound = false;
    for (let i = 0; i < wires.length; i++) {
        if (wires[i].direction === 0 && Math.min(wires[i].startX, wires[i].endX) < x && Math.max(wires[i].startX, wires[i].endX) > x && Math.min(wires[i].startY, wires[i].endY) == y) { // jshint ignore:line
            horFound = true;
        } else if (wires[i].direction === 1 && Math.min(wires[i].startY, wires[i].endY) < y && Math.max(wires[i].startY, wires[i].endY) > y && Math.min(wires[i].startX, wires[i].endX) == x) { // jshint ignore:line
            verFound = true;
        }
    }
    return (horFound && verFound);
}

/**
 * Checks whether a wire connects horizontally with the given coordinates, 
 * that represent the grid position. 
 * Returns true, if the current wire is horizontal and starts or ends on the 
 * same coordinates.
 * @param wireNumber The number of the current wire 
 * @param crossPointXcoordinate The x coordinate on the grid
 * @param crossPointYcoordinate The y coordinate on the grid
 */
function hasWireHorizontalConnection(wireNumber, crossPointXcoordinate, crossPointYcoordinate) {
    let isHorizontal = wires[wireNumber].direction === 0; 
    let wireConnectsFromLeft = Math.min(wires[wireNumber].startX, wires[wireNumber].endX) === crossPointXcoordinate; 
    let wireConnectsFromRight = Math.max(wires[wireNumber].startX, wires[wireNumber].endX) === crossPointXcoordinate; 
    let yPositionIsCorrect = Math.min(wires[wireNumber].startY, wires[wireNumber].endY) === crossPointYcoordinate;

    return isHorizontal && (wireConnectsFromLeft || wireConnectsFromRight) && yPositionIsCorrect;
}

/**
 * Checks whether a wire crosses the given coordinates horizontally, that 
 * represent the grid position. In case it does, return true. 
 * @param wireNumber The number of the current wire 
 * @param crossPointXcoordinate The x coordinate on the grid
 * @param crossPointYcoordinate The y coordinate on the grid
 */
function isHorizontalWireCrossing(wireNumber, crossPointXcoordinate, crossPointYcoordinate) {
    let isHorizontal = wires[wireNumber].direction === 0; 
    let isHorizontalWireCrossing = Math.min(wires[wireNumber].startX, wires[wireNumber].endX) < crossPointXcoordinate && 
                                    Math.max(wires[wireNumber].startX, wires[wireNumber].endX) > crossPointXcoordinate; 
    let yPositionIsCorrect = Math.min(wires[wireNumber].startY, wires[wireNumber].endY) === crossPointYcoordinate;
        
    return isHorizontal && isHorizontalWireCrossing && yPositionIsCorrect;
}

/**
 * Checks whether a wire connects vertically with the given coordinates, 
 * that represent the grid position. 
 * Returns true, if the current wire is vertical and starts or ends on the 
 * same coordinates.
 * @param wireNumber The number of the current wire 
 * @param crossPointXcoordinate The x coordinate on the grid
 * @param crossPointYcoordinate The y coordinate on the grid
 */
function hasWireVerticalConnection(wireNumber, crossPointXcoordinate, crossPointYcoordinate) {
    let isVertical = wires[wireNumber].direction === 1; 
    let wireConnectsFromAbove = Math.min(wires[wireNumber].startY, wires[wireNumber].endY) === crossPointYcoordinate;
    let wireConnectsFromBelow = Math.max(wires[wireNumber].startY, wires[wireNumber].endY) === crossPointYcoordinate;
    let xPositionIsCorrect = Math.min(wires[wireNumber].startX, wires[wireNumber].endX) === crossPointXcoordinate;
    
    return isVertical && (wireConnectsFromAbove || wireConnectsFromBelow) && xPositionIsCorrect;
}

/**
 * Checks whether a wire crosses the given coordinates vertically, that 
 * represent the grid position. In case it does, return true. 
 * @param wireNumber The number of the current wire 
 * @param crossPointXcoordinate The x coordinate on the grid
 * @param crossPointYcoordinate The y coordinate on the grid
 */
function isVerticalWireCrossing(wireNumber, crossPointXcoordinate, crossPointYcoordinate) {
    let isVertical = wires[wireNumber].direction === 1; 
    let wireCrossesVertically = Math.min(wires[wireNumber].startY, wires[wireNumber].endY) < crossPointYcoordinate && 
                                Math.max(wires[wireNumber].startY, wires[wireNumber].endY) > crossPointYcoordinate;
    let xPositionIsCorrect = Math.min(wires[wireNumber].startX, wires[wireNumber].endX) === crossPointXcoordinate;

    return isVertical && wireCrossesVertically && xPositionIsCorrect;
}

/**
 * Checks for a T connection between wires. Returns true, if the (crossPointXcoordinate, crossPointYcoordinate)
 * coordinate has one wire connected to it and one wire crossing it.
 * @param crossPointXcoordinate The x coordinate on the grid 
 * @param crossPointYcoordinate The y coordinate on the grid
 */
function tCrossing(crossPointXcoordinate, crossPointYcoordinate) {
    let horizontalWireConnection = false;
    let verticalWireConnection = false;
    let horizontalWireCrossing = false;
    let verticalWireCrossing = false;
    for (let i = 0; i < wires.length; i++) {
        if (hasWireHorizontalConnection(i, crossPointXcoordinate, crossPointYcoordinate)) {
            horizontalWireConnection = true;
        }
        if (isVerticalWireCrossing(i, crossPointXcoordinate, crossPointYcoordinate)) {
            verticalWireCrossing = true;
        }
        if (isHorizontalWireCrossing(i, crossPointXcoordinate, crossPointYcoordinate)) {
            horizontalWireCrossing = true;
        }
        if (hasWireVerticalConnection(i, crossPointXcoordinate, crossPointYcoordinate)) {
            verticalWireConnection = true;
        }
    }
    return ((horizontalWireConnection && verticalWireCrossing) || 
            (horizontalWireCrossing && verticalWireConnection)) && 
            !(horizontalWireCrossing && verticalWireCrossing);
}

function deleteConpoint(conpointNumber) {
    pushUndoAction('delCp', [conpointNumber], conpoints.splice(conpointNumber, 1));
    doConpoints();
    reDraw();
}

function deleteDiode(diodeNumber) {
    pushUndoAction('delDi', [diodeNumber], diodes.splice(diodeNumber, 1));
    doConpoints();
    reDraw();
}

function createDiode(x, y, state) {
    diodes.push(new Diode(x, y, state, transform));
    diodes[diodes.length - 1].updateClickBox();
    pushUndoAction('addDi', [diodes.length - 1], [diodes[diodes.length - 1]]);
}

/*
    Checks if a connection point is at the given position
*/
function isConPoint(x, y) {
    for (let i = 0; i < conpoints.length; i++) {
        if (conpoints[i].x === x && conpoints[i].y === y) {
            return i;
        }
    }
    return -1;
}

function listConpoints(x1, y1, x2, y2) {
    let cps = [];
    if (y1 == y2) { // jshint ignore:line
        for (let i = 0; i < conpoints.length; i++) {
            if (conpoints[i].x > x1 && conpoints[i].x < x2 && conpoints[i].y == y1) { // jshint ignore:line
                cps.push(i);
            }
        }
    } else {
        for (let i = 0; i < conpoints.length; i++) {
            if (conpoints[i].y > y1 && conpoints[i].y < y2 && conpoints[i].x == x1) { // jshint ignore:line
                cps.push(i);
            }
        }
    }
    return cps;
}

function isDiode(x, y) {
    for (let i = 0; i < diodes.length; i++) {
        if (diodes[i].x === x && diodes[i].y === y) {
            return i;
        }
    }
    return -1;
}

function diodesOnWire(wire) {
    let result = [];
    if (wire.direction === 0) {
        for (let i = 0; i < diodes.length; i++) {
            if (diodes[i].y === wire.startY && diodes[i].x >= wire.startX && diodes[i].x <= wire.endX) {
                result.push(i);
            }
        }
    } else { 
        for (let i = 0; i < diodes.length; i++) {
            if (diodes[i].x === wire.startX && diodes[i].y >= wire.startY && diodes[i].y <= wire.endY) {
                result.push(i);
            }
        }
    }
    return result;
}

/*
    Updates all ConPoints, including deleting
*/
function doConpoints() {
    /**
     * 4.12.19
     * PROBLEM: The state transition from full cross with diode to T cross
     * uses deleteWires() to delete the diode before cleaning up with 
     * doConpoints(), so a T cross always returns to dot connection after
     * deleting full cross. Also potential problems with recognition of
     * horizontally/vertically connected/crossing wires, transition from
     * a T cross, rotated clockwise with a dot connection, doesn't remove the 
     * dot when replacing with diode.  
     * 
     */
    for (let i = 0; i < wires.length; i++) {
        if (tCrossing(wires[i].startX, wires[i].startY) && isDiode(wires[i].startX, wires[i].startY) < 0) {
            createConpoint(wires[i].startX, wires[i].startY, false, -1);
        }
        if (tCrossing(wires[i].endX, wires[i].endY) && isDiode(wires[i].endX, wires[i].endY) < 0) {
            createConpoint(wires[i].endX, wires[i].endY, false, -1);
        }
    }
    deleteInvalidDiodes();
    deleteInvalidConpoints();
}

function showPreview(type, x, y) {
    fill(50, 50, 50);
    noStroke();
    scale(transform.zoom); // Handle the offset from scaling and translating
    translate(transform.dx, transform.dy);
    switch (type) {
        case 'diode':
            triangle(x, y + 11, x - 11, y, x + 11, y);
            break;
        case 'conpoint':
            rect(x - 3, y - 3, 7, 7);
            break;
        default:
    }
    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);
}

function switchDiodeForConpoint(diodeNumber) {
    let newCp = createConpoint(diodes[diodeNumber].x, diodes[diodeNumber].y, false, -1);
    if (newCp >= 0) {
        pushUndoAction('swiDi', [diodeNumber, newCp], [diodes.splice(diodeNumber, 1), conpoints[newCp]]);
    }
}

function toggleFullCrossingConnection() {
    let diode = isDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
    let conpoint = isConPoint(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);

    if (diode >= 0) {
        switchDiodeForConpoint(diode);
    } else if (conpoint >= 0) {
        deleteConpoint(conpoint);
    } else {
        createDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false);
    }
    
    reDraw();
}

function toggleTcrossingConnection() {
    let diode = isDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
    let conpoint = isConPoint(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);

    if (diode >= 0) {
        switchDiodeForConpoint(diode);
    } else {
        createDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false);    
        deleteConpoint(conpoint);
    }

    reDraw();
}