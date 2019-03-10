import config from '../config.json';

export class World {
    
    constructor() {
        this.size = 0;
        this.tileWidth = 40;
        this.tileTypes = 113;
        this.directions = {
            down: 0,
            downLeft: 1,
            left: 2,
            upLeft: 3,
            up: 4,
            upRight: 5,
            right: 6,
            downRight: 7
        };
        this.blockingTypes = [  
                                1, 6, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                                31, 34, 35, 36, 38, 39, 40, 41, 45, 46, 47, 48, 49, 52, 53, 54, 
                                55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 70, 
                                71, 99, 100, 101, 102, 103, 105, 106, 107, 108, 109, 110, 111
                            ];
        this.images = new Array(this.tileTypes);
        this.tiles = [];
        this.gates = [];
        this.objects = [];
        this.fps = 0;
        this.fpsCounter = 0;
        this.lastRender = new Date();
    }

    loadTiles = () => {
        for (let i = 0; i < this.tileTypes; i++) {
            this.images[i] = new Image();
            this.images[i].src = `${config.assetsPath}tiles/${i}.png`;
        }
    }

    loadMap = (mapData) => {
        this.size = mapData.tiles.length - 1;
        this.tiles = new Array(this.size);
        for (let i = 0; i <= this.size; i++) {
            this.tiles[i] = new Array(this.size);
            for (let j = 0; j <= this.size; j++) {
                let currentTile = parseInt(mapData.tiles[i][j]);
                this.tiles[i][j] = {
                    type: currentTile,
                    blocking: this.blockingTypes.includes(currentTile)
                };
            }
        }
        this.gates = mapData.gates;
        this.objects = mapData.objects;
        for (let object of this.objects) {
            object.sprite = new Image();
            object.sprite.src = `${config.assetsPath}objects/${object.image}.png`;
            object.counter = 0;
            object.render = (screen, renderScope, soldier) => this.renderObject(object, screen, renderScope, soldier);
        }
        this.loadTiles();
    }

    renderObject = (object, screen, renderScope, soldier) => {
        if (!object.interactive || (soldier.moving && soldier.x > object.x - 25 && soldier.x < object.x + object.width - 25 && soldier.y > object.y - 15 && soldier.y < object.y + object.height - 25)) {
            object.counter = (object.counter + .2) % object.sequence;
        }
        this.context.drawImage(object.sprite, object.width * Math.floor(object.counter), 0, object.width, object.height, object.x - soldier.x + screen.width / 2, object.y - object.height - soldier.y + screen.height / 2 + 20, object.width, object.height);
    }

    render = (screen, renderScope, soldier) => {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, screen.width, screen.height);
        for (let x = renderScope.x1; x <= renderScope.x2; x++) {
            for (let y = renderScope.y1; y <= renderScope.y2; y++) {
                this.context.drawImage(this.images[this.tiles[x][y].type], x * this.tileWidth - soldier.x + screen.width / 2, y * this.tileWidth - soldier.y + screen.height / 2, this.tileWidth, this.tileWidth);
            }
        }
    }

    showFPS = () => {
        this.fpsCounter++;
        let now = new Date();
        if (now - this.lastRender >= 1000) {
            this.lastRender = now;
            this.fps = this.fpsCounter;
            this.fpsCounter = 0;    
        }
        this.context.font = "18px Arial";        
        this.context.textAlign = "left"; 
        this.context.fillStyle = "rgba(255,255,255,.4)";
        this.context.fillText("FPS: " + this.fps, 10, 110);
    }

    showMonsterCount = (count) => {
        this.context.fillText("Monsters: " + count, 10, 130);
    }
}