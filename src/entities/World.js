export class World {
    
    constructor() {
        this.size = 200;
        this.tileWidth = 40;
        this.tileTypes = 29;
        this.monsterTypes = 4;
        this.screenWidth;
        this.screenHeight;
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
        this.assetsPath = "./assets/img/";
        this.blockingTypes = [1, 6, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27, 28];
        this.images = Array(this.tileTypes);
        this.tiles = Array(this.size);
        this.fps = 0;
        this.fpsCounter = 0;
        this.lastRender = new Date();
        this.targetImage = new Image();
        this.targetImage.src = `${this.assetsPath}target.png`;
    }

    loadTiles = () => {
        let tileBar = document.querySelector(".tile-bar");
        for (let i = 0; i < this.tileTypes; i++) {
            this.images[i] = new Image();
            this.images[i].src = `${this.assetsPath}tiles/${i}.png`;
            this.images[i].setAttribute('data-tile', i)
            this.images[i].onclick = (e) => {
                for (let item of document.querySelectorAll('.tile-bar>img')) {
                    item.classList.remove('selected');
                }
                selectedTileType = parseInt(e.target.getAttribute('data-tile'));
                e.target.classList.add('selected');
            }
            if (i == 1) {
                this.images[i].classList.add('selected');
            }
            tileBar.appendChild(this.images[i]);
        }
    }

    generateTiles = () => {
        for (let i = 0; i <= this.size; i++) {
            this.tiles[i] = new Array(this.size);
            for (let j = 0; j <= this.size; j++) {
                this.tiles[i][j] = {
                    type: 0,
                    direction: 0,
                    blocking: false
                };
            }
        }
    }

    render = (soldier) => {
        let screen = {
            x1: (() => {let x1 = parseInt((soldier.x - this.screenWidth / 2) / this.tileWidth); return x1 > 0 ? x1 : 0})(),
            y1: (() => {let y1 = parseInt((soldier.y - this.screenHeight / 2) / this.tileWidth); return y1 > 0 ? y1 : 0})(),
            x2: (() => {let x2 = parseInt((soldier.x + this.screenWidth / 2) / this.tileWidth); return x2 <= this.size ? x2 : this.size})(),
            y2: (() => {let y2 = parseInt((soldier.y + this.screenHeight / 2) / this.tileWidth); return y2 <= this.size ? y2 : this.size})()
        };

        this.context.fillStyle = "#3ABE41";
        this.context.fillRect(0, 0, this.screenWidth, this.screenHeight);
        for (let x = screen.x1; x <= screen.x2; x++) {
            for (let y = screen.y1; y <= screen.y2; y++) {
                this.context.drawImage(this.images[this.tiles[x][y].type], x * this.tileWidth - soldier.x + this.screenWidth / 2, y * this.tileWidth - soldier.y + this.screenHeight / 2, this.tileWidth, this.tileWidth);
            }
        }

        // <render target>
        if (soldier.currentStep < soldier.steps.length) {
            this.context.drawImage(this.targetImage, soldier.target.x * this.tileWidth - soldier.x + this.screenWidth / 2, soldier.target.y * this.tileWidth - 15 - soldier.y + this.screenHeight / 2, this.tileWidth, this.tileWidth);
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
        this.context.fillText("FPS: " + this.fps, 10, 30);
    }
}