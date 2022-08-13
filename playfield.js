const ARR_TETR_T = [[-1, 0], [0, 0], [1, 0], [0, 1]];
const ARR_TETR_L = [[-1, 0], [0, 0], [1, 0], [1, -1]];
const ARR_TETR_BL = [[-1, 0], [0, 0], [1, 0], [1, 1]];
const ARR_TETR_O = [[0, 0], [1, 0], [0, 1], [1, 1]];
const ARR_TETR_I = [[-1, 0], [0, 0], [1, 0], [2, 0]];
const ARR_TETR_Z = [[-1, 0], [0, 0], [0, 1], [1, 1]];
const ARR_TETR_BZ = [[1, 0], [0, 0], [0, 1], [-1, 1]];

const TETR_CLRS = ["#800080", "#0000FF", "#FF8000", "#FFFF00", "#00FFFF", "#FF0000", "#00FF00"];

const TETR_T = 0;
const TETR_L = 1;
const TETR_BL = 2;
const TETR_O = 3;
const TETR_I = 4;
const TETR_Z = 5;
const TETR_BZ = 6;

const NUM_TETRIMINOS = 7;

const CCROT = [0, -1, 1, 0];
const CROT = [0, 1, -1, 0];

const DEFAULT_BGCL = "#F0F0F0";

class Tetrimino {
  constructor(x, y, type, rotation, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.rotation = rotation;
    this.type = type;
    this.blocks = [];
    this.init();      
  }

  init() {
    if (this.type == TETR_T) this.loadBlocks(ARR_TETR_T);
    else if (this.type == TETR_L) this.loadBlocks(ARR_TETR_L);
    else if (this.type == TETR_BL) this.loadBlocks(ARR_TETR_BL);
    else if (this.type == TETR_O) this.loadBlocks(ARR_TETR_O);
    else if (this.type == TETR_I) this.loadBlocks(ARR_TETR_I);
    else if (this.type == TETR_Z) this.loadBlocks(ARR_TETR_Z);
    else if (this.type == TETR_BZ) this.loadBlocks(ARR_TETR_BZ); 
  }

  loadBlocks(array) {
    this.blocks = this.copyArrayConst(array);
  }

  copyArrayConst(array) {
    var arr = [];
    for (var i = 0; i < array.length; i++) {
      arr[i] = [...array[i]];
    }
    return arr;
  }

  ccRotate() {
    for (var i = 0; i < this.blocks.length; i++) {
      let x = this.blocks[i][0];
      let y = this.blocks[i][1];
      let xp = CCROT[0] * x + CCROT[1] * y;
      let yp = CCROT[2] * x + CCROT[3] * y;
      this.blocks[i][0] = xp;
      this.blocks[i][1] = yp;  
    }
  }

  cRotate() {
    for (var i = 0; i < this.blocks.length; i++) {
      let x = this.blocks[i][0];
      let y = this.blocks[i][1];
      let xp = CROT[0] * x + CROT[1] * y;
      let yp = CROT[2] * x + CROT[3] * y;
      this.blocks[i][0] = xp;
      this.blocks[i][1] = yp;  
    }
  }

  getLocations() {
    var blocks = [];

    // Deep copy the original arry
    for (var i = 0; i < this.blocks.length; i++) {
      blocks[i] = [
        this.blocks[i][0] // Deep copy from TETR constant 
        + this.x,         // Apply x transform 
        this.blocks[i][1]
        + this.y          // Apply y transformation
      ];
    }
    return blocks;
  }
}

class PlayField {
  constructor(id) {
    this.id = id;
    this.pf = document.getElementById(id);

    // Controls game speed
    this.dropSpeed = 15;
    this.dropSpeedCounter = 0;

    // Controls the speed of registered key events
    this.keySpeed = 50;

    // Time given to move a piece when it is on top of another
    this.dropTime = 15;
    this.dropTimeCounter = 0;

    this.init();
    this.keys = {};

    this.pf.addEventListener('keydown', (event) => {
      this.handleKeys(event.code);
    });
  }

  init() {
    this.blocks = [];
    this.cntrlPiece = {};
    this.width = 10;
    this.height = 20;
    for (var i = 0; i < this.width * this.height; i++) {
      this.blocks[i] = DEFAULT_BGCL;
    }
    this.ctx = this.pf.getContext("2d");
    this.blkWidth = this.pf.width / this.width;
    this.blkHeight = this.pf.height / this.height;
  } 

  spawn() {
    let rand = Math.floor(Math.random() * NUM_TETRIMINOS);

    var tetrimino = new Tetrimino(5, 1, rand, 0, TETR_CLRS[rand]);
    this.cntrlPiece = tetrimino;
  }

  isBlock(x, y) {
    return (this.blocks[this.coordsToInt(x, y)] != DEFAULT_BGCL); 
  }

  adjustCntrlPiece(travelDir, rot) {
    var xCollision;
    var yCollision;
    var tet = this.cntrlPiece.getLocations(); 
    for (var i = 0; i < tet.length; i++) {
      xCollision = 0;
      yCollision = 0;
      let x = tet[i][0];
      let y = tet[i][1];
      let xDif = this.cntrlPiece.x - x;
      let yDif = this.cntrlPiece.y - y;
      if (x < 0) xCollision = -1;
      else if (x > this.width - 1) xCollision = 1;
      if (y < 0) yCollision = -1;
      else if (y > this.height - 1) yCollision = 1;

      if (this.isBlock(x, y)) {
        if (rot >= 0) {
          xCollision = -xDif;
        }
        else if (travelDir == 0) xCollision = -1;
        else if (travelDir == 2) xCollision = 1;  
        else yCollision = 1;
      }
      this.cntrlPiece.x -= xCollision;
      this.cntrlPiece.y -= yCollision;
      tet = this.cntrlPiece.getLocations();
    }

  }

  handleKeys(code) {
    var travelDir = -1;
    var rot = -1;
    if (code == "KeyA") {
      this.cntrlPiece.x--;
      travelDir = 0;
    }
    else if (code == "KeyD") {
      this.cntrlPiece.x++;
      travelDir = 2;
    }
    else if (code == "KeyS") {
      this.cntrlPiece.y++;
      this.adjustCntrlPiece();
      this.checkPlacement(3);
      return;
    }
    else if (code == "Period" && this.cntrlPiece.type != TETR_O) {
      this.cntrlPiece.ccRotate();
      rot = 0;
    }
    else if (code == "Comma" && this.cntrlPiece.type != TETR_O) {
      this.cntrlPiece.cRotate();
      rot = 1;
    }

    this.adjustCntrlPiece(travelDir, rot);
  }

  /*
    Loops through each y index to check if the line at y needs to be cleared.
    Returns an array of indexes for lines that need to be cleared.
  */
  getLinesToClear() {
    var linesToClear = [];
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        if (!this.isBlock(x, y)) break;
        if (x == this.width - 1) linesToClear.push(y);
      }
    }
    return linesToClear;
  }

  clearLines() {
    var linesToClear = this.getLinesToClear();
    if (linesToClear.length < 1) return;

    for (var i = 0; i < linesToClear.length; i++) {
      this.clearLine(linesToClear[i]);
    }
  }

  clearLine(y) {
    if (!Number.isInteger(y) || y < 0 || y > this.height - 1) return;
    for (var yp = y; yp > 0; yp--) {
      for (var x = 0; x < this.width; x++) {
        this.blocks[this.coordsToInt(x, yp)] = this.blocks[this.coordsToInt(x, yp - 1)];
      }
    } 
  }

  placePiece() {
    var tet = this.cntrlPiece.getLocations();
    var colour = this.cntrlPiece.colour;
    for (var i = 0; i < tet.length; i++) {
      let j = tet[i][1] * this.width + tet[i][0];
      this.blocks[j] = colour;
    }
    this.spawn();
    this.clearLines();
  }

  intToCoords(i) {
    var coords = [];
    coords[0] = i % this.width;
    coords[1] = Math.floor(i / this.width);
    return coords;
  }

  coordsToInt(x, y) {
    return y * this.width + x;
  }

  checkPlacement(travelDir) {
    var tet = this.cntrlPiece.getLocations();
    for (var i = 0; i < tet.length; i++) {
      let x = tet[i][0];
      let y = tet[i][1];
      if (tet[i][1] == this.height - 1 || this.isBlock(x, y + 1)) {
        if (this.dropTimeCounter >= this.dropTime || travelDir == 3) {
          this.placePiece();
          this.dropTimeCounter = 0;
        }
        else this.dropTimeCounter++;
        return;
      }
    }
  }

  update() {
    this.dropSpeedCounter++;
    if (this.dropSpeedCounter >= this.dropSpeed) {
      if ('blocks' in this.cntrlPiece) {
        this.cntrlPiece.y++;
        this.adjustCntrlPiece();
        this.checkPlacement();
      } else {
        this.spawn();
      }
      this.dropSpeedCounter = 0;
    }
  }

  draw() {
    for (var i = 0; i < this.width * this.height; i++) {
      var x = i % this.width;
      var y = Math.floor(i/this.width);

      // Draw the grid block colours
      this.ctx.fillStyle = this.blocks[i];
      this.ctx.fillRect(x * this.blkWidth, y * this.blkHeight, this.blkWidth, this.blkHeight);
    }
    
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.pf.width, this.pf.height);
    this.ctx.stroke();
  
    if ('blocks' in this.cntrlPiece) {
      var tet = this.cntrlPiece.getLocations();
      for (var i = 0; i < tet.length; i++) {
        this.ctx.fillStyle = this.cntrlPiece.colour;
        this.ctx.fillRect(tet[i][0] * this.blkWidth, tet[i][1] * this.blkHeight, this.blkWidth, this.blkHeight);
      }   

      for (var i = 0; i < tet.length; i++) {
        this.ctx.beginPath();
        this.ctx.rect(tet[i][0] * this.blkWidth, tet[i][1] * this.blkHeight, this.blkWidth, this.blkHeight);
        this.ctx.stroke();
      }   

    }
 
  }

}
