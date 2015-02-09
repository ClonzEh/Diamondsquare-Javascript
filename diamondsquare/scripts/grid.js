//@param = gridObject{ x, y, rows, cols, width, height, spacingX, spacingY }, gridSpot{ x, y, width, height }, func : function(shape) { }
//returns grid[][]
function createGrid(rows, cols, func) {

    var newGrid = new Array(rows); //create rows

    for (var i = 0; i < newGrid.length; i++) { newGrid[i] = new Array(cols); } //create columns

    for (var i = 0, x = 0, y = 0; i < rows * cols; i++) {

        newGrid[x][y] = func(x, y);
        x++;
        if (x == rows) { x = 0; y++;}
    }
    return newGrid;
}