//globals
const songs = {};
let song;
let theta = 0;
let omega = 1;

//controls
let playButton;
let volumeSlider;
let freqSlider;
let bandWidth;
let colorSlider;
let bandSlider;
let rotateSlider;
let rotateCheckbox;

//music analysis
let amp;
let fft;

//ripple
let cols;
let rows;
let current; // = new float[cols][rows];
let previous; // = new float[cols][rows];
let dampening = 0.99;

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

const createListeners = () => {
  const progressBar = document.getElementById('progress-bar');
  progressBar.addEventListener("mousedown", function(e) {
    let clickedPos = e.clientX - e.target.offsetLeft;
    song.jump((clickedPos / e.target.offsetWidth) * song.duration());
  }, false);
}

const createButtons = () => {
  playButton = createButton("play");
  playButton.mousePressed(togglePlaying);
  playButton.addClass('control button');
}

const createSliders = () => {
  volumeSlider = createSlider(0, 0.5, 0.25, 0.0125);
  volumeSlider.addClass('control slider');
  volumeSlider.id('volume-slider');
  colorSlider = createSlider(0, 360, 0, 1);
  colorSlider.addClass('control slider');
  colorSlider.id('color-slider');
  bandSlider = createSlider(0, 3, 0, 1);
  bandSlider.addClass('control slider');
  bandSlider.id('band-slider');
  offsetSlider = createSlider(10, 100, 0, 5);
  offsetSlider.addClass('control slider');
  offsetSlider.id('offset-slider');
  bandWidth = createSlider(2, 64, 16, 2);
  bandWidth.addClass('control slider');
  bandWidth.id('bandWidth-slider');
  rotateSlider = createSlider(0, 360, 0, 1);
  rotateSlider.addClass('control slider');
  rotateSlider.id('rotate-slider');
}

const createCheckboxes = () => {
  rotateCheckbox = createCheckbox('auto-rotate', false);
  barsCheckbox = createCheckbox('Bars', false);
  FFTLineCheckbox = createCheckbox('FFT Line', false);
  pointWaveCheckbox = createCheckbox('Point Wave', false);
}

function createControls() {
  createButtons();
  createCheckboxes();
  createSliders();
  createListeners();
  amp = new p5.Amplitude();
}

const jumpSong = (len = song.duration()) => {
  let t = random(len);
  console.log(t);
  song.jump(t);
}

const drawCircleWave = () => {

}

const drawCircle = () => {
  const vol = amp.getLevel();
  volData.push(vol);
  stroke(255);
  noFill();

  push();
  translate(width / 2, height / 2);
  beginShape();

  for (let i = 0; i < volData.length; i++) {
    const y = map(volData[i], 0, 0.25, height / 2, 0);
    vertex(i + 200, y);
  }

  endShape();
  pop();
  if (volData.length > 360) volData.splice(0, 1);
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

const pointWave = () => {
  const wave = fft.waveform();
  const bw = bandWidth.value();
  noFill();
  strokeWeight(bw);
  push();
  translate(width / 2, height / 2);
  rotate(rotateSlider.value() + theta);
  for (let i = 0; i < wave.length; i++) {
    const y = map(wave[i], -1, 1, -height / 2, height / 2);
    const c = map(i, 0, wave.length, 0, 255);
    const color = (c + colorSlider.value()) % 255;
    stroke(color, 255, 255);
    
    point(i, y);
    point(-i, y);

    const numBands = bandSlider.value();
    const offset = offsetSlider.value();
    for (let j = 0; j < numBands; j++) {
      point(i, j * offset + y);
      point(i, -j * offset + y);
      point(-i, j * offset + y);
      point(-i, -j * offset + y);
    }
  }
  pop();
}


const drawLineFFT = () => {
  const spectrum = fft.analyze();
  const bw = bandWidth.value();
  strokeWeight(bw);
  push();
  translate(width / 2, height / 2);
  rotate(rotateSlider.value() + theta);
  for (let i = 0; i < spectrum.length; i += bw) {
    const amp = spectrum[i];
    const x = map(i, 0, spectrum.length, -width / 2 + 100, 0);
    const y = map(amp, 0, 256, 0, -height / 2);
    const c = map(i, 0, spectrum.length, 0, 255);
    const color = (c + colorSlider.value()) % 255;
    stroke(color, 255, 255);
    point(x, y);
    point(x, -y);
    point(-x, y);
    point(-x, -y);
  }
  pop();
}




const createFFT = () => {
  fft = new p5.FFT(0.90, 512);
}

const bars = () => {
  const spectrum = fft.analyze();
  const bw = bandWidth.value();
  noStroke();
  push();
  translate(width / 2, height / 2);
  rotate(rotateSlider.value() + theta);
  for (let i = 0; i < spectrum.length; i += bw) {
    const amp = spectrum[i];
    const x = map(i, 0, spectrum.length, -width / 2 + 100, 0);
    const y = map(amp, 0, 256, 0, height - 100);
    const c = map(i, 0, spectrum.length, 0, 360);
    const color = (c + colorSlider.value()) % 360;
    fill(color, 255, 255);
    rect(x, 0, bw, y);
    rect(x, 0, bw, -y);
    rect(-x, 0, bw, y);
    rect(-x, 0, bw, -y);
  }
  pop();
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

const cycles = () => {
  if (rotateCheckbox.checked()) theta += omega;
}

const checkAndReset = () => {
  if (theta > 360) theta = 0;
  cycles();
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
  createCanvas(windowWidth - 200, windowHeight - 200);
  createControls();
  angleMode(DEGREES);
  colorMode(HSB);
  background(0);

  createFFT();
  createRipple();
  structureMe();
}

function draw() {
  song.setVolume(volumeSlider.value());
  background(0);
  checkAndReset();
  // renderRipples();
  // drawLine();
  if (FFTLineCheckbox.checked()) drawLineFFT();
  if (barsCheckbox.checked()) bars();
  if (pointWaveCheckbox.checked()) pointWave();
}

const moveSketch = () => {
  const canvas = document.getElementById('defaultCanvas0');
  const div = document.getElementById('sketch');
  div.appendChild(canvas);
}

const moveControls = (parent, children) => {
  //all controls
  const div = document.getElementById(parent);
  const arr = document.getElementsByClassName(children);
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    div.appendChild(a);
  }
}

const structureMe = () => {
  moveSketch();
  moveControls('sliders', 'slider');
  moveControls('buttons', 'button');
  moveControls('checkboxes', 'checkbox');
}

