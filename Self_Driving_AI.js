/* AI powered self driving racecars using sexual reproduction and natural selection
by Anton Koenig, created in Aug 2021

2D racecars are naturally selected based on their ability to navigate a racetrack in a given timespan. The goal is to 'evolve' a car that can race down any track as quickly as possible without crashing.

-

I developed an algorithm that semi-randomly plots a given amount of verticies within two bounding circles such that a polygon formed form these verticies never intersects itself
The poloygon is then smoothed using p5.js implementation of Catmull-Rom splines (https://p5js.org/reference/#/p5/curveVertex)
As a car travels around the track, its angle from the canvas center will always increase. That way, a cars fitness can be measured using this angle.
The average of all tracks generated is a circle of a given radius around the canvas center.
The cars travel both clockwise and counter clockwise before each generation cycle and the racetrack is regenerated 
This avoids bias in the car's movement and strengthens its ability to generaly and drive down any racetrack

Every frame each car's neural net makes a prediction for the cars movement

The neural network takes the following as input:
  • Multiple ray-tracing sensors that detect the distance between the car and the edge of the racetrack on a specific vector from the front (or rear) of the car using pixel color data from the canvas
  • The speed of the car
  • The rotation of the front wheels

The neural net contains several hidden layers with perceptrons with sigmoid activation functions and randomly generated weights and biases

The network outputs two values corresponding with an increase/decrease of speed and a direction to rotate the wheels (left/right)

Each car then moves according to its neural net

After a certain timespan, a cars fitness is measured using the angle 

*/

var track;
var grid;
var cars;
var numCars = 50;
var selected = 0;
var fr = 60;
var numParents = 3;
var numRandomCars = 0;
var generation = 0;
var trialSpeed = 6;
var trial = 0;
var numTrials = 1;
var averageFitness = new Array();
var recordFitness = new Array();
let changeTracks = true;
let reverse = false;
let outOfBoundsColor;
let mainCanvas;
let mutationChanceButton, mutationWeightButton, completeMutationChanceButton;
let frameOffSet = 0;
function setup() {
  mainCanvas = createCanvas(1000, 800);
  frameRate(fr);
  track = new Track(8, [0.55, 0.8], 0.8, 0);
  track.generate();
  track.drawVerticies();
  cars = new Array(numCars);
  parents = new Array(numParents);
  for(var i = 0; i < cars.length; i++) {
    cars[i] = new Car();
    cars[i].spawn();
  }
  
  outOfBoundsColor = color(222, 187, 142);
  
  mutationChanceButton = createInput(mutationChance);
  mutationWeightButton = createInput(mutationWeight);
  completeMutationChanceButton = createInput(completeMutationChance);
}

function draw() {
    //grid.draw();
    background(outOfBoundsColor);
    track.drawVerticies();
    for(var i = 0; i < cars.length; i++) {
      if(cars[i].alive > 0) {
        cars[i].move();
      }
      cars[i].draw();
    }
    if((frameCount - frameOffSet) % (trialSpeed*fr) == 0) {
      next();
    }
    fill(0);
    noStroke();
    text("Generation: " + generation, 10, height-8);
    mutationChance = parseFloat(mutationChanceButton.value());
    mutationWeight = parseFloat(mutationWeightButton.value());
    completeMutationChance = parseFloat(completeMutationChanceButton.value());
    text("Mutation Chance: " + mutationChance.toFixed(3), 10, height-24);
    text("Mutation Weight: " + mutationWeight.toFixed(3), 10, height-40);
    text("Overriding Mutation Chance: " + completeMutationChance.toFixed(3), 10, height-56);
    
    drawGraph(recordFitness, color(250, 5, 5));
    drawGraph(averageFitness, color(5, 220, 20));
    stroke(0);
}

function next() {
  frameOffSet = frameCount;
  if(!reverse && changeTracks) {
    track.generate();
  }
  reverse = !reverse;
  for(i = 0; i < cars.length; i++) {
    cars[i].spawn();
  }
  if(!reverse) {
    trial++;
  }
  if(trial >= numTrials) {
    quickSortCars();
    recordFitness.push(cars[cars.length - 1].getFitness());
    var avg = 0;
    for(i = 0; i < cars.length; i++) {
      avg += cars[i].getFitness();
    }
    averageFitness.push(avg / cars.length);
    generation++;
    mateCars();
    trial = 0;
  }
      
}

function drawGraph(arr, col) {
  stroke(col);
  strokeWeight(1);
  for(var i = 1; i < arr.length; i++) {
    line((i * width) / arr.length, height - (arr[i]/5), ((i-1) * width) / arr.length, height - (arr[i-1]/5));
  }
}

function quickSortCars(low=0, high=cars.length - 1) {
  if(low >= high) {
    return;
  }
  var i = partition(low, high);

  quickSortCars(low, i - 1);
  quickSortCars(i + 1, high);
}
function partition(low, high) {
  var pivot = cars[high].getFitness();  
  var tempCar;
  var i = low - 1;

  for(var j = low; j < high; j++) {
      if(cars[j].getFitness() < pivot) {
          i++;
          tempCar = cars[i];
          cars[i] = cars[j];
          cars[j] = tempCar;
      }
  }
  i++;
  tempCar = cars[i];
  cars[i] = cars[high];
  cars[high] = tempCar;
  return i;
}

function mateCars() {
  var index1, index2;
  console.log("\nGeneration " + generation + "");
  console.log("-");
  for(i = cars.length - numParents; i < cars.length; i++) {
    console.log(cars[i].name + ": " + parseFloat(cars[i].getFitness()).toFixed(2));
    console.log("    " + cars[i].numChildren + " children");
  }
  for(var i = numRandomCars; i < cars.length - numParents; i++) {
    index1 = cars.length - numParents + Math.floor(Math.random()*numParents);
    index2 = cars.length - numParents + Math.floor(Math.random()*numParents);
    cars[index1].numChildren++;
    cars[i].mutate(cars[index1], cars[index2]);
  }
  for(i = 0; i < numRandomCars; i++) {
    cars[i] = new Car();
  }
}



function keyPressed() {
  switch(key.toLowerCase()) {
    case 'd':
      selected = (selected + 1) % (cars.length - 1);
      break;
    case 'a':
      selected = (selected - 1) % (cars.length - 1);
      break;
    case 'n':
      next();
      break;
  }
}

function mousePressed() {
  for(var i = 0; i < cars.length; i++) {
    if(dist(cars[i].x, cars[i].y, mouseX, mouseY) < 10) {
      selected = i;
    }
  }
}
