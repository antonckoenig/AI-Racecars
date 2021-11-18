let mutationChance = 0.25;
let completeMutationChance = 0.1;
let mutationWeight = 0.1;
class NeuralNet {
  constructor(car, numInputs, numHiddenLayers, hiddenLayerSize, numOutputs) {
    this.car = car;
    this.inputs = new Array(numInputs);
    this.layers = new Array(numHiddenLayers + 1);
    for(var i = 0; i < numHiddenLayers; i++) {
      this.layers[i] = new Array(hiddenLayerSize);
    }
    this.layers[numHiddenLayers] = new Array(numOutputs);
  }
  mutate(net, net2) {
    for(var j = 0; j < this.layers[0].length; j++) {
        this.layers[0][j].mutate(net.layers[0][j], net2.layers[0][j]);
    }
    for(var i = 1; i < this.layers.length; i++) { 
      for(j = 0; j < this.layers[i].length; j++) {
        this.layers[i][j].mutate(net.layers[i][j], net2.layers[i][j]);
      }
    }
  }
  generate() {
    for(var j = 0; j < this.layers[0].length; j++) {
        this.layers[0][j] = new Perceptron(this.inputs.length, Math.random()-0.5);
        this.layers[0][j].generate();
    }
    for(var i = 1; i < this.layers.length; i++) { 
      for(j = 0; j < this.layers[i].length; j++) {
        this.layers[i][j] = new Perceptron(this.layers[i-1].length, Math.random()-0.5);
        this.layers[i][j].generate();
      }
    }
  }
  predict(inputs) {
    this.inputs = inputs;
    this.propagateForward(inputs, this.layers[0]);
    for(var i = 1; i < this.layers.length; i++) { 
       this.propagateForward(this.layers[i-1], this.layers[i]);
    }
  }
  draw(x=10, y=20, scale=2) {
    strokeWeight(1);
    textSize(6*scale);
    stroke(0);
    for(var j = 0; j < this.inputs.length; j++) {
      fill(0, 200, 0);
      circle((4)*scale + x, j*16*scale + y, 12*scale);
      fill(255);
      text(parseFloat(this.inputs[j]).toFixed(2), (-2)*scale + x, (j*16+2)*scale + y);
    }
    for(var i = 0; i < this.layers.length; i++) { 
      for(j = 0; j < this.layers[i].length; j++) {
        fill(0, 0, 240);
        if(i == this.layers.length - 1) {
          fill(200, 0, 0);
        }
        circle((20+i*16)*scale + x, j*16*scale + y, 12*scale);
        fill(255);
        text(parseFloat(this.layers[i][j].getValue()).toFixed(2), (14+i*16)*scale + x, (j*16+2)*scale + y);
      }
    }
  }
  propagateForward(layer1, layer2) {
    for(var i = 0; i < layer2.length; i++) {
      layer2[i].setInputs(layer1);
      layer2[i].propagate();
    }
    return layer2;
  }
  getOutputs(index) {
    return this.layers[this.layers.length - 1][index].getValue();
  }
}

class Perceptron {
  constructor(numInputs, bias=0) {
    this.inputs = new Array(numInputs);
    this.weights = new Array(numInputs);
    this.bias = bias;
  }
  generate() {
    for(var i = 0; i < this.inputs.length; i++) {
      this.weights[i] = Math.random()*2 - 1;
    }
  }
  mutate(perceptron1, perceptron2) {
    if(Math.random() < completeMutationChance) {
      this.bias = Math.random() - 0.5;
    }
    else {
      if(Math.random() >= 0.5) {
        this.bias = perceptron1.bias;
      } else {
        this.bias = perceptron2.bias;
      }
      if(Math.random() < mutationChance) {
        this.bias += (Math.random()*2 - 1)*mutationWeight;
      }
    }
    for(var i = 0; i < this.inputs.length; i++) {
      if(Math.random() < completeMutationChance) {
        this.weights[i] = Math.random()*2 - 1;
      }
      else {        
        if(Math.random() >= 0.5) {
          this.weights[i] = perceptron1.weights[i];
        }
        else {
          this.weights[i] = perceptron2.weights[i];
        }
        if(Math.random() < mutationChance) {
          this.weights[i] += (Math.random()*2 - 1)*mutationWeight;
        }
      }
    }
  }
  propagate() {
    this.value = this.activate(dotProduct(this.weights, this.inputs));
    return this.value;
  }
  activate(val) {
    return sigmoid(val) + this.bias;
  }
  getValue() {
    return this.value;
  }
  setInputs(inputs) {
    if(typeof inputs[0] === "object") {
      for(var i = 0; i < inputs.length; i++) {
        this.inputs[i] = inputs[i].getValue();
      }
    } else {
      this.inputs = inputs;
    }
  }
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}
//https://stackoverflow.com/questions/64816766/dot-product-of-two-arrays-in-javascript
function dotProduct(a,b){
  const result = a.reduce((acc, cur, index)=>{
    acc += (cur * b[index]);
    return acc;
  }, 0);
  return result;
}
