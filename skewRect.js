class SkewRect {
    constructor(center, nomSize, subDepth = 0) {
        this.center = center; //vector position
        this.nomSize = nomSize;
        this.half = nomSize/2;
        this.magFactor = 4;
        //nominal corner points -- used to evaluate positions in noise field for offsets
        this.nP1 = this.center.copy().add(-this.half, -this.half,0);
        this.nP2 = this.center.copy().add(this.half,-this.half,0);
        this.nP3 = this.center.copy().add(this.half, this.half,0);
        this.nP4 = this.center.copy().add(-this.half,this.half,0);
        //actual corner points -- initially same as nominal points, will be modified later
        this.p1 = createVector();
        this.p2 = createVector();
        this.p3 = createVector();
        this.p4 = createVector();
        this.cp = createVector();
        this.color = color(0,0,100,0);
        this.divided = false;
        this.subRects = [];
        this.subDepth = subDepth;
        this.dirField = null;
        this.magField = null;
        this.colorField = null;
        this.subDivField = null;
        this.insetAmt = 8;
        this.g_shapes = null;
        this.g_stroke = null;
  }

    setFields(dirField, magField, colorField, subDivField) {
        this.dirField = dirField;
        this.magField = magField;
        this.colorField = colorField;
        this.subDivField = subDivField;
  }
  
  subdivide() {
    if (this.subDepth < 3) {
      let subValue = this.subDivField.value(this.center.x, this.center.y, 0)
      if (subValue >= 0.45 && subValue < 0.7) {
        // console.log('sub2');
        this.color = color("red");
        this.sub2();
        this.divided = true;
      }
      if (subValue >= 0.7)  {
        // console.log('sub3');
        this.color = color("blue");
        this.sub3();
        this.divided = true;
      }
      for (let rect of this.subRects) {
        rect.subdivide();
      }
    }
    
    //for (let rect of subRects) {
    //  rect.subdivide();
    //}
  }
  
  sub2() {
    // console.log("sub2 called");
    for (let i = -1; i < 2; i+=2) {
      for (let j = -1; j < 2; j+=2) {
        //console.log(i,j)
        let newSize = this.nomSize/2
        let quarterSize = this.nomSize/4
        let newCenter = this.center.copy().add(i*quarterSize,j*quarterSize);
        let sub = new SkewRect(newCenter, newSize, this.subDepth + 1);
        sub.setFields(this.dirField, this.magField, this.colorField, this.subDivField);
        this.subRects.push(sub);
      }
    }
  }
  
  sub3() {
    // console.log("sub3 called")
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        //console.log(i,j)
        let newSize = this.nomSize/3
        let newCenter = this.center.copy().add(i*newSize,j*newSize);
        let sub = new SkewRect(newCenter, newSize, this.subDepth + 1);
        sub.setFields(this.dirField, this.magField, this.colorField, this.subDivField);
        this.subRects.push(sub);
      }
    }
  }
  
  getCornerVector(pt) {
    return createVector(1,1,0)
      // .setMag(this.magField.value(pt.x, pt.y,0) * this.nomSize/this.magFactor)
      .setMag(this.magField.value(pt.x, pt.y,0) * MAXWARP)
      .setHeading(this.dirField.dir(pt.x, pt.y,0));
  }
  
  setColor () {
    if (this.divided) {
      for (let rect of this.subRects) {
        rect.setColor();        
      }
    } else {
        //let colAngle = this.colorField.value(this.center.x, this.center.y, 0) * PI - 0.4 // value from 0 to 1
        let colValue = this.colorField.value(this.center.x, this.center.y, 0); // value from 0 to 1
        let randoColor = false;
        if (fxrand() > 0.9) {
            colValue = fxrand();
            randoColor = true;
        }
        if (colValue < colorFieldMin) { colValue = colorFieldMin };
        if (colValue > colorFieldMax) { colValue = colorFieldMax };
        //let colIndex = Math.floor(colValue * numColors)
        let colIndexRaw = map(colValue, colorFieldMin, colorFieldMax, 0, palette.length - 1);
        let colIndex = Math.floor(colIndexRaw);
        //if (fxrand() > 0.3 && !randoColor) {
        //    if (colIndexRaw % 1 < 0.15 && colIndexRaw > 1) {
        //        colIndex -= 1
        //    } else if (colIndexRaw % 1 > 0.85 && colIndexRaw < palette.length-1) {
        //        colIndex += 1
        //    }
        //}
        let colorLerped = false;
        if (fxrand() > 0.3 && !randoColor) {
            if (colIndexRaw % 1 < 0.15 && colIndexRaw > 1) {
                let c1 = color(palette[colIndex]);
                let c2 = color(palette[colIndex - 1]);
                let lpc = lerpColor(c1, c2, 0.5);
                this.color = lpc;
                colorLerped = true;
            } else if (colIndexRaw % 1 > 0.85 && colIndexRaw < palette.length - 1) {
                let c1 = color(palette[colIndex]);
                let c2 = color(palette[colIndex + 1]);
                let lpc = lerpColor(c1, c2, 0.5);
                this.color = lpc;
                colorLerped = true;
            }
        }
        if (!colorLerped) {
            this.color = color(palette[colIndex])
        };

        //console.log(colValue);
        //console.log(colIndex);
        //console.log(palette[colIndex]);
        //console.log("assign: "+ color(palette[colIndex]));
        //console.log(this.color);
    }
  }
  
  setCorners () {
    let p1v = this.getCornerVector(this.nP1,this.dirField, this.magField);
    let p2v = this.getCornerVector(this.nP2,this.dirField, this.magField);
    let p3v = this.getCornerVector(this.nP3,this.dirField, this.magField);
    let p4v = this.getCornerVector(this.nP4,this.dirField, this.magField);
    
    this.p1 = this.nP1.copy();
    this.p2 = this.nP2.copy();
    this.p3 = this.nP3.copy();
    this.p4 = this.nP4.copy();
    
    this.p1.add(p1v);
    this.p2.add(p2v);
    this.p3.add(p3v);
      this.p4.add(p4v);

      if (feat_inset) {
          this.cp.add(this.p1).add(this.p2).add(this.p3).add(this.p4).div(4);

          let subDepthInset = this.insetAmt - (this.subDepth * 2.25);
          if (feat_oversized) { subDepthInset = -subDepthInset };
          let p1inset = p5.Vector.sub(this.cp, this.p1).setMag(subDepthInset);
          let p2inset = p5.Vector.sub(this.cp, this.p2).setMag(subDepthInset);
          let p3inset = p5.Vector.sub(this.cp, this.p3).setMag(subDepthInset);
          let p4inset = p5.Vector.sub(this.cp, this.p4).setMag(subDepthInset);

          this.p1.add(p1inset);
          this.p2.add(p2inset);
          this.p3.add(p3inset);
          this.p4.add(p4inset);
      }
  }
  
    show() {
        switch (this.subDepth) {
            case 0:
                this.g_shapes = g_shapes_0;
                this.g_stroke = g_stroke_0;
                break;
            case 1:
                this.g_shapes = g_shapes_1;
                this.g_stroke = g_stroke_1;
                break;
            case 2:
                this.g_shapes = g_shapes_2;
                this.g_stroke = g_stroke_2;
                break;
            case 3:
                this.g_shapes = g_shapes_3;
                this.g_stroke = g_stroke_3;
                break;
        }
        this.g_shapes.noStroke();
        this.g_stroke.noFill();
        if (feat_stroke) {
            if (feat_bg == "light") {
                this.g_stroke.stroke(0, 128);
            } else {
                this.g_stroke.stroke(255, 128);
            }

            if (this.subDepth < 2) {
                this.g_stroke.strokeWeight(2);
            } else if (this.subDepth < 3) {
                this.g_stroke.strokeWeight(1.5);
            } else {
                this.g_stroke.strokeWeight(0.75);
            }
        } else {
            this.g_stroke.noStroke();
        }

        if (feat_stroke && feat_blur && this.subDepth >= 3) {
            this.g_stroke.strokeWeight(0);
        }
        
    if (this.divided) {
      // console.log("divided")
      for (let rect of this.subRects) {
        rect.setCorners();
        rect.show();
      
      }
    } else {
        if (this.subDepth == 0) {
            this.setCorners()
        }
      if (this.color) {
        this.g_shapes.fill(this.color);
      }

        if (feat_rounded) {
            let p1a = p5.Vector.lerp(this.p1, this.p2, lerpAmt)
            let p1b = p5.Vector.lerp(this.p1, this.p2, 0.5)
            let p1c = p5.Vector.lerp(this.p1, this.p2, 1 - lerpAmt)
            let p2a = p5.Vector.lerp(this.p2, this.p3, lerpAmt)
            let p2b = p5.Vector.lerp(this.p2, this.p3, 0.5)
            let p2c = p5.Vector.lerp(this.p2, this.p3, 1 - lerpAmt)
            let p3a = p5.Vector.lerp(this.p3, this.p4, lerpAmt)
            let p3b = p5.Vector.lerp(this.p3, this.p4, 0.5)
            let p3c = p5.Vector.lerp(this.p3, this.p4, 1 - lerpAmt)
            let p4a = p5.Vector.lerp(this.p4, this.p1, lerpAmt)
            let p4b = p5.Vector.lerp(this.p4, this.p1, 0.5)
            let p4c = p5.Vector.lerp(this.p4, this.p1, 1 - lerpAmt)

            this.g_shapes.beginShape();
            vertex(p1b.x, p1b.y)
            bezierVertex(p1c.x, p1c.y, p2a.x, p2a.y, p2b.x, p2b.y)
            bezierVertex(p2c.x, p2c.y, p3a.x, p3a.y, p3b.x, p3b.y)
            bezierVertex(p3c.x, p3c.y, p4a.x, p4a.y, p4b.x, p4b.y)
            bezierVertex(p4c.x, p4c.y, p1a.x, p1a.y, p1b.x, p1b.y)
            this.g_shapes.endShape();

            this.g_stroke.beginShape();
            vertex(p1b.x, p1b.y)
            bezierVertex(p1c.x, p1c.y, p2a.x, p2a.y, p2b.x, p2b.y)
            bezierVertex(p2c.x, p2c.y, p3a.x, p3a.y, p3b.x, p3b.y)
            bezierVertex(p3c.x, p3c.y, p4a.x, p4a.y, p4b.x, p4b.y)
            bezierVertex(p4c.x, p4c.y, p1a.x, p1a.y, p1b.x, p1b.y)
            this.g_stroke.endShape();

        } else {
            this.g_stroke.beginShape();
            this.g_shapes.beginShape();
            vertex(this.p1.x, this.p1.y);
            vertex(this.p2.x, this.p2.y);
            vertex(this.p3.x, this.p3.y);
            vertex(this.p4.x, this.p4.y);
            this.g_shapes.endShape(CLOSE);
            this.g_stroke.endShape(CLOSE);
        }
      // ellipse(this.nP1.x, this.nP1.y,2);
      // ellipse(this.nP2.x, this.nP2.y,2);
      // ellipse(this.nP3.x, this.nP3.y,2);
      // ellipse(this.nP4.x, this.nP4.y,2);
        noFill();
/*        strokeWeight(1);
        stroke("black");
        ellipse(this.cp.x, this.cp.y, 10, 10);
        noStroke();*/

    }

  }
}