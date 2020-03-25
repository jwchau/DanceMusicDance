//globals
const songs = {};
let song;

//part 1
let amp;
let playButton;
let jumpButton;
let volumeSlider;

//part 2
let wave;
let freqSlider;
let envelope;
let mic;

//part 3
let fft;
let bandWidth;
let colorSlider;

//part 4
let cols;
let rows;
let current; // = new float[cols][rows];
let previous; // = new float[cols][rows];
let dampening = 0.95;

//init data
const volData = [0];
for (let i = 0; i < 360; i++) {
  volData.push(0);
}
let k = 0;


function preload() {
  for (let i = 1; i <= 5; i++) {
    const song = loadSound(`assets/sounds/sound_${i}.mp3`);
    songs[i] = song;
    songs[i].setVolume(0.125);
  }
  song = songs[Math.floor(Math.random() * 4) + 1];
}

function togglePlaying() {
  if (!song.isPlaying()) {
    song.play();
    playButton.html("paws");
  } else {
    song.pause();
    playButton.html("play");
  }
}

function createControls() {
  playButton = createButton("play");
  playButton.mousePressed(togglePlaying);
  // jumpButton = createButton("jump");
  // jumpButton.mousePressed(jumpSong);
  colorSlider = createSlider(0, 360, 0, 1);
  volumeSlider = createSlider(0, 0.5, 0.25, 0.0125);
  bandWidth = createSlider(2, 64, 16, 2);
  amp = new p5.Amplitude();
}

const jumpSong = (len = song.duration()) => {
  let t = random(len);
  console.log(t);
  song.jump(t);
}



const drawLine = () => {
  const vol = amp.getLevel();
  volData.push(vol);
  stroke(255);
  noFill();

  beginShape();
  for (let i = 0; i < volData.length; i++) {
    const y = map(volData[i], 0, 0.25, height / 2, 0);
    vertex(i + 200, y);
  }
  endShape();
  if (volData.length > width - 400) volData.splice(0, 1);
}

const drawLineFFT = () => {
  const spectrum = fft.analyze();
  const bw = bandWidth.value();
  strokeWeight(10);
  push();
  translate(width / 2, height / 2);
  rotate(-90);
  for (let i = 0; i < spectrum.length; i += bw) {
    const amp = spectrum[i];
    const x = map(i, 0, spectrum.length, -width / 2, width / 2 );
    const y = map(amp, 0, 256, 0, -height / 2);
    const c = map(i, 0, spectrum.length, 0, 255);
    const color = (c + colorSlider.value()) % 255;
    stroke(color, 255, 255);
    point(x, y);
    point(x, -y);
    // drawRipples(x,y);
    // drawRipples(x,-y);
  }
  pop();
}


const createFFT = () => {
  fft = new p5.FFT(0.90, 1024);
}

const drawSpectrum = () => {
  const spectrum = fft.analyze();
  const bw = bandWidth.value();
  noStroke();
  for (let i = 0; i < spectrum.length; i += bw) {
    const amp = spectrum[i];
    const y = map(amp, 0, 256, height, 0);
    const c = map(i, 0, spectrum.length, 0, 360);
    const color = (c + colorSlider.value()) % 360;
    fill(color, 255, 255);
    rect(i, y, bw, height - y);
  }
}

const createRipple = () => {
  cols = width;
  rows = height;
  current = new Array(cols).fill(0).map(n => new Array(rows).fill(0));
  previous = new Array(cols).fill(0).map(n => new Array(rows).fill(0));
}

const renderRipples = () => {
  loadPixels();
  for (let i = 1; i < cols - 1; i++) {
    for (let j = 1; j < rows - 1; j++) {
      current[i][j] =
        (previous[i - 1][j] +
          previous[i + 1][j] +
          previous[i][j - 1] +
          previous[i][j + 1]) /
          2 -
        current[i][j];
      current[i][j] = current[i][j] * dampening;

      let index = (i + j * cols) * 4;
      // pixels[index + 0] = current[i][j];
      pixels[index + 0] = current[i][j];
      pixels[index + 1] = current[i][j];
      pixels[index + 2] = current[i][j];
    }
  }
  updatePixels();

  let temp = previous;
  previous = current;
  current = temp;
}

const drawRipples = (x,y) => {
  previous[x][y] = 1000;
}

function mouseDragged() {
  if (mouseX < width && mouseY < height) {
    previous[mouseX][mouseY] = 1000;
  }
}

function setup() {
  pixelDensity(1);
  createCanvas(800, 800);
  structureMe();
  angleMode(DEGREES);
  colorMode(HSB);
  background(0);
  createControls();
  createFFT();
  createRipple();
}

function draw() {
  song.setVolume(volumeSlider.value());
  background(0);
  renderRipples();
  // drawLine();
  drawLineFFT();
  // drawSpectrum();
}

const structureMe = () => {
  const canvas = document.getElementById('defaultCanvas0');
  const div = document.createElement('div');
  div.classList.add('sketch');
  div.appendChild(canvas);
  document.body.appendChild(div);
}

