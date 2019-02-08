const   tileWidth = 450, 
        screenWidth = window.innerWidth,
        screenHeight = window.innerHeight,
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
var canvas,
    target = {
        x: 0,
        y: 0
    };

class Soldier {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.counter = 0;
        this.direction = directions.down;
        this.render = (context) => {
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
            //context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(soldierImage, Math.floor(this.counter / 6) * 69, this.direction * 96, 69, 96, this.x - 34.5, this.y - 48, 69, 96);
        };
    }
}

// 69x96				
var soldierImage = new Image();
soldierImage.src = "./assets/soldier.png";
var backgroundImage = new Image();
backgroundImage.src = "./assets/grass.png";
var stoneImage = new Image();
stoneImage.src = "./assets/stone.png";

window.onload = () => {
    canvas = document.querySelector("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext("2d");

    canvas.onmousedown = (e) => {
        target = {
            x: e.offsetX,
            y: e.offsetY
        }
    }

    update = () => {
        for (let x = 0; x < screenWidth / tileWidth; x++) {
            for (let y = 0; y < screenHeight / (tileWidth / 1.5); y++) {
                context.drawImage(backgroundImage, x * tileWidth, y * (tileWidth / 1.5), tileWidth, tileWidth / 1.5);
            }
        }
        soldier.render(context);
    }

    var soldier = new Soldier();
    soldier.direction = directions.left;
    var time = Date.now();

    (function mainLoop() {
        window.requestAnimationFrame(mainLoop);
        if ((Date.now() - time) > 10) {
            time = Date.now()
            update();
        }
    })();
}