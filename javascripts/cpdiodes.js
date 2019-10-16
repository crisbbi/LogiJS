// File: cpdiodes.js

/*
    Deletes all diodes that are not connected to two or more segments
*/
function deleteInvalidDiodes() {
    for (let j = diodes.length - 1; j >= 0; j--) {
        if (!fullCrossing(diodes[j].x, diodes[j].y)) {
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
        if (segmentPoints(conpoints[j].x, conpoints[j].y, -1).length < 3) {
            conpoints.splice(j, 1);
        }
    }
}

function segmentStartsIn(x, y) {
    for (let i = 0; i < segments.length; i++) {
        if (segments[i].startX === x && segments[i].startY === y) {
            return i;
        }
    }
    return -1;
}

function segmentEndsIn(x, y) {
    for (let i = 0; i < segments.length; i++) {
        if (segments[i].endX === x && segments[i].endY === y) {
            return i;
        }
    }
    return -1;
}

/*
    Creates a new connection point for group g at position x, y
    Only creates if not existing and no diode at the point
*/
function createConpoint(x, y, state, g) {
    console.log("createConPoint");
    if (isConPoint(x, y) < 0) {
        conpoints.push(new ConPoint(x, y, state, g));
    }
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

function wireSegmentsLikeTconnected(x, y) {
    let horizontalWireSegments = 0;
    let verticalWireSegments = 0;
    for (let i = 0; i < segments.length; i++) {
        if ((segments[i].startX === x && segments[i].startY === y) || (segments[i].endX === x && segments[i].endY === y)) {
            if (segments[i].direction === 0) {
                horizontalWireSegments++;
            }
            if (segments[i].direction === 1) {
                verticalWireSegments++;
            }
        }
    }
    return ((horizontalWireSegments === 2 && verticalWireSegments === 1) ||
            (horizontalWireSegments === 1 && verticalWireSegments === 2));
}

function fullCrossing(x, y) {
    let horCount = 0;
    let verCount = 0;
    for (let i = 0; i < segments.length; i++) {
        if ((segments[i].startX === x && segments[i].startY === y) || (segments[i].endX === x && segments[i].endY === y)) {
            if (segments[i].direction === 0) {
                horCount++;
            }
            if (segments[i].direction === 1) {
                verCount++;
            }
        }
    }
    return (horCount >= 2 && verCount >= 2);
}

/*
    Creates a new diode if the point meets the requirements
    gA: Group A (horizontal, not influenced by the vertical wire)
    gB: Group B (vertical, synced to group A)
*/
function createDiode(x, y, state, restore) {
    diodes.push(new Diode(x, y, state, transform));
    diodes[diodes.length - 1].updateClickBox();
    pushUndoAction('addDi', [], diodes[diodes.length - 1]);
    let cp = isConPoint(x, y);
    if (cp >= 0) {
        conpoints.splice(cp, 1);
    }
    diodes[diodes.length - 1].cp = ((restore) && (cp >= 0));
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
    if (y1 === y2) {
        for (let i = 0; i < conpoints.length; i++) {
            if (conpoints[i].x > x1 && conpoints[i].x < x2 && conpoints[i].y === y1) {
                cps.push(i);
            }
        }
    } else {
        for (let i = 0; i < conpoints.length; i++) {
            if (conpoints[i].y > y1 && conpoints[i].y < y2 && conpoints[i].x === x1) {
                cps.push(i);
            }
        }
    }
    return cps;
}

function isDiodeAtPosition(xPosition, yPosition) {
    for (let diode of diodes) {
        if (diode.x === xPosition && diode.y === yPosition) {
            return true;
        }
    }
    return false;
}

/*
    Updates all ConPoints, including deleting
*/
function doConpoints() {
    for (let i = 0; i < segments.length; i++) {
        // Get all segments starting or ending in the point
        let wp1 = segmentPoints(segments[i].startX, segments[i].startY, -1);
        let wp2 = segmentPoints(segments[i].endX, segments[i].endY, -1);

        // If there are 3 segments connecting
        if (wp1.length === 3) {
            createConpoint(segments[i].startX, segments[i].startY, false, -1);
        }
        // Same thing for the other direction
        if (wp2.length === 3) {
            createConpoint(segments[i].endX, segments[i].endY, false, -1);
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

function toggleDiode(restore) {
    for (let i = 0; i < diodes.length; i++) {
        if ((diodes[i].x === Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2)) &&
            (diodes[i].y === Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
            diodes[i].cp = true;
            deleteDiode(i);
            return;
        }
    }
    createDiode(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE,
        Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false, restore);
    reDraw();
}

function toggleConpoint(undoable) {
    for (var i = 0; i < conpoints.length; i++) {
        if ((conpoints[i].x === Math.round((mouseX / transform.zoom - transform.dx) / (GRIDSIZE / 2)) * (GRIDSIZE / 2)) &&
            (conpoints[i].y === Math.round((mouseY / transform.zoom - transform.dy) / (GRIDSIZE / 2)) * (GRIDSIZE / 2))) {
            let cp = conpoints.splice(i, 1);
            let before = conpoints.slice(0);
            doConpoints();
            if (JSON.stringify(conpoints) === JSON.stringify(before) && undoable) {
                pushUndoAction('delCp', [], cp);
            }
            return;
        }
    }
    conpoints.push(new ConPoint(Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE, Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE, false, -1));
    let before = conpoints.slice(0);
    doConpoints();
    if ((JSON.stringify(conpoints) === JSON.stringify(before)) && undoable) {
        pushUndoAction('addCp', [], conpoints[conpoints.length - 1]);
    }
    reDraw();
}

function toggleDiodeAndConpoint() {
    /* 14.10.2019
     * PROBLEM: a "T" connection between wire segments can't bypass the checks
     * in doConpoints() that create a normal connection point because the check
     * for 3 connected wires succeeds, hence it doesn't change. This prevents
     * the switch to a diode connection. Could be solved with 3 if statements
     * and in each case change the connection.
     */
    let nearestGridXpositionFromMouseX = Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE; 
    let nearestGridYpositionFromMouseY = Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE; 
    if (isDiodeAtPosition(nearestGridXpositionFromMouseX, nearestGridYpositionFromMouseY)) {
        toggleDiode(false);
    } else {
        if (isConPoint(nearestGridXpositionFromMouseX, nearestGridYpositionFromMouseY) >= 0) {
            toggleConpoint(true);
        } else {
            toggleDiode(false);
        }
    }
    reDraw();
}