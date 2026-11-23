
let socket;
let drawColor;
let oldX = 0;
let oldY = 0;
let oldZ = 0;
let shakeCount = 0;
let motion = false;
let ios = false;

// below code is essential for ios13 and above.
// A click is needed for the device to request permission
if (typeof DeviceMotionEvent.requestPermission === 'function') {
  document.body.addEventListener('click', function() {
    DeviceMotionEvent.requestPermission()
      .then(function() {
        console.log('DeviceMotionEvent enabled');
        motion = true;
        ios = true;
      })
      .catch(function(error) {
        console.warn('DeviceMotionEvent not enabled', error);
      });
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  strokeWeight(10);

  // Give each device a random color when the program starts
  drawColor = color(
    random(255),
    random(255),
    random(255)
  );

  socket = io();

  // Receive drawings from other devices
  socket.on('on_rotate', (data) => {
    stroke(data.r, data.g, data.b);
    strokeWeight(10);

    // resize the data from the phone to the computer and vice versa
    line(
      data.x * width,
      data.y * height,
      data.px * width,
      data.py * height
    );
  });

  socket.on('on_shake', () => {
    background(255);
    showInstructions();
  });

  showInstructions();
}

function touchMoved() {
  drawLine();
  return false;
}

function mouseDragged() {
  drawLine();
}

function drawLine() {
  shakeCount = 0;

  stroke(drawColor);
  strokeWeight(10);

  line(mouseX, mouseY, pmouseX, pmouseY);

  //send all the data in an object
  socket.emit('on_rotate', {
    x: mouseX / width,
    y: mouseY / height,
    px: pmouseX / width,
    py: pmouseY / height,
    r: red(drawColor),
    g: green(drawColor),
    b: blue(drawColor)
  });
}

function showInstructions() {
  let isMobile = ('ontouchstart' in window) ||
                 navigator.maxTouchPoints > 0;

  noStroke();
  fill(255);
  rect(0, 0, width, 75);

  fill(0);
  textSize(14);

  if (isMobile) {
    text('Draw with your finger!', 10, 22);
    text('Refresh for a new color. Your canvas will reset.', 10, 44);
    text('but your drawings stay visible on other devices.', 10, 64);
  } else {
    text('Connect your device to the url: http:...', 10, 22);
    text('Refresh this page for a blank canvas.', 10, 44);
  }
}

function draw() {
  let rotZ = round(rotationZ);
  let rotX = round(rotationX);
  let rotY = round(rotationY);
  let delta = abs(oldZ - rotZ) + abs(oldX - rotX) + abs(oldY - rotY);

  oldX = rotX;
  oldY = rotY;
  oldZ = rotZ;

  if (delta > 5) {
    shakeCount++;

    drawColor = color(
      random(255),
      random(255),
      random(255)
    );

    if (shakeCount >= 3) {
      background(255);
      showInstructions();
      socket.emit('on_shake');
      shakeCount = 0;
    }
  }
}
