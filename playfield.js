const ARR_TETR_T = [[-1, 0], [0, 0], [1, 0], [0, -1]];
const ARR_TETR_L = [[-1, 0], [0, 0], [1, 0], [1, -1]];
const ARR_TETR_BL = [[-1, 0], [0, 0], [1, 0], [-1, -1]];
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

class Bag {
  constructor() {
    this.bag = [];
    this.bagsize = 7;
    this.generate();
  }

  inBag(num) {
    for (var i = 0; i < this.bag.length; i++) {
      if (this.bag[i] == num) return true;
    }
    return false;
  }

  next() {
    let n = this.bag.pop();
    if (this.bag.length == 0) this.generate();
    return n;
  }

  preview() {
    return this.bag[this.bag.length - 1];
  }

  generate() {
    for (var i = 0; i < this.bagsize; i++) {
      var randNum;
      do {
        randNum = Math.floor(Math.random() * NUM_TETRIMINOS);
      } while (this.inBag(randNum));
      this.bag.push(randNum);
    }
  }
}

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

  getGhost() {
    var ghost = new Tetrimino(this.x, this.y, this.type, this.rotation, this.colour);
    ghost.blocks = this.blocks;
    return ghost;
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
  constructor(id, width, height) {
    this.id = id;

    // Controls game speed
    this.dropSpeed = 90;
    this.dropSpeedCounter = 0;

    // Controls the speed of registered key events
    this.keySpeed = 50;

    // Time given to move a piece when it is on top of another
    this.dropTime = 2;
    this.dropTimeCounter = 0;

    this.init(width, height);

    this.btnPressed = [];
    this.btnPressTimer = [];
    this.btnCooldown = 8;

    // A "bag" of 7 uniqte tetriminoes 
    this.bag = new Bag();
    this.ghost = {};

    this.held;

    this.pf.addEventListener('keyup', (event) => {
      this.btnPressed[event.code] = false;
    });

    this.pf.addEventListener('keydown', (event) => {
      this.btnPressed[event.code] = true;
    });
  }

  init(width, height) {
    // Create the game interface
    this.createGameEnvironment(width, height);

    this.blocks = [];
    this.cntrlPiece = {};
    this.width = 10;
    this.height = 20;
    for (var i = 0; i < this.width * this.height; i++) {
      this.blocks[i] = DEFAULT_BGCL;
    }
    this.ctx = this.pf.getContext("2d");
    this.ctx2 = this.pw.getContext("2d");
    this.blkWidth = this.pf.width / this.width;
    this.blkHeight = this.pf.height / this.height;
  } 

  /*
    Creates and adds the game's DOM elements to the element with the "game-board" id
  */
  createGameEnvironment(width, height) {
    this.UIWindow = document.createElement("div");
    this.UIWindow.className = "play-window";

    // Configuring the info for the game canvas
    this.pf = document.createElement("canvas");
    this.pf.style.width = width + "px";
    this.pf.style.height = height + "px";
    this.pf.width = width;
    this.pf.height = height;
    this.pf.tabIndex = -1;
    this.pf.className = "play-field";

    // Configuring the tetrimino preview window
    this.pw = document.createElement("canvas");
    var pwSize = width / 2;
    this.pw.style.width = pwSize + "px";
    this.pw.style.height = pwSize + "px";
    this.pw.width = pwSize;
    this.pw.height = pwSize;
    this.pw.className = "preview-window";

    this.UIWindow.appendChild(this.pf);
    this.UIWindow.appendChild(this.pw);

    const gameBoardWindow = document.getElementById("game-boards");
    gameBoardWindow.appendChild(this.UIWindow);
  }

  spawn() {
    let next = this.bag.next();
    const preview = this.bag.preview();
    this.preview = new Tetrimino(0, 0, preview, 0, TETR_CLRS[preview]);
    console.log(this.preview);
    var tetrimino = new Tetrimino(5, 1, next, 0, TETR_CLRS[next]);
    this.ghost = tetrimino.getGhost();
    this.cntrlPiece = tetrimino;
  }

  placeGhost() {
    this.ghost.x = this.cntrlPiece.x;
    this.ghost.y = this.cntrlPiece.y;
    var tet = this.ghost.getLocations();
    var hitBlock = false;
    do {
      for (var i = 0; i < tet.length; i++) {
        if (tet[i][1] < 0) continue;
        if (this.isBlock(tet[i][0], tet[i][1] + 1)) hitBlock = true;
      }
      if (!hitBlock) this.ghost.y++;
      tet = this.ghost.getLocations();
    } while (!hitBlock);
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

  handleKeys() {
    var travelDir = -1;
    var rot = -1;

    if (this.registerKey("KeyA", 10)) {
      this.cntrlPiece.x--;
      travelDir = 0;
    } else if (this.registerKey("KeyD", 10)) {
      this.cntrlPiece.x++;
      travelDir = 2;
    } else if (this.registerKey("KeyS")) {
      this.cntrlPiece.y++;
      this.adjustCntrlPiece();
      this.checkPlacement();
      return;
    } else if (this.registerKey("Period", 25) && this.cntrlPiece.type != TETR_O) {
      this.cntrlPiece.ccRotate();
      rot = 0;
    } else if (this.registerKey("Comma", 25) && this.cntrlPiece.type != TETR_O) {
      this.cntrlPiece.cRotate();
      rot = 0;
    } else if (this.registerKey("Space", 55)) {
      this.cntrlPiece.y = this.ghost.y;
      this.placePiece();
    }

    this.adjustCntrlPiece(travelDir, rot);
    this.placeGhost();
  }

  registerKey(key, cooldown) {
    if (!cooldown) cooldown = this.btnCooldown;

    if (this.btnPressed[key]) {
      if (this.btnPressTimer[key] % cooldown == 0) {
        this.btnPressTimer[key]++;
        return true;
      }
      this.btnPressTimer[key]++;
    } else {
      this.btnPressTimer[key] = 0;
    }
    return false;
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
    console.log(this.bag.bag);
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
        if (this.dropTimeCounter >= this.dropTime) {
          this.placePiece();
          this.dropTimeCounter = 0;
        } else if (travelDir == 3) {
          this.dropTimeCounter += 0.5;
        }
        else this.dropTimeCounter++;
        return;
      }
    }
  }

  update() {
    this.dropSpeedCounter++;
    this.handleKeys();
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

      if (this.isBlock(x, y)) {
        this.ctx.beginPath();
        this.ctx.rect(x * this.blkWidth, y * this.blkHeight, this.blkWidth, this.blkHeight);
        this.ctx.stroke();
      }
    }
    
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.pf.width, this.pf.height);
    this.ctx.stroke();
  
    if ('blocks' in this.cntrlPiece) {

      var tet = this.ghost.getLocations();
      for (var i = 0; i < tet.length; i++) {
        this.ctx.fillStyle = "#F8F8F8";
        this.ctx.fillRect(tet[i][0] * this.blkWidth, tet[i][1] * this.blkHeight, this.blkWidth, this.blkHeight);
      }

      // draw the ghost piece
      for (var i = 0; i < tet.length; i++) {
        this.ctx.beginPath();
        this.ctx.rect(tet[i][0] * this.blkWidth, tet[i][1] * this.blkHeight, this.blkWidth, this.blkHeight);
        this.ctx.stroke();
      }

      tet = this.cntrlPiece.getLocations();
      for (var i = 0; i < tet.length; i++) {
        this.ctx.fillStyle = this.cntrlPiece.colour;
        this.ctx.fillRect(tet[i][0] * this.blkWidth, tet[i][1] * this.blkHeight, this.blkWidth, this.blkHeight);
      }   

      for (var i = 0; i < tet.length; i++) {
        this.ctx.beginPath();
        this.ctx.rect(tet[i][0] * this.blkWidth, tet[i][1] * this.blkHeight, this.blkWidth, this.blkHeight);
        this.ctx.stroke();
      }   

      this.ctx2.fillStyle = "#F0F0F0";
      this.ctx2.fillRect(0, 0, this.pw.width, this.pw.height);

      tet = this.preview.getLocations();
      for (var i = 0; i < tet.length; i++) {
        this.ctx2.fillStyle = TETR_CLRS[this.preview.type];
        this.ctx2.fillRect(tet[i][0] * this.blkWidth + (this.pw.width / 2) - (this.blkWidth / 2), tet[i][1] * this.blkHeight + (this.pw.height / 2) - this.blkHeight, this.blkWidth, this.blkHeight);
        this.ctx2.beginPath();
        this.ctx2.rect(tet[i][0] * this.blkWidth + (this.pw.width / 2) - (this.blkWidth / 2), tet[i][1] * this.blkHeight + (this.pw.height / 2) - this.blkHeight, this.blkWidth, this.blkHeight);
        this.ctx2.stroke();
      }

      this.ctx2.beginPath();
      this.ctx2.rect(0, 0, this.pw.width, this.pw.height);
      this.ctx2.stroke();
    }

  }

}
