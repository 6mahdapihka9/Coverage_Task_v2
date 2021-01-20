//html elements
const CANVAS = document.getElementById('canvas');
const CTX = CANVAS.getContext('2d');
const aDownloadCoords = document.getElementById('downloadCoords');
const expStats = document.getElementById('exportStats');
const moveButton = document.getElementById('moveButton');
const unButton = document.getElementById('undoButton');
const inputByYourself = document.getElementById('inputByYourself');
const inputImg = document.getElementsByClassName('lgURL');
const inputMany = document.getElementsByClassName('many');
const delImage = document.getElementById('deleteImage');
const helpDiv = document.getElementById('help');
const statsDiv = document.getElementById('stat');
const pX = document.getElementById('pX');
const pY = document.getElementById('pY');
const pZoom = document.getElementById('zoom');
const form = document.forms[0];

let amountOfDotsAdded = [], dLengthBefore = [], counter = 0;
let eventHappened = [];
let statsShown = false;
pX.textContent = "x: " + 0;
pY.textContent = "y: " + 0;
pZoom.textContent = "Масштаб: " + 1;

//drawing variables
let xTranslated = 0, yTranslated = 0, xTranslateTo = 0, yTranslateTo = 0;
let scaleRate = 1, newScaleRate = 1;

//algorithm variables
let d = [], dist = [], circles = [];
let Cx, Cy, R,    tempX, tempY, tempR,    lenX, lenY,    smallR = 100;
let minDistGlob = 100000000;
let enoughOne; //is radius big enough to draw a circle

//image
const imgPathDef = 'img/def.png';
let imgPaths = [];
let imgObj = new Image();
imgObj.src = imgPathDef;

let mouse = {
    xPm : 0,
    yPm : 0,
    xPd : 0,
    yPd : 0,
    xNow: 0,
    yNow: 0,
    xReleased : 0,
    yReleased : 0,
    down: false
};
CANVAS.onmousedown = (e) => {
    mouse.xPm = e.offsetX;
    mouse.yPm = e.offsetY;
    mouse.xPd = (e.offsetX - xTranslated) / scaleRate;
    mouse.yPd = (e.offsetY - yTranslated) / scaleRate;
    mouse.down = true;
    if (inputByYourself.style.backgroundColor === "lightblue") {
        let newDot = new Dot(mouse.xPd, mouse.yPd);
        d.push( newDot );
        CTX.strokeStyle = 'red';
        CTX.beginPath();
        CTX.arc(mouse.xPd, mouse.yPd, 2, 0, Math.PI*2, true);
        CTX.stroke();
        dataExport();
        unButton.disabled = false;
        eventHappened.push("dotAdded");
    }
};
CANVAS.onmousemove = (e) => {
    pX.textContent = "x: " + (e.offsetX - xTranslated) / scaleRate;
    pY.textContent = "y: " + (e.offsetY - yTranslated) / scaleRate;
    if (mouse.down && moveButton.style.backgroundColor === "lightblue") {
        mouse.xNow = e.offsetX;
        mouse.yNow = e.offsetY;
        xTranslateTo = mouse.xReleased + mouse.xNow - mouse.xPm;
        yTranslateTo = mouse.yReleased + mouse.yNow - mouse.yPm;
        blankCanvas();
        redraw();
    }
};
CANVAS.onmouseup = () => {
    mouse.xReleased = xTranslated;
    mouse.yReleased = yTranslated;
    mouse.down = false;
};
inputByYourself.onclick = () => {
    if (inputByYourself.style.backgroundColor === "white")
        inputByYourself.style.backgroundColor = "lightblue";
    else
        inputByYourself.style.backgroundColor = "white";
    moveButton.style.backgroundColor = "white";
    return false;
};
moveButton.onclick = () => {
    if (moveButton.style.backgroundColor === "white")
        moveButton.style.backgroundColor = "lightblue";
    else
        moveButton.style.backgroundColor = "white";
    inputByYourself.style.backgroundColor = "white";
    return false;
};
class Dot{
    constructor(_x, _y) {
        if (_x !== undefined && _y !== undefined) {
            this.x = _x;
            this.y = _y;
        } else {
            this.x = 0;
            this.y = 0;
        }
        this.covered = false;
        this.coveredBy = undefined;
    }
}
class Dist {
    constructor(_v, _d1, _d2) {
        this.value = _v;
        this.dot1 = _d1;
        this.dot2 = _d2;
    }
}
class Circle {
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;
        this.dotsCovered = 0;
    }
}
function blankCanvas(){
    //очистить канвас
    CTX.beginPath();
    if (scaleRate >= 1)
        CTX.clearRect(-100000000, -100000000, 1000000000, 1000000000);
    else
        CTX.clearRect(-100000000, -100000000, 1000000000, 1000000000);

    //вернуть масштаб к 1:1
    CTX.scale(1/scaleRate,1/scaleRate);
    //вернуть точку отсчета на 0,0
    CTX.translate(-xTranslated, -yTranslated);

    //переместить точку отсчета на ...
    CTX.translate(xTranslateTo, yTranslateTo);
    xTranslated = xTranslateTo;
    yTranslated = yTranslateTo;

    //применить новый масштаб
    CTX.scale(newScaleRate, newScaleRate);
    scaleRate = newScaleRate;
}
function zoom(in_out) {
    newScaleRate = (in_out)? scaleRate / 0.5 : scaleRate * 0.5;
    blankCanvas();
    redraw();
    pZoom.textContent = "Масштаб: " + newScaleRate;
}
function redraw() {
    CTX.drawImage(imgObj, 0, 0);

    if (d !== []) {
        for (let dIndex in d) {
            CTX.strokeStyle = 'red';
            CTX.beginPath();
            CTX.arc(d[dIndex].x, d[dIndex].y, 2, 0, Math.PI * 2, true);
            CTX.stroke();
        }

        CTX.strokeStyle = 'blue';
        CTX.beginPath();
        CTX.arc(Cx, Cy, R, 0, Math.PI * 2, true);
        CTX.stroke();

        CTX.strokeStyle = 'darkgoldenrod';
        CTX.beginPath();
        CTX.arc(Cx, Cy, 2, 0, Math.PI * 2, true);
        CTX.stroke();

        for (let cIndex in circles){
            CTX.strokeStyle = 'green';
            CTX.beginPath();
            CTX.arc(circles[cIndex].x, circles[cIndex].y, smallR, 0, Math.PI * 2, true);
            CTX.stroke();

            CTX.strokeStyle = 'black';
            CTX.beginPath();
            CTX.arc(circles[cIndex].x, circles[cIndex].y, 2, 0, Math.PI * 2, true);
            CTX.stroke();
        }
    }
}
function dataImport(input){
    let file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    dLengthBefore.push(d.length);
    counter = 0;
    reader.onload = function() {
        let arrayStrs = reader.result.split("\n");
        for (let key in arrayStrs) {
            if (arrayStrs[key] !== "") {
                let coords = arrayStrs[key].split(" ");
                if (coords.length === 2 && typeof (+coords[0]) === "number" && typeof (+coords[1]) === "number") {
                    let newDot = new Dot(+coords[0], +coords[1]);
                    d.push(newDot);
                    counter++;
                } else {
                    alert("Incorrect data!");
                    break;
                }
            }
        }
    };
    reader.onloadend = () => {
        amountOfDotsAdded.push(counter);
        eventHappened.push("dotsAdded");
        unButton.disabled = false;
        blankCanvas();
        redraw();
        dataExport();
    };
    reader.onerror = function() {
        alert(reader.error);
    };
}
function dataExport(){
    aDownloadCoords.hidden = false;
    let filename = "OutputCoordinates.txt";
    let text = "";

    for (let i = 0; i < d.length; i++)
        text += d[i].x + " " + d[i].y + "\n";
    let blob = new Blob([text], {type:'text/plain'});

    aDownloadCoords.download = filename;
    aDownloadCoords.innerHTML = "Save coordinates in file";
    aDownloadCoords.href = window.URL.createObjectURL(blob);
}
function addImage(input, local_global) {
    //ToDo MIME-типа
    if (local_global) {
        try{
            let file = input.files[0];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function() {
                if (typeof(reader.result) === "string") {
                    imgObj.src = reader.result;
                    imgPaths.push( imgObj.src );
                    delImage.disabled = false;
                    unButton.disabled = false;
                    eventHappened.push("imageAdded");
                }
            };
            reader.onloadend = () => {
                blankCanvas();
                redraw();
            };
            reader.onerror = function() {
                alert(reader.error);
            };
        } catch (e) {
            console.log( e );
        }
    } else if (local_global === undefined) {
        imgObj.src = imgPathDef;
        imgPaths.push( imgObj.src );
        delImage.disabled = true;
        unButton.disabled = false;
        eventHappened.push("imageAdded");
        blankCanvas();
        redraw();
    } else {
        imgObj.src = form.imageUrl.value;
        imgPaths.push( imgObj.src );
        delImage.disabled = false;
        unButton.disabled = false;
        eventHappened.push("imageAdded");
        blankCanvas();
        redraw();
    }
}
function undo() {
    if (eventHappened.length > 0)
        if (eventHappened[eventHappened.length-1] === "dotAdded"){
            d.splice(d.length-1, 1);
            eventHappened.remove("dotAdded");
            Cx = 0; Cy = 0; R = 0;
            blankCanvas();
            redraw();
            statsDiv.hidden = true;
        } else if (eventHappened[eventHappened.length-1] === "dotsAdded") {
            d.splice(dLengthBefore[dLengthBefore.length-1], amountOfDotsAdded[amountOfDotsAdded.length-1]);
            dLengthBefore.splice(dLengthBefore.length-1,1);
            amountOfDotsAdded.splice(amountOfDotsAdded.length-1,1);
            eventHappened.remove("dotsAdded");
            Cx = 0; Cy = 0; R = 0;
            blankCanvas();
            redraw();
            statsDiv.hidden = true;
        } else if (eventHappened[eventHappened.length-1] === "imageAdded"){
            if (imgPaths.length > 1) {
                imgPaths.remove(imgObj.src);
                imgObj.src = imgPaths[imgPaths.length - 1];
            } else
                imgObj.src = imgPathDef;
            eventHappened.remove("imageAdded");
            blankCanvas();
            redraw();
        }
}
function clearAll() {
    d = [];
    Cx = Cy = R = xTranslateTo = yTranslateTo = 0;
    newScaleRate = 1;
    aDownloadCoords.hidden = true;
    statsDiv.hidden = true;
    unButton.disabled = true;
    imgObj.src = imgPathDef;
    blankCanvas();
}
function built() {
    blankCanvas();
    circles = [];
    dist = [];
    if (d.length >= 1) {
        if (form.builtOne.checked)
            builtOne();
    }
    if (d.length >= 2){
        if (form.builtMany.checked)
            builtMany();
    }
    redraw();
    statsDiv.hidden = false;
    removeDivStats();
}
function builtOne(){
    //two dots
    //выбор двух опорных точок между которыми самое большое растояние, чтобы построить на них окружность
    let k = 0, m = 0, n = 0;
    let max = 0;
    let newDist;
    dist = [];
    minDistGlob = 100000000;
    for (let i = 0; i < d.length-1; i++)
        for (let j = i+1; j < d.length; j++) {
            lenX = Math.abs(d[i].x - d[j].x);
            lenY = Math.abs(d[i].y - d[j].y);
            newDist = new Dist( Math.sqrt(Math.pow(lenX, 2) + Math.pow(lenY,2)) , d[i], d[j]);
            if (newDist.value < minDistGlob)
                minDistGlob = newDist.value;
            dist.push(newDist);
            if (max < dist[k].value) {
                max = dist[k].value;
                m = i;
                n = j;
            }
            k++;
        }
    tempX = (d[m].x + d[n].x)/2;
    tempY = (d[m].y + d[n].y)/2;
    tempR = Math.sqrt(Math.pow(d[m].x - tempX, 2) + Math.pow(d[m].y - tempY, 2));
    enoughOne = true;
    //проверка все ли точки входят в этот круг
    for (let i = 0; i < d.length; i++)
        if ((Math.pow(d[i].x-tempX, 2) + Math.pow(d[i].y-tempY, 2)) > Math.round(tempR*tempR * 100000000.0)/100000000.0 + 0.0001) {
            enoughOne = false;
            break;
        }
    Cx = tempX; Cy = tempY; R = tempR;

    //three dots
    if (!enoughOne) {
        let threeR = max, threeX = 0, threeY = 0;
        for (let n = 0; n < d.length-2; n++)
            for (let m = n+1; m < d.length-1; m++)
                for (let l = m+1; l < d.length; l++) {
                        Cx = -(d[n].y * (d[m].x * d[m].x + d[m].y * d[m].y - d[l].x * d[l].x - d[l].y * d[l].y) +
                            d[m].y * (d[l].x * d[l].x + d[l].y * d[l].y - d[n].x * d[n].x - d[n].y * d[n].y) +
                            d[l].y * (d[n].x * d[n].x + d[n].y * d[n].y - d[m].x * d[m].x - d[m].y * d[m].y)) /
                            (2 * (d[n].x * (d[m].y - d[l].y) + d[m].x * (d[l].y - d[n].y) + d[l].x * (d[n].y - d[m].y)));
                        Cy = (d[n].x * (d[m].x * d[m].x + d[m].y * d[m].y - d[l].x * d[l].x - d[l].y * d[l].y) +
                            d[m].x * (d[l].x * d[l].x + d[l].y * d[l].y - d[n].x * d[n].x - d[n].y * d[n].y) +
                            d[l].x * (d[n].x * d[n].x + d[n].y * d[n].y - d[m].x * d[m].x - d[m].y * d[m].y)) /
                            (2 * (d[n].x * (d[m].y - d[l].y) + d[m].x * (d[l].y - d[n].y) + d[l].x * (d[n].y - d[m].y)));
                        R = Math.sqrt(Math.pow(d[n].x - Cx, 2) + Math.pow(d[n].y - Cy, 2));

                        enoughOne = true;
                        for (let iter = 0; iter < d.length; iter++)
                            if ((Math.pow(d[iter].x - Cx, 2) + Math.pow(d[iter].y - Cy, 2)) > Math.round(R * R * 100000000.0)/100000000.0 + 0.0001) {
                                enoughOne = false;break;
                            }

                        if (enoughOne && R < threeR) {
                            threeX = Cx;
                            threeY = Cy;
                            threeR = R;
                        }
                    }
        Cx = threeX;	Cy = threeY;	R = threeR;
    }

}
function builtMany(){
    smallR = +form.radius.value;
    let newCircle;
    let maxDotsCoveredDist = 0, maxDotsCoveredTri = 0, circleToAdd = 0, dotsLeft = d.length, radiusEnough = (smallR > minDistGlob) ;

    for (let j = 0; j < d.length; j++) d[j].covered = false;
    for (let j = 0; j < dist.length; j++) dist[j].used = false;

    while(dotsLeft > 0){
        if (radiusEnough) {
            let tX, tY;
            for (let n = 0; n < d.length-2; n++)
                for (let m = n+1; m < d.length-1; m++)
                    for (let l = m+1; l < d.length; l++) {
                        tX = -(d[n].y * (d[m].x * d[m].x + d[m].y * d[m].y - d[l].x * d[l].x - d[l].y * d[l].y) + d[m].y * (d[l].x * d[l].x + d[l].y * d[l].y - d[n].x * d[n].x - d[n].y * d[n].y) + d[l].y * (d[n].x * d[n].x + d[n].y * d[n].y - d[m].x * d[m].x - d[m].y * d[m].y)) / (2 * (d[n].x * (d[m].y - d[l].y) + d[m].x * (d[l].y - d[n].y) + d[l].x * (d[n].y - d[m].y)));
                        tY = (d[n].x * (d[m].x * d[m].x + d[m].y * d[m].y - d[l].x * d[l].x - d[l].y * d[l].y) + d[m].x * (d[l].x * d[l].x + d[l].y * d[l].y - d[n].x * d[n].x - d[n].y * d[n].y) + d[l].x * (d[n].x * d[n].x + d[n].y * d[n].y - d[m].x * d[m].x - d[m].y * d[m].y)) / (2 * (d[n].x * (d[m].y - d[l].y) + d[m].x * (d[l].y - d[n].y) + d[l].x * (d[n].y - d[m].y)));

                        newCircle = new Circle(tX, tY);

                        for (let j = 0; j < d.length; j++)
                            if (!d[j].covered && (Math.pow(d[j].x - newCircle.x, 2) + Math.pow(d[j].y - newCircle.y, 2)) <= Math.round(smallR * smallR * 100000000.0) / 100000000.0 + 0.0001)
                                newCircle.dotsCovered++;

                        if (newCircle.dotsCovered > maxDotsCoveredDist && newCircle.dotsCovered > maxDotsCoveredTri) {
                            circleToAdd = newCircle;
                            maxDotsCoveredTri = newCircle.dotsCovered;
                        }
                    }

            for (let i = 0; i < dist.length; i++) {
                tX = (dist[i].dot1.x + dist[i].dot2.x) / 2;
                tY = (dist[i].dot1.y + dist[i].dot2.y) / 2;
                newCircle = new Circle(tX, tY);
                for (let j = 0; j < d.length; j++)
                    if (!d[j].covered && (Math.pow(d[j].x - newCircle.x, 2) + Math.pow(d[j].y - newCircle.y, 2)) <= Math.round(smallR * smallR * 100000000.0) / 100000000.0 + 0.0001)
                        newCircle.dotsCovered++;

                if (newCircle.dotsCovered > maxDotsCoveredDist && newCircle.dotsCovered > maxDotsCoveredTri) {
                    circleToAdd = newCircle;
                    maxDotsCoveredDist = newCircle.dotsCovered;
                }
            }
            let minusDots;
            if ((minusDots = (maxDotsCoveredDist > maxDotsCoveredTri)? maxDotsCoveredDist : maxDotsCoveredTri) > 1) {
                circles.push(circleToAdd);
                dotsLeft -= minusDots;
                for (let j = 0; j < d.length; j++)
                    if ((Math.pow(d[j].x - circleToAdd.x, 2) + Math.pow(d[j].y - circleToAdd.y, 2)) <= Math.round(smallR * smallR * 100000000.0) / 100000000.0 + 0.0001) {
                        d[j].covered = true;
                        d[j].coveredBy = circleToAdd;
                    }
                maxDotsCoveredDist = 0;
                maxDotsCoveredTri = 0;
            } else
                radiusEnough = false;
        } else {
            for (let j = 0; j < d.length; j++)
                if (!d[j].covered){
                    newCircle = new Circle();
                    newCircle.x = d[j].x;
                    newCircle.y = d[j].y;
                    newCircle.dotsCovered = 1;
                    circles.push(newCircle);
                    d[j].covered = true;
                    d[j].coveredBy = newCircle;
                }
            break;
        }
    }
    statsExport();
}
function addDivStats() {
    if (!statsShown) {
        statsShown = true;
        for (let i = 0; i < d.length; i++) {
            let statsDiv = document.getElementById('stats');
            let div;
            div = document.createElement('div');
            div.style.border = "1px solid black";
            div.style.color = "white";
            div.className = "stats";
            div.innerText = "Т. №" + (i + 1) + ": x = " + d[i].x + ", y = " + d[i].y +
                ",\n global ( " + Math.round(Cx * 100.0)/100.0 + " ; " + Math.round(Cy * 100.0)/100.0 + " ) R = " + Math.round(R * 100.0)/100.0 +
                ",\n local  ( " + d[i].coveredBy.x + " ; " + d[i].coveredBy.y + " ) R = " + smallR;
            statsDiv.append(div);
        }
    }
}
function removeDivStats() {
    if (statsShown) {
        statsShown = false;
        let divs = document.getElementsByClassName('stats');
        for (let i = divs.length - 1; i >= 0; i--)
            divs[i].remove();
    }
}
function statsExport(){
    if (d !== [] && circles !== []) {
        let filename = "Stats.txt";
        let text = "";
        for (let i = 0; i < d.length; i++)
            text += "Т. №" + (i + 1) + ": x = " + d[i].x + ", y = " + d[i].y +
                "\n\t global ( " + Math.round(Cx * 100.0)/100.0 + " ; " + Math.round(Cy * 100.0)/100.0 + " ) R = " + Math.round(R * 100.0)/100.0 +
                "\n\t local  ( " + d[i].coveredBy.x + " ; " + d[i].coveredBy.y + " ) R = " + smallR + "\n\n";
        let blob = new Blob([text], {type: 'text/plain'});
        expStats.download = filename;
        expStats.innerHTML = "Write statistics in file";
        expStats.href = window.URL.createObjectURL(blob);
    }
}
function able_disableFormsAddImage() {
    for(let i in inputImg)
        inputImg[i].disabled = !inputImg[i].disabled;
}
function able_disableFormsMany() {
    for(let i in inputMany)
        inputMany[i].disabled = !inputMany[i].disabled;
}
function showHideHelp(){
    helpDiv.hidden = !helpDiv.hidden;
}

Array.prototype.remove = function(value) {
    let idx = this.indexOf(value);
    if (idx !== -1) {
        // Второй параметр - число элементов, которые необходимо удалить
        return this.splice(idx, 1);
    }
    return false;
};
//ToDo отдельный метод для отрисовки кругов
//ToDo поправить везде стили и доперевести страницу на англ
//ToDo написать ивентлисенеры для нестандартных кнопок и поставить их реализацию на нормальные
//TODO написать больше комментариев
//TODO адаптивный дизайн ??


