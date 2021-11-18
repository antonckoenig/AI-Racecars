class Track {
  constructor(numVerticies, vectorLengthBounds, vectorAngleBound, tightness=0) {
    this.verticies = new Array(numVerticies);
    // length bounds stored as a fraction < 1 and > 0
    this.vectorLengthBounds = vectorLengthBounds;
    this.vectorAngleBound = vectorAngleBound;
    this.tightness = tightness;
    
  }
  generate() {
    var angleIncrement = (2*PI)/(this.verticies.length);
    for(var i = 0; i < this.verticies.length; i++) {
      // calculate center angle;
      var angle = i * angleIncrement + (Math.random()*this.vectorAngleBound-this.vectorAngleBound/2)*angleIncrement/2;
      if(i == 0) {
        angle = i*angleIncrement;
      }
      var distance = Math.min(this.vectorLengthBounds[1], Math.max(this.vectorLengthBounds[0], Math.random()));
      this.verticies[i] = [Math.round(Math.cos(angle)*distance*width/2+width/2), Math.round(Math.sin(angle)*distance*height/2+height/2)];
    }
  }
  drawVerticies(measureFitness = false) {
    
    document.getElementById('defaultCanvas0').getContext('2d').setLineDash([]);
    beginShape();
    strokeCap(SQUARE);
    strokeWeight(76);
    stroke(255);
    noFill();
    for(i = 0; i < this.verticies.length; i++) {
      v = this.verticies[i];
      curveVertex(v[0], v[1]);  
    }
    for(i = 0; i < Math.min(this.verticies.length, 3); i++) {
      v = this.verticies[i];
      curveVertex(v[0], v[1]);
    }
    endShape();
    
    document.getElementById('defaultCanvas0').getContext('2d').setLineDash([15, 15]);
    beginShape();
    stroke(255, 60, 60);
    noFill();
    for(i = 0; i < this.verticies.length; i++) {
      v = this.verticies[i];
      curveVertex(v[0], v[1]);  
    }
    for(i = 0; i < Math.min(this.verticies.length, 3); i++) {
      v = this.verticies[i];
      curveVertex(v[0], v[1]);
    }
    endShape();
    
    beginShape();
    document.getElementById('defaultCanvas0').getContext('2d').setLineDash([]);
    strokeCap(ROUND);
    curveTightness(this.tightness);
    strokeWeight(70);
    stroke(90, 95, 110);
    var v;
    noFill();
    for(var i = 0; i < this.verticies.length; i++) {
      v = this.verticies[i];
      curveVertex(v[0], v[1]);  
    }
    for(var i = 0; i < Math.min(this.verticies.length, 3); i++) {
      v = this.verticies[i];
      curveVertex(v[0], v[1]);
    }
    endShape();
    
    document.getElementById('defaultCanvas0').getContext('2d').setLineDash([10, 15]);
    strokeCap(SQUARE);
    beginShape();
    strokeWeight(2);
    stroke(255);
    noFill();
    for(i = 0; i < this.verticies.length; i++) {
      v = this.verticies[i];
      curveVertex(v[0], v[1]);  
    }
    for(i = 0; i < Math.min(this.verticies.length, 3); i++) {
      v = this.verticies[i];
      curveVertex(v[0], v[1]);
    }
    endShape();
    
    
    strokeCap(ROUND);
    document.getElementById('defaultCanvas0').getContext('2d').setLineDash([]);
    
    
    
    if(measureFitness) {
      for(var i = 0; i < this.verticies.length; i++) {
        v = this.verticies[i];
        //line(width/2, height/2, v[0], v[1], 5); 
        stroke(i*20);
        strokeWeight(160);
        line(v[0], v[1], this.verticies[(i + 1) % (this.verticies.length)][0], this.verticies[(i + 1) % (this.verticies.length)][1]);
      }
    }
    strokeWeight(1);
  }
}
