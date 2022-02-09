/* warpGrid: generative art by @d_ho__ / @d_ho__codes
 * built using p5.js 
 * intial development Nov 2021, developed for fxhash Jan / Feb 2022
 * NFT 2.0 license
 */

let subdivisionStats = {
    L0: { sub2: 0, sub3: 0 },
    L1: { sub2: 0, sub3: 0 },
    L2: { sub2: 0, sub3: 0 },
    L3: { sub2: 0, sub3: 0 }
}

p5.disableFriendlyErrors = true;

console.log("fxhash: " + fxhash);

let colorPalettes = {
    autumnRust: ["#242625", "#add1f7", "#616a59", "#8e5e48", "#c77c00", "#bf9481", "#dda734", "#f2bd45"],
    glassSky:["#2f5188", "#476ea7", "#6a93d1", "#5f89bb", "#b7c9e1"],
    lakeSky: ["#edf1fc", "#c0d2ea", "#a6afc0", "#6f7b8b", "#667c99", "#56676f", "#39484d"],
    granite: ["#f9c544","#32231b", "#494a4f", "#5d5958", "#777d81", "#9ea9af", "#c4cacd", "#cecdd2", "#edecec", "#7f917b"],
    rockBeach: ["#383f38", "#3c4645", "#b88776", "#b29a95", "#d7c5bf", "#b7b6b1", "#d4d8d9"],
    diggerTruck: ["#323034", "#4f453d", "#71604c", "#948d85", "#dd9b44", "#cb904f", "#b48653", "#916e44", "#5e6e6e"],
    redBlue: ["#053c5e", "#1d3958", "#353652", "#4c334d", "#643047", "#7c2e41", "#942b3b", "#ab2836", "#c32530", "#db222a"],
    rainbow: ["#d83030", "#f09018", "#ffd800", "#a8c060", "#30a8c0", "#6048a8"],
    eclipse: ["#0d090b", "#616c70", "#8a3518", "#f0771f", "#fcd951"],
    grayscale: ["#f8f9fa", "#e9ecef", "#dee2e6", "#ced4da", "#adb5bd", "#6c757d", "#495057", "#343a40", "#212529"],
    frogPond: ["#fdff56", "#99cc33", "#649b40", "#5c7531", "#445f4c", "#706925", "#a18d68", "#d9c1a5"]
};

let paletteNames = ["autumnRust", "glassSky", "lakeSky", "granite", "rockBeach", "diggerTruck", "redBlue", "rainbow", "eclipse", "grayscale", "frogPond"]

let textures = ["lightHatch", "striated", "dots", "flowfield", "pointilist"]

let g_shapes_0;
let g_shapes_1;
let g_shapes_2;
let g_shapes_3;
let g_shapes_all;
let g_shapes_upper;

let g_stroke_0;
let g_stroke_1;
let g_stroke_2;
let g_stroke_3;
let g_stroke_all;

let g_invert;

let g_texture;
let g_blur;

let g_final;

let cnv;

//randomization of features
let feat_paletteName = paletteNames[Math.floor(fxrand() * paletteNames.length)];
let feat_palette = colorPalettes[feat_paletteName];
let feat_gridSize = Math.floor(fxrand() * 18) + 3;
if (feat_gridSize > 16) {
    if (fxrand() > 0.4) {
        console.log("gridSize reduced. orig: " + feat_gridSize)
        feat_gridSize = feat_gridSize - (Math.floor(fxrand() * 9));
        console.log("new gridSize: " + feat_gridSize)
    }
}
let feat_rounded = fxrand() > 0.25 ? true: false;
let feat_oversized = fxrand() > 0.85 ? true: false;
let feat_inset = fxrand() > 0.55 ? true : false;
if (feat_inset == false) {
    feat_oversized = false
}
let feat_stroke = fxrand() > 0.75 ? true : false;
let feat_blur = fxrand() > 0.66 ? true : false;
let feat_border = fxrand() > 0.25 ? true : false;
let feat_borderSize = 0.03;
let feat_fullBleed = 1;
let feat_bg = fxrand() > 0.66 ? "light" : "dark";
if (feat_bg == "light" && ! feat_stroke) {
    feat_blur = true;
}
let feat_useTexture = fxrand() > 0.55;
let feat_texture = "none";
let feat_lerpAmt = ((fxrand() * 0.225) + 0.005).toFixed(2);

if (feat_bg == "light" && fxrand() > 0.25) {
    feat_blur = true;
}
if (feat_oversized) {
    feat_stroke = false;
    feat_blur = false;
    feat_useTexture = false;
}


if (feat_useTexture) {
    feat_texture = textures[Math.floor(fxrand() * textures.length)]
    if (feat_texture == "pointilist" && fxrand() > 0.4) {
        feat_texture = "none";
        feat_useTexture = false;
        //console.log("----- pointilist denied -----")
    } else if ( feat_texture == "pointilist" && feat_gridSize > 15){
        feat_texture = "none";
        feat_usetexture = false;
    } else if (feat_texture == "pointilist") {
        feat_blur = false;
        feat_stroke = false;
    }
}



if (feat_border) {
    feat_borderSize = 0.06;
    feat_fullBleed = 0;
};

//end features

//canvas and additional variables
let numColors = feat_palette.length;
let size = Math.min(window.innerWidth, window.innerHeight);
let quadSize;
let maxWarp = 0.02;

let dirField;
let magField;
let colorField;
let subDivField;

let colorFieldMin = 0.5;
let colorFieldMax = 0.5;

let quads = [];

let bgcolor;

let seed = (fxrand() * 1213) + (fxrand() * 7753)

function setup() {
    pixelDensity(1);


    if (feat_bg == "light") {
        bgcolor = color("#FFFDF9")
    } else {
        bgcolor = color(25);
    }

    quadSize = (1 - (feat_borderSize * 2)) / feat_gridSize;
    cnv = createCanvas(size, size);
    background(bgcolor);

    noiseSeed(seed);

    dirField = new NoiseField(0.2);
    magField = new NoiseField(0.2, z = 100);
    colorField = new NoiseField(0.2, z = 800);
    subDivField = new NoiseField(0.2, z = 300);

    g_shapes_0 = createGraphics(size, size);
    g_shapes_1 = createGraphics(size, size);
    g_shapes_2 = createGraphics(size, size);
    g_shapes_3 = createGraphics(size, size);
    g_shapes_all = createGraphics(size, size);
    g_shapes_upper = createGraphics(size, size);

    g_stroke_0 = createGraphics(size, size);
    g_stroke_1 = createGraphics(size, size);
    g_stroke_2 = createGraphics(size, size);
    g_stroke_3 = createGraphics(size, size);
    g_stroke_all = createGraphics(size, size);

    g_invert = createGraphics(size, size);
    g_invert.fill(0);
    g_invert.rect(0, 0, size, size);
    g_texture = createGraphics(size, size);
    g_blur = createGraphics(size, size);
    g_final = createGraphics(size, size);

    if (feat_useTexture) {
        switch (feat_texture) {
            case "lightHatch":
                for (x = 0; x < 1; x += 0.0008177) {
                    for (y = 0; y < 1; y += 0.0008177) {
                        if (fxrand() < 0.12) {
                            let lineColor = color(fxrand() * 100 + 50);
                            //let lineColor = color(0);
                            lineColor.setAlpha(50);
                            let lens = [3,4,5,6,7,8]
                            let len = lens[Math.floor(fxrand() * lens.length)]
                            g_texture.stroke(lineColor);
                            g_texture.line(x * size, y * size, x * size, y * size + len);
                        }
                    }
                }
                break;
            case "striated":
                for (x = 0; x < 1; x += 0.0008177) {
                    for (y = 0; y < 1; y += 0.0008177) {
                        if (fxrand() < 0.05) {
                            let lineColor = color(fxrand() * 100 + 50);
                            //let lineColor = color(0);
                            lineColor.setAlpha(40);
                            let lens = [2, 3, 4, 5, 6]
                            let len = lens[Math.floor(fxrand() * lens.length)]
                            g_texture.stroke(lineColor);
                            g_texture.line(x * size, y * size, x * size, y * size + (len* 10));
                        }
                    }
                }
                break;
            case "dots":
                for (x = 0; x < 1; x += 0.0008177) {
                    for (y = 0; y < 1; y += 0.0008177) {
                        if (fxrand() < 0.05) {
                            let lineColor = color(fxrand() * 100 + 50);
                            //let lineColor = color(0);
                            lineColor.setAlpha(40);
                            let lens = [2, 3, 4, 5, 6]
                            let len = lens[Math.floor(fxrand() * lens.length)]
                            g_texture.fill(lineColor);
                            g_texture.noStroke();
                            g_texture.ellipse(x * size, y * size, len);
                        }
                    }
                }
                break;
            case "flowfield":
                for (x = 0; x < 1; x += 0.0008177) {
                    for (y = 0; y < 1; y += 0.0008177) {
                        if (fxrand() < 0.07) {
                            let lineColor = color(fxrand() * 100 + 50);
                            let mag = magField.value(x, y, 0) * maxWarp;
                            let dir = createVector(mag, 0).setHeading(dirField.dir(x, y, 0));
                            let p1 = createVector(x, y)
                            let p2 = p1.copy().add(dir)
                            //let lineColor = color(0);
                            lineColor.setAlpha(80);
                            g_texture.stroke(lineColor);
                            g_texture.line(p1.x * size, p1.y * size, p2.x * size, p2.y * size);
                        }
                    }
                }
                break;
        }
    }


    for (let x = 0; x < 1; x += 0.01) {
        for (let y = 0; y < 1; y += 0.01) {
            let v = colorField.value(x, y, 0);
            if (v < colorFieldMin) {
                colorFieldMin = v
            }
            if (v > colorFieldMax) {
                colorFieldMax = v
            }
        }
    };


    for (let y = 0 - feat_fullBleed; y < feat_gridSize + feat_fullBleed; y++) {
        for (let x = 0 - feat_fullBleed; x < feat_gridSize + feat_fullBleed; x++) {
            let xC = (x * quadSize) + (quadSize / 2) + feat_borderSize;
            let yC = (y * quadSize) + (quadSize / 2) + feat_borderSize;
            let center = createVector(xC, yC);
            quads.push(new SkewRect(center, quadSize));
        }
    }

    for (let quad of quads) {
        quad.setFields(dirField, magField, colorField, subDivField);
        quad.subdivide();
    }
}

function draw() {
    for (let r of quads) {
        r.setColor(colorField);
        r.show();
    }
    colorMode(RGB);

    if (feat_stroke && ! feat_blur) {
        g_shapes_all.blend(g_shapes_0, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_stroke_0, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_shapes_1, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_stroke_1, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_shapes_2, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_stroke_2, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_shapes_3, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_stroke_3, 0, 0, size, size, 0, 0, size, size, NORMAL);

    } else if (feat_blur) {
        g_shapes_all.blend(g_shapes_0, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_shapes_1, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_shapes_2, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_shapes_3, 0, 0, size, size, 0, 0, size, size, NORMAL);

        g_shapes_upper.blend(g_shapes_1, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_upper.blend(g_shapes_2, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_upper.blend(g_shapes_3, 0, 0, size, size, 0, 0, size, size, NORMAL);

        g_stroke_0.loadPixels();
        g_shapes_upper.loadPixels();
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let i = (x + (y * size))*4;
                let r = i + 0;
                let g = i + 1;
                let b = i + 2;
                let a = i + 3;
                if (g_shapes_upper.pixels[a] > 0) {
                    g_stroke_0.pixels[a] = 0;
                }
            }
        }
        g_stroke_0.updatePixels();

        g_stroke_all.blend(g_stroke_0, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_stroke_all.blend(g_stroke_1, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_stroke_all.blend(g_stroke_2, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_stroke_all.blend(g_stroke_3, 0, 0, size, size, 0, 0, size, size, NORMAL);

        g_blur.blend(g_stroke_all, 0, 0, size, size, 0, 0, size, size, NORMAL)
        g_blur.filter(BLUR, 5)

    } else {
        g_shapes_all.blend(g_shapes_0, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_shapes_1, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_shapes_2, 0, 0, size, size, 0, 0, size, size, NORMAL);
        g_shapes_all.blend(g_shapes_3, 0, 0, size, size, 0, 0, size, size, NORMAL);
    }

    if (feat_texture == "pointilist") {
        g_texture.clear()
        g_shapes_all.loadPixels()
        for (x = 0; x < 1; x += 0.0011) {
            for (y = 0; y < 1; y += 0.0011) {
                if (fxrand() < 0.8) {
                    let sampleIndex = ((Math.floor(x * size) + (Math.floor(y * size)*g_shapes_all.width))) * 4;
                    let r = g_shapes_all.pixels[sampleIndex + 0];
                    let g = g_shapes_all.pixels[sampleIndex + 1];
                    let b = g_shapes_all.pixels[sampleIndex + 2];
                    let a = g_shapes_all.pixels[sampleIndex + 3];
                    if (a != 0) {
                        let sampleColor = color(r,g,b);
                        let opacity = fxrand() * 255;
                        sampleColor.setAlpha(opacity);
                        let dotSize = fxrand() * size / 300;
                        g_texture.stroke(sampleColor);
                        g_texture.strokeWeight(dotSize);
                        g_texture.point(x * size, y * size);
                    }
                }
            }
        }
        if (feat_blur) {
            image(g_stroke_all, 0, 0)
        }
        image(g_texture, 0, 0)
    } else {
        (g_masked_texture = g_texture.get()).mask(g_shapes_all);
        g_final.blend(g_shapes_all, 0, 0, size, size, 0, 0, size, size, NORMAL);
        if (feat_stroke) { g_final.blend(g_stroke_all, 0, 0, size, size, 0, 0, size, size, OVERLAY) };
        if (feat_blur) { g_final.blend(g_blur, 0, 0, size, size, 0, 0, size, size, OVERLAY) };
        g_final.blend(g_masked_texture, 0, 0, size, size, 0, 0, size, size, OVERLAY);

        image(g_final, 0, 0);
    }


    noLoop();
    fxpreview();

    console.log("---warpGrid complete, thanks for stopping by---")

}



function keyTyped() {
    if (key === 's') {
        saveCanvas("warpGrid", 'png')
    } else if (key === 'i') { //print feature settings to console for debugging / general info
        let debug_features = [
            "feat_paletteName: " + feat_paletteName,
            "feat_rounded: " + feat_rounded,
            "feat_oversized: " + feat_oversized,
            "feat_inset: " + feat_inset,
            "feat_stroke: " + feat_stroke,
            "feat_strokeBlur: " + feat_blur,
            "feat_border: " + feat_border,
            "feat_borderSize: " + feat_borderSize,
            "feat_fullBleed: " + feat_fullBleed,
            "feat_bg: " + feat_bg,
            "feat_useTexture: " + feat_useTexture,
            "feat_texture: " + feat_texture,
            "feat_lerpAmt: " + feat_lerpAmt
        ]

        for (let f of debug_features) {
            console.log(f);
        }
        console.log("subdivision stats: ")
        console.log(subdivisionStats)
    } else if (key === 't') { //save using timestamp
        let y = year();
        let m = month();
        let d = day();
        let h = hour();
        let mn = minute();
        let sc = second();
        let datetimearray = [y, m, d, h, mn, sc]
        let datestamp = datetimearray.join('-')
        saveCanvas(datestamp, 'png')
    } else if (key === 'h') { //save using hash
        saveCanvas("warpGrid_" + fxhash, 'png')
    }
}

//fxhash features
let fxfeat_canvas = (feat_border) ? "border" : "full frame";
let fxfeat_gridSize
if (feat_gridSize <= 4) {
    fxfeat_gridSize = "jumbo"
} else if (feat_gridSize <= 8) {
    fxfeat_gridSize = "large"
} else if (feat_gridSize <= 14) {
    fxfeat_gridSize = "medium"
} else {
    fxfeat_gridSize = "small"
}
let fxfeat_shape;
if (feat_rounded) {
    fxfeat_shape = "rounded"
    if (feat_lerpAmt < 0.1) {
        fxfeat_shape = "slightly rounded"
    } else if (feat_lerpAmt >= 0.18) {
        fxfeat_shape = "heavily rounded"
    }
} else {
    fxfeat_shape = "quad"
}
let fxfeat_offset;
if (feat_inset) {
    if (feat_oversized) {
        fxfeat_offset = "oversized"
    } else {
        fxfeat_offset = "inset"
    }
} else {
    fxfeat_offset = "normal"
}
let fxfeat_edgeStyle;
if (!feat_stroke && !feat_blur) {
    fxfeat_edgeStyle = "normal"
} else if (!feat_stroke && feat_blur) {
    fxfeat_edgeStyle = "blur"
} else if (feat_stroke && !feat_blur) {
    fxfeat_edgeStyle = "stroke"
} else {
    fxfeat_edgeStyle = "stroke and blur"
}



window.$fxhashFeatures = {
    framing: fxfeat_canvas,
    backgroud: feat_bg,
    palette: feat_paletteName,
    grid_size: fxfeat_gridSize,
    shape: fxfeat_shape,
    shape_fitting: fxfeat_offset,
    edge_style: fxfeat_edgeStyle,
    texture: feat_texture
}

