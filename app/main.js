const MQ = MathQuill.getInterface(2);

var fontSizeController = document.getElementById("font-size");

var currentFieldCount = 1;
var activeField = 1;
var lastPositionY = 10;
var lastPositionX = 10;
var mouseX = 0;
var mouseY = 0;
var mainBoard = document.getElementById("main-board");
const fields = new Map();

function activateMathField(x) {
    var mathFieldSpan = document.getElementById(`math-field-${x}`);
    var latexSpan = document.getElementById('latex');

    activeField = x;

    var mathField = MQ.MathField(mathFieldSpan, {
        spaceBehavesLikeTab: true, // configurable
        // autoCommands: 'pi theta sqrt sum',
        autoOperatorNames: 'sin cos',
        substituteTextarea: function() {
            return document.createElement('textarea');
        },
        handlers: {
            edit: function () { // useful event handlers
                latexSpan.textContent = mathField.latex(); // simple API
            },
            enter: function () {
                // addMathField();
            },
        }
    });

    mathField.focus();
    mathField.el().addEventListener('click', function(evt) {
        activeField = x;
        console.log(`Active field ${x}`);
    });
}

function within(x1, x2, delta) {
    return x2 - delta <= x1 && x1 <= x2 + delta;
}

function addMathField() {
    console.log('Adding new math field');

    var mathFieldContainer = document.createElement("div");
    var newMathField = document.createElement("span");
    newMathField.id = `math-field-${currentFieldCount}`;
    newMathField.classList.add("math-field");
    newMathField.style.fontSize = `${fontSizeController.value}px`;
    mathFieldContainer.classList.add("math-field-container");
    mathFieldContainer.id = `math-field-container-${currentFieldCount}`;
    mathFieldContainer.appendChild(newMathField);
    newMathField.addEventListener("keydown", function (evt) {
        if (evt.shiftKey && evt.key === 'Enter') {
            evt.preventDefault();
            addMathField();
        }

        if (evt.ctrlKey && evt.key === 'Delete') {
            evt.preventDefault();
            removeActiveMathField();
        }
    });

    fields[currentFieldCount] = newMathField;

    mainBoard.appendChild(mathFieldContainer);
    activateMathField(currentFieldCount);
    fieldAdded(mathFieldContainer);

    currentFieldCount++;
}

function addTextField() {
    console.log('Adding new text field');

    var textFieldContainer = document.createElement("div");
    var newTextField = document.createElement("textarea");
    newTextField.style.fontSize = `${fontSizeController.value}px`;
    newTextField.id = `text-field-${currentFieldCount}`;
    newTextField.classList.add("text-field");
    newTextField.addEventListener("click", function(evt) {
        activeField = parseInt(evt.target.id.match(/\d+/)[0]);
    });
    textFieldContainer.classList.add("text-field-container");
    textFieldContainer.id = `text-field-container-${currentFieldCount}`;
    textFieldContainer.appendChild(newTextField);
    textFieldContainer.addEventListener("keydown", function (evt) {
        if (evt.shiftKey && evt.key === 'Enter') {
            addTextField();
        }
        if (evt.ctrlKey && evt.key === 'Delete') {
            removeActiveTextField();
        }
    });

    activeField = currentFieldCount;

    fields[currentFieldCount] = newTextField;
    mainBoard.appendChild(textFieldContainer);
    fieldAdded(textFieldContainer);

    currentFieldCount++;
}

function activateMDField(x) {
    activeField = x;

    const Editor = toastui.Editor;
    const editor = new Editor({
        el: document.querySelector(`#md-field-${x}`),
        height: 'auto',
        initialEditType: 'markdown',
        previewStyle: 'vertical'
    });
    editor.addHook("keydown", function (title, evt) {
        // console.log(evt);

        if (evt.shiftKey && evt.key === 'Enter') {
            addMDField();
        }
        if (evt.ctrlKey && evt.key === 'Delete') {
            removeActiveMDField();
        }
    });

    editor.getMarkdown();

    editor.on("focus", function(evt) {
        console.log(`Active field ${x}`);
        activeField = x;
    });

    editor.focus();
}

function addMDField() {
    console.log('Adding new md field');

    var mdFieldContainer = document.createElement("div");
    var newMDField = document.createElement("div");
    newMDField.id = `md-field-${currentFieldCount}`;
    newMDField.classList.add("md-field");
    mdFieldContainer.classList.add("md-field-container");
    mdFieldContainer.id = `md-field-container-${currentFieldCount}`;

    fields[currentFieldCount] = newMDField;
    mdFieldContainer.appendChild(newMDField);
    mainBoard.appendChild(mdFieldContainer);
    activateMDField(currentFieldCount);
    fieldAdded(mdFieldContainer);

    currentFieldCount++;
}

function removeActiveTextField(id = -1) {
    if (id == -1) {
        id = activeField;
    }
    
    console.log(`Removing text field ${id}`);
    
    fields.delete(id);
    
    var item = document.getElementById(`text-field-${id}`);
    item.remove();
    var container = document.getElementById(`text-field-container-${id}`);
    fieldRemoved(container);
    container.remove();
}

function removeActiveMathField(id = -1) {
    if (id == -1) {
        id = activeField;
    }
    
    console.log(`Removing math field ${id}`);
    
    fields.delete(id);
    
    var item = document.getElementById(`math-field-${id}`);
    item.remove();
    var container = document.getElementById(`math-field-container-${id}`);
    fieldRemoved(container);
    container.remove();
}

function removeActiveTextField(id = -1) {
    if (id == -1) {
        id = activeField;
    }
    
    console.log(`Removing text field ${id}`);

    fields.delete(id);
    
    var item = document.getElementById(`text-field-${id}`);
    item.remove();
    var container = document.getElementById(`text-field-container-${id}`);
    fieldRemoved(container);
    container.remove();
}

function removeActiveMDField(id = -1) {
    if (id == -1) {
        id = activeField;
    }

    console.log(`Removing md field ${id}`);

    fields.delete(id);
    
    var item = document.getElementById(`md-field-${id}`);
    item.remove();
    var container = document.getElementById(`md-field-container-${id}`);
    fieldRemoved(container);
    container.remove();
}

var paintOn = false;
function showPaintField() {
    var paintContainer = document.getElementById("paint-app-container-id");
    if (paintOn) {
        paintContainer.style.display = "none";
        paintOn = false;
    } else {
        paintContainer.style.display = "flex";
        paintOn = true;
    }
    
    $(".draggable-element").arrangeable({dragSelector: '.drag-area'});
}

function fieldAdded(container) {
    var draggable = document.createElement("div");
    draggable.classList.add("drag-area");
    container.classList.add("draggable-element");
    container.appendChild(draggable);
    // container.insertBefore(draggable, container.firstChild);
    $(".draggable-element").arrangeable({dragSelector: '.drag-area'});
}

function fieldRemoved(container) {
}

function changeFont() {
    var forAll = document.getElementById("apply-to-all");
    if (forAll.checked) {
        var mathFields = document.getElementsByClassName("math-field");
        for (let mathField of mathFields) {
            mathField.style.fontSize = `${Math.max(3, fontSizeController.value)}px`;
        }
    
        var textFields = document.getElementsByClassName("text-field");
        for (let textField of textFields) {
            textField.style.fontSize = `${Math.max(3, fontSizeController.value)}px`;
        }
    
        var mdFields = document.getElementsByClassName("ProseMirror");
        for (let mdField of mdFields) {
            mdField.style.fontSize = `${Math.max(3, fontSizeController.value - 8)}px`;
        }
    } else {
        fields[activeField].style.fontSize = `${Math.max(3, fontSizeController.value)}px`;
    }
}

function initialize() {
    var latexControl = document.getElementById("show-latex");
    latexControl.addEventListener("change", function(evt) {
        if (latexControl.checked) {
            document.getElementById("latex").style.display = 'block';
        } else {
            document.getElementById("latex").style.display = 'none';
        }
    });

    document.addEventListener("mousemove", function(evt) {
        mouseX = evt.clientX;
        mouseY = evt.clientY;
    });

    var hour = 0, minute = 0, second = 0;
    var elapsedTime = document.getElementById("elapsed-time");
    setInterval(() => {
        elapsedTime.innerText = `${hour}:${minute}:${second}`;
        second++;
        if (second === 60) {
            minute++;
            second = 0;
        }
        if (minute === 60) {
            hour++;
            minute = 0;
        }
    }, 1000);
}

initialize();
