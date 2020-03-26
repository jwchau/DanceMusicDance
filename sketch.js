//globals
const songs = [];
let song;
let songIdx = Math.floor(Math.random() * 4);
let theta = 0;
let cTheta = 0;
let omega = 1;
let cOmega = 1;

//buttons
let playButton;
let prevButton;
let nextButton;

//sliders
let volumeSlider;
let freqSlider;
let bandWidth;
let colorSlider;
let bandSlider;
let rotateSlider;

//check boxes
let rotateCheckbox;
let cycleColors;

//music analysis
let amp;
let fft;

//init data
const volData = [0];
for (let i = 0; i < 360; i++) {
  volData.push(0);
}
let k = 0;


function preload() {
  for (let i = 0; i < 5; i++) {
    const song = loadSound(`assets/sounds/sound_${i}.mp3`);
    songs.push(song);
    songs[i].setVolume(0.125);
  }
  song = songs[songIdx];
}

const songPush = (k) => () => {
  song.stop();
  songIdx += k;
  if (songIdx === songs.length) songIdx = 0;
  if (songIdx < 0) songIdx = songs.length - 1;
  song = songs[songIdx];
  song.play();
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

const createButtons = () => {
  playButton = createButton("play");
  playButton.mousePressed(togglePlaying);
  playButton.addClass('control button');
  playButton.id('play');

  prevButton = createButton("prev");
  prevButton.mousePressed(songPush(-1));
  prevButton.addClass('control button');
  prevButton.id('prev');

  nextButton = createButton("next");
  nextButton.mousePressed(songPush(1));
  nextButton.addClass('control button');
  nextButton.id('next');
}

const createListeners = () => {
  const progressBar = document.getElementById('progress-bar');
  progressBar.addEventListener("mousedown", function(e) {
    let clickedPos = e.clientX - e.target.offsetLeft;
    song.jump((clickedPos / e.target.offsetWidth) * song.duration());
  }, false);
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
  const div = document.createElement('div');
  div.className = 'checkboxes';
  rotateCheckbox = createCheckbox('auto-rotate', false);
  rotateCheckbox.parent(div);
  cycleColors = createCheckbox('cycle colors', false);
  cycleColors.parent(div);
  barsCheckbox = createCheckbox('Bars', false);
  barsCheckbox.parent(div);
  FFTLineCheckbox = createCheckbox('FFT Line', false);
  FFTLineCheckbox.parent(div);
  pointWaveCheckbox = createCheckbox('Point Wave', false);
  pointWaveCheckbox.parent(div);
  document.body.appendChild(div);
}

function createControls() {
  createButtons();
  createCheckboxes();
  createSliders();
  createListeners();
  amp = new p5.Amplitude();
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
    const r = map(volData[i], 0, 1, 100, height * 0.666);
    const x = r * cos(i);
    const y = r * sin(i);
    vertex(x, y);
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
  for (let i = 0; i < wave.length; i += bw) {
    const y = map(wave[i], -1, 1, -height / 2, height / 2);
    const c = map(i, 0, wave.length, 0, 255);
    const color = colorMe(c, 255);
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
  const offset = offsetSlider.value();
  const mult = 2;
  push();
  translate(width / 2, height / 2);
  rotate(rotateSlider.value() + theta);
  for (let i = 0; i < spectrum.length; i += bw) {
    const amp = spectrum[i];
    const x = map(i, 0, spectrum.length, -width / 2 + 100, 0);
    const y = map(amp, 0, 256, 0, -height / 2);
    const c = map(i, 0, spectrum.length, 0, 255);
    const color = colorMe(c, 255);
    stroke(color, 255, 255);
    point(x + (mult * offset), y);
    point(x + (mult * offset), -y);
    point(-x - (mult * offset), y);
    point(-x - (mult * offset), -y);
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
    const x = map(i, 0, spectrum.length, -width / 2, 0);
    const y = map(amp, 0, 256, 1, height - 100);
    const c = map(i, 0, spectrum.length, 0, 255);
    const color = colorMe(c, 255);
    fill(color, 255, 255);
    rect(x, 0, bw, y);
    rect(x, 0, bw, -y);
    rect(-x, 0, bw, y);
    rect(-x, 0, bw, -y);
  }
  pop();
}

const colorMe = (current, max) => {
  return current + colorSlider.value() + cTheta % max;
}

const cycles = () => {
  if (rotateCheckbox.checked()) theta += omega;
  if (cycleColors.checked()) cTheta += cOmega;
}

const checkAndReset = () => {
  if (theta > 360) theta = 0;
  if (cTheta >= 255) cOmega = -1;
  if (cTheta <= 0) cOmega = 1;
  cycles();
}


function setup() {
  pixelDensity(1);
  createCanvas(windowHeight - 200, windowHeight - 200);
  angleMode(DEGREES);
  colorMode(HSB);
  background(0);
  
  createControls();
  createFFT();
  structureMe();
}

function draw() {
  song.setVolume(volumeSlider.value());
  background(0);
  checkAndReset();
  // drawLine();
  drawCircle();
  if (FFTLineCheckbox.checked()) drawLineFFT();
  if (barsCheckbox.checked()) bars();
  if (pointWaveCheckbox.checked()) pointWave();
}

const moveSketch = () => {
  const canvas = document.getElementById('defaultCanvas0');
  const div = document.getElementById('sketch');
  div.appendChild(canvas);
}

const attachByClass = (parent, children) => {
  const p = document.getElementById(parent);
  const c = document.getElementsByClassName(children);
  for (let i = 0; i < c.length; i++) {
    const a = c[i];
    p.appendChild(a);
  }
}

const attachById = (parent, child) => {
  const p = document.getElementById(parent);
  const c = document.getElementById(child);
  p.appendChild(c);
}

const structureMe = () => {
  moveSketch();

  attachById('volume-label', 'volume-slider');
  attachById('color-label', 'color-slider');
  attachById('band-label', 'band-slider');
  attachById('offset-label', 'offset-slider');
  attachById('bandWidth-label', 'bandWidth-slider');
  attachById('rotate-label', 'rotate-slider');

  attachByClass('buttons', 'button');
  attachByClass('checkboxes', 'checkbox');
}

