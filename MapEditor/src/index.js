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

import { World } from './entities/World';

var world = new World(), 
    canvas, cursorPosition, renderScope, mapData,
    screen = {
        width: 0,
        height: 0
    },
    position = {
        x: 400,
        y: 400
    },
    brushSize = 1,
    currentButton = 3,
    keysPressed = {
        left: false,
        up: false,
        right: false,
        down: false,
        attack: false
    };

const setCanvasSize = () => {
    setTimeout(() => {
        canvas.width = screen.width = window.innerWidth;
        canvas.height = screen.height = window.innerHeight;
    }, 500);
}

const update = () => {

    if (keysPressed.left) position.x-=20;
    if (keysPressed.right) position.x+=20;
    if (keysPressed.up) position.y-=20;
    if (keysPressed.down) position.y+=20;

    renderScope = {
        x1: (() => {let x1 = parseInt((position.x - screen.width / 2) / world.tileWidth); return x1 > 0 ? x1 : 0})(),
        y1: (() => {let y1 = parseInt((position.y - screen.height / 2) / world.tileWidth); return y1 > 0 ? y1 : 0})(),
        x2: (() => {let x2 = parseInt((position.x + screen.width / 2) / world.tileWidth); return x2 <= world.size ? x2 : world.size})(),
        y2: (() => {let y2 = parseInt((position.y + screen.height / 2) / world.tileWidth); return y2 <= world.size ? y2 : world.size})()
    };

    // <render world>
    world.render(screen, renderScope, position);
    // </render world>

    // <display coords>
    if (cursorPosition) {
        world.context.font = "18px Arial";        
        world.context.textAlign = "left"; 
        world.context.fillStyle = "white";
        world.context.fillText(`${cursorPosition.x}, ${cursorPosition.y}`, 10, 25);
    }
    // </display coords>
}

const downloadMap = () => {
    if (!mapData) {
        mapData = {
            startingPosition: {x: 0, y: 0},
            npcs: [],
            spawnPoints: [],
            objects: [],
            gates: [],
            tiles: []
        };
    }
    mapData.tiles = world.tiles;
    document.querySelector("[download]").setAttribute("href", "data:text/json;charset=utf-8," + JSON.stringify(mapData));
}

document.oncontextmenu = (e) => e.preventDefault();

window.onresize = () => setCanvasSize();

window.onload = () => {

    // <init canvas>
    canvas = document.querySelector("canvas");
    world.context = canvas.getContext("2d");
    setCanvasSize();
    // </init canvas>

    // <load map functionality>
    var fileSelect = document.querySelector("[type='file']");
    fileSelect.onchange = (e) => {
        var reader = new FileReader();
        reader.onload = (e) => {
            mapData = JSON.parse(e.target.result);
            world.size = mapData.tiles[0].length - 1;
            world.tiles = mapData.tiles;
        };
        reader.readAsText(e.target.files[0]);
    }
    // </load map functionality>

    // <change brush size functionality>
    var brushSizeSelect = document.querySelector("select");
    brushSizeSelect.onchange = (e) => {
        brushSize = parseInt(e.target.value);
    }
    // </change brush size functionality>

    // <attach listeners>
    document.onkeydown = (e) => {
        switch (e.key) {
            case "a": keysPressed.left = true; break;
            case "w": keysPressed.up = true; break;
            case "d": keysPressed.right = true; break;
            case "s": keysPressed.down = true; break;
        }
    }

    document.onkeyup = (e) => {
        switch (e.key) {
            case "a": keysPressed.left = false; break;
            case "w": keysPressed.up = false; break;
            case "d": keysPressed.right = false; break;
            case "s": keysPressed.down = false; break;
            case "\"": 
                let input = prompt("Please enter map size (e.g. 200):", "200");
                if (input) {
                    if (input.length > 0) {
                        world.generateMap(parseInt(input));
                    }
                }
            break;
        }
    }

    canvas.onwheel = (e) => {
        if (e.deltaY < 0) {
            if (world.tileWidth > 5) world.tileWidth--;
        } else {
            if (world.tileWidth < 45) world.tileWidth++;
        }
    }

    canvas.onmousemove = (e) => {
        cursorPosition = {
            x: parseInt((position.x - (screen.width / 2) + e.clientX) / world.tileWidth),
            y: parseInt((position.y - (screen.height / 2) + e.clientY) / world.tileWidth)
        };
        if (currentButton == 0) {
            //world.setTile(cursorPosition);
            let halfSize = Math.floor(brushSize / 2);
            for (let i = cursorPosition.x - halfSize; i <= cursorPosition.x + halfSize; i++) {
                for (let j = cursorPosition.y - halfSize; j <= cursorPosition.y + halfSize; j++) {
                    if (i >= 0 && i <= world.size && j >= 0 && j <= world.size) {
                        world.setTile({x: i, y: j});
                    }
                }    
            }
        }
    }

    canvas.onmousedown = (e) => {
        currentButton = e.button;

        if (currentButton == 0) {
            //world.setTile(cursorPosition);
            let halfSize = Math.floor(brushSize / 2);
            for (let i = cursorPosition.x - halfSize; i <= cursorPosition.x + halfSize; i++) {
                for (let j = cursorPosition.y - halfSize; j <= cursorPosition.y + halfSize; j++) {
                    if (i >= 0 && i <= world.size && j >= 0 && j <= world.size) {
                        world.setTile({x: i, y: j});
                    }
                }    
            }
        }
    }

    canvas.onmouseup = () => currentButton = 3;
    // </attach listeners>

    // <generate initial map>
    world.generateMap(20);
    world.loadTiles();
    // </generate initial map>

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