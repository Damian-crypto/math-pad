var tableId = 0;
var activeTable = -1;
var activeCell = null;
const tableData = [];

function createCell(id, i, j, rows) {
	var input = document.createElement("input");
	input.classList.add("tbl_input");
	input.id = `cell_${id}_${rows * i + j}`;

	// Event handling of this cell
	input.addEventListener("input", () => {
		activeCell = `cell_${id}_${rows * i + j}`;
		adjustWidth();
	});
	input.addEventListener("click", () => {
		activeCell = `cell_${id}_${rows * i + j}`;
	});

	return input;
}

function createTable(id, rows = 3, cols = 5) {
	var body = document.getElementsByTagName("body");
	var table = document.createElement("table");
	table.classList.add("d_table");
	table.id = `table_${id}`;
	body[0].appendChild(table);

	table.addEventListener("click", () => {
		activeTable = id;
	});

	activeTable = id;
	tableData[id] = [ 0, 0 ];

	for (let i = 0; i < rows; i++) {
		addRow();
	}
	// This is because at the time there are 0 columns (adding rows won't add columns)
	for (let i = 0; i < cols; i++) {
		addColumn();
	}

	return table;
}

function addTable() {
	return createTable(tableId++);
}

function addColumn() {
	if (activeTable !== -1) {
		var [ rows, cols ] = tableData[activeTable];

		for (let i = 0; i < rows; i++) {
			var col = document.createElement("td");
			col.id = `col_${activeTable}_${cols + 1}`;
			var input = createCell(activeTable, i, cols, rows);
			col.appendChild(input);

			var row = document.getElementById(`row_${activeTable}_${i}`);
			row.appendChild(col);
		}

		tableData[activeTable] = [rows, cols + 1];
	}
}

function addRow() {
	if (activeTable !== -1) {
		var [ rows, cols ] = tableData[activeTable];
		var row = document.createElement("tr");
		row.id = `row_${activeTable}_${rows}`;

		for (let i = 1; i <= cols; i++) {
			var col = document.createElement("td");
			col.id = `col_${activeTable}_${i}`;
			var input = createCell(activeTable, rows, i, rows);
			col.appendChild(input);

			row.appendChild(col);
		}

		var table = document.getElementById(`table_${activeTable}`);
		table.appendChild(row);
		tableData[activeTable] = [rows + 1, cols];
	}
}

function deleteRow() {
	if (activeTable !== -1) {
		var [ rows, cols ] = tableData[activeTable];
		var row = document.getElementById(`row_${activeTable}_${rows - 1}`)

		row.remove();

		tableData[activeTable] = [rows - 1, cols];
	}
}

function deleteColumn() {
	if (activeTable !== -1) {
		var [ rows, cols ] = tableData[activeTable];
		
		for (let i = 0; i < rows; i++) {
			var row = document.getElementById(`row_${activeTable}_${i}`)
			var col = row.querySelector(`#col_${activeTable}_${cols}`);
			col.remove();
		}

		tableData[activeTable] = [rows, cols - 1];
	}
}

function adjustWidth() {
	if (activeCell) {
		console.log(activeCell);
		var cell = document.getElementById(activeCell);
		cell.style.width = Math.max(2, cell.value.length) + "ch";
	}
}
