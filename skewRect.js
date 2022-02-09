/* warpGrid: generative art by @d_ho__ / @d_ho__codes
 * built using p5.js
 * intial development Nov 2021, developed for fxhash Jan / Feb 2022
 * NFT 2.0 license
 */

class SkewRect {
    constructor(center, nomSize, subDepth = 0) {
        this.center = center; //vector positions, generally
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
        this.insetAmt = 0.006667;
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
            let debugDepth;
            switch (this.subDepth) {
                case 0:
                    debugDepth = subdivisionStats.L0
                    break;
                case 1:
                    debugDepth = subdivisionStats.L1
                    break;
                case 2:
                    debugDepth = subdivisionStats.L2
                    break;
                case 3:
                    debugDepth = subdivisionStats.L3
                    break;
                case 4:
                    debugDepth = subdivisionStats.L4
                    break;
            }
            let addFactor = this.subDepth * 0.05
            let subValue = this.subDivField.value(this.center.x, this.center.y, 0) - addFactor
            if (subValue >= 0.45 && subValue < 0.55) {
                this.sub2();
                this.divided = true;
                debugDepth.sub2 += 1;
            }
            if (subValue >= 0.55) {
                this.sub3();
                this.divided = true;
                debugDepth.sub3 += 1;
            }
            for (let rect of this.subRects) {
                rect.subdivide();
            }
        }
    }
  
  sub2() {
    for (let i = -1; i < 2; i+=2) {
      for (let j = -1; j < 2; j+=2) {
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
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
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
      .setMag(this.magField.value(pt.x, pt.y,0) * maxWarp)
      .setHeading(this.dirField.dir(pt.x, pt.y,0));
  }
  
  setColor () {
    if (this.divided) {
      for (let rect of this.subRects) {
        rect.setColor();        
      }
    } else {
        let colValue = this.colorField.value(this.center.x, this.center.y, 0); // value from 0 to 1
        let randoColor = false;
        if (fxrand() > 0.9) {
            colValue = fxrand();
            randoColor = true;
        }
        if (colValue < colorFieldMin) { colValue = colorFieldMin };
        if (colValue > colorFieldMax) { colValue = colorFieldMax };
        let colIndexRaw = map(colValue, colorFieldMin, colorFieldMax, 0, feat_palette.length - 1);
        let colIndex = Math.floor(colIndexRaw);
        let colorLerped = false;
        if (fxrand() > 0.3 && !randoColor) {
            if (colIndexRaw % 1 < 0.15 && colIndexRaw > 1) {
                let c1 = color(feat_palette[colIndex]);
                let c2 = color(feat_palette[colIndex - 1]);
                let lpc = lerpColor(c1, c2, 0.5);
                this.color = lpc;
                colorLerped = true;
            } else if (colIndexRaw % 1 > 0.85 && colIndexRaw < feat_palette.length - 1) {
                let c1 = color(feat_palette[colIndex]);
                let c2 = color(feat_palette[colIndex + 1]);
                let lpc = lerpColor(c1, c2, 0.5);
                this.color = lpc;
                colorLerped = true;
            }
        }
        if (!colorLerped) {
            this.color = color(feat_palette[colIndex])
        };
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

          let subDepthInset = this.insetAmt - (this.subDepth * 0.001875);
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

        if (feat_bg == "light") {
            this.g_stroke.stroke(0, 200);
        } else {
            this.g_stroke.stroke(255, 200);
        }

        if (this.subDepth < 2) {
            this.g_stroke.strokeWeight(2);
        } else if (this.subDepth < 3) {
            this.g_stroke.strokeWeight(1.5);
        } else {
            this.g_stroke.strokeWeight(0.75);
        } 

        if (this.subDepth == 2) {
        //if (feat_blur && this.subDepth == 2) {
            //this.g_stroke.strokeWeight(0);
            if (feat_bg == "light") {
                this.g_stroke.stroke(0, 140)
            } else {
                this.g_stroke.stroke(255, 120)
            }
        } else if (this.subDepth >= 3) {
        //} else if (feat_blur && this.subDepth >= 3) {
            //this.g_stroke.strokeWeight(0);
            if (feat_bg == "light") {
                this.g_stroke.stroke(0, 60)
            } else {
                this.g_stroke.stroke(255, 40)
            }
        }
        
    if (this.divided) {
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
            let p1a = p5.Vector.lerp(this.p1, this.p2, feat_lerpAmt)
            let p1b = p5.Vector.lerp(this.p1, this.p2, 0.5)
            let p1c = p5.Vector.lerp(this.p1, this.p2, 1 - feat_lerpAmt)
            let p2a = p5.Vector.lerp(this.p2, this.p3, feat_lerpAmt)
            let p2b = p5.Vector.lerp(this.p2, this.p3, 0.5)
            let p2c = p5.Vector.lerp(this.p2, this.p3, 1 - feat_lerpAmt)
            let p3a = p5.Vector.lerp(this.p3, this.p4, feat_lerpAmt)
            let p3b = p5.Vector.lerp(this.p3, this.p4, 0.5)
            let p3c = p5.Vector.lerp(this.p3, this.p4, 1 - feat_lerpAmt)
            let p4a = p5.Vector.lerp(this.p4, this.p1, feat_lerpAmt)
            let p4b = p5.Vector.lerp(this.p4, this.p1, 0.5)
            let p4c = p5.Vector.lerp(this.p4, this.p1, 1 - feat_lerpAmt)

            this.g_shapes.beginShape();
            vertex(p1b.x * size, p1b.y * size)
            bezierVertex(p1c.x * size, p1c.y * size, p2a.x * size, p2a.y * size, p2b.x * size, p2b.y * size)
            bezierVertex(p2c.x * size, p2c.y * size, p3a.x * size, p3a.y * size, p3b.x * size, p3b.y * size)
            bezierVertex(p3c.x * size, p3c.y * size, p4a.x * size, p4a.y * size, p4b.x * size, p4b.y * size)
            bezierVertex(p4c.x * size, p4c.y * size, p1a.x * size, p1a.y * size, p1b.x * size, p1b.y * size)
            this.g_shapes.endShape();

            this.g_stroke.beginShape();
            vertex(p1b.x * size, p1b.y * size)
            bezierVertex(p1c.x * size, p1c.y * size, p2a.x * size, p2a.y * size, p2b.x * size, p2b.y * size)
            bezierVertex(p2c.x * size, p2c.y * size, p3a.x * size, p3a.y * size, p3b.x * size, p3b.y * size)
            bezierVertex(p3c.x * size, p3c.y * size, p4a.x * size, p4a.y * size, p4b.x * size, p4b.y * size)
            bezierVertex(p4c.x * size, p4c.y * size, p1a.x * size, p1a.y * size, p1b.x * size, p1b.y * size)
            this.g_stroke.endShape();

        } else {
            this.g_stroke.beginShape();
            this.g_shapes.beginShape();
            vertex(this.p1.x * size, this.p1.y * size);
            vertex(this.p2.x * size, this.p2.y * size);
            vertex(this.p3.x * size, this.p3.y * size);
            vertex(this.p4.x * size, this.p4.y * size);
            this.g_shapes.endShape(CLOSE);
            this.g_stroke.endShape(CLOSE);
        }

        noFill();

    }

  }
}