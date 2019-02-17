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

import { World, Soldier } from './entities';

var world = new World(), 
    canvas, context, cursorPosition, soldier, steps, tileBar, progressing,
    selectedTileType = 1,
    currentButton = 3,
    fps = 0, 
    fpsCounter = 0,
    screen = {x1: 0, x2: 0, y1: 0, y2: 0},
    tiles = Array(world.size),
    images = Array(world.tileTypes),
    monsters = [],
    monsterSprites = [],
    lastRender = new Date();

class Monster {
    constructor() {
        this.type = 0;
        this.x = 0;
        this.y = 0;
        this.counter = 0;
        this.direction = world.directions.down;
        this.target = {
            x: 0,
            y: 0
        }
    }

    render = () => {
        if (this.x == this.target.x * world.tileWidth && this.y == this.target.y * world.tileWidth) {
            let availableDirections = [];
            if (this.x / world.tileWidth > 0 && !tiles[this.x / world.tileWidth - 1][this.y / world.tileWidth].blocking) availableDirections.push(world.directions.left);
            if (this.x / world.tileWidth < world.size && !tiles[this.x / world.tileWidth + 1][this.y / world.tileWidth].blocking) availableDirections.push(world.directions.right);
            if (this.y / world.tileWidth > 0 && !tiles[this.x / world.tileWidth][this.y / world.tileWidth - 1].blocking) availableDirections.push(world.directions.up);
            if (this.y / world.tileWidth < world.size && !tiles[this.x / world.tileWidth][this.y / world.tileWidth + 1].blocking) availableDirections.push(world.directions.down);
            this.direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            switch(this.direction) {
                case world.directions.left: this.target.x--; break;
                case world.directions.right: this.target.x++; break;
                case world.directions.up: this.target.y--; break;
                case world.directions.down: this.target.y++; break;
            }
        } else {
            this.counter = (this.counter + 1) % 30;
            this.x = this.x > this.target.x * world.tileWidth ? this.x - 1 : this.x + 1;
            this.y = this.y > this.target.y * world.tileWidth ? this.y - 1 : this.y + 1;
        }
        context.drawImage(monsterSprites[this.type], Math.floor(this.counter / 10) * 48, this.direction * 48, 48, 48, this.x - soldier.x + world.screenWidth / 2 - 4, this.y - soldier.y + world.screenHeight / 2 - 15, 48, 48);
    }
}

var targetImage = new Image();
targetImage.src = `${world.assetsPath}target.png`;

for (let i = 1; i <= world.monsterTypes; i++) {
    let monsterSprite = new Image();
    monsterSprite.src = `${world.assetsPath}/monsters/${i}.png`;
    monsterSprites.push(monsterSprite);
}

const setCanvasSize = () => {
    canvas.width = world.screenWidth = window.innerWidth;
    canvas.height = world.screenHeight = window.innerHeight;
}

const resetDirections = () => {
    for (let i = 0; i <= world.size; i++) {
        for (let j = 0; j <= world.size; j++) {
            tiles[i][j].direction = 0;
        }
    }
}

const markDirections = (x, y) => {
    if (x > 0 && y > 0 && !tiles[x - 1][y - 1].blocking && tiles[x - 1][y - 1].direction == 0) {
        tiles[x - 1][y - 1].direction = 1;
        if (x - 1 == soldier.target.x && y - 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (x < world.size, y > 0 && !tiles[x + 1][y - 1].blocking && tiles[x + 1][y - 1].direction == 0) {
        tiles[x + 1][y - 1].direction = 3;
        if (x + 1 == soldier.target.x && y - 1 == soldier.target.y) {
        return true;
        }
        progressing = true;
    }
    if (x < world.size && y < world.size && !tiles[x + 1][y + 1].blocking && tiles[x + 1][y + 1].direction == 0) {
        tiles[x + 1][y + 1].direction = -1;
        if (x + 1 == soldier.target.x && y + 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (x > 0 && y < world.size && !tiles[x - 1][y + 1].blocking && tiles[x - 1][y + 1].direction == 0) {
        tiles[x - 1][y + 1].direction = -3;
        if (x - 1 == soldier.target.x && y + 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (x > 0 && !tiles[x - 1][y].blocking && tiles[x - 1][y].direction == 0) {
        tiles[x - 1][y].direction = -4;
        if (x - 1 == soldier.target.x && y == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (y > 0 && !tiles[x][y - 1].blocking && tiles[x][y - 1].direction == 0) {
        tiles[x][y - 1].direction = 2;
        if (x == soldier.target.x && y - 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (x < world.size && !tiles[x + 1][y].blocking && tiles[x + 1][y].direction == 0) {
        tiles[x + 1][y].direction = 4;
        if (x + 1 == soldier.target.x && y == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (y < world.size && !tiles[x][y + 1].blocking && tiles[x][y + 1].direction == 0) {
        tiles[x][y + 1].direction = -2;
        if (x == soldier.target.x && y + 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    return false;
}

const update = () => {

    // <render tiles>
    screen = {
        x1: (() => {screen.x1 = parseInt((soldier.x - world.screenWidth / 2) / world.tileWidth); return screen.x1 > 0 ? screen.x1 : 0})(),
        y1: (() => {screen.y1 = parseInt((soldier.y - world.screenHeight / 2) / world.tileWidth); return screen.y1 > 0 ? screen.y1 : 0})(),
        x2: (() => {screen.x2 = parseInt((soldier.x + world.screenWidth / 2) / world.tileWidth); return screen.x2 <= world.size ? screen.x2 : world.size})(),
        y2: (() => {screen.y2 = parseInt((soldier.y + world.screenHeight / 2) / world.tileWidth); return screen.y2 <= world.size ? screen.y2 : world.size})()
    };
    context.fillStyle = "#3ABE41";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let x = screen.x1; x <= screen.x2; x++) {
        for (let y = screen.y1; y <= screen.y2; y++) {
            context.drawImage(images[tiles[x][y].type], x * world.tileWidth - soldier.x + world.screenWidth / 2, y * world.tileWidth - soldier.y + world.screenHeight / 2, world.tileWidth, world.tileWidth);
        }
    }
    // </render tiles>

    // <render target>
    if (soldier.currentStep < soldier.steps.length) {
        context.drawImage(targetImage, soldier.target.x * world.tileWidth - soldier.x + world.screenWidth / 2, soldier.target.y * world.tileWidth - 15 - soldier.y + world.screenHeight / 2, world.tileWidth, world.tileWidth);
    }
    // </render target>

    // <new monster spawn>
    if (Math.floor(Math.random() * 10) == 0) {
        let spawnPoint = {
            x: Math.floor(Math.random() * world.size),
            y: Math.floor(Math.random() * world.size)
        }
        if (!tiles[spawnPoint.x][spawnPoint.y].blocking) {
            let monster = new Monster();
            monster.x = spawnPoint.x * world.tileWidth;
            monster.y = spawnPoint.y * world.tileWidth;
            monster.type = Math.floor(Math.random() * 3);
            monster.target.x = spawnPoint.x;
            monster.target.y = spawnPoint.y;
            monsters.push(monster);
        }
    }
    // </new monster spawn>

    // <render monsters and the player>
    for (let monster of monsters) {
        monster.render();
    }

    soldier.render();
    // </render monsters and the player>

    // <FPS info>
    fpsCounter++;
    let now = new Date();
    if (now - lastRender >= 1000) {
        lastRender = now;
        fps = fpsCounter;
        fpsCounter = 0;    
    }
    context.font = "18px Arial";
    context.fillText("FPS: " + fps, 10, 30);
    // </FPS info>
}

const downloadMap = () => {
    document.querySelector("[download]").setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tiles)));
}

document.oncontextmenu = (e) => e.preventDefault();

window.onresize = () => setCanvasSize();

window.onload = () => {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    world.context = context;
    setCanvasSize();
    tileBar = document.querySelector(".tile-bar");

    if (map) {
        tiles = map;
    } else {
        for (let i = 0; i <= world.size; i++) {
            tiles[i] = new Array(world.size);
            for (let j = 0; j <= world.size; j++) {
                tiles[i][j] = {
                    type: 0,
                    direction: 0,
                    blocking: false
                };
            }
        }
    }

    for (let i = 0; i < world.tileTypes; i++) {
        images[i] = new Image();
        images[i].src = `${world.assetsPath}tiles/${i}.png`;
        images[i].setAttribute('data-tile', i)
        images[i].onclick = (e) => {
            for (let item of document.querySelectorAll('.tile-bar>img')) {
                item.classList.remove('selected');
            }
            selectedTileType = parseInt(e.target.getAttribute('data-tile'));
            e.target.classList.add('selected');
        }
        if (i == 1) {
            images[i].classList.add('selected');
        }
        tileBar.appendChild(images[i]);
    }

    canvas.onmousemove = (e) => {
        cursorPosition = {
            x: parseInt((soldier.x - (world.screenWidth / 2) + e.clientX) / world.tileWidth),
            y: parseInt((soldier.y - (world.screenHeight / 2) + e.clientY) / world.tileWidth)
        };
        if (currentButton == 2) {
            tiles[cursorPosition.x][cursorPosition.y].type = selectedTileType;            
            tiles[cursorPosition.x][cursorPosition.y].blocking = world.blockingTypes.includes(selectedTileType);
        }
    }

    canvas.onmousedown = (e) => {
        currentButton = e.button;

        if (currentButton == 0 && tiles[cursorPosition.x][cursorPosition.y].blocking)
        {
        return; 
        }
        if (currentButton == 2) {
            tiles[cursorPosition.x][cursorPosition.y].type = selectedTileType;
        } else if (currentButton == 0) {
            resetDirections();
            soldier.target = {
                x: cursorPosition.x,
                y: cursorPosition.y
            }

            // find
            var found = false;
            var initialSearch = false;
            progressing = true;
            
            while (!found && progressing) {
                if (!initialSearch) {
                    found = markDirections(parseInt(soldier.x / world.tileWidth), parseInt(soldier.y / world.tileWidth));
                    initialSearch = true;
                    } else {
                    progressing = false;
                    for (let i = 0; i < world.size; i++) {
                        for (let j = 0; j < world.size; j++) {
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
                soldier.currentStep = 0;
                let currentLocation = {
                    x: soldier.target.x,
                    y: soldier.target.y
                }
                let soldierLocation = {
                    x: parseInt(soldier.x / world.tileWidth),
                    y: parseInt(soldier.y / world.tileWidth)
                }
                soldier.steps = [];            
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
                    soldier.steps.push({x: currentLocation.x, y: currentLocation.y});
                }
                soldier.steps = soldier.steps.reverse();
            }
        }
    }

    canvas.onmouseup = () => currentButton = 3;

    soldier = new Soldier(world);

    (function mainLoop() {
        window.requestAnimationFrame(mainLoop);
        update();
    })();
}

module.exports = {
    generateMap: function () {
        downloadMap();
    }
};