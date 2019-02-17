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

import { World, Soldier, Monster } from './entities';
import config from './config.json';

var world = new World(), 
    canvas, cursorPosition, soldier, progressing,
    screen = {
        width: 0,
        height: 0
    },
    currentButton = 3,
    monsters = [],
    monsterSprites = [];

const monsterTypes = 4;

for (let i = 1; i <= monsterTypes; i++) {
    let monsterSprite = new Image();
    monsterSprite.src = `${config.assetsPath}/monsters/${i}.png`;
    monsterSprites.push(monsterSprite);
}

const setCanvasSize = () => {
    canvas.width = screen.width = window.innerWidth;
    canvas.height = screen.height = window.innerHeight;
}

const resetDirections = () => {
    for (let i = 0; i <= world.size; i++) {
        for (let j = 0; j <= world.size; j++) {
            world.tiles[i][j].direction = 0;
        }
    }
}

const markDirections = (x, y) => {
    if (x > 0 && y > 0 && !world.tiles[x - 1][y - 1].blocking && world.tiles[x - 1][y - 1].direction == 0) {
        world.tiles[x - 1][y - 1].direction = 1;
        if (x - 1 == soldier.target.x && y - 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (x < world.size, y > 0 && !world.tiles[x + 1][y - 1].blocking && world.tiles[x + 1][y - 1].direction == 0) {
        world.tiles[x + 1][y - 1].direction = 3;
        if (x + 1 == soldier.target.x && y - 1 == soldier.target.y) {
        return true;
        }
        progressing = true;
    }
    if (x < world.size && y < world.size && !world.tiles[x + 1][y + 1].blocking && world.tiles[x + 1][y + 1].direction == 0) {
        world.tiles[x + 1][y + 1].direction = -1;
        if (x + 1 == soldier.target.x && y + 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (x > 0 && y < world.size && !world.tiles[x - 1][y + 1].blocking && world.tiles[x - 1][y + 1].direction == 0) {
        world.tiles[x - 1][y + 1].direction = -3;
        if (x - 1 == soldier.target.x && y + 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (x > 0 && !world.tiles[x - 1][y].blocking && world.tiles[x - 1][y].direction == 0) {
        world.tiles[x - 1][y].direction = -4;
        if (x - 1 == soldier.target.x && y == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (y > 0 && !world.tiles[x][y - 1].blocking && world.tiles[x][y - 1].direction == 0) {
        world.tiles[x][y - 1].direction = 2;
        if (x == soldier.target.x && y - 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (x < world.size && !world.tiles[x + 1][y].blocking && world.tiles[x + 1][y].direction == 0) {
        world.tiles[x + 1][y].direction = 4;
        if (x + 1 == soldier.target.x && y == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    if (y < world.size && !world.tiles[x][y + 1].blocking && world.tiles[x][y + 1].direction == 0) {
        world.tiles[x][y + 1].direction = -2;
        if (x == soldier.target.x && y + 1 == soldier.target.y) {
            return true;
        }
        progressing = true;
    }
    return false;
}

const update = () => {

    // <render world>
    world.render(soldier, screen);
    // </render world>

    // <new monster spawn>
    if (Math.floor(Math.random() * 10) == 0) {
        let spawnPoint = {
            x: Math.floor(Math.random() * world.size),
            y: Math.floor(Math.random() * world.size)
        }
        if (!world.tiles[spawnPoint.x][spawnPoint.y].blocking) {
            let monster = new Monster(world);
            monster.x = spawnPoint.x * world.tileWidth;
            monster.y = spawnPoint.y * world.tileWidth;
            monster.sprite = monsterSprites[Math.floor(Math.random() * 3)];
            monster.target.x = spawnPoint.x;
            monster.target.y = spawnPoint.y;
            monsters.push(monster);
        }
    }
    // </new monster spawn>

    // <render monsters and the player>
    for (let monster of monsters) {
        monster.render(soldier, screen);
    }

    soldier.render(screen);
    // </render monsters and the player>

    // <FPS info>
    world.showFPS();
    // </FPS info>
}

const downloadMap = () => {
    document.querySelector("[download]").setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(world.tiles)));
}

document.oncontextmenu = (e) => e.preventDefault();

window.onresize = () => setCanvasSize();

window.onload = () => {
    canvas = document.querySelector("canvas");
    world.context = canvas.getContext("2d");
    setCanvasSize();

    if (map) {
        world.tiles = map;
    } else {
        world.generateTiles();
    }

    world.loadTiles();

    canvas.onmousemove = (e) => {
        cursorPosition = {
            x: parseInt((soldier.x - (screen.width / 2) + e.clientX) / world.tileWidth),
            y: parseInt((soldier.y - (screen.height / 2) + e.clientY) / world.tileWidth)
        };
        if (currentButton == 2) {
            world.setTile(cursorPosition);
        }
    }

    canvas.onmousedown = (e) => {
        currentButton = e.button;

        if (currentButton == 0 && world.tiles[cursorPosition.x][cursorPosition.y].blocking)
        {
        return; 
        }
        if (currentButton == 2) {
            world.tiles[cursorPosition.x][cursorPosition.y].type = world.selectedTileType;
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
                            if (world.tiles[i][j].direction != 0) {
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
                    switch (world.tiles[currentLocation.x][currentLocation.y].direction) {
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