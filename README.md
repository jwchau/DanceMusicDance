# DanceMusicDance

Music Visualizer made with P5.js library for the sound analysis and visual rendering functions

## Getting Started

The demo is live [HERE](https://jwchau.github.io/DanceMusicDance)

### Prerequisites

* No prerequisities required.

### Cloning

* Clone or download project
* Run the index.html file

## Features
 * Comes with a collection of the highest calibre tracks!
 * Or upload your own song and see it come to life!
 * Variety different visual styles
 * Incorporates FFT, Waveform, Amplitude sound analysis tools to help better visualize the music!
 * Very interactable! There's a slider, checkbox, or button for all your interactible needs!
 
### Code
```
  const progressBar = document.getElementById('progress-bar');
  progressBar.addEventListener("mousedown", function(e) {
    let clickedPos = e.clientX - e.target.offsetLeft;
    song.jump((clickedPos / e.target.offsetWidth) * song.duration());
  }, false);
```
Track seeking code integrates event listener on html element

```
  const vol = amp.getLevel();
  volData.push(vol);
  noFill();
  strokeWeight(bandWidth.value());
  stroke(colorMe(0), 255, 255);
  push();
  translate(width / 2, height / 2);
  rotate(theta + rotateSlider.value());
  beginShape();
  for (let i = 0; i < volData.length; i++) {
    const r = map(volData[i], 0, 0.25, 10 + (1.5 * offsetSlider.value()), height);
    const x = r * cos(i);
    const y = r * sin(i);
    const c = map(i, 0, volData.length, 0, 255);
    vertex(x, y);
  }
  endShape();
  pop();

  if (volData.length > 360) volData.splice(0, 1);
```
Rotating Circle drawing is made of 360 points, constantly being pushed into an array based on current music amplitude.

```
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
    const color = colorMe(c);
    fill(color, 255, 255);
    rect(x, 0, bw, y);
    rect(x, 0, bw, -y);
    rect(-x, 0, bw, y);
    rect(-x, 0, bw, -y);
  }
  pop();
}
```
Bars are drawn with rectangles. Length is based on FFT spectrum and width is based on a width slider.

### screenshots

![ss1](https://github.com/jwchau/DanceMusicDance/blob/master/assets/images/ss1.png)
![ss2](https://github.com/jwchau/DanceMusicDance/blob/master/assets/images/ss2.png)
![ss3](https://github.com/jwchau/DanceMusicDance/blob/master/assets/images/ss3.png)


## Challenges

* The creativity aspect of this project had me hit a wall sometimes, because there's so many different ways to visualize MUSIC, let alone just one sound at a moment in time.
* The math for some of the drawings were a bit weird, and I still don't have 100% understanding of it. Coordinate space, distance calculations, timing, loops, etc.
* HTML structure and CSS matching were difficult to figure out because I used p5 in global mode, which creates html elements and appends it to the body. So I had to individually attach to the appropriate containers I created.
## Author

* **John Chau** - [github](https://github.com/jwchau)

## My thoughts about the project

* Overall I felt it was a pretty fun project to do. I definitely solidified my understanding of pure JavaScript.
* I certainly felt the arduous process of repeatedly hard coding things like buttons and checkboxes. If I could go back in time and redo, I would make it more modular.
* I felt pretty relaxed during development as this wasn't a strict structure by any means. I think that's an important mindset to be in while developing or else one would be tied down by specifics of every detail.
