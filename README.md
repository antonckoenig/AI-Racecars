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
