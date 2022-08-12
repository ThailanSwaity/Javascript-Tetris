const playfield1 = new PlayField("playfield");
const playfield2 = new PlayField("playfield2");

playfield1.spawn();
playfield2.spawn();

function render() {
  playfield1.draw();
  playfield1.update();

  playfield2.draw();
  playfield2.update();

  window.requestAnimationFrame(render);
}

render();
