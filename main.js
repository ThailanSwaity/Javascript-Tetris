const playfield1 = new PlayField("playfield");

playfield1.spawn();

function render() {
  playfield1.update();
  playfield1.draw();

  window.requestAnimationFrame(render);
}

render();
