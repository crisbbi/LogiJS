// File: sketch.js

let gates = []; // List of gates (and, or, xor)
let outputs = []; // List of outputs
let inputs = []; // List of inputs (buttons, switches)
let pwWireX = null;
let pwWireY = null;
let conpoints = []; // List of wire connection points
let diodes = []; // List of diodes
let customs = []; // List of custom objects
let wires = []; // List of wires
let labels = []; // List of text labels
let segDisplays = []; // List of 7-segment displays

let segBits = 4; // Number of bits for new 7-segment displays
let counterBitWidth = 4; // Output width of counter objects
let decoderBitWidth = 2; // Input width of decoder objects
let muxBitWidth = 1; // In/output width for (de-) multiplexers

let startDirection = 0; // Start direction for the current wire preview
let traced = []; // List of all traced wires (needed by parseGroups)

/*
    This is a list of all elements that are currently selected with the selection tool
*/
let selection = [];

let selectionConpoints = [];
let selectionWires = [];

/*
    These are the start coordinates for the wire preview elements
*/
let wirePreviewStartX = 0;
let wirePreviewStartY = 0;

/*
    This list contains all logical wire groups of the current sketch
*/
let groups = [];

/*
    Name that is displayed on the sketch's custom module
*/
let moduleCaption = []; // Name of the sketch, displayed on customs

/*
    Current size of the grid in pixels, scaled to the current zoom level
*/
let currentGridSize = GRIDSIZE;

/*
    The control mode represents the current state of the system.
    These are the different possible modes:
        - modify: the default modifier mode
        - delete: when this is active, elements can be deleted from sketch
        - addObject: when this is active, elements can be places on the sketch
        - select: this mode is to select parts of the sketch
*/
let controlMode = 'modify';

let addType = 0;
let wireMode = 'none'; // Possible modes: none, hold, preview, delete ...

/*
    This represents the current state of the selection process:
        - none: The selection process hasn't been started
        - start: The selection mode has been selected, but the user hasn't started dragging
        - drag: The user has pressed the left mouse button to drag
        - end: The user ended the selection process by releasing the mouse button
*/
let selectMode = 'none';

/*
    This is the input count for new gates
*/
let gateInputCount = 2;

/*
    This is the direction for new gates and custom modules
*/
let gateDirection = 0;

/*
    If this is true, the inputs that are placed will be buttons
*/
let newIsButton = false;

/*
    If this is true, the inputs that are placed will be clock elements
*/
let newIsClock = false;

/*
    The name of the custom module that is currently selected to be placed
*/
let custFile = '';

let actionUndo = [];
let actionRedo = [];

let selectStartX = 0;
let selectStartY = 0;
let selectEndX = 0;
let selectEndY = 0;

let sDragX1 = 0;
let sDragX2 = 0;
let sDragY1 = 0;
let sDragY2 = 0;
let initX = 0;
let initY = 0;

/*
    If these aren't zero, the canvas offset has changed
*/
let lastX = 0;
var lastY = 0;

/*
    This is the speed with that the canvas is dragged
    It's recalculated for every zoom level
*/
let dragSpeed = 1;

/*
    This objects contains the current zoom level as well as x and y offset
*/
let transform = new Transformation(0, 0, 1);

/*
    This ClickBox represents the selection box that is used to mark parts of the sketch
*/
let selectionBox = new ClickBox(0, 0, 0, 0, transform);

/*
    If this is true, the selectionBox is displayed on the canvas
*/
let showSelectionBox = false;

/*
    If this is true, the simulation has been started
*/
let simRunning = false;

/*
    If this is true, the save dialog is displayed
*/
let saveDialog = false;

/*
    If this variable is true, the custom module dialog is displayed
*/
let showCustomDialog = false;

/*
    The number of columns for the sketch previews in the custom module dialog
*/
let customDialogColumns = 0;

/*
    The number of rows for the sketch previews in the custom module dialog
*/
let customDialogRows = 0;

/*
    The current page displayed in the custom module dialog
*/
let customDialogPage = 0;

/*
    The number of pages in the custom module dialog
*/
let customDialogPages = 0;

let error = '';
let errordesc = '';

/*
    This object indicates if and what object preview should be drawn on screen.
*/

let previewData = {};

let importSketchData = {}; // Contains look and caption of all user sketches that can be imported

/*
    If this is deactivated, the simulation will run as fast as possible, not synced to the framerate.
*/
let syncFramerate = true;

let segIndices = [];
let wireIndices = [];

/*
    These arrays contain the data of custom modules that have already been loaded from server once.
*/
let cachedFiles = [];
let cachedData = [];

/*
    This array contains all custom modules that have yet to be loaded to complete the loading of the entire module.
    It contains file names and index positions in which module to load the data. When loading one module,
    new submodules will be added to the main queue.
*/
let customsToLoadQueue = [];

/*
    This is the index for the customsToLoadQueue that indicates which module will be loaded next
*/
let nextCustomToLoadIndex = 0;

/*
    This variable is true, when the system is loading a sketch or module. Prevents button clicking, canvas movements etc.
*/
let loading = false;

/*
    This contains the file name of the sketch or module that is currently being loaded.
*/
let loadFile = '';

let justClosedMenu = false;

/*
    This variable contains a preview of the sketch, a snapshot is taken every time, 'Save' is clicked.
*/
let previewImg;

/*
    This variable indicates whether the user changed the module name of the current sketch. If this is the case,
    it shouldn't be reset to the sketch name when editing it.
*/
let moduleNameChanged = false;

/*
    These variable is set if a negation, connection point or diode preview was added to the last drawn frame.
    In this case, the canvas will be redrawn with the next mouse movement.
*/
let removeOldPreview = false;

/*
    When an element is selected in modifier mode, it's number is saved in the respective variable.
    The other variables should be -1, indicating no element of this type is selected.
*/
let inputToModify = -1;
let outputToModify = -1;
let labelToModify = -1;

let modifierMenuX, modifierMenuY;

let sequencerAdjusted = false;
let clickedOutOfGUI = false;

/*
    These are the modifier elements and their descriptional labels.
*/
let inputIsTopBox, captionInput, minusLabel, plusLabel; // Input elements
let redButton, yellowButton, greenButton, blueButton; // Output elements
let labelTextBox; // Label elements

/*
    This is a select element that allows the user to alter the in- and output order.
    It's displayed in the modifier menu of in- and outputs.
*/
let sequencer;

let sketchNameInput, moduleNameInput, saveButton, saveDialogText;
let helpLabel, customDialogText, saveDialogButton, dashboardButton, cancelButton, descInput, newButton, pageUpButton, pageDownButton;
let deleteButton, simButton, labelBasic, labelAdvanced, labelOptions,
    andButton, orButton, xorButton, inputButton, buttonButton, clockButton,
    outputButton, clockspeedSlider, undoButton, redoButton, modifierModeButton, labelButton, segDisplayButton;

let counterButton, decoderButton, dFlipFlopButton, rsFlipFlopButton, reg4Button,
    muxButton, demuxButton, halfaddButton, fulladdButton, customButton;

let updater, sfcheckbox;

let gateInputSelect, labelGateInputs, directionSelect, bitSelect, labelDirection, labelBits, counterBitSelect, labelOutputWidth,
    decoderBitSelect, labelInputWidth, multiplexerBitSelect;

/*
    This is the socket element used for socket communication with the server
*/
let socket;

/*
    This is the main HTML5 canvas variable for the sketch area
*/
let mainCanvas;

/*
    Disable some error messages from p5
*/
p5.disableFriendlyErrors = true; // jshint ignore:line

/*
    This line prevents the browser default right-click menu from appearing.
*/
document.addEventListener('contextmenu', event => event.preventDefault());

/*
    Sets up the canvas and caps the framerate
*/
function setup() { // jshint ignore:line
    mainCanvas = createCanvas(windowWidth - 230, windowHeight - 50);     // Creates the canvas in full window size
    mainCanvas.position(230, 50);
    mainCanvas.id('mainCanvas');

    // Prevents the input field from being focused when clicking in the canvas
    document.addEventListener('mousedown', function (event) {
        if (event.detail > 1) {
            event.preventDefault();
        }
    }, false);

    document.title = 'LogiJS: New Sketch';

    //Div for the Left Side Buttons
    let leftSideButtons = createDiv('');
    leftSideButtons.elt.className = 'scrollBoxLeft';
    let height = (windowHeight - 74 - 32 - 15);
    leftSideButtons.elt.style.height = height.toString() + 'px';
    leftSideButtons.elt.style.margin = '55px 0px';

    // Adds text 'Basic'
    labelBasic = createP('BASIC ELEMENTS');
    labelBasic.elt.className = 'label';
    labelBasic.parent(leftSideButtons);

    // Left Side Buttons
    // Adds and-gates
    andButton = createButton('');
    andButton.mousePressed(function () { andClicked(false); });
    andButton.elt.className = 'previewButton';
    andButton.elt.innerHTML = '<img class="preview" src="images/and-gate.png">';
    andButton.mouseOver(function () {
        setHelpText('AND-Gate');
    });
    andButton.mouseOut(function () {
        setHelpText('');
    });
    andButton.parent(leftSideButtons);

    // Adds or-gates
    orButton = createButton('');
    orButton.mousePressed(function () { orClicked(false); });
    orButton.elt.className = 'previewButton';
    orButton.elt.innerHTML = '<img class="preview" src="images/or-gate.png">';
    orButton.mouseOver(function () {
        setHelpText('OR-Gate');
    });
    orButton.mouseOut(function () {
        setHelpText('');
    });
    orButton.parent(leftSideButtons);

    // Adds xor-gates
    xorButton = createButton('');
    xorButton.mousePressed(function () { xorClicked(false); });
    xorButton.elt.className = 'previewButton';
    xorButton.elt.innerHTML = '<img class="preview" src="images/xor-gate.png">';
    xorButton.mouseOver(function () {
        setHelpText('XOR-Gate');
    });
    xorButton.mouseOut(function () {
        setHelpText('');
    });
    xorButton.parent(leftSideButtons);

    // Adds switches
    inputButton = createButton('');
    inputButton.mousePressed(function () { inputClicked(false); });
    inputButton.elt.className = 'previewButton';
    inputButton.elt.innerHTML = '<img class="preview" src="images/switch.png">';
    inputButton.mouseOver(function () {
        setHelpText('Switch');
    });
    inputButton.mouseOut(function () {
        setHelpText('');
    });
    inputButton.parent(leftSideButtons);

    // Adds buttons (short impulse)
    buttonButton = createButton('');
    buttonButton.mousePressed(function () { buttonClicked(false); });
    buttonButton.elt.className = 'previewButton';
    buttonButton.elt.innerHTML = '<img class="preview" src="images/button.png">';
    buttonButton.mouseOver(function () {
        setHelpText('Button');
    });
    buttonButton.mouseOut(function () {
        setHelpText('');
    });
    buttonButton.parent(leftSideButtons);

    // Adds clocks (variable impulse)
    clockButton = createButton('');
    clockButton.mousePressed(function () { clockClicked(false); });
    clockButton.elt.className = 'previewButton';
    clockButton.elt.innerHTML = '<img class="preview" src="images/clock.png">';
    clockButton.mouseOver(function () {
        setHelpText('Clock');
    });
    clockButton.mouseOut(function () {
        setHelpText('');
    });
    clockButton.parent(leftSideButtons);

    // Adds outputs (lamps)
    outputButton = createButton('');
    outputButton.mousePressed(function () { outputClicked(false); });
    outputButton.elt.className = 'previewButton';
    outputButton.elt.innerHTML = '<img class="preview" src="images/output.png">';
    outputButton.mouseOver(function () {
        setHelpText('Lamp');
    });
    outputButton.mouseOut(function () {
        setHelpText('');
    });
    outputButton.parent(leftSideButtons);

    // Adds 7-segment displays
    segDisplayButton = createButton('');
    segDisplayButton.mousePressed(function () { segDisplayClicked(false); });
    segDisplayButton.elt.className = 'previewButton';
    segDisplayButton.elt.innerHTML = '<img class="preview" src="images/segments.png">';
    segDisplayButton.mouseOver(function () {
        setHelpText('7-Segment Display');
    });
    segDisplayButton.mouseOut(function () {
        setHelpText('');
    });
    segDisplayButton.parent(leftSideButtons);

    // Adds labels
    labelButton = createButton('');
    labelButton.mousePressed(function () { labelButtonClicked(false); });
    labelButton.elt.className = 'previewButton';
    labelButton.elt.innerHTML = '<img class="preview" src="images/label.png">';
    labelButton.mouseOver(function () {
        setHelpText('Text Label');
    });
    labelButton.mouseOut(function () {
        setHelpText('');
    });
    labelButton.parent(leftSideButtons);

    // Adds text 'Advanced Elements'
    labelAdvanced = createP('ADVANCED ELEMENTS');
    labelAdvanced.elt.className = 'label';
    labelAdvanced.parent(leftSideButtons);

    // Adds an rs-flipflop
    rsFlipFlopButton = createButton('RS Flip-Flop');
    rsFlipFlopButton.mousePressed(function () {
        setActive(rsFlipFlopButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['S', 'R'],
            outputLabels: ['Q', ''],
            caption: 'RS-FF',
            inputs: 2,
            outputs: 2
        });
        return importCustom('rs-flipflop.json');
    });
    rsFlipFlopButton.elt.className = 'previewButton';
    rsFlipFlopButton.elt.innerHTML = '<img class="preview" src="images/rs-flipflop.png">';
    rsFlipFlopButton.mouseOver(function () {
        setHelpText('RS Flip-Flop');
    });
    rsFlipFlopButton.mouseOut(function () {
        setHelpText('');
    });
    rsFlipFlopButton.parent(leftSideButtons);
    // Adds a d-flipflop
    dFlipFlopButton = createButton('D Flip-Flop');
    dFlipFlopButton.mousePressed(function () {
        setActive(dFlipFlopButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['D', '>'],
            outputLabels: ['Q', ''],
            caption: 'D-FF',
            inputs: 2,
            outputs: 2
        });
        return importCustom('d-flipflop.json');
    });
    dFlipFlopButton.elt.className = 'previewButton';
    dFlipFlopButton.elt.innerHTML = '<img class="preview" src="images/d-flipflop.png">';
    dFlipFlopButton.mouseOver(function () {
        setHelpText('D Flip-Flop');
    });
    dFlipFlopButton.mouseOut(function () {
        setHelpText('');
    });
    dFlipFlopButton.parent(leftSideButtons);
    // Adds a counter
    counterButton = createButton('Counter');
    counterButton.mousePressed(function () {
        setActive(counterButton, true);
        let opLabels = new Array(counterBitWidth).fill('');
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['>'],
            outputLabels: opLabels,
            caption: 'Counter',
            inputs: 1,
            outputs: counterBitWidth
        });
        return counterClicked();
    });
    counterButton.elt.className = 'previewButton';
    counterButton.elt.innerHTML = '<img class="preview" src="images/counter.png">';
    counterButton.mouseOver(function () {
        setHelpText('Counter');
    });
    counterButton.mouseOut(function () {
        setHelpText('');
    });
    counterButton.parent(leftSideButtons);
    // Adds a decoder
    decoderButton = createButton('Decoder');
    decoderButton.mousePressed(function () {
        setActive(decoderButton, true);
        let opLabels = [];
        for (let i = 0; i < Math.pow(2, decoderBitWidth); i++) {
            opLabels.push(i);
        }
        let ipLabels = new Array(decoderBitWidth).fill('');
        setPreviewElement(true, {
            tops: [],
            inputLabels: ipLabels,
            outputLabels: opLabels,
            caption: 'Decoder',
            inputs: decoderBitWidth,
            outputs: Math.pow(2, decoderBitWidth)
        });
        return decoderClicked();
    });
    decoderButton.elt.className = 'previewButton';
    decoderButton.elt.innerHTML = '<img class="preview" src="images/decoder.png">';
    decoderButton.mouseOver(function () {
        setHelpText('Decoder');
    });
    decoderButton.mouseOut(function () {
        setHelpText('');
    });
    decoderButton.parent(leftSideButtons);
    // Adds a multiplexer
    muxButton = createButton('Multiplexer');
    muxButton.mousePressed(function () {
        setActive(muxButton, true);
        let ipLabels = [];
        switch (muxBitWidth) {
            case 1:
                ipLabels.push('2º');
                break;
            case 2:
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
            case 3:
                ipLabels.push('2²');
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
        }
        for (let i = 0; i < Math.pow(2, muxBitWidth); i++) {
            ipLabels.push(i);
        }
        let tops = [];
        for (let i = 0; i < muxBitWidth; i++) {
            tops.push(i);
        }
        setPreviewElement(true, {
            tops: tops,
            inputLabels: ipLabels,
            outputLabels: [''],
            caption: 'MUX',
            inputs: Math.pow(2, muxBitWidth) + muxBitWidth,
            outputs: 1
        });
        return muxClicked();
    });
    muxButton.elt.className = 'previewButton';
    muxButton.elt.innerHTML = '<img class="preview" src="images/mux.png">';
    muxButton.mouseOver(function () {
        setHelpText('Multiplexer');
    });
    muxButton.mouseOut(function () {
        setHelpText('');
    });
    muxButton.parent(leftSideButtons);
    // Adds a demultiplexer
    demuxButton = createButton('Demultiplexer');
    demuxButton.mousePressed(function () {
        setActive(demuxButton, true);
        let ipLabels = [];
        switch (muxBitWidth) {
            case 1:
                ipLabels.push('2º');
                break;
            case 2:
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
            case 3:
                ipLabels.push('2²');
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
        }
        ipLabels.push('');
        let tops = [];
        for (let i = 0; i < muxBitWidth; i++) {
            tops.push(i);
        }
        let opLabels = [];
        for (let i = 0; i < Math.pow(2, muxBitWidth); i++) {
            opLabels.push(i);
        }
        setPreviewElement(true, {
            tops: tops,
            inputLabels: ipLabels,
            outputLabels: opLabels,
            caption: 'DEMUX',
            inputs: 1 + muxBitWidth,
            outputs: Math.pow(2, muxBitWidth)
        });
        return demuxClicked();
    });
    demuxButton.elt.className = 'previewButton';
    demuxButton.elt.innerHTML = '<img class="preview" src="images/demux.png">';
    demuxButton.mouseOver(function () {
        setHelpText('Demultiplexer');
    });
    demuxButton.mouseOut(function () {
        setHelpText('');
    });
    demuxButton.parent(leftSideButtons);
    // Adds a register (4Bit)
    reg4Button = createButton('4Bit-Register');
    reg4Button.mousePressed(function () {
        setActive(reg4Button, true);
        setPreviewElement(true, {
            tops: [0, 1],
            inputLabels: ['L', '>', '2³', '2²', '2¹', '2º'],
            outputLabels: ['2³', '2²', '2¹', '2º'],
            caption: 'Register',
            inputs: 6,
            outputs: 4
        });
        return importCustom('4-register.json');
    });
    reg4Button.elt.className = 'previewButton';
    reg4Button.elt.innerHTML = '<img class="preview" src="images/register.png">';
    reg4Button.mouseOver(function () {
        setHelpText('4-bit Register');
    });
    reg4Button.mouseOut(function () {
        setHelpText('');
    });
    reg4Button.parent(leftSideButtons);
    // Adds a Half Adder
    halfaddButton = createButton('Half Adder');
    halfaddButton.mousePressed(function () {
        setActive(halfaddButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['', ''],
            outputLabels: ['', ''],
            caption: 'HA',
            inputs: 2,
            outputs: 2
        });
        return importCustom('half_add.json');
    });
    halfaddButton.elt.className = 'previewButton';
    halfaddButton.elt.innerHTML = '<img class="preview" src="images/halfadd.png">';
    halfaddButton.mouseOver(function () {
        setHelpText('Half Adder');
    });
    halfaddButton.mouseOut(function () {
        setHelpText('');
    });
    halfaddButton.parent(leftSideButtons);

    // Adds a Full Adder
    fulladdButton = createButton('Full Adder');
    fulladdButton.mousePressed(function () {
        setActive(fulladdButton, true);
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['', '', ''],
            outputLabels: ['', ''],
            caption: 'FA',
            inputs: 3,
            outputs: 2
        });
        return importCustom('full_add.json');
    });
    fulladdButton.elt.className = 'previewButton';
    fulladdButton.elt.innerHTML = '<img class="preview" src="images/fulladd.png">';
    fulladdButton.mouseOver(function () {
        setHelpText('Full Adder');
    });
    fulladdButton.mouseOut(function () {
        setHelpText('');
    });
    fulladdButton.parent(leftSideButtons);

    customButton = createButton('<i class="fa fa-file-import icon"></i> Import own element');
    customButton.mousePressed(function () { customDialogPage = 0; customClicked(); });
    customButton.elt.className = 'buttonLeft';
    customButton.mouseOver(function () {
        setHelpText('Import your own sketches as custom elements');
    });
    customButton.mouseOut(function () {
        setHelpText('');
    });
    customButton.parent(leftSideButtons);
    if (getCookieValue('access_token') === '') {
        customButton.elt.disabled = true;
    }

    // Adds text 'Options'
    labelOptions = createP('OPTIONS');
    labelOptions.elt.className = 'label';
    labelOptions.parent(leftSideButtons);
    labelOptions.hide();

    helpLabel = createP('<i class="fa fa-question-circle icon" style="color: rgb(200, 50, 50);"></i>');
    helpLabel.elt.className = 'label';
    helpLabel.elt.style.color = 'white';
    helpLabel.position(745, 5);
    helpLabel.hide();

    // Adds text 'Gate inputs'
    labelGateInputs = createP('GATE INPUTS');
    labelGateInputs.hide();
    labelGateInputs.elt.className = 'optionLabel';
    labelGateInputs.parent(leftSideButtons);

    gateInputSelect = createSelect();
    gateInputSelect.hide();
    for (let i = 1; i <= 10; i++) {
        gateInputSelect.option(i);
    }
    gateInputSelect.changed(newGateInputNumber);
    gateInputSelect.elt.className = 'selectLeft';
    gateInputSelect.parent(leftSideButtons);
    gateInputSelect.value('2');
    gateInputSelect.mouseOver(function () {
        setHelpText('Define the number of gate inputs');
    });
    gateInputSelect.mouseOut(function () {
        setHelpText('');
    });

    // Adds text 'Direction'
    labelDirection = createP('DIRECTION');
    labelDirection.hide();
    labelDirection.elt.className = 'optionLabel';
    labelDirection.parent(leftSideButtons);

    directionSelect = createSelect();
    directionSelect.hide();
    directionSelect.option('Right');
    directionSelect.option('Up');
    directionSelect.option('Left');
    directionSelect.option('Down');
    directionSelect.changed(newDirection);
    directionSelect.elt.className = 'selectLeft';
    directionSelect.parent(leftSideButtons);
    directionSelect.value('Right');
    directionSelect.mouseOver(function () {
        setHelpText('Define the direction of the element');
    });
    directionSelect.mouseOut(function () {
        setHelpText('');
    });

    // Adds text 'Input width'
    labelBits = createP('INPUT WIDTH');
    labelBits.hide();
    labelBits.elt.className = 'optionLabel';
    labelBits.parent(leftSideButtons);

    // Adds text 'Output width'
    labelOutputWidth = createP('OUTPUT WIDTH');
    labelOutputWidth.hide();
    labelOutputWidth.elt.className = 'optionLabel';
    labelOutputWidth.parent(leftSideButtons);

    // Adds text 'Input width'
    labelInputWidth = createP('INPUT WIDTH');
    labelInputWidth.hide();
    labelInputWidth.elt.className = 'optionLabel';
    labelInputWidth.parent(leftSideButtons);


    bitSelect = createSelect();
    bitSelect.hide();
    for (let i = 1; i <= 8; i++) {
        bitSelect.option(i);
    }
    bitSelect.option('16');
    bitSelect.option('32');
    bitSelect.changed(newBitLength);
    bitSelect.elt.className = 'selectLeft';
    bitSelect.parent(leftSideButtons);
    bitSelect.value('4');
    bitSelect.mouseOver(function () {
        setHelpText('Define the number of input bits');
    });
    bitSelect.mouseOut(function () {
        setHelpText('');
    });

    counterBitSelect = createSelect();
    counterBitSelect.hide();
    for (let i = 2; i <= 5; i++) {
        counterBitSelect.option(i);
    }
    counterBitSelect.changed(newCounterBitLength);
    counterBitSelect.elt.className = 'selectLeft';
    counterBitSelect.parent(leftSideButtons);
    counterBitSelect.value('4');
    counterBitSelect.mouseOver(function () {
        setHelpText('Define the number of output bits');
    });
    counterBitSelect.mouseOut(function () {
        setHelpText('');
    });

    decoderBitSelect = createSelect();
    decoderBitSelect.hide();
    for (let i = 2; i <= 5; i++) {
        decoderBitSelect.option(i);
    }
    decoderBitSelect.changed(newDecoderBitLength);
    decoderBitSelect.elt.className = 'selectLeft';
    decoderBitSelect.parent(leftSideButtons);
    decoderBitSelect.value('2');
    decoderBitSelect.mouseOver(function () {
        setHelpText('Define the number of input bits');
    });
    decoderBitSelect.mouseOut(function () {
        setHelpText('');
    });

    multiplexerBitSelect = createSelect();
    multiplexerBitSelect.hide();
    for (let i = 1; i <= 3; i++) {
        multiplexerBitSelect.option(i);
    }
    multiplexerBitSelect.changed(newMuxBitLength);
    multiplexerBitSelect.elt.className = 'selectLeft';
    multiplexerBitSelect.parent(leftSideButtons);
    multiplexerBitSelect.value('1');
    multiplexerBitSelect.mouseOver(function () {
        setHelpText('Define the address width of the element');
    });
    multiplexerBitSelect.mouseOut(function () {
        setHelpText('');
    });

    sfcheckbox = createCheckbox('SYNC TICKS TO FRAMES', true);
    sfcheckbox.hide();
    sfcheckbox.changed(function () {
        syncFramerate = sfcheckbox.checked();
        if (!sfcheckbox.checked() && simRunning) {
            updater = setInterval(updateTick, 1);
        } else {
            clearInterval(updater);
        }
    });
    sfcheckbox.elt.className = 'checkbox';
    sfcheckbox.parent(leftSideButtons);
    sfcheckbox.mouseOver(function () {
        setHelpText('Synchronize the simulation speed with the frame rate');
    });
    sfcheckbox.mouseOut(function () {
        setHelpText('');
    });

    //Upper left

    // Activates the edit mode
    modifierModeButton = createButton('<i class="fa fa-pen icon"></i> Edit');
    modifierModeButton.position(232, 3);
    modifierModeButton.mousePressed(function () {
        enterModifierMode();
    });
    modifierModeButton.elt.className = 'button active';
    modifierModeButton.mouseOver(function () {
        setHelpText('Draws wires and changes element properties');
    });
    modifierModeButton.mouseOut(function () {
        setHelpText('');
    });


    // Activates the delete mode (objects and wires)
    deleteButton = createButton('<i class="far fa-trash-alt icon"></i> Delete');
    deleteButton.position(306, 3);
    deleteButton.mousePressed(deleteClicked);
    deleteButton.elt.className = 'button';
    deleteButton.mouseOver(function () {
        setHelpText('Deletes wires and elements');
    });
    deleteButton.mouseOut(function () {
        setHelpText('');
    });

    // Starts and stops the simulation
    simButton = createButton('<i class="fa fa-play icon"></i> Start');
    simButton.position(396, 3);
    simButton.mousePressed(simClicked);
    simButton.elt.className = 'button';
    simButton.mouseOver(function () {
        setHelpText('Starts and stops the simulation');
    });
    simButton.mouseOut(function () {
        setHelpText('');
    });

    // Undos the last action
    undoButton = createButton('<i class="fa fa-undo icon"></i> Undo');
    undoButton.position(476, 3);
    undoButton.mousePressed(() => {
        previewSymbol = null;
        undo();
    });
    undoButton.elt.disabled = true;
    undoButton.elt.className = 'button';

    // Redos the last action
    redoButton = createButton('<i class="fa fa-redo icon"></i> Redo');
    redoButton.position(561, 3);
    redoButton.mousePressed(() => {
        previewSymbol = null;
        redo();
    });
    redoButton.elt.disabled = true;
    redoButton.elt.className = 'button';

    // Activates the mode for area selecting
    selectButton = createButton('<i class="fas fa-object-group icon"></i> Select');
    selectButton.position(644, 3);
    selectButton.mousePressed(startSelect);
    selectButton.elt.style.cursor = 'default';
    selectButton.elt.className = 'button';
    selectButton.elt.title = 'Coming soon!';

    moduleNameInput = createInput('');
    moduleNameInput.attribute('placeholder', 'MODULE NAME');
    moduleNameInput.position(windowWidth / 2 - 238, windowHeight / 2 - 104);
    moduleNameInput.elt.style.fontFamily = 'Open Sans';
    moduleNameInput.elt.className = 'textInput saveInput';
    moduleNameInput.size(180, 27);
    moduleNameInput.elt.onkeyup = function () {
        moduleNameChanged = true;
        reDraw();
    };
    moduleNameInput.hide();
    moduleNameInput.mouseOver(function () {
        setHelpText('This is the text written on the module');
    });
    moduleNameInput.mouseOut(function () {
        setHelpText('');
    });

    sketchNameInput = createInput('');
    sketchNameInput.attribute('placeholder', 'SKETCH NAME');
    sketchNameInput.position(windowWidth / 2 - 23, windowHeight / 2 - 104);
    sketchNameInput.elt.style.fontFamily = 'Open Sans';
    sketchNameInput.elt.className = 'textInput saveInput';
    sketchNameInput.elt.onkeyup = function () {
        if (!moduleNameInput.elt.disabled && !moduleNameChanged) {
            moduleNameInput.value(sketchNameInput.value());
        }
        reDraw();
    };
    sketchNameInput.hide();
    sketchNameInput.mouseOver(function () {
        setHelpText('This is the file name of the sketch');
    });
    sketchNameInput.mouseOut(function () {
        setHelpText('');
    });

    descInput = createElement('textarea');
    descInput.attribute('placeholder', 'SKETCH DESCRIPTION');
    descInput.position(windowWidth / 2 - 3, windowHeight / 2 - 25);
    descInput.size(280, 114);
    descInput.elt.style.fontFamily = 'Open Sans';
    descInput.elt.style.fontSize = '15px';
    descInput.elt.className = 'textInput descInput';
    if (getCookieValue('access_token') === '') {
        descInput.attribute('placeholder', 'SKETCH DESCRIPTION\n(LOG IN TO GIVE A DESCRIPTION)');
        descInput.elt.disabled = true;
    }
    descInput.hide();
    descInput.mouseOver(function () {
        setHelpText('This is the description displayed in the dashboard');
    });
    descInput.mouseOut(function () {
        setHelpText('');
    });

    // Clears the canvas and resets the view
    newButton = createButton('<i class="fas fa-file icon"></i> New');
    newButton.position(windowWidth - 290, 3);
    newButton.elt.style.width = '50px';
    newButton.mousePressed(function () {
        if (newButton.html() === 'SURE?') {
            newButton.elt.className = "button";
            newButton.html('<i class="fas fa-file icon"></i> New');
            newClicked();
        } else {
            newButton.elt.className = "button active";
            newButton.html('SURE?');
            setTimeout(function () { newButton.html('<i class="fas fa-file icon"></i> New'); newButton.elt.className = "button"; }, 3000);
        }
    });
    newButton.elt.className = 'button';
    newButton.mouseOver(function () {
        setHelpText('Clears the sketch');
    });
    newButton.mouseOut(function () {
        setHelpText('');
    });

    // Button to save the sketch
    if (getCookieValue('access_token') !== '') {
        saveButton = createButton('SAVE');
        saveButton.mouseOver(function () {
            setHelpText('Save this sketch to the dashboard');
        });
    } else {
        saveButton = createButton('DOWNLOAD');
        saveButton.mouseOver(function () {
            setHelpText('Download this sketch as a JSON file');
        });
    }
    saveButton.position(windowWidth / 2 + 142, windowHeight / 2 + 110);
    saveButton.mousePressed(saveClicked);
    saveButton.elt.className = 'btn btn-lg btn-red';
    saveButton.hide();
    saveButton.mouseOut(function () {
        setHelpText('');
    });

    cancelButton = createButton('CANCEL');
    cancelButton.position(windowWidth / 2 - 13, windowHeight / 2 + 110);
    cancelButton.mousePressed(cancelClicked);
    cancelButton.elt.className = 'btn btn-lg btn-red';
    cancelButton.hide();

    pageUpButton = createButton('<i class="fas fa-arrow-up"></i> Up');
    pageUpButton.position(window.width - 545, window.height - window.height / 5);
    pageUpButton.style('padding-left', '10px');
    pageUpButton.style('padding-right', '10px');
    pageUpButton.mousePressed(function () {
        if (customDialogPage <= 0) {
            return;
        }
        customDialogPage--;
        showCustomDialog = false;
        customClicked();
    });
    pageUpButton.elt.className = 'btn btn-lg btn-red';
    pageUpButton.hide();

    pageDownButton = createButton('<i class="fas fa-arrow-down"></i> Down');
    pageDownButton.position(window.width - 335, window.height - window.height / 5 + 50);
    pageDownButton.style('padding-left', '10px');
    pageDownButton.style('padding-right', '10px');
    pageDownButton.mousePressed(function () {
        if (customDialogPage >= customDialogPages) {
            return;
        }
        customDialogPage++;
        showCustomDialog = false;
        customClicked();
    });
    pageDownButton.elt.className = 'btn btn-lg btn-red';
    pageDownButton.hide();

    saveDialogButton = createButton('<i class="fas fa-save icon"></i> Save');
    saveDialogButton.position(windowWidth - 216, 3);
    saveDialogButton.mousePressed(saveDialogClicked);
    saveDialogButton.elt.className = 'button';
    saveDialogButton.mouseOver(function () {
        setHelpText('Saves the sketch');
    });
    saveDialogButton.mouseOut(function () {
        setHelpText('');
    });

    if (getCookieValue('access_token') !== '') {
        dashboardButton = createButton('<i class="fas fa-th icon"></i> Dashboard');
        dashboardButton.mouseOver(function () {
            setHelpText('Get back to the dashboard');
        });
        dashboardButton.mouseOut(function () {
            setHelpText('');
        });
    } else {
        dashboardButton = createButton('<i class="fa fa-sign-in-alt icon"></i> Login');
        dashboardButton.mouseOver(function () {
            setHelpText('Log into your LogiJS account');
        });
        dashboardButton.mouseOut(function () {
            setHelpText('');
        });
    }
    dashboardButton.elt.style.width = '110px';
    dashboardButton.mousePressed(function () {
        if (dashboardButton.html() === 'SURE?') {
            window.location = '/dashboard';
        } else {
            dashboardButton.elt.className = "button active";
            dashboardButton.html('SURE?');
            setTimeout(function () { if (getCookieValue('access_token') !== '') { dashboardButton.html('<i class="fas fa-th icon"></i> Dashboard'); } else { dashboardButton.html('<i class="fa fa-sign-in-alt icon"></i> Login'); } dashboardButton.elt.className = "button"; }, 3000);
        }
    });
    dashboardButton.position(windowWidth - 142, 3);
    dashboardButton.elt.className = 'button';

    saveDialogText = createP('SAVE SKETCH');
    saveDialogText.hide();
    saveDialogText.elt.style.color = 'white';
    saveDialogText.elt.style.fontFamily = 'Open Sans';
    saveDialogText.elt.style.margin = '3px 0px 0px 0px';
    saveDialogText.position(windowWidth / 2 - 65, windowHeight / 2 - 160);
    saveDialogText.style('font-size', '36px');

    customDialogText = createP('IMPORT OWN ELEMENT');
    customDialogText.hide();
    customDialogText.elt.style.color = 'white';
    customDialogText.elt.style.fontFamily = 'Open Sans';
    customDialogText.elt.style.margin = '3px 0px 0px 0px';
    customDialogText.position(windowWidth / 2 - 100, 120);
    customDialogText.style('font-size', '36px');

    createModifierElements();

    frameRate(60); // Caps the framerate at 60 FPS

    enterModifierMode();

    //sets font-size for all label elements
    let guiLabels = document.getElementsByClassName('label');
    for (let i = 0; i < guiLabels.length; i++) {
        guiLabels[i].style.fontSize = '16px';
    }

    //socket = io.connect();

    let loadfile = urlParam('sketch');
    if (loadfile !== '') {
        if (loadfile.indexOf('lib') === 0) {
            sketchNameInput.value(loadfile.substring(10));
        } else {
            sketchNameInput.value(loadfile);
        }
        setLoading(true);
        loadSketch(loadfile + '.json');
        //socket.emit('getDescription', { file: loadfile, access_token: getCookieValue('access_token') });
        /*
        socket.on('sketchDescription', (data) => {
            try {
                let d = JSON.parse(data.data);
                if (data.success === true) {
                    descInput.value(d.desc);
                    moduleNameInput.value(d.caption);
                }
            } catch (e) {
                if (data.success === true) {
                    descInput.value(data.data);
                }
            }
            //socket.off('sketchDescription');
        });
        */
    }
    /*
    socket.on('demousererror', function () {
        error = 'Saving failed: No permissions!';
        errordesc = 'This is a demo account.';
        reDraw();
        setTimeout(function () { error = ''; errordesc = ''; reDraw(); }, 3000);
    });
    */

    fetchImportData();

    reDraw();
    setTimeout(reDraw, 100); // Redraw after 100ms in case fonts weren't loaded on first redraw
}

// Credits to https://stackoverflow.com/questions/2405355/how-to-pass-a-parameter-to-a-javascript-through-a-url-and-display-it-on-a-page (Mic)
function urlParam(name, w) {
    w = w || window;
    var rx = new RegExp('[\&|\?]' + name + '=([^\&\#]+)'),
        val = w.location.search.match(rx);
    return !val ? '' : val[1];
}

function importCustom(filename) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 10 && filename === custFile) {
        enterModifierMode();
    } else {
        setControlMode('addObject');
        if (showCustomDialog) {
            addType = 11; // external custom
            closeCustomDialog();
        } else {
            addType = 10; // internal custom
        }
        labelDirection.show();
        labelDirection.style('display', 'inline-block');
        directionSelect.show();
        directionSelect.style('display', 'inline-block');
        labelOptions.show();
        custFile = filename;
    }
}

function customClicked() {
    if (showCustomDialog) {
        closeCustomDialog();
        return;
    }
    showCustomDialog = true;
    setPreviewElement(false, {}, 'none');
    setUnactive();
    disableButtons(true);
    simButton.elt.disabled = true;
    saveDialogButton.elt.disabled = true;
    //closeTutorialButton.elt.disabled = true;
    //nextStepButton.elt.disabled = true;
    customButton.elt.disabled = false;

    setActive(customButton, true);
    setControlMode('modify');
    reDraw();
    displayCustomDialog();
}

function counterClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    labelDirection.show();
    labelDirection.style('display', 'inline-block');
    directionSelect.show();
    directionSelect.style('display', 'inline-block');
    labelOutputWidth.show();
    labelOutputWidth.style('display', 'inline-block');
    counterBitSelect.show();
    counterBitSelect.style('display', 'inline-block');
    labelOptions.show();
    custFile = counterBitWidth + '-counter.json';
}

function decoderClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    labelDirection.show();
    labelDirection.style('display', 'inline-block');
    directionSelect.show();
    directionSelect.style('display', 'inline-block');
    labelInputWidth.show();
    labelInputWidth.style('display', 'inline-block');
    decoderBitSelect.show();
    decoderBitSelect.style('display', 'inline-block');
    labelOptions.show();
    custFile = decoderBitWidth + '-decoder.json';
}

function muxClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    labelDirection.show();
    labelDirection.style('display', 'inline-block');
    directionSelect.show();
    directionSelect.style('display', 'inline-block');
    labelInputWidth.show();
    labelInputWidth.style('display', 'inline-block');
    multiplexerBitSelect.show();
    multiplexerBitSelect.style('display', 'inline-block');
    labelOptions.show();
    custFile = muxBitWidth + '-mux.json';
}

function demuxClicked() {
    hideAllOptions();
    setControlMode('addObject');
    addType = 10;
    labelDirection.show();
    labelDirection.style('display', 'inline-block');
    directionSelect.show();
    directionSelect.style('display', 'inline-block');
    labelInputWidth.show();
    labelInputWidth.style('display', 'inline-block');
    multiplexerBitSelect.show();
    multiplexerBitSelect.style('display', 'inline-block');
    labelOptions.show();
    custFile = muxBitWidth + '-demux.json';
}

// Triggered when a sketch should be saved
function saveClicked() {
    if (sketchNameInput.value().includes(' ')) {
        saveDialogText.position(windowWidth / 2 - 105, windowHeight / 2 - 160);
        saveDialogText.elt.style.color = 'red';
        saveDialogText.html('No spaces allowed!');
        setTimeout(function () {
            saveDialogText.elt.style.color = '#fff';
            saveDialogText.position(windowWidth / 2 - 65, windowHeight / 2 - 160);
            saveDialogText.html('Save Sketch');
        }, 3000);
        return;
    }

    saveSketch(sketchNameInput.value() + '.json', function (look) {
        closeSaveDialog();
        look.desc = descInput.value();
        //socket.emit('savePreview', { name: textInput.value(), img: previewImg, desc: JSON.stringify(look), access_token: getCookieValue('access_token') });
        document.title = 'LogiJS: ' + sketchNameInput.value();
        //socket.emit('savePreview', { name: sketchNameInput.value(), img: previewImg, desc: JSON.stringify(look), access_token: getCookieValue('access_token') });
    });
}

function cancelClicked() {
    if (saveDialog) {
        closeSaveDialog();
    } else if (showCustomDialog) {
        closeCustomDialog();
    }
}

function closeSaveDialog() {
    saveDialog = false;
    saveButton.hide();
    sketchNameInput.hide();
    moduleNameInput.hide();
    descInput.hide();
    saveDialogText.hide();
    cancelButton.hide();
    disableButtons(false);
    simButton.elt.disabled = false;
    saveDialogButton.elt.disabled = false;
    justClosedMenu = true;
}

function closeCustomDialog() {
    showCustomDialog = false;
    disableButtons(false);
    simButton.elt.disabled = false;
    saveDialogButton.elt.disabled = false;
    if (controlMode === 'modify') {
        setActive(modifierModeButton, true);
    }
    pageUpButton.hide();
    pageDownButton.hide();
    cancelButton.hide();
    customDialogText.hide();
    justClosedMenu = true;
}

// Triggered when a sketch should be loaded
function loadClicked() {
    closeModifierMenu();
    enterModifierMode();
    document.title = 'LogiJS: ' + sketchNameInput.value();
    loadSketch(sketchNameInput.value() + '.json');
    reDraw();
}

function saveDialogClicked() {
    endSimulation();
    if (modifierMenuDisplayed()) {
        closeModifierMenu();
        unmarkPropTargets();
    }
    enterModifierMode();
    reDraw();
    saveDialog = true;
    saveButton.show();
    cancelButton.position(windowWidth / 2 - 13, windowHeight / 2 + 110);
    cancelButton.show();
    sketchNameInput.show();
    moduleNameInput.show();
    descInput.show();
    saveDialogText.show();
    previewImg = document.getElementById('mainCanvas').toDataURL('image/png');
    disableButtons(true);
    simButton.elt.disabled = true;
    saveDialogButton.elt.disabled = true;
    customButton.elt.disabled = true;

    moduleNameChanged = (moduleNameInput.value() !== sketchNameInput.value()) && (moduleNameInput.value() !== '');

    moduleNameInput.elt.disabled = (outputs.length <= 0);
    if (outputs.length <= 0) {
        moduleNameInput.value('');
    } else if (!moduleNameChanged) {
        moduleNameInput.value(sketchNameInput.value());
    }

    reDraw();
}

// Resets the canvas and the view / transformation
function newClicked() {
    clearItems();
    clearActionStacks();
    hideAllOptions();
    closeCustomDialog();
    closeSaveDialog();
    transform = new Transformation(0, 0, 1);
    currentGridSize = GRIDSIZE;
    gateInputCount = 2;
    gateInputSelect.value('2');
    gateDirection = 0;
    directionSelect.value('Right');
    setLoading(false);
    endSimulation(); // End the simulation, if started
    leaveModifierMode();
    enterModifierMode();
    wireMode = 'none';
    document.title = 'LogiJS: New Sketch';
    sketchNameInput.value('');
    moduleNameInput.value('');
    reDraw();
}

function hideAllOptions() {
    bitSelect.hide();
    labelBits.hide();
    directionSelect.hide();
    labelDirection.hide();
    gateInputSelect.hide();
    labelGateInputs.hide();
    counterBitSelect.hide();
    labelOutputWidth.hide();
    decoderBitSelect.hide();
    multiplexerBitSelect.hide();
    labelInputWidth.hide();
    labelOptions.hide();
}

/*
    Deletes all items that are drawn on screen
*/
function clearItems() {
    gates = [];
    outputs = [];
    inputs = [];
    conpoints = [];
    customs = [];
    diodes = [];
    labels = [];
    wires = [];
    segDisplays = [];
}

/*
    This clears the undo and redo stacks
*/
function clearActionStacks() {
    actionUndo = [];
    actionRedo = [];
}

function pushMoveSelectionAction(dx, dy, x1, y1, x2, y2) {
    if ((Math.abs(dx) >= GRIDSIZE || Math.abs(dy) >= GRIDSIZE) && selection.length > 0) {
        pushUndoAction('moveSel', [dx, dy, x1, y1, x2, y2], [_.cloneDeep(selection), _.cloneDeep(selectionConpoints), _.cloneDeep(selectionWires)]);
    }
}

function setActive(btn, clear = true) {
    if (clear) {
        setUnactive();
    }
    hideAllOptions();
    btn.elt.className += ' active';
}

function isActive(btn) {
    return btn.elt.className.includes('active');
}

function setUnactive() {
    andButton.elt.className = 'previewButton';
    orButton.elt.className = 'previewButton';
    xorButton.elt.className = 'previewButton';
    inputButton.elt.className = 'previewButton';
    buttonButton.elt.className = 'previewButton';
    clockButton.elt.className = 'previewButton';
    outputButton.elt.className = 'previewButton';
    labelButton.elt.className = 'previewButton';
    segDisplayButton.elt.className = 'previewButton';
    counterButton.elt.className = 'previewButton';
    decoderButton.elt.className = 'previewButton';
    dFlipFlopButton.elt.className = 'previewButton';
    rsFlipFlopButton.elt.className = 'previewButton';
    reg4Button.elt.className = 'previewButton';
    muxButton.elt.className = 'previewButton';
    demuxButton.elt.className = 'previewButton';
    halfaddButton.elt.className = 'previewButton';
    fulladdButton.elt.className = 'previewButton';
    customButton.elt.className = 'buttonLeft';

    deleteButton.elt.className = 'button';
    selectButton.elt.className = 'button';
    modifierModeButton.elt.className = 'button';
    simButton.elt.className = 'button';
}

function deleteClicked() {
    // If the button was clicked at the end of a select process
    if (controlMode === 'select' && selectMode === 'end') {
        enterModifierMode();
        setControlMode('modify');
        unmarkAll();
        let delGates = [[], []];
        let delCustoms = [[], []];
        let delInputs = [[], []];
        let delLabels = [[], []];
        let delOutputs = [[], []];
        let delWires = [[], []];
        let delSegDisplays = [[], []];
        for (let i = 0; i < selection.length; i++) {
            /*if (selection[i] instanceof LogicGate) {
                delGates[0].push(selection[i]);
                delGates[1].push(gates.indexOf(selection[i]));
            } else if (selection[i] instanceof CustomSketch) {
                for (const elem of selection[i].responsibles) {
                    customs.splice(customs.indexOf(elem), 1);
                }
                delCustoms[0].push(selection[i]);
                delCustoms[1].push(customs.indexOf(selection[i]));
            }
            else if (selection[i] instanceof Input) {
                delInputs[0].push(selection[i]);
                delInputs[1].push(inputs.indexOf(selection[i]));
            }
            else if (selection[i] instanceof Label) {
                delLabels[0].push(selection[i]);
                delLabels[1].push(labels.indexOf(selection[i]));
            }
            else if (selection[i] instanceof Output) {
                delOutputs[0].push(selection[i]);
                delOutputs[1].push(outputs.indexOf(selection[i]));
            }
            else if (selection[i] instanceof SegmentDisplay) {
                delSegDisplays[0].push(selection[i]);
                delSegDisplays[1].push(segDisplays.indexOf(selection[i]));
            }
            // Filtering out wires and segments and pushing them into their arrays
            /*else if (selection[i] instanceof Wire) {
                // The last selection[] element is the # of wires, therefore
                // all elements before that index are wires, the rest are segments
                if (i < selection[selection.length - 1]) {
                    delWires[0].push(selection[i]);
                    // Find the index of the wire and push it
                    delWires[1].push(wireIndizees.pop());
                } else {
                    delSegments[0].push(selection[i]);
                    delSegments[1].push(segIndices.pop());
                }
            }*/
            error = 'This feature is coming soon!';
            errordesc = '';
            setTimeout(function () { error = ''; }, 3000); //jshint ignore:line
        }
        for (let j = delGates[1].length - 1; j >= 0; j--) {
            gates.splice(delGates[1][j], 1);
        }
        for (let j = delCustoms[1].length - 1; j >= 0; j--) {
            customs.splice(delCustoms[1][j], 1);
        }
        for (let j = delInputs[1].length - 1; j >= 0; j--) {
            inputs.splice(delInputs[1][j], 1);
        }
        for (let j = delLabels[1].length - 1; j >= 0; j--) {
            labels.splice(delLabels[1][j], 1);
        }
        for (let j = delOutputs[1].length - 1; j >= 0; j--) {
            outputs.splice(delOutputs[1][j], 1);
        }
        /*for (let j = delWires[1].length - 1; j >= 0; j--) {
            //console.log('Deleting wire No. ' + delWires[1][j]);
            wires.splice(delWires[1][j], 1);
        }
        for (let j = delSegments[1].length - 1; j >= 0; j--) {
            //console.log('Deleting segment No. ' + delSegments[1][j]);
            segments.splice(delSegments[1][j], 1);
        }*/
        for (let j = delSegDisplays[1].length - 1; j >= 0; j--) {
            segDisplays.splice(delSegDisplays[1][j], 1);
        }
        pwWireX = null;
        pwWireY = null;
        wireMode = 'none';
        lockElements = false;
        if (selection.length > 0) {
            pushUndoAction('delSel', 0, [_.cloneDeep(delGates), _.cloneDeep(delCustoms), _.cloneDeep(diodes), _.cloneDeep(delInputs), _.cloneDeep(delLabels), _.cloneDeep(delOutputs), _.cloneDeep(delWires), _.cloneDeep(delSegDisplays), _.cloneDeep(conpoints)]);
        }
        doConpoints();
    } else {
        if (controlMode === 'delete') {
            enterModifierMode();
        } else {
            setActive(deleteButton, true);
            setControlMode('delete');
        }
    }
}

/*
    This triggers when a label text was altered
*/
function labelChanged() {
    labels[labelToModify].alterText(labelTextBox.value()); // Alter the text of the selected label
    reDraw();
    positionModifierElements();
}

function newGateInputNumber() {
    gateInputCount = parseInt(gateInputSelect.value());
    // Ensure that the correct preview gate is displayed when user selection changes
    switch(addType){
        case 1: previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'and', '&'));
                    break;
        case 2:  previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'or', '≥1'));
                    break;   
        case 3: previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'xor', '=1'));
                    break;           
    }
    
}

function newBitLength() {
    segBits = parseInt(bitSelect.value());
}

function newCounterBitLength() {
    counterBitWidth = parseInt(counterBitSelect.value());
    custFile = counterBitWidth + '-counter.json';
    if (isActive(counterButton)) {
        let opLabels = new Array(counterBitWidth).fill('');
        setPreviewElement(true, {
            tops: [],
            inputLabels: ['>'],
            outputLabels: opLabels,
            caption: 'Counter',
            inputs: 1,
            outputs: counterBitWidth
        });
    }
}

function newDecoderBitLength() {
    decoderBitWidth = parseInt(decoderBitSelect.value());
    custFile = decoderBitWidth + '-decoder.json';
    if (isActive(decoderButton)) {
        let opLabels = [];
        for (let i = 0; i < Math.pow(2, decoderBitWidth); i++) {
            opLabels.push(i);
        }
        let ipLabels = new Array(decoderBitWidth).fill('');
        setPreviewElement(true, {
            tops: [],
            inputLabels: ipLabels,
            outputLabels: opLabels,
            caption: 'Decoder',
            inputs: decoderBitWidth,
            outputs: Math.pow(2, decoderBitWidth)
        });
    }
}

function newMuxBitLength() {
    muxBitWidth = parseInt(multiplexerBitSelect.value());
    if (isActive(muxButton)) {
        let ipLabels = [];
        switch (muxBitWidth) {
            case 1:
                ipLabels.push('2º');
                break;
            case 2:
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
            case 3:
                ipLabels.push('2²');
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
        }
        for (let i = 0; i < Math.pow(2, muxBitWidth); i++) {
            ipLabels.push(i);
        }
        let tops = [];
        for (let i = 0; i < muxBitWidth; i++) {
            tops.push(i);
        }
        setPreviewElement(true, {
            tops: tops,
            inputLabels: ipLabels,
            outputLabels: [''],
            caption: 'MUX',
            inputs: Math.pow(2, muxBitWidth) + muxBitWidth,
            outputs: 1
        });
        custFile = muxBitWidth + '-mux.json';
    } else if (isActive(demuxButton)) {
        let ipLabels = [];
        switch (muxBitWidth) {
            case 1:
                ipLabels.push('2º');
                break;
            case 2:
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
            case 3:
                ipLabels.push('2²');
                ipLabels.push('2¹');
                ipLabels.push('2º');
                break;
        }
        ipLabels.push('');
        let tops = [];
        for (let i = 0; i < muxBitWidth; i++) {
            tops.push(i);
        }
        let opLabels = [];
        for (let i = 0; i < Math.pow(2, muxBitWidth); i++) {
            opLabels.push(i);
        }
        setPreviewElement(true, {
            tops: tops,
            inputLabels: ipLabels,
            outputLabels: opLabels,
            caption: 'DEMUX',
            inputs: 1 + muxBitWidth,
            outputs: Math.pow(2, muxBitWidth)
        });
        custFile = muxBitWidth + '-demux.json';
    }
}

function newDirection() {
    switch (directionSelect.value()) {
        case 'Right': gateDirection = 0; break;
        case 'Up': gateDirection = 3; break;
        case 'Left': gateDirection = 2; break;
        case 'Down': gateDirection = 1; break;
    }
    // Ensure that the correct preview gate is displayed when user selection changes
    switch(addType){
        case 1: previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'and', '&'));
                    break;
        case 2:  previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'or', '≥1'));
                    break;   
        case 3: previewSymbol = new CreatePreviewSymbol(new LogicGate(mouseX, mouseY, transform, gateDirection, gateInputCount, 1, 'xor', '=1'));
                    break;           
    }
}

function newClockspeed() {
    if (inputToModify >= 0) {
        if (inputs[inputToModify].clock) {
            inputs[inputToModify].speed = 60 - clockspeedSlider.value();
        }
    }
}

/* 
    Toggles the simulation
    Button label updated in the functions
*/
function simClicked() {
    previewSymbol = null;
    if (!simRunning) {
        reDraw();
        startSimulation();
    } else {
        endSimulation();
        enterModifierMode();
    }
}

/*
    Adding modes for gates, in/out, customs, etc.
*/
function andClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 1 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(andButton, true);
        setControlMode('addObject');
        addType = 1; // and
        setPreviewElement(false, {}, 'and');
        gateInputSelect.show();
        gateInputSelect.style('display', 'inline-block');
        labelGateInputs.show();
        labelGateInputs.style('display', 'inline-block');
        directionSelect.show();
        directionSelect.style('display', 'inline-block');
        labelDirection.show();
        labelDirection.style('display', 'inline-block');
        labelOptions.show();
    }
}

function orClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 2 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(orButton, true);
        setControlMode('addObject');
        addType = 2; // or
        setPreviewElement(false, {}, 'or');
        gateInputSelect.show();
        gateInputSelect.style('display', 'inline-block');
        labelGateInputs.show();
        labelGateInputs.style('display', 'inline-block');
        directionSelect.show();
        directionSelect.style('display', 'inline-block');
        labelDirection.show();
        labelDirection.style('display', 'inline-block');
        labelOptions.show();
    }
}

function xorClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 3 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(xorButton, true);
        setControlMode('addObject');
        addType = 3; // xor
        setPreviewElement(false, {}, 'xor');
        gateInputSelect.show();
        gateInputSelect.style('display', 'inline-block');
        labelGateInputs.show();
        labelGateInputs.style('display', 'inline-block');
        directionSelect.show();
        directionSelect.style('display', 'inline-block');
        labelDirection.show();
        labelDirection.style('display', 'inline-block');
        labelOptions.show();
    }
}

function inputClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 4 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(inputButton, true);
        newIsButton = false;
        newIsClock = false;
        setPreviewElement(false, {}, 'switch');
        setControlMode('addObject');
        addType = 4; // switch
        previewSymbol = new CreatePreviewSymbol(new Input(mouseX, mouseY, transform));
    }
}

function buttonClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 5 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(buttonButton, true);
        newIsButton = true;
        newIsClock = false;
        setPreviewElement(false, {}, 'button');
        setControlMode('addObject');
        addType = 5; // button
        previewSymbol = new CreatePreviewSymbol(new Input(mouseX, mouseY, transform));
    }
}

function clockClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 6 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(clockButton, true);
        newIsButton = false;
        newIsClock = true;
        setPreviewElement(false, {}, 'clock');
        setControlMode('addObject');
        addType = 6; // clock
        previewSymbol = new CreatePreviewSymbol(new Input(mouseX, mouseY, transform));
    }
}

function outputClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 7 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(outputButton, true);
        setControlMode('addObject');
        addType = 7; // output
        setPreviewElement(false, {}, 'output');
    }
}

function segDisplayClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 8 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(segDisplayButton, true);
        setControlMode('addObject');
        addType = 8; // segDisplay
        setPreviewElement(false, {}, '7-segment');
        bitSelect.show();
        bitSelect.style('display', 'inline-block');
        labelBits.show();
        labelBits.style('display', 'inline-block');
    }
}

// Starts the selection process
function startSelect() {
    if (controlMode === 'select') {
        enterModifierMode();
    } else {
        setActive(selectButton, true);
        setControlMode('select');
        setSelectMode('none');
    }
}

// Triggered when a label should be added
function labelButtonClicked(dontToggle = false) {
    hideAllOptions();
    if (controlMode === 'addObject' && addType === 9 && !dontToggle) {
        enterModifierMode();
    } else {
        setActive(labelButton, true);
        setControlMode('addObject');
        addType = 9; // label
        setPreviewElement(false, {}, 'label');
    }
}

function setControlMode(mode) {
    if (controlMode === 'select') { // If the select mode is leaved, clean up
        setSelectMode('none');
    }
    if (mode === 'addObject' || mode === 'select' || mode === 'delete') {
        leaveModifierMode();
        controlMode = mode;
    } else if (mode === 'modify') {
        controlMode = 'modify';
    } else {
        console.log('Control mode not supported!');
    }
}

function setSelectMode(mode) {
    selectMode = mode;
    switch (selectMode) {
        case 'none':
            unmarkAll();
            selection = [];
            selectionConpoints = [];
            selectionWires = [];
            showSelectionBox = false;
            break;
        case 'start':
            showSelectionBox = false;
            break;
        case 'drag':
            showSelectionBox = true;
            break;
        case 'end':
            showSelectionBox = true;
            break;
        default:
    }
    reDraw();
}

function addWires() {
    let pushed = false;

    let xIndex = -1;
    let yIndex = -1;

    let deletedIndices = [];

    let editLog = [];

    if (pwWireX !== null) {
        for (let i = 0; i < wires.length; i++) {
            let overlap = wireOverlap(pwWireX, wires[i]);
            if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (wires[i].direction === 0 && pwWireX.startY === wires[i].startY &&
                (pwWireX.startX == wires[i].endX || pwWireX.startX == wires[i].startX || pwWireX.endX == wires[i].startX || pwWireX.endX == wires[i].endX))) { //jshint ignore:line
                if (xIndex >= 0) {
                    let newWire = new Wire(0, Math.min(wires[xIndex].startX, wires[i].startX), wires[xIndex].startY, false, transform);
                    newWire.endX = Math.max(wires[xIndex].endX, wires[i].endX);
                    newWire.endY = wires[xIndex].startY;
                    editLog.push(['r', xIndex, wires[xIndex], newWire]);
                    wires.splice(xIndex, 1, newWire);
                    pushed = true;
                    deletedIndices.push(i);
                } else {
                    let newWire = new Wire(0, Math.min(pwWireX.startX, wires[i].startX), pwWireX.startY, false, transform);
                    newWire.endX = Math.max(pwWireX.endX, wires[i].endX);
                    newWire.endY = pwWireX.startY;
                    editLog.push(['r', i, wires[i], newWire]);
                    wires.splice(i, 1, newWire);
                    pushed = true;
                    xIndex = i;
                }
            }
        }

        if (xIndex < 0) {
            let newWire = new Wire(0, pwWireX.startX, pwWireX.startY, false, transform);
            newWire.endX = pwWireX.endX;
            newWire.endY = pwWireX.startY;
            editLog.push(['a', wires.length, newWire]);
            wires.push(newWire);
            pushed = true;
        }
    }

    if (pwWireY !== null) {
        for (let i = 0; i < wires.length; i++) {
            let overlap = wireOverlap(pwWireY, wires[i]);
            if ((overlap[0] !== overlap[2] || overlap[1] !== overlap[3]) || (wires[i].direction === 1 && pwWireY.startX === wires[i].startX &&
                (pwWireY.startY == wires[i].endY || pwWireY.startY == wires[i].startY || pwWireY.endY == wires[i].startY || pwWireY.endY == wires[i].endY))) { //jshint ignore:line
                if (yIndex >= 0) {
                    let newWire = new Wire(1, wires[yIndex].startX, Math.min(wires[yIndex].startY, wires[i].startY), false, transform);
                    newWire.endX = wires[yIndex].startX;
                    newWire.endY = Math.max(wires[yIndex].endY, wires[i].endY);
                    editLog.push(['r', yIndex, wires[yIndex], newWire]);
                    wires.splice(yIndex, 1, newWire);
                    pushed = true;
                    deletedIndices.push(i);
                } else {
                    let newWire = new Wire(1, pwWireY.startX, Math.min(pwWireY.startY, wires[i].startY), false, transform);
                    newWire.endX = pwWireY.startX;
                    newWire.endY = Math.max(pwWireY.endY, wires[i].endY);
                    editLog.push(['r', i, wires[i], newWire]);
                    wires.splice(i, 1, newWire);
                    pushed = true;
                    yIndex = i;
                }
            }
        }

        if (yIndex < 0) {
            let newWire = new Wire(1, pwWireY.startX, pwWireY.startY, false, transform);
            newWire.endX = pwWireY.startX;
            newWire.endY = pwWireY.endY;
            editLog.push(['a', wires.length, newWire]);
            wires.push(newWire);
            pushed = true;
        }
    }

    for (let i = deletedIndices.length - 1; i >= 0; i--) {
        editLog.push(['d', deletedIndices[i], wires.splice(deletedIndices[i], 1)[0]]);
    }

    if (pushed) {
        let conpointsBefore = _.cloneDeep(conpoints);
        doConpoints();
        let conpointsAfter = _.cloneDeep(conpoints);
        pushUndoAction('addWire', [], [_.cloneDeep(editLog), conpointsBefore, conpointsAfter]); // push the action for undoing
        wireMode = 'hold';
    } else {
        wireMode = 'none';
    }

    lockElements = false;
    pwWireX = null;
    pwWireY = null;
}

/*
    Adds a new gate with given type, input count and direction
*/
function addGate(type, inputs, direction) {
    for (let i = 0; i < gates.length; i++) {
        if ((gates[i].x === Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (gates[i].y === Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    let newGate = null;
    switch (type) {
        case 1:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'and');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [gates.length - 1], [newGate]);
            break;
        case 2:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'or');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [gates.length - 1], [newGate]);
            break;
        case 3:
            newGate = new LogicGate(mouseX, mouseY, transform, direction, inputs, 1, 'xor');
            newGate.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
            newGate.updateClickBoxes();
            gates.push(newGate);
            pushUndoAction('addGate', [gates.length - 1], [newGate]);
            break;
        default:
            console.log('Gate type \'' + type + '\' not found!');
    }
    reDraw();
}

/*
    Adds a custom element and loads it file and sub-customs
*/
function addCustom(file, direction) {
    for (let i = 0; i < customs.length; i++) {
        if (customs[i].visible) {
            if ((customs[i].x === Math.round(((mouseX - GRIDSIZE / 2) / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
                (customs[i].y === Math.round(((mouseY - GRIDSIZE / 2) / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
                return;
            }
        }
    }
    setLoading(true);
    let newCustom = new CustomSketch(mouseX, mouseY, transform, direction, file);
    newCustom.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    customs.push(newCustom);
    loadCustomFile(newCustom.filename, customs.length - 1, customs.length - 1);
    pushUndoAction('addCust', [customs.length - 1], [newCustom]);
}

/*
    Adds a new output (lamp)
*/
function addOutput() {
    for (var i = 0; i < outputs.length; i++) {
        if ((outputs[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (outputs[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    var newOutput = new Output(mouseX, mouseY, transform, 0);
    newOutput.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newOutput.updateClickBox();
    outputs.push(newOutput);
    pushUndoAction('addOut', [outputs.length - 1], [newOutput]);
    reDraw();
}

/*
    Adds a new 7-segment display
*/
function addSegDisplay(bits) {
    for (var i = 0; i < segDisplays.length; i++) {
        if ((segDisplays[i].x === Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) &&
            (segDisplays[i].y === Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE)) {
            return;
        }
    }
    var newDisplay = new SegmentDisplay(mouseX, mouseY, transform, bits);
    newDisplay.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newDisplay.updateClickBoxes();
    segDisplays.push(newDisplay);
    pushUndoAction('addSegDis', [segDisplays.length - 1], [newDisplay]);
    reDraw();
}

/*
    Adds a new input (switch, button or clock)
*/
function addInput() {
    for (var i = 0; i < inputs.length; i++) {
        if ((inputs[i].x === (Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE) - GRIDSIZE / 2) &&
            (inputs[i].y === (Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE) - GRIDSIZE / 2)) {
            return;
        }
    }
    var newInput = new Input(mouseX, mouseY, transform);
    newInput.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newInput.updateClickBox();
    if (newIsButton) {
        newInput.framecount = BUTCOUNT;
    } else if (newIsClock) {
        newInput.resetFramecount();
    } else {
        newInput.framecount = -1;
    }
    newInput.clock = newIsClock;
    inputs.push(newInput);
    pushUndoAction('addIn', [inputs.length - 1], [newInput]);
    reDraw();
}

/*
    Adds a new label
*/
function addLabel() {
    for (var i = 0; i < labels.length; i++) {
        if ((labels[i].x === (Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE)) &&
            (labels[i].y === (Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE))) {
            return;
        }
    }
    var newLabel = new Label(mouseX, mouseY, 'New label', transform);
    newLabel.setCoordinates(mouseX / transform.zoom - transform.dx, mouseY / transform.zoom - transform.dy);
    newLabel.updateClickBox();
    labels.push(newLabel);
    pushUndoAction('addLabel', [labels.length - 1], [newLabel]);
    reDraw();
}

function deleteWires() {
    let deletedDiodesIndices = [];
    let deletedDiodes = [];

    let changes = false;

    let newWiresList = [];
    let replaceIndices = [];
    let deletedIndices = [];

    let editLog = [];

    if (pwWireX !== null) {
        for (let i = 0; i < wires.length; i++) {
            let overlap = wireOverlap(pwWireX, wires[i]);
            let newWires = removeFromWire(wires[i], overlap, i);
            if (newWires !== false) {
                deletedIndices.push(i);
                changes = true;
                if (newWires.length >= 1) {
                    newWiresList.push(newWires);
                    replaceIndices.push(i);
                }
            }
        }
    }

    if (pwWireY !== null) {
        for (let i = 0; i < wires.length; i++) {
            let overlap = wireOverlap(pwWireY, wires[i]);
            let newWires = removeFromWire(wires[i], overlap, i);
            if (newWires !== false) {
                deletedIndices.push(i);
                changes = true;
                if (newWires.length >= 1) {
                    newWiresList.push(newWires);
                    replaceIndices.push(i);
                }
            }
        }
    }

    /*
        delete all wires that should be removed
    */
    for (let i = wires.length - 1; i >= 0; i--) {
        if (deletedIndices.indexOf(i) >= 0) {
            editLog.push(['d', i, wires.splice(i, 1)[0]]);
        }
    }

    /*
        Add all newly created wires
    */
    for (let i = wires.length - 1; i >= 0; i--) {
        if (deletedIndices.indexOf(i) >= 0) {
            if (replaceIndices.indexOf(i) >= 0) {
                let newWires = newWiresList.pop();
                for (let j = 0; j < newWires.length; j++) {
                    if (newWires[j].startX !== newWires[j].endX || newWires[j].startY !== newWires[j].endY) {
                        editLog.push(['a', i + j, newWires[j]]);
                        wires.splice(i + j, 0, newWires[j]);
                    }
                }
            }
        }
    }

    /*
        Note all indices of diodes that are placed on the preview wires
    */
    if (pwWireX !== null) {
        deletedDiodesIndices = deletedDiodesIndices.concat(diodesOnWire(pwWireX));
    }

    if (pwWireY !== null) {
        deletedDiodesIndices = deletedDiodesIndices.concat(diodesOnWire(pwWireY));
    }


    if (changes) { // only push an undo action when changes have been made to the wires
        deletedDiodesIndices.sort(function (a, b) { // sort the diode indices to remove them in the right order
            return a - b;
        });
        deletedDiodesIndices = _.uniq(deletedDiodesIndices); // Remove duplicate indices in case a diode is on both wires
        for (let i = deletedDiodesIndices.length - 1; i >= 0; i--) {
            deletedDiodes.push(diodes.splice(deletedDiodesIndices[i], 1)); // remove the diodes and save them in an array
        }
        deletedDiodes.reverse();
        let conpointsBefore = _.cloneDeep(conpoints);
        doConpoints();
        let conpointsAfter = _.cloneDeep(conpoints);
        pushUndoAction('delWire', [deletedDiodesIndices], [editLog, conpointsBefore, conpointsAfter, deletedDiodes]);
    }

    pwWireX = null; // reset the preview wires
    pwWireY = null;
    wireMode = 'none';
    lockElements = false;
}

/*
    Deletes the given gate
*/
function deleteGate(gateNumber) {
    pushUndoAction('delGate', [gateNumber], gates.splice(gateNumber, 1));
    reDraw();
}

/*
    Deletes the given custom
*/
function deleteCustom(customNumber) {
    for (let i = customs.length - 1; i >= 0; i--) {
        if (customs[i].pid === customs[customNumber].id) {
            customs.splice(i, 1);
        }
    }
    pushUndoAction('delCust', [customNumber], customs.splice(customNumber, 1));
    reDraw();
}

/*
    Deletes the given output (lamp)
*/
function deleteOutput(outputNumber) {
    pushUndoAction('delOut', [outputNumber], outputs.splice(outputNumber, 1));
    reDraw();
}

/*
    Deletes the given input (switch)
*/
function deleteInput(inputNumber) {
    pushUndoAction('delIn', [inputNumber], inputs.splice(inputNumber, 1));
    reDraw();
}

/*
    Deletes the given label
*/
function deleteLabel(labelNumber) {
    pushUndoAction('delLabel', [labelNumber], labels.splice(labelNumber, 1));
    reDraw();
}

/*
    Deletes the given 7-segment display
*/
function deleteSegDisplay(segDisNumber) {
    pushUndoAction('delSegDis', [segDisNumber], segDisplays.splice(segDisNumber, 1));
    reDraw();
}

/*
    Starts the simulation mode
    - Groups are created and objects are integrated
    - simRunning is set so that the sketch can't be altered
*/
function startSimulation() {
    if (!sfcheckbox.checked()) {
        updater = setInterval(updateTick, 0);
    }

    setSimButtonText('<i class="fa fa-stop icon"></i> Stop'); // Alter the caption of the Start/Stop button
    setControlMode('modify');
    setActive(simButton, true);
    disableButtons(true);
    hideAllOptions();

    parseGroups();
    integrateElements();

    // Reset all clocks
    for (const elem of inputs) {
        if (elem.getIsClock()) {
            elem.resetFramecount();
        }
    }

    // Tell all customs that the simulation started
    for (let i = 0; i < customs.length; i++) {
        customs[i].setSimRunning(true);
    }

    labelOptions.show();
    sfcheckbox.show();

    // Start the simulation and exit the modifier mode
    simRunning = true;
    leaveModifierMode();
}

/*
    Ends the simulation mode
    - Groups are deleted
    - Objects are set to low state
    - simRunning is cleared so that the sketch can be altered
*/
function endSimulation() {
    clearInterval(updater); // Stop the unsynced simulation updater
    setSimButtonText('<i class="fa fa-play icon"></i> Start'); // Set the button caption to 'Start'
    updateUndoButtons();
    labelOptions.hide();
    sfcheckbox.hide();

    groups = []; // Reset the groups, as they are regenerated when starting again
    for (const elem of gates) {
        elem.shutdown(); // Tell all the gates to leave the simulation mode
    }
    for (const elem of customs) {
        elem.setSimRunning(false); // Shutdown all custom elements
    }
    for (const elem of segDisplays) {
        elem.shutdown();
    }
    // Set all item states to zero
    for (const elem of conpoints) {
        elem.state = false;
    }
    for (const elem of outputs) {
        elem.state = false;
    }
    for (const elem of inputs) {
        elem.setState(false);
    }
    for (const elem of diodes) {
        elem.setState(false);
    }
    for (const elem of wires) {
        elem.state = false;
    }
    simRunning = false;
    reDraw();
}

function setSimButtonText(text) {
    simButton.elt.innerHTML = text;
}

/*
    Enables/Disables the undo and redo buttons
    depending on the state of the stack
*/
function updateUndoButtons() {
    redoButton.elt.disabled = (actionRedo.length === 0);
    undoButton.elt.disabled = (actionUndo.length === 0);
    if (loading) {
        redoButton.elt.disabled = true;
        undoButton.elt.disabled = true;
    }
}

/*
    Enables or disables all buttons that should not be
    clickable during simulation
    Also alters the color of the labels on the left
*/
function disableButtons(status) {
    if (status) {
        /*andButton.elt.innerHTML = '<img style="filter: brightness(50%);" class="preview" src="images/and-gate.png">';
        orButton.elt.innerHTML = '<img style="filter: brightness(50%);" class="preview" src="images/or-gate.png">';
        xorButton.elt.innerHTML = '<img style="filter: brightness(50%);" class="preview" src="images/xor-gate.png">';
        inputButton.elt.innerHTML = '<img style="filter: brightness(50%);" class="preview" src="images/switch.png">';
        outputButton.elt.innerHTML = '<img style="filter: brightness(50%);" class="preview" src="images/output.png">';
        segDisplayButton.elt.innerHTML = '<img style="filter: brightness(50%);" class="preview" src="images/segments.png">';
        buttonButton.elt.innerHTML = '<img style="filter: brightness(50%);" class="preview" src="images/button.png">';
        clockButton.elt.innerHTML = '<img style="filter: brightness(50%);" class="preview" src="images/clock.png">';*/
        undoButton.elt.disabled = true;
        redoButton.elt.disabled = true;
    } else {
        /*andButton.elt.innerHTML = '<img class="preview" src="images/and-gate.png">';
        orButton.elt.innerHTML = '<img class="preview" src="images/or-gate.png">';
        xorButton.elt.innerHTML = '<img class="preview" src="images/xor-gate.png">';
        inputButton.elt.innerHTML = '<img class="preview" src="images/switch.png">';
        outputButton.elt.innerHTML = '<img class="preview" src="images/output.png">';
        segDisplayButton.elt.innerHTML = '<img class="preview" src="images/segments.png">';
        buttonButton.elt.innerHTML = '<img class="preview" src="images/button.png">';
        clockButton.elt.innerHTML = '<img class="preview" src="images/clock.png">';*/
        updateUndoButtons();
    }
    andButton.elt.disabled = status;
    orButton.elt.disabled = status;
    xorButton.elt.disabled = status;
    inputButton.elt.disabled = status;
    outputButton.elt.disabled = status;
    segDisplayButton.elt.disabled = status;
    buttonButton.elt.disabled = status;
    clockButton.elt.disabled = status;
    deleteButton.elt.disabled = status;
    selectButton.elt.disabled = true; // !!!
    reg4Button.elt.disabled = status;
    decoderButton.elt.disabled = status;
    counterButton.elt.disabled = status;
    muxButton.elt.disabled = status;
    demuxButton.elt.disabled = status;
    dFlipFlopButton.elt.disabled = status;
    rsFlipFlopButton.elt.disabled = status;
    halfaddButton.elt.disabled = status;
    fulladdButton.elt.disabled = status;
    if (getCookieValue('access_token') !== '') {
        customButton.elt.disabled = status;
    }
    modifierModeButton.elt.disabled = status;
    labelButton.elt.disabled = status;
    // Sets the colors of the labels
    /*if (status) {
        labelBasic.elt.style.color = '#969696';
        labelAdvanced.elt.style.color = '#969696';
    } else {
        labelBasic.elt.style.color = '#969696';
        labelAdvanced.elt.style.color = '#969696';
    }*/
}

/*
    Executes in every frame, draws everything and updates the sketch logic
*/
function draw() {
    if (simRunning) {
        updateTick(); // Updates the circuit logic
        reDraw(); // Redraw all elements of the sketch
    } else {
        if ((wireMode === 'preview' || wireMode === 'delete') && !mouseOverGUI() && !modifierMenuDisplayed()) {
            generatePreviewWires(wirePreviewStartX, wirePreviewStartY, Math.round((mouseX / transform.zoom - transform.dx) / GRIDSIZE) * GRIDSIZE,
                Math.round((mouseY / transform.zoom - transform.dy) / GRIDSIZE) * GRIDSIZE);
            reDraw();
        } else if (controlMode === 'select' || controlMode === 'addObject' && !mouseIsPressed && !modifierMenuDisplayed()) {
            reDraw();
        }

    }

    handleDragging();
}

/*
    Executes one update tick of the sketch logic
*/
function updateTick() {
    // Tell all gates to update
    for (const value of gates) {
        value.update();
    }

    // Tell all visible customs to update
    // (they will update all of their gates and customs by themselves)
    for (const value of customs) {
        if (value.visible) {
            value.update();
        }
    }

    // Update all wire groups
    updateGroups();

    // Update all connection points to adopt the state of their wire group
    for (const value of conpoints) {
        value.state = groups[value.group].state;
    }

    // Update all self-toggling input elements (buttons and clocks)
    for (const value of inputs) {
        if (value.framecount === 0) {
            if (value.getIsClock()) {
                value.toggle();
                value.resetFramecount();
            } else {
                value.setState(false);
                value.framecount = BUTCOUNT;
            }
        } else if ((value.framecount > 0) && (value.state || value.getIsClock())) {
            value.framecount--;
        }
    }

    // Update all segments displays
    for (const value of segDisplays) {
        value.update();
    }

    // Update the states of all diodes
    // They adopt the state of their group A (horizontal wire)
    // and if they are high, they pass that event to group B
    for (const value of diodes) {
        value.state = groups[value.groupA].state;
        if (value.state) {
            groups[value.groupB].diodeHigh();
        }
    }
}

/*
    Redraws all items on the screen, partly translated and scaled
*/
function reDraw() {
    // Set the background, scale and draw the grid
    background(150);
    scale(transform.zoom);
    drawGrid();

    // Handle the offset from dragging
    translate(transform.dx, transform.dy);

    // Draw all sketch elements on screen
    //let t0 = performance.now();
    showElements();

    // Display the preview wire segment set
    if (wireMode === 'preview' || wireMode === 'delete') {
        if (pwWireX !== null) {
            pwWireX.show(wireMode === 'delete');
        }

        if (pwWireY !== null) {
            pwWireY.show(wireMode === 'delete');
        }
    }

    if (controlMode === 'select' && selectMode === 'start') {
        fill(0, 0, 0, 100); // Set the fill color to a semi-transparent black
        noStroke();
        selectEndX = Math.round(((mouseX + GRIDSIZE / 2) / transform.zoom - transform.dx - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
        selectEndY = Math.round(((mouseY + GRIDSIZE / 2) / transform.zoom - transform.dy - GRIDSIZE / 2) / GRIDSIZE) * GRIDSIZE + GRIDSIZE / 2;
        rect(Math.min(selectStartX, selectEndX), Math.min(selectStartY, selectEndY),
            Math.abs(selectStartX - selectEndX), Math.abs(selectStartY - selectEndY));
    }

    //let t1 = performance.now();
    //console.log('took ' + (t1 - t0) + ' milliseconds.');

    // Reverse the scaling and translating to draw the stationary elements of the GUI
    scale(1 / transform.zoom);
    translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);

    // If the modifier mode is active and an object was selected, show the modifier menu background
    if (modifierMenuDisplayed()) {
        scale(transform.zoom);
        translate(transform.dx, transform.dy);
        if (inputToModify >= 0) {
            inputs[inputToModify].show();
        } else if (outputToModify >= 0) {
            outputs[outputToModify].show();
        } else if (labelToModify >= 0) {
            labels[labelToModify].show();
        }
        scale(1 / transform.zoom);
        translate(-transform.zoom * transform.dx, -transform.zoom * transform.dy);
        showModifierMenu();
        cursor(ARROW);
    }

    if (loading && !showCustomDialog) {
        showMessage('LOADING...', loadFile.split('.json')[0]);
    }

    if (error !== '') {
        showMessage(error, errordesc);
    }

    if (saveDialog) {
        showSaveDialog();
    }

    if (showCustomDialog) {
        textFont('Gudea');
    }

    // Draw the zoom and framerate labels
    textFont('Gudea');
    textAlign(LEFT, TOP);
    textSize(12);
    fill(0);
    noStroke();
    text(Math.round(transform.zoom * 100) + '%', 10, window.height - 20); // Zoom label
    text(Math.round(frameRate()), window.width - 20, window.height - 20); // Framerate label
}

function showMessage(msg, subline = '') {
    textFont('Open Sans');
    fill(0, 0, 0, 80);
    noStroke();
    rect(0, 0, window.width, window.height);

    fill(50);
    noStroke();
    rect(window.width / 2 - 250, window.height / 2 - 75, 500, 150, 10);
    fill(255);
    textSize(30);
    textAlign(CENTER, CENTER);
    text(msg, window.width / 2, window.height / 2 - 20);
    textSize(20);
    text(subline, window.width / 2, window.height / 2 + 30);
}

function showSaveDialog() {
    fill('rgba(50, 50, 50, 1)');
    noStroke();
    rect(window.width / 2 - 365, window.height / 2 - 208, 580, 385, 10);
    showPreviewImage();
}

function displayCustomDialog() {
    pageUpButton.position(Math.round(window.width / 8) + customDialogColumns * 220 + 260, customDialogRows * 220 - 10);
    pageDownButton.position(Math.round(window.width / 8) + customDialogColumns * 220 + 260, customDialogRows * 220 + 50);
    fill(50, 50, 50);
    noStroke();
    rect(Math.round(window.width / 8), 50, customDialogColumns * 220 + 220, customDialogRows * 220 + 90, 10);
    cancelButton.position(Math.round(window.width / 8) + customDialogColumns * 220 + 260, customDialogRows * 220 + 110);
    cancelButton.show();
    customDialogText.show();
    for (let i = 0; i < importSketchData.sketches.length; i++) {
        showCustomItem(i + 1, importSketchData.views/images[i], importSketchData.sketches[i], importSketchData.looks[i]);
    }
    if (customDialogPages > 0 && customDialogPage < customDialogPages) {
        pageDownButton.show();
    } else {
        pageDownButton.hide();
    }
    if (customDialogPage > 0) {
        pageUpButton.show();
    } else {
        pageUpButton.hide();
    }
}

function fetchImportData() {
    /*
    customDialogColumns = Math.floor((window.width - 150 - window.width / 4) / 220);
    customDialogRows = Math.floor((window.height - window.height / 10) / 220);
    socket.emit('getImportSketches', { access_token: getCookieValue('access_token') });
    socket.on('importSketches', (data) => {
        socket.off('importSketches'); 
        importSketchData = data;
        customDialogPages = Math.ceil(Math.ceil(data.sketches.length / customDialogColumns) / customDialogRows) - 1;
    });
    */
}

function showCustomItem(place, img, caption, look) {
    let row = Math.ceil(place / customDialogColumns - 1) - (customDialogPage * customDialogRows);
    let x = ((place - 1) % customDialogColumns) * 220 + Math.round(window.width / 8) + 40;
    let y = (row * 220) + 140;
    if (row >= customDialogRows || row < 0) {
        return;
    }
    if (img !== '') {
        img = 'data:image/png;base64,' + img;
        let raw = new Image(200, 200);
        raw.src = img;
        img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAQAAAAHUWYVAAABV0lEQVR4Ae3YBxEAMRADMafwxxwU6RKFHd+XnpKDIIggCCIIggiCIIKwWk8NFoIggiCIIAgiCIIIgiD4dWIhCCIIggiCIILgOwQLEQRBBEEQQRBEEARBEEHwL8tCEEQQBBEEQRDEdwgWIgiCCIIggiAIggiCIH6dYCGCIIggCIIggiCID0MsRBAEEQRBEEQQfIdYCIIIgiCCIAiCCIIggiCIf1lYiCAI8idBBEEQQfAdYiEIIgiCIIggCCIIggiCXycWgiAIIgiCCIIggiCIIAhCDxaChVgIFmIhCOJkYSGC4GRhIRaChQiCk2UhCOJkYSFYiIUgiJOFhVgIFmIhWAiCOFlYiCA4WRaChVgIguBkWQgWYiEI4mRhIRaChSCIk4WFWAgWIghOloUgCE6WhWAhFoIgThYWYiFYCII4WViIhWAhguBkWQgWgoUIgpNlIViIhSDIFwafxgPUTiURLQAAAABJRU5ErkJggg==';
        let gradientRaw = new Image(200, 200);
        gradientRaw.src = img;
        raw.onload = function () {
            let normal_img = createImage(200, 200);
            normal_img.drawingContext.drawImage(raw, 0, 0);
            normal_img.drawingContext.drawImage(gradientRaw, 0, 0);
            fill(0);
            image(normal_img, x, y);
            if (look.hasOwnProperty('outputs')) {
                if (look.outputs > 0) {
                    showImportPreview(look, x, y);
                }
            }
            fill('rgba(0, 0, 0, 0)');
            strokeWeight(10);
            stroke(50, 50, 50);
            rect(x, y, 200, 200, 10);
            noStroke();
            fill(255);
            textSize(16);
            text(caption.toUpperCase(), x + 10, y + 170);
        };
    }
}

/*
    This is executed when the user clicks on an item in the custom dialog
    row, col: row and column of the item the user clicked on
*/
function importItemClicked(row, col) {
    let place = customDialogColumns * row + col + customDialogPage * customDialogColumns * customDialogRows; // Calculate the array position of the custom module
    if (place >= importSketchData.sketches.length || importSketchData.looks[place].outputs === 0) {
        return; // If the place should be greater than the number of available modules or the module has no outputs, return.
    }
    setActive(customButton, true); // Set the custom modules button as activated
    setPreviewElement(true, importSketchData.looks[place]); // Show a preview of the module at the users mouse position
    importCustom(importSketchData.sketches[place] + '.json'); // Import the module on mouse click
}

/*
    This function displays all compoments of the sketch as well as preview elements
*/
function showElements() {
    if (simRunning) {
        for (const elem of groups) {
            elem.show();
        }
    } else {
        if (selection.length > 0) {
            for (const elem of wires) {
                elem.show();
            }
            for (const elem of selection) {
                elem[0].show();
            }
        } else {
            for (let i = 0; i < wires.length; i++) {
                wires[i].show(false, i);
            }
        }
    }

    textFont('Consolas');
    if (gates.length > 0) {
        for (const elem of gates) {
            elem.show();
        }
    }

    if (customs.length > 0) {
        textFont('Open Sans');
        for (const elem of customs) {
            if (elem.visible) {
                elem.show();
            }
        }
    }

    for (const elem of conpoints) {
        elem.show();
    }

    for (const elem of outputs) {
        elem.show();
    }

    for (const elem of inputs) {
        elem.show();
    }

    for (const elem of diodes) {
        elem.show();
    }

    if (segDisplays.length > 0) {
        textFont('PT Mono');
        for (const elem of segDisplays) {
            elem.show();
        }
    }

    textFont('Gudea');
    textSize(20);
    textAlign(LEFT, TOP);
    for (const elem of labels) {
        elem.show();
    }

    if (controlMode === 'addObject') {
        textFont('Consolas');
        showElementPreview();
    }

    if (showSelectionBox) {
        selectionBox.markClickBox();
    }
}

/*
    Updates all group states
*/
function updateGroups() {
    for (var i = 0; i < groups.length; i++) {
        groups[i].updateAll();
    }
}

/*
    Check if a key was pressed and act accordingly
*/
function keyPressed() {
    if (captionInput.elt === document.activeElement || labelTextBox.elt === document.activeElement || loading || saveDialog) {
        return;
    }
    if (sketchNameInput.elt !== document.activeElement) {
        if (keyCode >= 49 && keyCode <= 57) {
            gateInputCount = keyCode - 48;
            gateInputSelect.value(gateInputCount);
            return;
        }
        switch (keyCode) {
            case ESCAPE:
                enterModifierMode();
                reDraw();
                break;
            case RETURN:
                leaveModifierMode();
                hideAllOptions();
                simClicked();
                break;
            case CONTROL:
                //startSelect();
                console.log(wires.length);
                break;
            case 32: // Space
                if (controlMode !== 'delete') {
                    deleteClicked();
                } else {
                    enterModifierMode();
                }
                break;
            case 48: // 0
                gateInputCount = 10;
                gateInputSelect.value('10');
                break;
            case RIGHT_ARROW:
                gateDirection = 0;
                directionSelect.value('Right');
                break;
            case DOWN_ARROW:
                gateDirection = 1;
                directionSelect.value('Down');
                break;
            case LEFT_ARROW:
                gateDirection = 2;
                directionSelect.value('Left');
                break;
            case UP_ARROW:
                gateDirection = 3;
                directionSelect.value('Up');
                break;
            default:
                break;
        }
    } else if (keyCode === RETURN) { // Load the sketch when the textInput is active
        loadClicked();
    }
}

function setHelpText(str) {
    if (str !== '') {
        helpLabel.elt.innerHTML = '<i class="fa fa-question-circle icon" style="color: rgb(200, 50, 50);"></i> ' + str;
        helpLabel.style('font-size', '15px');
        helpLabel.show();
    } else {
        helpLabel.hide();
    }
}

function setLoading(l) {
    loading = l;
    disableButtons(l);
    simButton.elt.disabled = l;
    saveDialogButton.elt.disabled = l;
    if (getCookieValue('access_token') !== '') {
        customButton.elt.disabled = l;
    }
    //closeTutorialButton.elt.disabled = l;
    //nextStepButton.elt.disabled = l;
    updateUndoButtons();
    reDraw();
}

/*
    Draws the underlying grid on the canvas
*/
function drawGrid() {
    stroke(140); // Grid lines are a bit darker than the background
    strokeWeight(3); // Grid lines are three pixels wide
    for (let i = Math.round(transform.dx % GRIDSIZE); i < width / transform.zoom; i += GRIDSIZE) { // Vertical lines
        line(i, 0, i, height / transform.zoom);
    }
    for (let j = Math.round(transform.dy % GRIDSIZE); j < height / transform.zoom; j += GRIDSIZE) { // Horizontal lines
        line(0, j, width / transform.zoom, j);
    }
}

function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}