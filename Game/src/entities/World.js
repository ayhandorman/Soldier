import config from '../config.json';
import tileTypes from '../data/tiles.json';

export class World {
    
    constructor() {
        this.size = 0;
        this.tileWidth = 40;
        this.tileTypes = tileTypes;
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
        this.images = new Array(this.tileTypes.length);
        this.tiles = [];
        this.gates = [];
        this.objects = [];
        this.nameCounter = 0;
        this.name = "";
        this.fps = 0;
        this.fpsCounter = 0;
        this.lastRender = new Date();
    }

    loadTiles = () => {
        for (let i = 0; i < this.tileTypes.length; i++) {
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
                let tileType = this.tileTypes.find(x => x.id == currentTile);
                this.tiles[i][j] = {
                    type: currentTile,
                    blocking: tileType.blocking,
                    colour: tileType.colour,
                    counter: 0,
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
        this.nameCounter = 240;
        this.name = mapData.name;
    }

    renderObject = (object, screen, renderScope, soldier) => {
        if (!object.interactive || (soldier.moving && soldier.x > object.x - 25 && soldier.x < object.x + object.width - 25 && soldier.y > object.y - 15 && soldier.y < object.y + object.height - 5)) {
            object.counter = (object.counter + .2) % object.sequence;
        }
        this.context.drawImage(object.sprite, object.width * Math.floor(object.counter), 0, object.width, object.height, object.x - soldier.x + screen.width / 2, object.y - object.height - soldier.y + screen.height / 2 + 20, object.width, object.height);
    }

    render = (screen, renderScope, soldier) => {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, screen.width, screen.height);
        for (let x = renderScope.x1; x <= renderScope.x2; x++) {
            for (let y = renderScope.y1; y <= renderScope.y2; y++) {
                if (this.tiles[x][y].type == 123) {
                    this.tiles[x][y].counter = (this.tiles[x][y].counter + .15) % 10;
                    this.context.drawImage(this.images[this.tiles[x][y].type], Math.floor(this.tiles[x][y].counter) * this.tileWidth, 0, this.tileWidth, this.tileWidth, x * this.tileWidth - soldier.x + screen.width / 2, y * this.tileWidth - soldier.y + screen.height / 2, this.tileWidth, this.tileWidth);
                } else {
                    this.context.drawImage(this.images[this.tiles[x][y].type], x * this.tileWidth - soldier.x + screen.width / 2, y * this.tileWidth - soldier.y + screen.height / 2, this.tileWidth, this.tileWidth);
                }
            }
        }
        if (this.nameCounter > 0) {
            --this.nameCounter;
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
        this.context.fillStyle = "rgba(0,0,0,.6)";
        this.context.fillText("FPS: " + this.fps, 11, 111);
        this.context.fillStyle = "rgba(255,255,255,.6)";
        this.context.fillText("FPS: " + this.fps, 10, 110);
    }

    showMonsterCount = (count) => {
        this.context.fillStyle = "rgba(0,0,0,.6)";
        this.context.fillText("Monsters: " + count, 11, 131);
        this.context.fillStyle = "rgba(255,255,255,.6)";
        this.context.fillText("Monsters: " + count, 10, 130);
    }
}