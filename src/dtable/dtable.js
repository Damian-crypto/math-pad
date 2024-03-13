var tableId = 0;
var activeTable = -1;
var activeCell = null;
const tableData = [];

function createCell(id, i, j, rows) {
	var input = document.createElement("input");
	input.classList.add("tbl_input");
	input.id = `cell_${id}_${rows * i + j}`;
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
	var table = document.createElement("table");
	table.classList.add("d_table");
	table.id = `table_${id}`;
	for (let i = 0; i < rows; i++) {
		var row = document.createElement("tr");
		row.id = `row_${id}_${i}`;
		for (let j = 0; j < cols; j++) {
			var col = document.createElement("td");
			col.id = `col_${id}_${i}`;
			var input = createCell(id, i, j, rows);
			col.appendChild(input);
			row.appendChild(col);
		}
		table.appendChild(row);
	}

	table.addEventListener("click", () => {
		activeTable = id;
	});

	tableData[id] = [ rows, cols ];
	activeTable = id;

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
			col.id = `col_${activeTable}_${cols + i}`;
			var input = createCell(activeTable, i, cols + 1, rows);
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
		row.id = `row_${activeTable}_${rows + 1}`;

		for (let i = 0; i < cols; i++) {
			var col = document.createElement("td");
			col.id = `col_${activeTable}_${cols + i}`;
			var input = createCell(activeTable, rows + 1, i, rows);
			col.appendChild(input);

			row.appendChild(col);
		}

		var table = document.getElementById(`table_${activeTable}`);
		table.appendChild(row);
		tableData[activeTable] = [rows + 1, cols];
	}
}

function adjustWidth() {
	if (activeCell) {
		console.log(activeCell);
		var cell = document.getElementById(activeCell);
		cell.style.width = Math.max(2, cell.value.length) + "ch";
	}
}
