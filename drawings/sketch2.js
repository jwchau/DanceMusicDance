const minval = -1.5;
const maxval = 1.5;


let angle = 0;

const drawMandel = () => {
  // const jA = map(mouseX, 0, width, -1, 1);
  // const jB = map(mouseY, 0, height, -1, 1);

  // const jA = sin(angle);
  const jA = 0;
  angle += 1;
  const jB = sin(angle);

  const maxIterations = 100;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {

      let a = map(x, 0, width, minval, maxval);
      let b = map(y, 0, width, minval, maxval);

      let ca = a;
      let cb = b;

      let n = 0;

      while (n < maxIterations) {
        const aa = a * a;
        const bb = b * b;
        const twoab = 2 * a * b;

        if (abs(a + b) > 4) break;

        a = aa - bb + jA;
        b = twoab + jB;
        n++;
      }

      let bright = map(n, 0, 100, 0, 1);
      bright = map(bright, 0, 1, 0, 255);
      if (n === maxIterations) bright = 0;

      const pix = (x + y * width) * 4;
      pixels[pix + 0] = bright;
      pixels[pix + 1] = bright;
      pixels[pix + 2] = bright;
      pixels[pix + 3] = 255;
    }
  }
  updatePixels();
}

function setup() {
  createCanvas(300, 300);
  angleMode(DEGREES);
  pixelDensity(1);
  loadPixels();
}

function draw() {
  drawMandel();
}
