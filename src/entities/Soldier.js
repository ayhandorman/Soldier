import config from '../config.json';

export class Soldier {

    constructor(world) {
        this.world = world;
        this.x = (world.size * world.tileWidth) / 2;
        this.y = (world.size * world.tileWidth) / 2;
        this.counter = 0;
        this.maxHP = 200;
        this.hp = 200;
        this.direction = world.directions.downRight;
        this.target = {
          x: parseInt(this.x / world.tileWidth),
          y: parseInt(this.y / world.tileWidth)
        };
        this.currentStep = 0,
        this.steps = [{
          x: this.target.x,
          y: this.target.y
        }];
        this.sprite = new Image();
        this.sprite.src = `${config.assetsPath}soldier.png`;
    }
    
    render = (screen, a, b, keysPressed) => {

        let whereToGo;
        let keyControl = keysPressed.left || keysPressed.up || keysPressed.right || keysPressed.down;
        if (keyControl) {
            whereToGo = {
                x: keysPressed.left && this.x > 0 ? this.x - 1 : keysPressed.right && this.x < this.world.size * this.world.tileWidth ? this.x + 1 : this.x,
                y: keysPressed.up && this.y > 0 ? this.y - 1 : keysPressed.down && this.y < this.world.size * this.world.tileWidth ? this.y + 1 : this.y
            }
            this.steps = [];
        } else 
        {
            whereToGo = this.steps[this.currentStep] ? {
                x: this.steps[this.currentStep].x * this.world.tileWidth,
                y: this.steps[this.currentStep].y * this.world.tileWidth
            } : {x: this.x, y: this.y}
        }

        if (this.x != whereToGo.x || this.y != whereToGo.y) {
            this.counter = (this.counter + 1) % 36;
            this.x += whereToGo.x == this.x ? 0 : whereToGo.x < this.x ? -2 : 2;
            this.y += whereToGo.y == this.y ? 0 : whereToGo.y < this.y ? -2 : 2;
            let directions = this.world.directions;

            switch(true) {
                case (this.x > whereToGo.x && this.y == whereToGo.y): this.direction = keyControl ? directions.right : directions.left; break;
                case (this.x < whereToGo.x && this.y == whereToGo.y): this.direction = keyControl ? directions.left : directions.right; break;
                case (this.y > whereToGo.y && this.x == whereToGo.x): this.direction = keyControl ? directions.down : directions.up; break;
                case (this.y < whereToGo.y && this.x == whereToGo.x): this.direction = keyControl ? directions.up : directions.down; break;
                case (this.x > whereToGo.x && this.y > whereToGo.y): this.direction = keyControl ? directions.downRight : directions.upLeft; break;
                case (this.x < whereToGo.x && this.y < whereToGo.y): this.direction = keyControl ? directions.upLeft : directions.downRight; break;
                case (this.x > whereToGo.x && this.y < whereToGo.y): this.direction = keyControl ? directions.upRight : directions.downLeft; break;
                case (this.x < whereToGo.x && this.y > whereToGo.y): this.direction = keyControl ? directions.downLeft : directions.upRight; break;
            }
        } else {
            if (this.currentStep < this.steps.length) {
                this.currentStep++;
            }
        }
        // <render shadow>
        this.world.context.shadowBlur = 5;
        this.world.context.shadowColor = "black";
        this.world.context.fillStyle = "rgba(0,0,0,.3)";
        this.world.context.beginPath();
        this.world.context.ellipse(screen.width / 2 + 15, screen.height / 2 + 19, 16, 8, 0, 0, 2 * Math.PI);
        this.world.context.fill();
        this.world.context.shadowBlur = 0;
        // </render shadow>

        this.world.context.drawImage(this.sprite, Math.floor(this.counter / 6) * 69, this.direction * 96, 69, 96, screen.width / 2 - 20, screen.height / 2 - 48, 69, 96);

        // <render hp bar>
        let soldierPosition = {
            x: screen.width / 2,
            y: screen.height / 2
        }
        this.world.context.lineWidth = 0.8;
        this.world.context.strokeRect(soldierPosition.x - 10, soldierPosition.y - 50, 52, 7);
        this.world.context.fillStyle = "lightgreen";
        this.world.context.fillRect(soldierPosition.x - 9, soldierPosition.y - 49, 50 / this.maxHP * this.hp, 5);
        // </render hp bar>
    };		
}