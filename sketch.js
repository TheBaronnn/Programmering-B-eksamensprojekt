let angleInput,
  angleInputLabel,
  inputVx,
  inputVxLabel,
  inputVy,
  inputVyLabel,
  inputAirResistance,
  inputAirResistanceLabel;
let massInput, massInputLabel;
let speedInput, speedInputLabel;
let buttonStart;
let buttonReset;
let buttonDrawPositions;
let buttonSimulateAirResistance;
let buttonLogToConsole;
let objectToThrow;
let earth;
let universe;

const defaultMass = "1";
const defaultSpeed = "1";
const defaultAngle = "45";
const defaultVx = "8";
const defaultVy = "8";
const defaulAirResistance = "0.0";

class ObjectToThrow {
  constructor(x, y, vx, vy, angle, mass) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle;
    this.diameter = 50;
    this.fired = false; // if true, the object is fired
    this.stopped = false; // if true, the object is stopped (by pressing space or hitting the ground)
    this.mass = mass;
    this.showTrajectory = false;
    this.positions = [createVector(x, y)];
    this.useAirResistance = false;
    this.airResistance = Number(defaulAirResistance);
  }

  getAllInputValues() {
    this.mass = Number(massInput.value());
    this.angle = radians(Number(angleInput.value()));
    this.vx = Number(inputVx.value());
    this.vy = Number(inputVy.value());
    this.speed = Number(speedInput.value());
    this.airResistance = Number(inputAirResistance.value());
  }

  printDataOnScreen() {
    push();
    fill("black");
    rect(windowWidth - 120, 10, 120, 100);
    fill("white");
    textSize(20);
    text("Vx:  " + round(this.vx, 2), windowWidth - 100, 30);
    text("Vy:  " + round(this.vy, 2), windowWidth - 100, 55);
    text("X:   " + round(this.x, 2), windowWidth - 100, 75);
    text("Y:   " + round(this.y, 2), windowWidth - 100, 95);
    pop();
  }

  draw() {
    this.drawCircle();
    this.addPosition(this.x, this.y);
    this.drawTrajectory();
    this.printDataOnScreen();
  }

  drawCircle() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill("red");
    circle(0, 0, this.diameter);
    pop();
  }

  drawVector() {
    push();
    stroke("black");
    translate(this.x, this.y);
    strokeWeight(2);
    line(0, 0, this.vx * 10, -this.vy * 10);
    pop();
  }

  addPosition() {
    if (this.stopped === false) {
      this.positions.push(createVector(this.x, this.y));
    }
  }

  drawTrajectory() {
    if (this.showTrajectory === true) {
      push();
      stroke("red");
      strokeWeight(2);
      for (let i = 0; i < this.positions.length - 1; i++) {
        line(
          this.positions[i].x,
          this.positions[i].y,
          this.positions[i + 1].x,
          this.positions[i + 1].y
        );
      }
      pop();
    }
  }

  drawInWorld() {
    objectToThrow.draw();
    objectToThrow.move(universe);

    if (objectToThrow.checkForCollision() && !objectToThrow.stopped) {
      objectToThrow.stop();
    }
  }

  move(universe) {
    if (!this.stopped) {
      this.x += this.vx;
      this.y -= this.vy;
      this.vy -= (universe.gravity * this.mass) / 100; //100 is a factor to make the object fall slower

      if (this.useAirResistance === true) {
        this.vx -= this.airResistance;
      }
    }
  }

  checkForCollision() {
    if (this.y + this.diameter / 2 + 2 > windowHeight - earth.height) {
      // Vi er landet på jorden
      return true;
    }
  }

  stop() {
    this.vy = 0;
    this.vx = 0;
  }

  reset(x, y, vx, vy, angle) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle;
    this.positions = [];
  }
}

class Universe {
  constructor() {
    this.gravity = 9.82;
  }
}

class Ground {
  constructor(height = 50) {
    this.x = 0;
    this.y = windowHeight - height;
    this.width = windowWidth;
    this.height = height;
  }

  draw() {
    push();
    fill("green");
    rect(this.x, this.y, this.width, this.height);
    pop();
  }
}

function preload() {
  img = loadImage(importedImage);
  audio = loadSound(importedAudio);
}

function setupInputFields() {
  let x = 150;
  let y = 30;

  // Mass input
  massInput = createInput(defaultMass);
  massInput.position(x, y);
  massInputLabel = createDiv("Vægt i g:");
  massInputLabel.position(10, y);
  massInput.changed(() => {
    objectToThrow.getAllInputValues();
  });

  // Speed input
  speedInput = createInput(defaultSpeed);
  speedInput.position(x, 2 * y);
  speedInputLabel = createDiv("Hastighed (m/s):");
  speedInputLabel.position(10, 2 * y);
  speedInput.changed(() => {
    let angle = radians(Number(angleInput.value()));
    let speed = Number(speedInput.value());
    let vxVy = computeVxAndVyFromAngle(angle, speed);
    inputVx.value(vxVy.vx);
    inputVy.value(vxVy.vy);
    objectToThrow.getAllInputValues();
  });

  // Angle input
  angleInput = createInput(defaultAngle, "number");
  angleInput.position(x, 3 * y);
  angleInput.attribute("min", "0");
  angleInput.attribute("max", "90");
  angleInputLabel = createDiv("Vinkel:");
  angleInputLabel.position(10, 3 * y);
  angleInput.changed(() => {
    let angle = radians(Number(angleInput.value()));
    let speed = Number(speedInput.value());
    let vxVy = computeVxAndVyFromAngle(angle, speed);
    inputVx.value(vxVy.vx);
    inputVy.value(vxVy.vy);
    objectToThrow.getAllInputValues();
  });

  // Vx input
  inputVx = createInput(defaultVx);
  inputVx.position(x, 4 * y);
  inputVxLabel = createDiv("vx (meter):");
  inputVxLabel.position(10, 4 * y);
  inputVx.changed(() => {
    let vx = Number(inputVx.value());
    let vy = Number(inputVy.value());
    let angle = computeAngleFromVxAndVy(vx, vy);
    angleInput.value(degrees(angle));
    objectToThrow.getAllInputValues();
  });

  // Vy input
  inputVy = createInput(defaultVy);
  inputVy.position(x, 5 * y);
  inputVyLabel = createDiv("vy (meter):");
  inputVyLabel.position(10, 5 * y);
  inputVy.changed(() => {
    let vx = Number(inputVx.value());
    let vy = Number(inputVy.value());
    let angle = computeAngleFromVxAndVy(vx, vy);
    angleInput.value(degrees(angle));
    // update throw object with new values
    objectToThrow.getAllInputValues();
  });

  // Air resistance input
  inputAirResistance = createInput(defaulAirResistance);
  inputAirResistance.position(x, 6 * y);
  inputAirResistanceLabel = createDiv("Luftmodstand:");
  inputAirResistanceLabel.position(10, 6 * y);

  // Log to console button
  buttonLogToConsole = createButton("Log to console");
  buttonLogToConsole.position(x, 9 * y);
  buttonLogToConsole.mousePressed(() => {
    console.log("objectToThrow", objectToThrow);
    // convert positions to geogebra friendly format
    let tmpString = "{";
    let positions = objectToThrow.positions;
    for (let i = 0; i < positions.length; i++) {
      tmpString +=
        "(" +
        round(positions[i].x, 0) +
        "," +
        (windowHeight - 75 - round(positions[i].y, 0)) +
        ")";
      if (i < positions.length - 1) {
        tmpString += ",";
      }
    }
    tmpString += "}";
    console.log("positions", tmpString);
  });

  // Start button
  buttonStart = createButton("Start");
  buttonStart.position(x, 7 * y);
  buttonStart.mousePressed(() => {
    if (objectToThrow.fired === true) {
      objectToThrow.reset(50, windowHeight - 75, 0, 0, 0);
    }

    objectToThrow.fired = true;
    objectToThrow.getAllInputValues();
    objectToThrow.stopped = false;
  });

  // Reset button
  buttonReset = createButton("Reset");
  buttonReset.position(x + 50, 7 * y);
  buttonReset.mousePressed(() => {
    objectToThrow.reset(50, windowHeight - 75, 0, 0, 0);
    objectToThrow.stopped = true;
    objectToThrow.fired = false;
    objectToThrow.positions = [];
    // Reset input fields
    massInput.value(defaultMass);
    speedInput.value(defaultSpeed);
    angleInput.value(defaultAngle);
    inputVx.value(defaultVx);
    inputVy.value(defaultVy);
    inputAirResistance.value(defaulAirResistance);
    objectToThrow.getAllInputValues();
  });

  // Draw trajectory button
  buttonDrawPositions = createButton("Draw trajectory");
  buttonDrawPositions.position(x + 100, 7 * y);
  buttonDrawPositions.mousePressed(() => {
    objectToThrow.showTrajectory = !objectToThrow.showTrajectory;

    if (objectToThrow.showTrajectory === false) {
      buttonDrawPositions.html("Draw trajectory");
    }
    if (objectToThrow.showTrajectory === true) {
      buttonDrawPositions.html("Hide trajectory");
    }
  });

  // Simulate air resistance button
  buttonSimulateAirResistance = createButton("Simulate air resistance");
  buttonSimulateAirResistance.position(x, 8 * y);
  buttonSimulateAirResistance.mousePressed(() => {
    objectToThrow.useAirResistance = !objectToThrow.useAirResistance;
    if (objectToThrow.useAirResistance === false) {
      buttonSimulateAirResistance.html("Simulate air resistance");
    }
    if (objectToThrow.useAirResistance === true) {
      buttonSimulateAirResistance.html("Disable air resistance");
    }
  });
}

function computeVxAndVyFromAngle(angle, speed) {
  let vx = speed * cos(angle);
  let vy = speed * sin(angle);
  return { vx, vy };
}

function computeAngleFromVxAndVy(vx, vy) {
  return atan(vy / vx);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupInputFields();
  universe = new Universe();
  earth = new Ground();
  objectToThrow = new ObjectToThrow(50, windowHeight - 75, 8, 8, 45, 1);
  objectToThrow.stopped = true;
}

function drawBackground() {
  background(214, 234, 248);
  push();
  fill("white");
  noStroke();
  ellipse(500, 200, 250, 100);
  ellipse(550, 250, 150, 70);
  ellipse(550, 150, 150, 70);
  ellipse(650, 250, 150, 70);
  ellipse(600, 200, 150, 70);
  ellipse(400, 250, 150, 50);
  ellipse(650, 250, 150, 40);
  pop();
}

function draw() {
  drawBackground();

  earth.draw();
  objectToThrow.drawInWorld();
  objectToThrow.drawVector();
}

function keyPressed() {
  if (keyCode === 32) {
    // Check for Enter-tasten
    if (objectToThrow.stopped) {
      objectToThrow.stopped = false;
    } else {
      objectToThrow.stopped = true;
    }
  }
}
