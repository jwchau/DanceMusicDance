//globals
const songs = [];
let song;
let songIdx;
let theta = 0;
let cTheta = 0;
let omega = -1;
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

function preload() {
  for (let i = 0; i < 4; i++) {
    const song = loadSound(`assets/sounds/sound_${i}.mp3`);
    songs.push(song);
    songs[i].setVolume(0.125);
  }
  songIdx = Math.floor(Math.random() * songs.length);
  song = songs[3];
}

const songPush = (k) => () => {
  song.jump(0);
  song.stop();
  songIdx += k;
  if (songIdx === songs.length) songIdx = 0;
  if (songIdx < 0) songIdx = songs.length - 1;
  song = songs[songIdx];
}

function togglePlaying() {
  if (!song.isPlaying()) {
    song.play();
    playButton.html("||");
  } else {
    song.pause();
    playButton.html("&#9658;");
  }
}

const createFFT = () => {
  fft = new p5.FFT(0.9, 512);
}

const clearAllSettings = () => {
  theta = 0;
  cTheta = 0;
  volumeSlider.value(0.25);
  fadeSlider.value(1);
  colorSlider.value(0);
  bandSlider.value(0);
  offsetSlider.value(0);
  bandWidth.value(0);
  rotateSlider.value(0);
  omegaSlider.value(1);
  rotateCheckbox.checked(false);
  cycleColors.checked(false);
  rippleCheckbox.checked(false);
  radialPatternCheckbox.checked(false);
  radialWaveCheckbox.checked(false);
  drawCircleCheckbox.checked(false);
  barsCheckbox.checked(false);
  FFTLineCheckbox.checked(false);
  pointWaveCheckbox.checked(false);
}

const preset = (k) => () => {
  clearAllSettings();
  if (k === 0) {
    fadeSlider.value(10);
    bandWidth.value(4);
    cycleColors.checked(true);
    barsCheckbox.checked(true);
  } else if (k === 1) {
    bandSlider.value(1);
    offsetSlider.value(100);
    bandWidth.value(2);
    rotateCheckbox.checked(true);
    radialPatternCheckbox.checked(true);
  } else if (k === 2) {
    bandSlider.value(3);
    offsetSlider.value(33);
    bandWidth.value(4);
    cycleColors.checked(true);
    radialWaveCheckbox.checked(true);
    drawCircleCheckbox.checked(true);
  } else if (k === 3) {
    fadeSlider.value(5);
    bandSlider.value(3);
    offsetSlider.value(100);
    cycleColors.checked(true);
    barsCheckbox.checked(true);
    FFTLineCheckbox.checked(true);
    pointWaveCheckbox.checked(true);
  }
  return true;
}

const createButtons = () => {
  prevButton = createButton("Prev");
  prevButton.mousePressed(songPush(-1));
  prevButton.addClass('control song-button');
  prevButton.id('prev');

  playButton = createButton("&#9658;");
  playButton.mousePressed(togglePlaying);
  playButton.addClass('control song-button');
  playButton.id('play');

  nextButton = createButton("Next");
  nextButton.mousePressed(songPush(1));
  nextButton.addClass('control song-button');
  nextButton.id('next');

  presetButton0 = createButton("Preset 0");
  presetButton0.mousePressed(preset(0));
  presetButton0.addClass('control button');
  presetButton0.id('preset-0');

  presetButton1 = createButton("Preset 1");
  presetButton1.mousePressed(preset(1));
  presetButton1.addClass('control button');
  presetButton1.id('preset-1');

  presetButton2 = createButton("Preset 2");
  presetButton2.mousePressed(preset(2));
  presetButton2.addClass('control button');
  presetButton2.id('preset-2');

  presetButton3 = createButton("Preset 3");
  presetButton3.mousePressed(preset(3));
  presetButton3.addClass('control button');
  presetButton3.id('preset-3');

  clearButton = createButton("Clear");
  clearButton.mousePressed(preset('clear'));
  clearButton.addClass('control button');
  clearButton.id('clear');
}

const createListeners = () => {
  const progressBar = document.getElementById('progress-bar');
  progressBar.addEventListener("mousedown", function(e) {
    let clickedPos = e.clientX - e.target.offsetLeft;
    song.jump((clickedPos / e.target.offsetWidth) * song.duration());
  }, false);

  const splash = document.getElementById('splash');
  const iButton = document.getElementById('i-button');
  iButton.addEventListener("click", function(e) {
    e.preventDefault();
    splash.style.display = 'none';
  }, false);

  const show = document.getElementById('show-controls');
  const controls = document.getElementById('controls');
  show.addEventListener("click", function(e) {
    e.preventDefault();
    if (controls.style.display === 'none') {
      controls.style.display = 'flex';
      show.children[0].classList.replace('left', 'right');
      resizeCanvas(windowHeight, windowHeight - 74);
    } else {
      controls.style.display = 'none';
      show.children[0].classList.replace('right', 'left');
      resizeCanvas(windowWidth, windowHeight - 74);
    }
  }, false);
}


const createSliders = () => {
  volumeSlider = createSlider(0, 0.5, 0.25, 0.0125);
  volumeSlider.addClass('control slider');
  volumeSlider.id('volume-slider');
  fadeSlider = createSlider(1, 100, 5, 1);
  fadeSlider.addClass('control slider');
  fadeSlider.id('fade-slider');
  colorSlider = createSlider(0, 255, 150, 1);
  colorSlider.addClass('control slider');
  colorSlider.id('color-slider');
  bandSlider = createSlider(0, 3, 3, 1);
  bandSlider.addClass('control slider');
  bandSlider.id('band-slider');
  offsetSlider = createSlider(10, 100, 50, 5);
  offsetSlider.addClass('control slider');
  offsetSlider.id('offset-slider');
  bandWidth = createSlider(2, 64, 6, 2);
  bandWidth.addClass('control slider');
  bandWidth.id('bandWidth-slider');
  rotateSlider = createSlider(0, 360, 0, 1);
  rotateSlider.addClass('control slider');
  rotateSlider.id('rotate-slider');
  omegaSlider = createSlider(1, 15, 1, 1);
  omegaSlider.addClass('control slider');
  omegaSlider.id('omega-slider');
}

const createCheckboxes = () => {
  const div = document.getElementById('checkboxes');
  rotateCheckbox = createCheckbox('auto-rotate', false);
  rotateCheckbox.parent(div);
  cycleColors = createCheckbox('cycle colors', false);
  cycleColors.parent(div);
  rippleCheckbox = createCheckbox('Ripples', false);
  rippleCheckbox.parent(div);
  radialPatternCheckbox = createCheckbox('Radial Pattern', false);
  radialPatternCheckbox.parent(div);
  radialWaveCheckbox = createCheckbox('Radial Wave', false);
  radialWaveCheckbox.parent(div);
  drawCircleCheckbox = createCheckbox('Radial Expanse', true);
  drawCircleCheckbox.parent(div);
  barsCheckbox = createCheckbox('Bars', false);
  barsCheckbox.parent(div);
  FFTLineCheckbox = createCheckbox('FFT Line', false);
  FFTLineCheckbox.parent(div);
  pointWaveCheckbox = createCheckbox('Point Wave', false);
  pointWaveCheckbox.parent(div);
}

function createControls() {
  createButtons();
  createCheckboxes();
  createSliders();
  createListeners();
  amp = new p5.Amplitude();
}

const drawBeziersType0 = (diam, offset) => {
  let p1 = [diam / 6, diam / 2];
  let p2 = [diam / 6, offset + diam / 2];
  let p3 = [diam / 12, 2 * offset + diam / 2];
  let p4 = [-diam / 12, 3 * offset + diam / 2];
  bezier(...p1, ...p2, ...p3, ...p4);
  p1 = [-diam / 6, diam / 2];
  p2 = [-diam / 6, offset + diam / 2];
  p3 = [diam / 12, 2 * offset + diam / 2];
  p4 = [-diam / 12, 3 * offset + diam / 2];
  bezier(...p1, ...p2, ...p3, ...p4);
}

const drawType0 = (diam, offset, ang, dist) => {
  push();
  const wave = fft.waveform();
  const size = map(wave[69], 0, 1, 0, 100);
  translate(width / 2, height / 2);
  ellipse(0, 0, (size + dist) / 2, (size + dist) / 2);
  rotate(theta + rotateSlider.value() + ang);
  for (let i = 0; i < 3; i++) {
    const size = map(wave[i * 120], 0, 1, 0, 75);
    rotate(120);
    fill(colorMe(0), 255, 255);
    ellipse(0, dist / 4, size + diam / 6, size + diam / 6);
    drawBeziersType0(size + dist / 2, offset);
  }
  pop();
}

const drawType2 = (diam, offset) => {
  push();
  noFill();
  const wave = fft.waveform();
  const size = map(wave[69], 0, 1, 0, 100);
  translate(width / 2, height / 2);
  ellipse(0, 0, (size + diam) / 2, (size + diam) / 2);
  ellipse(0, 0, (size + diam), (size + diam));
  rotate(theta + rotateSlider.value());
  for (let i = 0; i < 3; i++) {
    const size = map(wave[i * 120], 0, 1, 0, 25);
    rotate(120);
    ellipse(0, diam / 4, size + diam / 6, size + diam / 6);
    push();
    rotate(60);
    rectMode(RADIUS);
    rect(0, diam / 2, size + diam / 8, size + diam / 4, size + diam / 4);
    rectMode(CORNER);
    pop();
    drawBeziersType0(diam, size + offset);
  }
  pop();
}

const drawType3 = (diam, offset) => {
  push();
  const wave = fft.waveform();
  const size = map(wave[69], -1, 1, -100, 100);
  translate(width / 2, height / 2);
  fill(colorMe(0), 255, 255);
  ellipse(0, 0, size + diam / 4, size + diam / 4);
  rotate(theta + rotateSlider.value());
  noFill();
  push();
  for (let i = 0; i < 4; i++) {
    const size = map(wave[i * 100], -1, 1, -10 * (offset * 5), 10 * (offset * 5));
    
    rotate(45);
    ellipse(0, 0, (size + diam) / 2, height);
  }
  pop();
  pop();
}

const drawEyeType = (type, diam) => {
  const offset = map(offsetSlider.value(), 0, 100, 0, 30);
  if (type === 0) {
    drawType0(diam, offset, 0, diam);
  } else if (type === 1) {
    for (let i = 0; i < 3; i++) {
      drawType0(diam, offset, i * 60, diam * (i + 1));
    }
  } else if (type === 2) {
    drawType2(diam, offset);
  } else if (type === 3) {
    drawType3(diam, offset);
  }

}

const nerdOut = () => {
  const diam = 300;

  noFill();
  strokeWeight(bandWidth.value());
  stroke(colorMe(0), 255, 255);
  
  drawEyeType(bandSlider.value(), diam);
}

const drawChaos = (start) => {
  const wave = fft.waveform();
  push();
    rotate((start / 50) * 90);
    beginShape();
      for (let i = 0; i < 360; i++) {
        const magicNumber = Math.floor(i * (512 / 360)) + 1;
        const variance = offsetSlider.value() * 3;
        const bandMult = (bandSlider.value() + 1) * 25;
        const r = map(wave[magicNumber], 0, 1, start + bandMult, bandMult + start + variance);
        const x = r * cos(i);
        const y = r * sin(i);
        vertex(x, y);
      }
    endShape();
  pop();
}

const drawCircleLines = () => {
  noFill();
  strokeWeight(bandWidth.value());
  push();
    translate(width / 2, height / 2);
    rotate(theta + rotateSlider.value());
    stroke(colorMe(0), 255, 255);
    for (let i = 1; i <= 5; i++) {
      const distance = i * 50;
      drawChaos(distance);
    }
  pop();
}


const drawCircle = () => {
  const spectrum = fft.analyze();
  const bw = bandWidth.value();
  const offset = offsetSlider.value() * 2.5;
  const numBands = bandSlider.value() * 20;

  noFill();
  strokeWeight(bw);
  push();
  translate(width / 2, height / 2);
  for (let i = 0; i < spectrum.length; i += bw + numBands) {
    const amp = spectrum[i];
    const size = map(amp, 0, 255, 0, height);
    const c = map(i, 0, spectrum.length, 0, 255);
    const color = colorMe(c);
    stroke(color, 255, 255);
    ellipse(0, 0, size + offset, offset + size);
  }
  pop();
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
    const color = colorMe(c);
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
    const y = map(amp, 0, 255, 0, -height / 2);
    const c = map(i, 0, spectrum.length, 0, 255);
    const color = colorMe(c);
    stroke(color, 255, 255);
    point(x + (mult * offset), y);
    point(x + (mult * offset), -y);
    point(-x - (mult * offset), y);
    point(-x - (mult * offset), -y);
  }
  pop();
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
    const y = map(amp, 0, 255, 1, height - 100);
    const c = map(i, 0, spectrum.length, 0, 255);
    const color = colorMe(c);
    fill(color, 255, 255);
    rect(x, 0, bw, y);
    rect(x, 0, bw, -y);
    rect(-x, 0, bw, y);
    rect(-x, 0, bw, -y);
  }
  pop();
}

const ripples = new Array(1);
let rippleIdx = 0;

const fillRipples = () => {
  for (let i = 0; i < ripples.length; i++) {
    r = new Array();
    r.push(random(width) - (width / 2));
    r.push(random(height) - (height / 2));
    r.push(0);
    r.push(random(50, 200));
    ripples[i] = r;
  }
}

const ripple = (i, r) => {
  let diam = r[2];
  let limit = r[3];
  if (diam <= limit) {
    var fade = map(diam, 0, limit, 1, 0);
    stroke(colorMe(0), 255, 255, fade);
    noFill();
    ellipse(r[0], r[1], diam);
    r[2] += 1;
  } else {
    ripples.splice(i, 1);
  }

}

const generateRipples = (limit = 1) => {
  for (let i = 0; i < limit; i++) {
    r = [];
    r.push(random(width) - (width / 2)); //x value
    r.push(random(height) - (height / 2)); //y value
    r.push(0); //starting size
    r.push(random(50, 200)); //limit size
    ripples.push(r);
  }
}

const drawRipples = () => {
  noFill();
  stroke(255);
  strokeWeight(bandWidth.value() / 2);
  push();
  translate(width / 2, height / 2);
  rotate(theta + rotateSlider.value());
  for (let i = 0; i < ripples.length; i++) {
    ripple(i, ripples[i]);
  }
  generateRipples();
  pop();
}

const colorMe = (current) => {
  return (current + colorSlider.value() + cTheta) % 256;
}

const cycles = () => {
  if (rotateCheckbox.checked()) theta += (omega * omegaSlider.value());
  if (cycleColors.checked()) cTheta += cOmega;
}

const colorProgressBar = () => {
  const progress = document.getElementById('progress');
  progress.style.width = `${(song.currentTime() / song.duration()) * 100}%`;
}

const checkAndReset = () => {
  if (!song.isPlaying()) playButton.html('&#9658;');
  else playButton.html('&#10074;&#10074;');
  if (theta > 360) theta = 0;
  if (cTheta >= 255) cOmega = -1;
  if (cTheta <= 0) cOmega = 1;
  cycles();
}

function setup() {
  pixelDensity(1);
  createCanvas(windowHeight, windowHeight - 70);
  angleMode(DEGREES);
  colorMode(HSB);
  background(0);
  
  fillRipples();
  createControls();
  createFFT();
  fileUpload();
  structureMe();
}

function draw() {
  song.setVolume(volumeSlider.value());
  colorProgressBar();
  checkAndReset();
  noStroke();
  background(0, 0, 0, 1 / fadeSlider.value());
  if (rippleCheckbox.checked()) drawRipples();
  if (radialPatternCheckbox.checked()) nerdOut();
  if (radialWaveCheckbox.checked()) drawCircleLines();
  if (drawCircleCheckbox.checked()) drawCircle();
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
  attachById('omega-label', 'omega-slider');
  attachById('fade-label', 'fade-slider');

  attachByClass('buttons', 'button');
  attachByClass('song-buttons', 'song-button');

  replaceLoading();
}

const replaceLoading = () => {
  const loadingP = document.querySelector('#i-loading');
  loadingP.parentNode.removeChild(loadingP);
}

const fileUpload = () => {
  document.getElementById('input').onchange = function(e){
    if (this.files[0] === undefined) return;
    song.stop();
    song = loadSound(URL.createObjectURL(this.files[0]));
  }
}