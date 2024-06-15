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
        autoCommands: 'ne pi to cup cap bar iff not and mid sum sqrt text theta times equiv lambda forall exists implies subseteq therefore',
        autoOperatorNames: 'sin cos tan cosec sec cot csc',
        substituteTextarea: function () {
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
    mathField.el().addEventListener('click', function (evt) {
        activeField = x;
        console.log(`Active field ${x}`);
    });
}

function activateNumberLine(id) {
    var rangeInput = document.getElementById(`numberLineRangeInput${id}`);
    rangeInput.addEventListener("change", function (evt) {
        __active_number_line(id, parseFloat(rangeInput.value));
    });

    __active_number_line(id, 4);

    function __active_number_line(x, range) {
        const margin = {
            top: 20,
            right: 40,
            bottom: 20,
            left: 15
        },
            width = 800 - margin.left - margin.right,
            height = 50 - margin.top - margin.bottom;

        var already = document.getElementById(`nl-field-${x}`).getElementsByTagName("svg")[0];
        if (already) {
            already.remove();
        }

        const svg = d3
            .select(`#nl-field-${x}`)
            .append("svg");

        // console.log(svg);

        svg
            .attr("class", "nl-svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const data = [];
        for (let i = -range; i <= range; i++) {
            data.push(i);
        }
        const xScale = d3.scaleLinear();
        const dataMinX = d3.min(data, (d) => d);
        const dataMaxX = d3.max(data, (d) => d);
        xScale.domain([dataMinX, dataMaxX]).range([margin.left, width]);

        const xAxis = d3.axisBottom(xScale).tickValues(data);
        svg
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .style("font-size", 16)
            .call(xAxis);

        function addCircle(x, y, dark, color = "#3469a5") {
            svg
                .append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("fill", dark ? "none" : color)
                .attr("stroke", dark ? color : "none")
                .attr("r", 5);
        }

        var start = 0;
        var clicked = false;
        var dragged = false;
        var line = null;
        svg
            .on("mousedown", function (evt) {
                console.log(evt);
                activeField = x;

                evt.preventDefault();
                start = evt.offsetX;
                clicked = true;
                dragged = false;

                if (margin.left <= start && start <= width && evt.button === 0) {
                    addCircle(start, margin.top, evt.ctrlKey);
                }

                line = svg
                    .append("line")
                    .attr("x1", start)
                    .attr("y1", margin.top)
                    .attr("x2", start)
                    .attr("y2", margin.top)
                    .style("stroke", "#3469a5")
                    .style("stroke-width", 4);
            });

        svg
            .on("mouseup", function (evt) {
                if (dragged && evt.offsetX >= 20 && evt.offsetX <= 800 && evt.button === 0) {
                    addCircle(evt.offsetX, margin.top, evt.ctrlKey);
                }
                clicked = false;
            });

        svg
            .on("mousemove", function (evt) {
                evt.preventDefault();
                if (clicked && evt.button === 0) {
                    line.attr("x2", evt.offsetX);
                }
                dragged = true;
            });

        svg
            .on("dblclick", function (evt) {
                addCircle(evt.offsetX, margin.top);
            });
        
        svg
            .on("keypress", function() {
                console.log(x);
                // if (evt.ctrlKey && evt.key === 'Delete') {
                //     evt.preventDefault();
                //     removeActiveNumberLineField();
                // }
            });

        document.getElementById(`numberLineRemoveButton${x}`).addEventListener("click", function() {
            removeActiveNumberLineField();
        });

        document.getElementById(`numberLineSaveButton${x}`).addEventListener('click', function () {
            var svg = document.querySelector('svg');
            var svgData = new XMLSerializer().serializeToString(svg);

            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");

            var img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                var dataURL = canvas.toDataURL("image/png");

                // Create a temporary link element to download the image
                var link = document.createElement('a');
                link.download = 'svg_image.png';
                link.href = dataURL;
                link.click();
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        });
    }
}

function addNumberLineField() {
    console.log('Adding new number line field');

    var numberLineFieldContainer = document.createElement("div");
    var newNumberLineField = document.createElement("div");

    newNumberLineField.id = `nl-field-${currentFieldCount}`;
    newNumberLineField.classList.add("nl-field");
    newNumberLineField.style.fontSize = `${fontSizeController.value}px`;
    numberLineFieldContainer.classList.add("nl-field-container");
    numberLineFieldContainer.id = `nl-field-container-${currentFieldCount}`;

    var buttonPanel = document.createElement("div");
    buttonPanel.classList.add("nl-button-panel");

    var saveBtn = document.createElement("button");
    saveBtn.id = `numberLineSaveButton${currentFieldCount}`;
    saveBtn.innerText = "Save Line";
    buttonPanel.appendChild(saveBtn);

    var removeBtn = document.createElement("button");
    removeBtn.id = `numberLineRemoveButton${currentFieldCount}`;
    removeBtn.innerText = "Remove Line";
    buttonPanel.appendChild(removeBtn);

    var rangeInput = document.createElement("input");
    rangeInput.type = "range";
    rangeInput.id = `numberLineRangeInput${currentFieldCount}`;
    rangeInput.value = "10";
    rangeInput.max = "20";
    rangeInput.min = "1";
    buttonPanel.appendChild(rangeInput);
    newNumberLineField.appendChild(buttonPanel);

    fields[currentFieldCount] = newNumberLineField;

    numberLineFieldContainer.appendChild(newNumberLineField);
    mainBoard.appendChild(numberLineFieldContainer);
    activateNumberLine(currentFieldCount);
    fieldAdded(numberLineFieldContainer);

    currentFieldCount++;
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
    newTextField.addEventListener("click", function (evt) {
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

    editor.on("focus", function (evt) {
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

function activateGraphField(x) {
    activeField = x;

    var board = JXG.JSXGraph.initBoard(`graph-field-${x}`, { boundingbox: [-5, 10, 7, -6], axis: true });

    var fnInput = document.getElementById(`input_fn_${x}`);

    var graph = board.create('functiongraph',
        [function (x) { return eval(fnInput.value); }, -10, 10]
    );

    fnInput.addEventListener("change", (evt) => {
        board.update();
    });

    document.getElementById(`btn_add_point_${x}`).addEventListener("click", (evt) => {
        points.push(board.create('point', [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 3], { size: 4 }));
    });

    board.on()
}

function addGraphField() {
    console.log('Adding new graph field');

    var graphFieldContainer = document.createElement("div");

    var graphContainer = document.createElement("div");
    // Add Point button
    var btnAddPoint = document.createElement("button");
    btnAddPoint.id = `btn_add_point_${currentFieldCount}`;
    btnAddPoint.innerText = "Add Point";
    graphContainer.appendChild(btnAddPoint);
    // Function String
    var fnInput = document.createElement("input");
    fnInput.id = `input_fn_${currentFieldCount}`;
    fnInput.value = "0.5 * x * x - 2 * x";
    graphContainer.appendChild(fnInput);

    var newGraphField = document.createElement("div");
    newGraphField.id = `graph-field-${currentFieldCount}`;
    newGraphField.classList.add("graph-field");
    newGraphField.classList.add("jxgbox");
    graphFieldContainer.classList.add("graph-field-container");
    graphFieldContainer.id = `graph-field-container-${currentFieldCount}`;

    fields[currentFieldCount] = newGraphField;
    graphContainer.appendChild(newGraphField);
    graphFieldContainer.appendChild(graphContainer);
    mainBoard.appendChild(graphFieldContainer);
    activateGraphField(currentFieldCount);
    fieldAdded(graphFieldContainer);

    currentFieldCount++;
}

function addTableField() {
    console.log('Adding new table field');

    var tableFieldContainer = document.createElement("div");
    var tableButtonContainer = document.createElement("div");
    tableButtonContainer.classList.add("table-table-button-container");

    var buttonContainer = document.createElement("div");
    buttonContainer.classList.add("table-button-container");
    // Add Column button
    var btnAddCol = document.createElement("button");
    btnAddCol.id = `btn_add_col_${currentFieldCount}`;
    btnAddCol.innerText = "Add Column";
    btnAddCol.addEventListener("click", () => {
        addColumn();
    });
    // Add Row button
    var btnAddRow = document.createElement("button");
    btnAddRow.id = `btn_add_row_${currentFieldCount}`;
    btnAddRow.innerText = "Add Row";
    btnAddRow.addEventListener("click", () => {
        addRow();
    });
    // Delete Row button
    var btnDeleteRow = document.createElement("button");
    btnDeleteRow.id = `btn_delete_row_${currentFieldCount}`;
    btnDeleteRow.innerText = "Delete Row";
    btnDeleteRow.addEventListener("click", () => {
        deleteRow();
    });
    // Delete Column button
    var btnDeleteCol = document.createElement("button");
    btnDeleteCol.id = `btn_delete_col_${currentFieldCount}`;
    btnDeleteCol.innerText = "Delete Column";
    btnDeleteCol.addEventListener("click", () => {
        deleteColumn();
    });

    buttonContainer.appendChild(btnAddCol);
    buttonContainer.appendChild(btnAddRow);
    buttonContainer.appendChild(btnDeleteRow);
    buttonContainer.appendChild(btnDeleteCol);

    var tableContainer = document.createElement("div");
    tableContainer.classList.add("table-table-container");
    var table = addTable();
    console.log(table);
    tableContainer.appendChild(table);

    fields[currentFieldCount] = table;
    tableButtonContainer.appendChild(buttonContainer);
    tableButtonContainer.appendChild(tableContainer);
    tableFieldContainer.appendChild(tableButtonContainer);
    mainBoard.appendChild(tableFieldContainer);
    fieldAdded(tableFieldContainer);

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

function removeActiveNumberLineField(id = -1) {
    if (id == -1) {
        id = activeField;
    }

    console.log(`Removing number line field ${id}`);

    fields.delete(id);

    var item = document.getElementById(`nl-field-${id}`);
    if (item) {
        item.remove();
    }
    var container = document.getElementById(`nl-field-container-${id}`);
    fieldRemoved(container);
    if (container) {
        container.remove();
    }
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

    $(".draggable-element").arrangeable({ dragSelector: '.drag-area' });
}

function fieldAdded(container) {
    var draggable = document.createElement("div");
    draggable.classList.add("drag-area");
    container.classList.add("draggable-element");
    container.appendChild(draggable);
    // container.insertBefore(draggable, container.firstChild);
    $(".draggable-element").arrangeable({ dragSelector: '.drag-area' });
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
    latexControl.addEventListener("change", function (evt) {
        if (latexControl.checked) {
            document.getElementById("latex").style.display = 'block';
        } else {
            document.getElementById("latex").style.display = 'none';
        }
    });

    document.addEventListener("mousemove", function (evt) {
        mouseX = evt.clientX;
        mouseY = evt.clientY;
    });

    var hour = 0, minute = 0, second = 0, delta = 1;
    var elapsedTime = document.getElementById("elapsed-time");
    setInterval(() => {
        elapsedTime.innerText = `${hour}:${minute}:${second}`;
        second += delta;
        if (second === 60) {
            minute++;
            second = 0;
        }
        if (minute === 60) {
            hour++;
            minute = 0;
        }
    }, 1000);

    elapsedTime.addEventListener("click", () => {
        if (delta === 1) {
            delta = 0;
            elapsedTime.style.color = "darkgrey";
        } else {
            delta = 1;
            elapsedTime.style.color = "white";
        }
    });
}

initialize();
