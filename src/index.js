/*
MIT License

Copyright (c) 2019 Ayhan Dorman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const   tileWidth = 30,
        tileSize = 120,
        tileTypes = 14,
        directions = {
            down: 0,
            downLeft: 1,
            left: 2,
            upLeft: 3,
            up: 4,
            upRight: 5,
            right: 6,
            downRight: 7
        };
var canvas, screenWidth, screenHeight, cursorPosition, 
    selectedTileType = 1,
    currentButton = 3,
    currentStep = 0, 
    processing = false,
    tiles = Array(tileSize),
    images = Array(tileTypes),
    target = {
        x: 5,
        y: 5
    },
    steps = [{x: 5, y: 5}];

class Soldier {

    constructor() {        
        this.x = 170;
        this.y = 150;
        this.counter = 0;
        this.direction = directions.down;
    }
    
    render = (context) => {
        let whereToGo = steps[currentStep] ? {
            x: steps[currentStep].x * tileWidth + 20,
            y: steps[currentStep].y * tileWidth
        } : {x: this.x, y: this.y}

        if (this.x != whereToGo.x || this.y != whereToGo.y) {
            this.counter = (this.counter + 1) % 36;
            this.x += whereToGo.x == this.x ? 0 : whereToGo.x < this.x ? -1 : 1;
            this.y += whereToGo.y == this.y ? 0 : whereToGo.y < this.y ? -1 : 1;

            switch(true) {
                case (this.x > whereToGo.x && this.y == whereToGo.y): this.direction = directions.left; break;
                case (this.x < whereToGo.x && this.y == whereToGo.y): this.direction = directions.right; break;
                case (this.y > whereToGo.y && this.x == whereToGo.x): this.direction = directions.up; break;
                case (this.y < whereToGo.y && this.x == whereToGo.x): this.direction = directions.down; break;
                case (this.x > whereToGo.x && this.y > whereToGo.y): this.direction = directions.upLeft; break;
                case (this.x < whereToGo.x && this.y < whereToGo.y): this.direction = directions.downRight; break;
                case (this.x > whereToGo.x && this.y < whereToGo.y): this.direction = directions.downLeft; break;
                case (this.x < whereToGo.x && this.y > whereToGo.y): this.direction = directions.upRight; break;
            }
        } else {
            if (currentStep < steps.length) {
                currentStep++;
            }
        }
        // <render shadow>
        context.shadowBlur = 5;
        context.shadowColor = "black";
        context.fillStyle = "rgba(0,0,0,.3)";
        context.beginPath();
        context.ellipse(this.x, this.y + 19, 16, 8, 0, 0, 2 * Math.PI);
        context.fill();
        context.shadowBlur = 0;
        // </render shadow>
        context.drawImage(soldierImage, Math.floor(this.counter / 6) * 69, this.direction * 96, 69, 96, this.x - 34.5, this.y - 48, 69, 96);
    };
}
			
var soldierImage = new Image();
soldierImage.src = "./assets/img/soldier.png";
var targetImage = new Image();
targetImage.src = "./assets/img/target.png";

const setCanvasSize = () => {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    canvas.width = screenWidth;
    canvas.height = screenHeight;
}

document.oncontextmenu = (e) => e.preventDefault();

window.onresize = () => setCanvasSize();

window.onload = () => {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    setCanvasSize();
    tileBar = document.querySelector(".tile-bar");
    for (let i = 0; i <= tileSize; i++) {
        tiles[i] = new Array(tileSize);
        for (let j = 0; j <= tileSize; j++) {
            tiles[i][j] = {
                type: 0,
                direction: 0
            };
        }
    }
    
    for (let i = 0; i <= tileTypes; i++) {
        images[i] = new Image();
        images[i].src = `./assets/img/tiles/${i}.png`;
        images[i].setAttribute('data-tile', i)
        images[i].onclick = (e) => {
            for (let item of document.querySelectorAll('.tile-bar>img')) {
                item.classList.remove('selected');
            }
            selectedTileType = e.target.getAttribute('data-tile');
            e.target.classList.add('selected');
        }
        if (i == 0) {
            images[i].classList.add('selected');
        }
        tileBar.appendChild(images[i]);
    }

    markDirections = (x, y) => {
        let found = false;
        if (x > 0 && tiles[x - 1][y].type == 0 && tiles[x - 1][y].direction == 0) {
            tiles[x - 1][y].direction = -4;
            if (x - 1 == target.x && y == target.y) found = true;
            progressing = true;
        }
        if (y > 0 && tiles[x][y - 1].type == 0 && tiles[x][y - 1].direction == 0) {
            tiles[x][y - 1].direction = 2;
            if (x == target.x && y - 1 == target.y) found = true;
            progressing = true;
        }
        if (x < tileSize && tiles[x + 1][y].type == 0 && tiles[x + 1][y].direction == 0) {
            tiles[x + 1][y].direction = 4;
            if (x + 1 == target.x && y == target.y) found = true;
            progressing = true;
        }
        if (y < tileSize && tiles[x][y + 1].type == 0 && tiles[x][y + 1].direction == 0) {
            tiles[x][y + 1].direction = -2;
            if (x == target.x && y + 1 == target.y) found = true;
            progressing = true;
        }
        return found;
    }

    canvas.onmousemove = (e) => {
        cursorPosition = {
            x: parseInt(e.clientX / tileWidth),
            y: parseInt(e.clientY / tileWidth)
        };
        if (currentButton == 2) {
            tiles[parseInt(e.clientX / tileWidth)][parseInt(e.clientY / tileWidth)].type = selectedTileType;
        }
    }

    resetDirections = () => {
        for (let i = 0; i <= tileSize; i++) {
            for (let j = 0; j <= tileSize; j++) {
                tiles[i][j].direction = 0;
            }
        }
    }

    canvas.onmousedown = (e) => {
        currentButton = e.button;

        if (currentButton == 0 && tiles[cursorPosition.x][cursorPosition.y].type != 0)
        {
           return; 
        }
        if (currentButton == 2) {
            tiles[cursorPosition.x][cursorPosition.y].type = selectedTileType;
        } else if (currentButton == 0) {
            resetDirections();
            target = {
                x: cursorPosition.x,
                y: cursorPosition.y
            }

            // find
            var found = false;
            var initialSearch = false;
            progressing = true;
            
            while (!found && progressing) {
                if (!initialSearch) {
                    found = markDirections(parseInt(soldier.x / tileWidth), parseInt(soldier.y / tileWidth));
                    initialSearch = true;
                    } else {
                    progressing = false;
                    for (let i = 0; i < tileSize; i++) {
                        for (let j = 0; j < tileSize; j++) {
                            if (tiles[i][j].direction != 0) {
                                found = markDirections(i, j);
                                if (found) {
                                    break;
                                }
                            }            
                        }
                        if (found) break;
                    }
                }
            }
            if (found) {
                currentStep = 0;
                let currentLocation = {
                    x: target.x,
                    y: target.y
                }
                let soldierLocation = {
                    x: parseInt(soldier.x / tileWidth),
                    y: parseInt(soldier.y / tileWidth)
                }
                steps = [];            
                while (currentLocation.x != soldierLocation.x || currentLocation.y != soldierLocation.y) {
                    switch (tiles[currentLocation.x][currentLocation.y].direction) {
                        case -4: ++currentLocation.x; break;
                        case  1: ++currentLocation.x; ++currentLocation.y; break;
                        case  2: ++currentLocation.y; break;
                        case  3: --currentLocation.x; ++currentLocation.y; break;
                        case  4: --currentLocation.x; break;
                        case -1: --currentLocation.x; --currentLocation.y; break;
                        case -2: --currentLocation.y; break;
                        case -3: ++currentLocation.x; --currentLocation.y; break;          
                    }
                    steps.push({x: currentLocation.x, y: currentLocation.y});
                }
                steps = steps.reverse();
            }
        }
    }

    canvas.onmouseup = () => currentButton = 3;

    update = () => {
        for (let x = 0; x < screenWidth / tileWidth; x++) {
            for (let y = 0; y < screenHeight / tileWidth; y++) {
                context.drawImage(images[tiles[x][y].type], x * tileWidth, y * tileWidth, tileWidth, tileWidth);
            }
        }
        context.drawImage(targetImage, target.x * tileWidth, target.y * tileWidth - 15, tileWidth, tileWidth);
        soldier.render(context);
    }

    var soldier = new Soldier();
    soldier.direction = directions.downRight;
    var time = Date.now();

    (function mainLoop() {
        window.requestAnimationFrame(mainLoop);
        if ((Date.now() - time) > 10) {
            time = Date.now()
            update();
        }
    })();
}