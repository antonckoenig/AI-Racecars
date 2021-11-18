const drawWheels = true;
const drawDetail = true;
const collisionPrecision = 3;
const sensorPrecision = 3;
const maxSpeed = 2;
const maxWheelRotation = 0.3;
const maxNameLength = 3;
const wheelDeadZone = 0;
const subtractHighest = false;
class Car {
  constructor(x=width/2, y=height/2) {
    this.f = 0;
    this.x = x;
    this.y = y;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.speed = 0;
    this.wheelRotation = 0;
    this.rotation = -PI/2;
    this.col = color(Math.random()*200 + 55, Math.random()*200 + 55, Math.random()*200 + 55);
    while(this.col != outOfBoundsColor && Math.abs(this.col[0] - this.col[1]) < 50 && Math.abs(this.col[0] - this.col[2]) < 50 && Math.abs(this.col[1] - this.col[2]) < 50) {
      this.col = color(Math.random()*200 + 55, Math.random()*200 + 55, Math.random()*200 + 55);
    }
    this.currentColor = this.col;
    this.neuralNet = new NeuralNet(this, 6, 2, 4, 2);
    this.neuralNet.generate();
    this.alive = 0;
    this.fitness = new Array(numTrials);
    this.numChildren = 0;
    this.name = randomName();
    this.prevFitness = 0;
    this.checkPoint = false;
  }
  spawn() {
    this.x = track.verticies[0][0];
    this.y = track.verticies[0][1];
    this.checkPoint = false;
    this.speed = 0;
    this.wheelRotation = 0;
    if(reverse) {
      this.rotation = PI/2;
    }
    else {
      this.rotation = -PI/2;
    }
    this.prevFitness = 0;
    this.alive = 2;
  }
  mutate(car1, car2) {
    this.numChildren = 0;
    this.col = mixColors(car1.col, car2.col, 0.2);
    while(this.col != outOfBoundsColor && Math.abs(this.col[0] - this.col[1]) < 50 && Math.abs(this.col[0] - this.col[2]) < 50 && Math.abs(this.col[1] - this.col[2]) < 50) {
      this.col = mixColors(car1.col, car2.col, 0.2);
    }
    this.name = randomName() + " " + car1.name;
    
    var splitName = this.name.split(" ");
    if(splitName.length > 1) {
      this.name = splitName[0];
      if(car1.name != car2.name) {
        splitName[1] += "-" + car2.name.split(" ")[0];
      }
      for(var i = 1; i < Math.min(maxNameLength, splitName.length); i++) {
        this.name +=  " " + splitName[i];
      }
    }
    this.neuralNet.mutate(car1.neuralNet, car2.neuralNet);
  }
  
  move() {
    this.neuralNet.predict(this.sense().concat([this.speed, this.wheelRotation]));
    this.speed += this.neuralNet.getOutputs(0) - 0.5;
    this.speed = Math.min(Math.max(this.speed, 0), maxSpeed);
    if(this.neuralNet.getOutputs(1) > 0.5 + wheelDeadZone) {
      this.wheelRotation += 0.01;
    }
    else if(this.neuralNet.getOutputs(1) < 0.5 - wheelDeadZone) {
      this.wheelRotation -= 0.01;
    }
    this.wheelRotation = Math.max(Math.min(this.wheelRotation, maxWheelRotation), -maxWheelRotation);
    
    this.x += Math.cos(this.rotation)*this.speed;
    this.y += Math.sin(this.rotation)*this.speed;
    this.rotation += this.wheelRotation * this.speed / 10;
    var deg = this.setFitness();
    this.checkCollision();
    if(deg > 350 && !this.checkPoint) {
      this.alive = 0;
    }
    if(deg > 180 && deg < 190) {
      this.checkPoint = true;
    }
  }
  draw() {
    if(this == cars[selected]) {
      this.neuralNet.draw(15, 45);
      fill(255);
      stroke(0);
      strokeWeight(2);
      text(this.name + ": " + this.setFitness() + " current Fitness " + this.getFitness() + " average fitness", 10, 20);
      strokeWeight(1);
      stroke(255);
    } else {
      noStroke();
    }
    if(this.alive <= 0) {
      fill(this.col);
      circle(this.x, this.y, 5);
      return;
    }
    noStroke();
    this.x1 = this.x + 5;
    this.y1 = this.y + 5;
    this.x2 = this.x + 5 + 10*Math.cos(this.rotation);
    this.y2 = this.y + 5 + 10*Math.sin(this.rotation);
    if(drawWheels) {
      this.drawWheels();
    }
    if(drawDetail) {
      this.drawDetail();
    }
    stroke(this.currentColor);
    strokeWeight(10);
    line(this.x1, this.y1, this.x2, this.y2);
    noStroke();
  }
  drawWheels() {
      rectMode(CENTER);
      fill(0);
      noStroke();
      push();
      translate(this.x1, this.y1);
      rotate(this.rotation);
      rect(0, 0, 4, 13, 1);
      pop();
      push();
      translate(this.x2, this.y2);
      rotate(this.rotation + this.wheelRotation);
      rect(0, 0, 4, 13, 1);
      pop();
      rectMode(CORNER);
  }
  drawDetail() {
      stroke(0);
      strokeWeight(1);
      if(this == cars[selected]) {
        stroke(255);
        strokeWeight(2);
      }
      ellipse(this.x2, this.y2, 10);
      ellipse(this.x1, this.y1, 10);
   }
   
   checkCollision(d=7) {
    if(dist(this.x, this.y, track.verticies[0][0], track.verticies[0][1]) > 10) {
      for(var t = PI/2; t < 3*PI/2; t += PI/collisionPrecision) {
        if(this.checkAngle(t, this.x1, this.y1, d) || this.checkAngle(t + PI, this.x2, this.y2, d)) {
          this.alive--;
        } else {
          this.alive = 2;
        }
      }
    }
  }
  sense(minDist=7, maxDist=60) {
    var inputs = new Array(sensorPrecision);
    var n = minDist;
    var arr = new Array(sensorPrecision);
    for(var t = PI/2; t <= 3*PI/2; t += PI/sensorPrecision) {
      while(!this.checkAngle(t + PI, this.x2, this.y2, n, false) && n < maxDist) {
        n++;
      }
      arr[Math.round((t-PI/2)/(PI/sensorPrecision))] = (n - minDist) / (maxDist - minDist);
      /*n = minDist;
      while(!this.checkAngle(PI + t, this.x2, this.y2, n, false) && n < maxDist) {
        n++;
      }
      arr[Math.round((t-PI/2)/(PI/sensorPrecision)) + 3] = n / maxDist;*/
    }
    return arr;
  }
  checkAngle(theta, x, y, d, drawline=false) {
    theta += this.rotation;
    
    var col = get(x + (int)(Math.cos(theta) * d), y + (int)(Math.sin(theta)* d));
    if(drawline) {
      stroke(255, 0, 0);
      strokeWeight(1);
      line(x, y, x + (int)(Math.cos(theta) * (d-1)), y + (int)(Math.sin(theta) * (d-1)));
    }
    if((col[0] == red(outOfBoundsColor) && col[1] == green(outOfBoundsColor) && col[2] == blue(outOfBoundsColor))) {
      return true;
    }
    return false;
  }
  setFitness() {
    var xx = (this.x - width/2);
    var yy = (this.y - height/2);
    var deg = parseInt(Math.atan(yy/xx) * (180/PI));
    if(xx < 0 && yy >= 0) {
      deg += 180;
    }
    if(xx < 0 && yy < 0) {
      deg += 180;
    }
    if(xx >= 0 && yy < 0) {
      deg += 360;
    }
    if(!reverse) {
      deg = 360 - deg;
    }
    if(deg == 360) {
      deg = 0;
    }
    this.fitness[trial + (reverse ? 1 : 0)] = deg;
    return deg;
  }
  getFitness() {
    var fn = 0;
    var len = 0;
    var highest = this.fitness[0];
    for(var i = 0; i < this.fitness.length; i++) {
      if(this.fitness[i] === undefined) {
        break;
      }
      if(this.fitness[i] > highest) {
        highest = this.fitness[i];
      }
      len++;
      if(this.fitness[i] > 350) {
        this.fitness[i] = 0;
      }
      fn += this.fitness[i];
    }
    if(!subtractHighest) {
      highest = 0;
    }
    this.f = fn / len - highest / len;
    return parseInt(fn / len - highest / len);
  }
}

const vowels = "aeiou";
const consonants = "qwrtypsdfghjklzxcvbnm";

function mixColors(c1, c2, deviance) {
  return color((red(c1) + red(c2))/2 + deviance*(Math.random()*510 - 255), (green(c1) + green(c2))/2 + deviance*(Math.random()*510 - 255), (blue(c1) + blue(c2))/2 + deviance*(Math.random()*510 - 255));
}

function randomName() {
  var str = consonants.charAt(Math.floor(Math.random()*consonants.length)) + vowels.charAt(Math.floor(Math.random()*vowels.length)) + consonants.charAt(Math.floor(Math.random()*consonants.length));
  if(Math.random() > 0.5) {
    str += vowels.charAt(Math.floor(Math.random()*vowels.length));
  }
  if(Math.random() > 0.5) {
    str = vowels.charAt(Math.floor(Math.random()*vowels.length)) + str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
