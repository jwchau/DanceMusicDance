
const sketch = (p5) => {
  let songs = {};
  let song;

  p5.setup = () => {
    p5.createCanvas(500, 500);
    p5.background(0);
    p5.noStroke();
  }

  p5.preload = () => {
    for (let i = 1; i <= 5; i++) {
      const song = p5.loadSound(`sounds/sound_${i}.mp3`);
      songs[i] = song;
      songs[i].setVolume(0.125);
    }
    song = songs[Math.floor(Math.random() * 4) + 1];
  }

  p5.draw = () => {

  }
}

export default sketch;