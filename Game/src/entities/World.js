import config from '../config.json';

export class World {
    
    constructor() {
        this.size = 0;
        this.tileWidth = 40;
        this.tileTypes = 99;
        this.selectedTileType = 1;
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
        this.blockingTypes = [1, 6, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 35, 36, 38, 39, 40, 41, 45, 46, 47, 48, 49];
        this.images = new Array(this.tileTypes);
        this.tiles = new Array(this.size);
        this.fps = 0;
        this.fpsCounter = 0;
        this.lastRender = new Date();
        this.targetImage = new Image();
        this.targetImage.src = `${config.assetsPath}target.png`;
    }

    loadTiles = () => {
        for (let i = 0; i < this.tileTypes; i++) {
            this.images[i] = new Image();
            this.images[i].src = `${config.assetsPath}tiles/${i}.png`;
        }
    }

    loadMap = (mapData) => {
        this.size = mapData.length - 1;
        for (let i = 0; i <= this.size; i++) {
            this.tiles[i] = new Array(this.size);
            for (let j = 0; j <= this.size; j++) {
                let currentTile = parseInt(mapData[i][j]);
                this.tiles[i][j] = {
                    type: currentTile,
                    direction: 0,
                    blocking: this.blockingTypes.includes(currentTile)
                };
            }
        }        
        this.loadTiles();
    }

    setTile = (cursorPosition) => {
        this.tiles[cursorPosition.x][cursorPosition.y].type = this.selectedTileType;
        this.tiles[cursorPosition.x][cursorPosition.y].blocking = this.blockingTypes.includes(this.selectedTileType);
    }

    render = (screen, renderScope, soldier) => {
        this.context.fillStyle = "#3ABE41";
        this.context.fillRect(0, 0, screen.width, screen.height);
        for (let x = renderScope.x1; x <= renderScope.x2; x++) {
            for (let y = renderScope.y1; y <= renderScope.y2; y++) {
                this.context.drawImage(this.images[this.tiles[x][y].type], x * this.tileWidth - soldier.x + screen.width / 2, y * this.tileWidth - soldier.y + screen.height / 2, this.tileWidth, this.tileWidth);
            }
        }

        // <render target>
        if (soldier.currentStep < soldier.steps.length) {
            this.context.drawImage(this.targetImage, soldier.target.x * this.tileWidth - soldier.x + screen.width / 2, soldier.target.y * this.tileWidth - 15 - soldier.y + screen.height / 2, this.tileWidth, this.tileWidth);
        }
        // </render target>
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
        this.context.fillStyle = "rgba(0,0,0,.3)";
        this.context.fillText("FPS: " + this.fps, 10, 110);
    }

    showMonsterCount = (count) => {
        this.context.fillText("Monsters: " + count, 10, 130);
    }
}