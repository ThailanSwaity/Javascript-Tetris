const playfield1 = new PlayField("playfield");

playfield1.spawn();

function render() {
  playfield1.draw();
  playfield1.update();

  window.requestAnimationFrame(render);
}

render();
