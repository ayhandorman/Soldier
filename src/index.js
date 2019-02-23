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
import map from '../assets/maps/map1.json';

var world = new World(), 
    canvas, cursorPosition, soldier, progressing, renderScope,
    screen = {
        width: 0,
        height: 0
    },
    currentButton = 3,
    monsters = [],
    monsterSprites = [],
    keysPressed = {
        left: false,
        up: false,
        right: false,
        down: false,
        attack: false
    };

const monsterTypes = [
    { name: "Devil", maxHP: 150, level: 4 },
    { name: "Maneater", maxHP: 100, level: 3 },
    { name: "Nessie", maxHP: 130, level: 2 },
    { name: "Chicky", maxHP: 50, level: 1 }
];

for (let i = 1; i <= monsterTypes.length; i++) {
    let monsterSprite = new Image();
    monsterSprite.src = `${config.assetsPath}monsters/${i}.png`;
    monsterSprites.push(monsterSprite);
}

let hud = new Image();
hud.src = `${config.assetsPath}hud.png`;

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
    renderScope = {
        x1: (() => {let x1 = parseInt((soldier.x - screen.width / 2) / world.tileWidth); return x1 > 0 ? x1 : 0})(),
        y1: (() => {let y1 = parseInt((soldier.y - screen.height / 2) / world.tileWidth); return y1 > 0 ? y1 : 0})(),
        x2: (() => {let x2 = parseInt((soldier.x + screen.width / 2) / world.tileWidth); return x2 <= world.size ? x2 : world.size})(),
        y2: (() => {let y2 = parseInt((soldier.y + screen.height / 2) / world.tileWidth); return y2 <= world.size ? y2 : world.size})()
    };

    // <render world>
    world.render(screen, renderScope, soldier);
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
            let monsterType = Math.floor(Math.random() * 4);
            monster.sprite = monsterSprites[monsterType];
            monster.name = monsterTypes[monsterType].name;
            monster.maxHP = monsterTypes[monsterType].maxHP;
            monster.level = monsterTypes[monsterType].level;
            monster.hp = monster.maxHP;
            monster.target.x = spawnPoint.x;
            monster.target.y = spawnPoint.y;
            monsters.push(monster);
        }
    }
    // </new monster spawn>

    // <attack monsters>
    if (keysPressed.attack) {
        let attackArea;
        switch (soldier.direction) {
            case world.directions.up: attackArea = {x1: soldier.x - 40, y1: soldier.y - 55, x2: soldier.x + 45, y2: soldier.y + 40 }; break;
            case world.directions.down: attackArea = {x1: soldier.x - 40, y1: soldier.y + 10, x2: soldier.x + 45, y2: soldier.y + 70 }; break;
            case world.directions.left: attackArea = {x1: soldier.x - 65, y1: soldier.y - 50, x2: soldier.x + 20, y2: soldier.y + 50 }; break;
            case world.directions.right: attackArea = {x1: soldier.x - 20, y1: soldier.y - 50, x2: soldier.x + 65, y2: soldier.y + 50 }; break;
            case world.directions.downLeft: attackArea = {x1: soldier.x - 65, y1: soldier.y - 20, x2: soldier.x + 30, y2: soldier.y + 75 }; break;
            case world.directions.downRight: attackArea = {x1: soldier.x - 30, y1: soldier.y - 20, x2: soldier.x + 65, y2: soldier.y + 75 }; break;
            case world.directions.upLeft: attackArea = {x1: soldier.x - 65, y1: soldier.y - 45, x2: soldier.x + 30, y2: soldier.y + 30 }; break;
            case world.directions.upRight: attackArea = {x1: soldier.x - 30, y1: soldier.y - 45, x2: soldier.x + 65, y2: soldier.y + 30 }; break;
        }

        monsters.filter(monster => monster.x > attackArea.x1 && monster.x < attackArea.x2 && monster.y > attackArea.y1 && monster.y < attackArea.y2)
                .map((monster) => {
            if (monster.hp <= 0 && !monster.yielded) {
                soldier.gainExp(monster.level * 5);
                monster.yielded = true;
            } else if ( monster.counter == 0) {
                monster.receiveDamage(soldier.ap);
            }
        });

        monsters.filter(monster => monster.hp <= 0 && monster.damageList.length == 0)
                .map((monster) => monsters.splice(monsters.indexOf(monster), 1));
    }
    // </attack monsters>

    // <calculate render order>
    let renderOrder = monsters.slice();
    renderOrder.push(soldier);
    renderOrder.sort((a, b) => a.y - b.y);
    // </calculate render order>

    // <render monsters and the player>
    for (let item of renderOrder) {
        item.render(screen, renderScope, soldier, keysPressed);
    }
    // </render monsters and the player>

    // <hud>
    let ctx = world.context;
    ctx.fillStyle = "#826729";
    ctx.fillRect(60, 48, 162, 19)
    ctx.fillStyle = "#f2c254";
    let expBarWidth = 162 / ((Math.pow(soldier.level, 2) * 100) - (Math.pow(soldier.level - 1, 2) * 100)) * (soldier.exp - (Math.pow(soldier.level - 1, 2) * 100))
    ctx.fillRect(60, 48, expBarWidth, 19)
    ctx.font = "15px Arial";
    ctx.textAlign = "center"; 
    ctx.fillStyle = "black";
    ctx.fillText(`${soldier.exp}/${Math.pow(soldier.level, 2) * 100}`, 140, 63);
    ctx.drawImage(hud, 10, 20);
    ctx.font = "bold 12px Arial";
    ctx.fillText(soldier.level, 21, 77);
    // </hud>

    // <display stats>
    world.showFPS();
    world.showMonsterCount(monsters.length);
    // </display stats>
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

    window.onbeforeunload = () => {
        localStorage.setItem("exp", soldier.exp);
        localStorage.setItem("level", soldier.level);
    }

    document.onkeydown = (e) => {
        switch (e.key) {
            case "a": keysPressed.left = true; break;
            case "w": keysPressed.up = true; break;
            case "d": keysPressed.right = true; break;
            case "s": keysPressed.down = true; break;
            case "e": keysPressed.attack = true; break;
        }
    }

    document.onkeyup = (e) => {
        switch (e.key) {
            case "a": keysPressed.left = false; break;
            case "w": keysPressed.up = false; break;
            case "d": keysPressed.right = false; break;
            case "s": keysPressed.down = false; break;
            case "e": keysPressed.attack = false; break;
        }
    }

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
                soldier.steps = [{x: currentLocation.x, y: currentLocation.y}];            
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
    soldier.level = parseInt(localStorage.getItem("level") || 1);
    soldier.exp = parseInt(localStorage.getItem("exp") || 0);
    soldier.ap = Math.pow(soldier.level, 2) * 1.5 + 5;

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