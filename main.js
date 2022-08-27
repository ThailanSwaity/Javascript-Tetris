const playfield1 = new PlayField("playfield", 350, 700);

playfield1.spawn();

function render() {
  playfield1.update();
  playfield1.draw();

  window.requestAnimationFrame(render);
}

render();
