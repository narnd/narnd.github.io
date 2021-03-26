const newButton = document.querySelector("#newMaze");
const rndButton = document.querySelector("#newRnd");
const delButton = document.querySelector("#delMaze");
const dlButton = document.querySelector("#dCanvas");
const xButton = document.querySelector("#startX");
const yButton = document.querySelector("#startY");

newButton.addEventListener('click', createMaze);
rndButton.addEventListener('click', createRnd);
delButton.addEventListener('click', deleteMaze);
dlButton.addEventListener('click', dlCanvas, false);

const mazeClass = document.querySelector(".mazes");

var mazes = [];
var createdMazes = 0;

function createMaze() {
  const width   = parseInt(document.querySelector("#widthIn").value);
  const heigth  = parseInt(document.querySelector("#heigthIn").value);
  const cell    = parseInt(document.querySelector("#cellIn").value);
  const wall    = parseInt(document.querySelector("#wallIn").value);
  const x       = parseInt(document.querySelector("#startX").value);
  const y       = parseInt(document.querySelector("#startY").value);

  mazes.push(new Maze(width, heigth, cell, wall, x, y));
  
  // first created maze triggers animation
  if (!createdMazes)
    animate(step);

  createdMazes++;
};
function createRnd() {
  const width   = Math.floor(Math.random() * 20 + 9);
  const heigth  = Math.floor(Math.random() * 20 + 9);
  const cell    = Math.floor(Math.random() * 10 + 2);
  const wall    = Math.floor(Math.random() * 5  + 2);
  const x       = Math.floor(Math.random() * width);
  const y       = Math.floor(Math.random() * heigth);

  mazes.push(new Maze(width, heigth, cell, wall, x, y));

  // first created maze triggers animation
  if (!createdMazes)
    animate(step);

  createdMazes++;
};

function deleteMaze() {
  mazes[mazes.length-1].canvas.parentNode.removeChild(mazes[mazes.length-1].canvas);
  mazes[mazes.length-1].li.parentNode.removeChild(mazes[mazes.length-1].li);
  mazes.pop();
}

function dlCanvas() {
  var dt = mazes[mazes.length - 1].canvas.toDataURL('image/png');
  this.href = dt;
}

var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

function step() {
  for (let maze of mazes) {
    maze.update();
    maze.render();
  }
  animate(step);
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
class Maze {
  constructor(width = 50, height = 50, cellSize = 5, wallSize = 3, startX = 5, startY = 5) {
    //alert(height); alert(width); alert(cellSize); alert(wallSize);
    //alert(startX); alert(startY);
    this.canvas = document.createElement("canvas");
    this.canvas.width = width * (cellSize + wallSize) + wallSize;
    this.canvas.height = height * (cellSize + wallSize) + wallSize;
    this.context = this.canvas.getContext("2d");
    this.id = createdMazes + 1;
    this.li = document.createElement("li");
    this.li.appendChild(this.canvas);
    mazeClass.appendChild(this.li);
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.cellSize = cellSize;
    this.wallSize = wallSize;
    this.cells = [];
    for (var x = 0; x < width; x++) {
      this.cells[x] = []; // create nested array
    }
    this.cells[startX][startY] = Maze.pathFlags.visited;
    this.visitedCells = 1;
    this.stack = [];
    this.stack.push(new Cell(startX, startY));
    this.oldPathLength = 0;
    this.newPathLength = 0;
    this.longestPath = new Cell(startX, startY);
  }
  update() {
    if (this.visitedCells < this.size) {
      var neighbours = [];
      var x = this.stack[this.stack.length - 1].x;
      var y = this.stack[this.stack.length - 1].y;
      // north
      if (y > 0)
        if (!(this.cells[x][y - 1] & Maze.pathFlags.visited))
          neighbours.push(0);
      // east
      if (x < this.width - 1)
        if (!(this.cells[x + 1][y] & Maze.pathFlags.visited))
          neighbours.push(1);
      // south
      if (y < this.height - 1)
        if (!(this.cells[x][y + 1] & Maze.pathFlags.visited))
          neighbours.push(2);
      // west
      if (x > 0)
        if (!(this.cells[x - 1][y] & Maze.pathFlags.visited))
          neighbours.push(3);
      if (neighbours.length > 0) {
        switch (neighbours[Math.floor(Math.random() * neighbours.length)]) {
          case 0: // north
            this.cells[x][y - 1] |= Maze.pathFlags.visited | Maze.pathFlags.south;
            this.cells[x][y] |= Maze.pathFlags.north;
            this.stack.push(new Cell(x, y - 1));
            break;
          case 1: // east
            this.cells[x + 1][y] |= Maze.pathFlags.visited | Maze.pathFlags.west;
            this.cells[x][y] |= Maze.pathFlags.east;
            this.stack.push(new Cell(x + 1, y));
            break;
          case 2: // south
            this.cells[x][y + 1] |= Maze.pathFlags.visited | Maze.pathFlags.north;
            this.cells[x][y] |= Maze.pathFlags.south;
            this.stack.push(new Cell(x, y + 1));
            break;
          case 3: // west
            this.cells[x - 1][y] |= Maze.pathFlags.visited | Maze.pathFlags.east;
            this.cells[x][y] |= Maze.pathFlags.west;
            this.stack.push(new Cell(x - 1, y));
            break;
        }
        this.visitedCells++;
        this.newPathLength++;
      }
      else {
        if (this.newPathLength > this.oldPathLength) {
          this.longestPath = this.stack[this.stack.length - 1];
          this.oldPathLength = this.newPathLength;
        }
        this.newPathLength--;
        this.stack.pop();
      }
    }
  }
  render() {
    // clear screen
    this.context.fillStyle = "#222222";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // draw
    this.context.fillStyle = "#FAFAFA";
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        if (this.cells[x][y] & Maze.pathFlags.visited) {
          this.context.fillRect(x * (this.cellSize + this.wallSize) + this.wallSize, y * (this.cellSize + this.wallSize) + this.wallSize, this.cellSize, this.cellSize);
        }
        if (this.cells[x][y] & Maze.pathFlags.north) {
          this.context.fillRect(x * (this.cellSize + this.wallSize) + this.wallSize, y * (this.cellSize + this.wallSize), this.cellSize, this.wallSize);
        }
        if (this.cells[x][y] & Maze.pathFlags.west) {
          this.context.fillRect(x * (this.cellSize + this.wallSize), y * (this.cellSize + this.wallSize) + this.wallSize, this.wallSize, this.cellSize);
        }
      }
    }
    var x = this.stack[this.stack.length - 1].x;
    var y = this.stack[this.stack.length - 1].y;
    this.context.fillStyle = "#0000FF";
    this.context.fillRect(x * (this.cellSize + this.wallSize) + this.wallSize, y * (this.cellSize + this.wallSize) + this.wallSize, this.cellSize, this.cellSize);
    x = this.stack[0].x;
    y = this.stack[0].y;
    this.context.fillStyle = "#00FF00";
    this.context.fillRect(x * (this.cellSize + this.wallSize) + this.wallSize, y * (this.cellSize + this.wallSize) + this.wallSize, this.cellSize, this.cellSize);
    x = this.longestPath.x;
    y = this.longestPath.y;
    this.context.fillStyle = "#FF0000";
    this.context.fillRect(x * (this.cellSize + this.wallSize) + this.wallSize, y * (this.cellSize + this.wallSize) + this.wallSize, this.cellSize, this.cellSize);
  }
}
Maze.pathFlags = {
  north:    1 << 0,
  east:     1 << 1,
  south:    1 << 2,
  west:     1 << 3,
  visited:  1 << 4,
}
