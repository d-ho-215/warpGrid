class NoiseField {
  constructor (scale, xOff=0, yOff=0, zOff=0) {
    this.scale = scale;
    this.xOff = xOff;
    this.yOff = yOff;
    this.zOff = zOff;
  }
  
  value(x,y,z) {
    return noise((x+this.xOff)/this.scale, 
                 (y+this.yOff)/this.scale, 
                 (z+this.zOff)/this.scale);
  }
  
  dir(x,y,z) {
    let v = this.value(x,y,z);
    return (v * TWO_PI * 3)%TWO_PI;
  }
}