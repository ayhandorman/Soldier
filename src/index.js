const   floorWidth = 250,
        tileWidth = 40,
        tileSize = 100,
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
        // 3  4  5
        // 2     6
        // 1  0  7
var canvas, screenWidth, screenHeight, mouse,
    processing = false,
    tiles = Array(tileSize),
    target = {
        x: 100,
        y: 100
    };

class Soldier {

    constructor() {        
        this.x = 100;
        this.y = 100;
        this.counter = 0;
        this.direction = directions.down;
    }
    
    render = (context) => {

        if (this.x != target.x || this.y != target.y) {
            this.counter = (this.counter + 1) % 36;
            this.x += target.x == this.x ? 0 : target.x < this.x ? -1 : 1;
            this.y += target.y == this.y ? 0 : target.y < this.y ? -1 : 1;

            switch(true) {
                case (this.x > target.x && this.y == target.y): this.direction = directions.left; break;
                case (this.x < target.x && this.y == target.y): this.direction = directions.right; break;
                case (this.y > target.y && this.x == target.x): this.direction = directions.up; break;
                case (this.y < target.y && this.x == target.x): this.direction = directions.down; break;
                case (this.x > target.x && this.y > target.y): this.direction = directions.upLeft; break;
                case (this.x < target.x && this.y < target.y): this.direction = directions.downRight; break;
                case (this.x > target.x && this.y < target.y): this.direction = directions.downLeft; break;
                case (this.x < target.x && this.y > target.y): this.direction = directions.upRight; break;
            }
        }
        context.drawImage(soldierImage, Math.floor(this.counter / 6) * 69, this.direction * 96, 69, 96, this.x - 34.5, this.y - 48, 69, 96);
    };
}

// 69x96				
var soldierImage = new Image();
soldierImage.src = "./assets/soldier.png";
var backgroundImage = new Image();
backgroundImage.src = "./assets/grass.png";
var stoneImage = new Image();
stoneImage.src = "./assets/stone.png";

const setCanvasSize = () => {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    canvas.width = screenWidth;
    canvas.height = screenHeight;
}

window.onresize = () => setCanvasSize();

window.onload = () => {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    setCanvasSize();

    canvas.onmousedown = (e) => {
        target = {
            x: e.offsetX,
            y: e.offsetY
        }
        for (let i = 0; i <= tileSize; i++) {
            for (let j = 0; j <= tileSize; j++) {
                tiles[i][j].direction = 0;
            }
        }
    }

    drawTiles = () => {
        context.strokeStyle = '#888';
        context.beginPath();
        for (let i = 0; i <= tileSize; i++) {
            tiles[i] = new Array(tileSize);
            for (let j = 0; j <= tileSize; j++) {
                tiles[i][j] = {
                    type: 0,
                    direction: 0
                };
            }
            context.moveTo(tileWidth * i, 0);
            context.lineTo(tileWidth * i, screenHeight);
            context.moveTo(0, tileWidth * i);
            context.lineTo(screenWidth, tileWidth * i);
        }
        context.stroke();
    }

    update = () => {
        for (let x = 0; x < screenWidth / floorWidth; x++) {
            for (let y = 0; y < screenHeight / (floorWidth / 2); y++) {
                context.drawImage(backgroundImage, x * floorWidth, y * (floorWidth / 2), floorWidth, floorWidth / 2);
            }
        }
        drawTiles();
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