const menuBackground = document.getElementById("menu-background");
var width = document.body.clientWidth;
var height = document.body.clientHeight;

const ctx = menuBackground.getContext("2d");
ctx.canvas.width = width;
ctx.canvas.height = height;

var tetriminoes = [];
const bag = new Bag();
var BLOCKSIZE = 80;

const PIECE_SPAWN_TIMER = 30;
var pieceSpawnCounter = 0;
const DROP_SPEED_TIMER = 0;
var dropSpeedCounter = 0;

function remove(element) {
	const index = tetriminoes.indexOf(5);
	if (index > -1) tetriminoes.splice(index, 1);
}

function spawnPiece() {
	let x = Math.floor(Math.random() * (width / BLOCKSIZE));
	let y = -10;
	let preview = bag.next();
	tetriminoes.push(new Tetrimino(x, y, preview, 0, TETR_CLRS[preview]));
}

function spawnPieces() {
	pieceSpawnCounter--;
	if (pieceSpawnCounter <= 0) {
		pieceSpawnCounter = PIECE_SPAWN_TIMER;
		spawnPiece();
	}
}

function drawTetrimino(tetrimino) {
	var tet = tetrimino.getLocations();
	for (var i = 0; i < tet.length; i++) {
		ctx.fillStyle = tetrimino.colour;
		ctx.fillRect(tet[i][0] * BLOCKSIZE, tet[i][1] * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE)

		ctx.beginPath();
		ctx.rect(tet[i][0] * BLOCKSIZE, tet[i][1] * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE)
		ctx.stroke();
	}
}

function update() {

	// Adjusts the dimensions of the canvas each frame update.
	width = document.body.clientWidth;
	height = document.body.clientHeight;
	ctx.canvas.width = width;
	ctx.canvas.height = height;
	BLOCKSIZE = width / 25;

	ctx.fillStyle = DEFAULT_BGCL;
	ctx.fillRect(0, 0, document.body.clientWidth, document.body.clientHeight);

	spawnPieces();
	dropSpeedCounter--;

	for (var i = 0; i < tetriminoes.length; i++) {

		// Randomly rotates the current piece
		if (tetriminoes[i].type != TETR_O) {
			var rand = Math.floor(Math.random() * 1000);
			if (rand == 1) tetriminoes[i].cRotate();
			else if (rand == 2) tetriminoes[i].ccRotate();
		}

		// Lowers the piece slowly every DROP_SPEED_TIMER ticks
		if (dropSpeedCounter <= 0) {
			dropSpeedCounter = DROP_SPEED_TIMER;
			tetriminoes[i].y += 0.1;
		}

		// Deletes the Tetriminoes that drop beneath the screen
		if (tetriminoes[i].y > (height / BLOCKSIZE) + 2 * BLOCKSIZE) {
			tetriminoes.splice(i, 1);
			continue;
		}
		drawTetrimino(tetriminoes[i]);
	}

	window.requestAnimationFrame(update);
}

update();