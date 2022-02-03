// these are the variables you can use as inputs to your algorithms
console.log(fxhash)   // the 64 chars hex number fed to your algorithm
console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()

// note about the fxrand() function 
// when the "fxhash" is always the same, it will generate the same sequence of
// pseudo random numbers, always

//----------------------
// defining features
//----------------------
// You can define some token features by populating the $fxhashFeatures property
// of the window object.
// More about it in the guide, section features:
// [https://fxhash.xyz/articles/guide-mint-generative-token#features]
//
// window.$fxhashFeatures = {
//   "Background": "Black",
//   "Number of lines": 10,
//   "Inverted": true
// }

// this code writes the values to the DOM as an example
//const container = document.createElement("div")
//container.innerText = `
//  random hash: ${fxhash}\n
//  some pseudo random values: [ ${fxrand()}, ${fxrand()}, ${fxrand()}, ${fxrand()}, ${fxrand()},... ]\n
//`
//document.body.prepend(container)

//let WIDTH = 1000;
//let HEIGHT = 1000;

console.log('-----')

let colorPalettes = {
    autumnRust: ["#242625", "#add1f7", "#616a59", "#8e5e48", "#c77c00", "#bf9481", "#dda734", "#f2bd45"],
    glassSky: ["#38598f", "#476ea7", "#6a93d1", "#698cb6", "#b7c9e1"],
    lakeSky: ["#ecf3f9", "#b3c9e1", "#9eafcb", "#a0adc0", "#828d9f"],
    granite: ["#f9c544","#32231b", "#494a4f", "#5d5958", "#777d81", "#9ea9af", "#c4cacd", "#cecdd2", "#edecec", "#7f917b"],
    rockBeach: ["#383f38", "#3c4645", "#b88776", "#b29a95", "#d7c5bf", "#b7b6b1", "#d4d8d9"],
    diggerTruck: ["#323034", "#4f453d", "#71604c", "#948d85", "#cc9751", "#c49056", "#b48653", "#916e44", "#5e6e6e"],
    //rainbow1: ["#fa7921", "#fe9920", "#b9a44c", "#566e3d", "#0c4767"],
    redBlue: ["#053c5e", "#1d3958", "#353652", "#4c334d", "#643047", "#7c2e41", "#942b3b", "#ab2836", "#c32530", "#db222a"],
    pride1: ["#d83030", "#f09018", "#ffd800", "#a8c060", "#30a8c0", "#6048a8"],
    eclipse: ["#0d090b", "#616c70", "#8a3518", "#f0771f", "#fcd951"]
};

let paletteNames = ["autumnRust", "glassSky", "lakeSky", "granite", "rockBeach", "diggerTruck", "redBlue", "pride1", "eclipse"]

let textures = ["shortLines", "striated", "dots", "halftone", "flowfield"]

// p5js createGraphics objects for layering 

let g_shapes_0;
let g_shapes_1;
let g_shapes_2;
let g_shapes_3;
let g_shapes_all;

let g_stroke_0;
let g_stroke_1;
let g_stroke_2;
let g_stroke_3;
let g_stroke_all;

let g_texture;
let g_blur;

let g_final;


//features to use

let feat_rounded = fxrand() > 0.25 ? true: false;
let feat_oversized = fxrand() > 0.85 ? true: false;
let feat_inset = fxrand() > 0.5 ? true : false;
let feat_stroke = fxrand() > 0.75 ? true : false;
if (feat_oversized) {
    feat_stroke = false;
}
//let feat_blur = fxrand() > 0.5 ? true : false;
let feat_blur = false;
let feat_border = fxrand() > 0.25 ? true : false;
let feat_borderSize = 25;
let feat_fullBleed = 1;
let feat_bg = fxrand() > 0.5 ? "light" : "dark";
let feat_useTexture = fxrand() > 0.33;
//let feat_useTexture = false;
let feat_texture;
if (feat_useTexture) {
    feat_texture = textures[Math.floor(fxrand() * textures.length)]
}

if (feat_border) {
    feat_borderSize = 75;
    feat_fullBleed = 0;
};

//end features

//let size = Math.min(window.innerWidth, window.innerHeight) - feat_borderSize;
let size = 1200;
let cnvSize = 1250;
let gridRand = fxrand();
let gridSize;
let numPalettes = paletteNames.length;
let colRand = fxrand()
let paletteIndex = Math.floor(colRand * numPalettes);

/*console.log("rand * numPalettes: " + colRand * numPalettes);
console.log("math.floor above: " + Math.floor(colRand * numPalettes));
console.log("paletteIndex: " + paletteIndex);
console.log("palette Name: "+ paletteNames[paletteIndex]);*/

let palette = colorPalettes[paletteNames[paletteIndex]];
//console.log(palette);
let numColors = palette.length;

let RECTSIZE;

let MAXWARP = 25;

let lerpAmt;
let roundnessFactor = fxrand().toFixed(2);

let sR;
let dirField;
let magField;
let colorField;
let subDivField;

let colorFieldMin = 0.5;
let colorFieldMax = 0.5;

let rects = [];
let tests = [];

let bgcolor;

let cnv;
let strokeGraphics;
let shapeGraphics;

//let scaleSlide;

function setup() {
    g_shapes_0 = createGraphics(cnvSize, cnvSize);
    g_shapes_1 = createGraphics(cnvSize, cnvSize);
    g_shapes_2 = createGraphics(cnvSize, cnvSize);
    g_shapes_3 = createGraphics(cnvSize, cnvSize);
    g_shapes_all = createGraphics(cnvSize, cnvSize);

    g_stroke_0 = createGraphics(cnvSize, cnvSize);
    g_stroke_1 = createGraphics(cnvSize, cnvSize);
    g_stroke_2 = createGraphics(cnvSize, cnvSize);
    g_stroke_3 = createGraphics(cnvSize, cnvSize);
    g_stroke_all = createGraphics(cnvSize, cnvSize);

    g_texture = createGraphics(cnvSize, cnvSize);
    g_blur = createGraphics(cnvSize, cnvSize);
    g_final = createGraphics(cnvSize, cnvSize);

    if (feat_bg == "light") {
        bgcolor = color(255)
    } else {
        bgcolor = color(25);
    }

    if (feat_useTexture) {
        switch (feat_texture) {
            case "shortLines":
                for (x = 0; x < cnvSize; x++) {
                    for (y = -5; y < cnvSize+5 ; y++) {
                        if (fxrand() < 0.05) {
                            let lineColor = color(fxrand() * 100 + 50);
                            //let lineColor = color(0);
                            lineColor.setAlpha(50);
                            let lens = [2,3,4,5,6]
                            let len = lens[Math.floor(fxrand() * lens.length)]
                            g_texture.stroke(lineColor);
                            g_texture.line(x, y, x, y + len);
                        }
                    }
                }
                break;
            case "striated":
                for (x = 0; x < cnvSize; x++) {
                    for (y = -20; y < cnvSize + 20; y++) {
                        if (fxrand() < 0.05) {
                            let lineColor = color(fxrand() * 100 + 50);
                            //let lineColor = color(0);
                            lineColor.setAlpha(25);
                            let lens = [2, 3, 4, 5, 6]
                            let len = lens[Math.floor(fxrand() * lens.length)]
                            g_texture.stroke(lineColor);
                            g_texture.line(x, y, x, y + (len* 10));
                        }
                    }
                }
                break;
            case "dots":
                for (x = -5; x < cnvSize + 5; x++) {
                    for (y = -5; y < cnvSize + 5; y++) {
                        if (fxrand() < 0.05) {
                            let lineColor = color(fxrand() * 100 + 100);
                            //let lineColor = color(0);
                            lineColor.setAlpha(20);
                            let lens = [2, 3, 4, 5, 6]
                            let len = lens[Math.floor(fxrand() * lens.length)]
                            g_texture.fill(lineColor);
                            g_texture.noStroke();
                            g_texture.ellipse(x, y, len+2);
                        }
                    }
                }
                break;
            case "halftone":
                for (x = 0; x < cnvSize; x++) {
                    for (y = 0; y < cnvSize; y++) {
                        if (x % 10 == 0 && y % 10 == 0) {
                            let dotColor = color(50);
                            //let lineColor = color(0);
                            dotColor.setAlpha(100);
                            g_texture.noStroke();
                            g_texture.fill(dotColor);
                            g_texture.ellipse(x, y, 3);
                        }
                    }
                }
            case "flowfield":
                zx = 5;
                console.log("texture ===== flowfield " + zx);
                break;
        }
    }

    lerpAmt = map(roundnessFactor, 0, 1, 0.005, 0.23).toFixed(2);
    //console.log("roundnessFactor: " + roundnessFactor + "  lerpAmt: " + lerpAmt);
    gridSize = Math.floor(map(gridRand, 0, 1, 3, 15));
    //console.log("gridsize: " + gridSize);
    RECTSIZE = Math.floor(size / gridSize);
    cnv = createCanvas(cnvSize, cnvSize);
    background(bgcolor);
    rect(feat_borderSize / 2, feat_borderSize / 2, size, size);

    strokeGraphics = createGraphics(size + feat_borderSize, size + feat_borderSize);
    shapeGraphics = createGraphics(size + feat_borderSize, size + feat_borderSize);
    //colorMode(HSB, 1, 100, 100);


    //scaleSlide = createSlider(20, 2000, 200, 20);
    //scaleSlide.style('width', '500px');
    seed = (fxrand() * 1213) + (fxrand() * 7753)
    noiseSeed(seed);
    console.log("seed = " + seed)

    dirField = new NoiseField(250);
    magField = new NoiseField(250, z = 100);
    colorField = new NoiseField(250, z = 800);
    subDivField = new NoiseField(250, z = 300);

    for (let x = 0; x < width; x += 10) {
        for (let y = 0; y < height; y += 10) {
            let v = colorField.value(x, y, 0);
            if (v < colorFieldMin) {
                colorFieldMin = v
            }
            if (v > colorFieldMax) {
                colorFieldMax = v
            }
        }
    };



    let numCols = gridSize;
    let numRows = gridSize;

    for (let y = 0 - feat_fullBleed; y < numRows + feat_fullBleed; y++) {
        for (let x = 0 - feat_fullBleed; x < numCols + feat_fullBleed; x++) {
            let xC = (x * RECTSIZE) + (RECTSIZE / 2);
            let yC = (y * RECTSIZE) + (RECTSIZE / 2);
            let center = createVector(xC, yC);
            rects.push(new SkewRect(center, RECTSIZE));
        }
    }

    tests.push(new SkewRect(createVector(width / 2, height / 2), 200));

    for (let rect of rects) {
        rect.setFields(dirField, magField, colorField, subDivField);
        rect.subdivide();
    }
}

function draw() {
    g_shapes_0.translate(feat_borderSize / 2, feat_borderSize / 2);
    g_shapes_1.translate(feat_borderSize / 2, feat_borderSize / 2);
    g_shapes_2.translate(feat_borderSize / 2, feat_borderSize / 2);
    g_shapes_3.translate(feat_borderSize / 2, feat_borderSize / 2);
    //g_shapes_all.translate(feat_borderSize / 2, feat_borderSize / 2);

    g_stroke_0.translate(feat_borderSize / 2, feat_borderSize / 2);
    g_stroke_1.translate(feat_borderSize / 2, feat_borderSize / 2);
    g_stroke_2.translate(feat_borderSize / 2, feat_borderSize / 2);
    g_stroke_3.translate(feat_borderSize / 2, feat_borderSize / 2);
    //g_stroke_all.translate(feat_borderSize / 2, feat_borderSize / 2);

    g_texture.translate(feat_borderSize / 2, feat_borderSize / 2);
    g_blur.translate(feat_borderSize / 2, feat_borderSize / 2);
    //g_final.translate(feat_borderSize / 2, feat_borderSize / 2);

    shapeGraphics.translate(feat_borderSize / 2, feat_borderSize / 2);
    strokeGraphics.translate(feat_borderSize / 2, feat_borderSize / 2);
    //shapeGraphics.noStroke();
    //strokeGraphics.noFill();
    //let bgcolor = color(1, 0, 10);
    //background(1, 0, 10);
    //let scl = scaleSlide.value();
    //noStroke();
    //noFill();

    for (let r of rects) {
        r.setColor(colorField);
        r.show();
    }
    colorMode(RGB);
    console.log("bg color: " + bgcolor);

/*    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            if (fxrand() < 0.3) {
                let sample = get(x, y);
                //console.log(sample);
                if (sample[0] != 10) {
                    let opacity = (fxrand() * 100);
                    let lightness = (fxrand() * 100) + 100;
                    let dotColor = color(lightness, opacity)
                    stroke(dotColor);
                    //filterGraphics.point(x, y);
                    point(x, y);
                }

            }
        }
    }*/

    //filterGraphics.filter(BLUR, 1);
    //image(filterGraphics, 0, 0);

/*    image(g_shapes_0, 0, 0);
    image(g_stroke_0, 0, 0);
    image(g_shapes_1, 0, 0);
    image(g_stroke_1, 0, 0);
    image(g_shapes_2, 0, 0);
    image(g_stroke_2, 0, 0);
    image(g_shapes_3, 0, 0);
    image(g_stroke_3, 0, 0);*/

    g_shapes_all.blend(g_shapes_0, 0, 0, cnvSize, cnvSize, 0, 0, cnvSize, cnvSize, NORMAL);
    g_shapes_all.blend(g_shapes_1, 0, 0, cnvSize, cnvSize, 0, 0, cnvSize, cnvSize, NORMAL);
    g_shapes_all.blend(g_shapes_2, 0, 0, cnvSize, cnvSize, 0, 0, cnvSize, cnvSize, NORMAL);
    g_shapes_all.blend(g_shapes_3, 0, 0, cnvSize, cnvSize, 0, 0, cnvSize, cnvSize, NORMAL);

    (g_masked_texture = g_texture.get()).mask(g_shapes_all);

    g_final.blend(g_shapes_all, 0, 0, cnvSize, cnvSize, 0, 0, cnvSize, cnvSize, NORMAL);
    g_final.blend(g_masked_texture, 0, 0, cnvSize, cnvSize, 0, 0, cnvSize, cnvSize, OVERLAY);

    //image(g_shapes_all, 0, 0);

/*    if (feat_stroke) {
        console.log("------image stroke-----");
        if (feat_blur) {
            strokeGraphics.filter(BLUR, 3);
        }
        image(strokeGraphics, 0, 0)
    };*/

   // g_texture.ellipse(500, 500, 500);
    //tint(255, 125);
    image(g_final, 0, 0);

    dirField.zOff += 2;
    magField.zOff += 2;
    colorField.zOff += 2;

    noLoop();
}

let features = ["feat_rounded: " + feat_rounded,
"feat_oversized: " + feat_oversized,
"feat_inset: " + feat_inset,
"feat_stroke: " + feat_stroke,
"feat_strokeBlur: " + feat_blur,
"feat_border: " + feat_border,
"feat_borderSize: " + feat_borderSize,
"feat_fullBleed: " + feat_fullBleed,
"feat_bg: " + feat_bg,
"feat_useTexture: " + feat_useTexture,
"feat_texture: " + feat_texture
]

for (let f of features) {
    console.log(f);
}

function keyTyped() {
    if (key === 's') {
        let y = year();
        let m = month();
        let d = day();
        let mn = minute();
        let sc = second();
        let datetimearray = [y, m, d, mn, sc]
        let datestamp = datetimearray.join('-')
        saveCanvas(datestamp, 'png')
    }
}
window.$fxhashFeatures = {
    rounded: feat_rounded,
    oversized: feat_oversized,
    inset: feat_inset,
    stroke: feat_stroke,
    strokeBlur: feat_blur,
    border: feat_border,
    fullBleed: feat_fullBleed,
    background: feat_bg
}