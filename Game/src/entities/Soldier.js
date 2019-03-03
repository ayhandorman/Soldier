import config from '../config.json';

export class Soldier {

    constructor(world) {
        this.world = world;
        this.x = 0;
        this.y = 0;
        this.counter = 0;
        this.maxHP = 200;
        this.hp = 200;
        this.exp = 0;
        this.level = 1;
        this.ap = 6.5;
        this.attackCounter = 0;
        this.direction = world.directions.downRight;
        this.target = {
          x: 0,
          y: 0
        };
        this.currentStep = 0,
        this.steps = [];
        this.damageList = [];
        this.questList = [];
        this.sprite = new Image();
        this.sprite.src = `${config.assetsPath}soldier.png`;
        this.hpTick = 0;
        this.movementSpeed = 2;
        this.hpRecovery = 1;
    }
    
    render = (screen, a, b, keysPressed) => {

        let whereToGo;
        let keyControl = keysPressed.left || keysPressed.up || keysPressed.right || keysPressed.down;
        if (keyControl) {
            whereToGo = {
                x: keysPressed.left && this.x > 0 ? this.x - 1 : keysPressed.right && this.x < this.world.size * this.world.tileWidth ? this.x + 1 : this.x,
                y: keysPressed.up && this.y > 0 ? this.y - 1 : keysPressed.down && this.y < this.world.size * this.world.tileWidth ? this.y + 1 : this.y
            }
            if (this.world.tiles[parseInt(Math.round(whereToGo.x / this.world.tileWidth))][Math.round(parseInt(this.y / this.world.tileWidth))].blocking) {
                whereToGo.x = this.x;
            }
            if (this.world.tiles[parseInt(Math.round(this.x / this.world.tileWidth))][Math.round(parseInt(whereToGo.y / this.world.tileWidth))].blocking) {
                whereToGo.y = this.y;
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
            this.counter = (this.counter + 1) % 48;
            this.x += whereToGo.x == this.x ? 0 : whereToGo.x < this.x ? -this.movementSpeed : this.movementSpeed;
            this.y += whereToGo.y == this.y ? 0 : whereToGo.y < this.y ? -this.movementSpeed : this.movementSpeed;
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

        this.attackCounter = (this.attackCounter + 1) % 25;

        // <hp recovery>
        this.hpTick = (this.hpTick + 1) % 50;
        if (this.hpTick == 0 && this.damageList.length == 0 && this.hp < this.maxHP) {
            this.hp+=this.hpRecovery;
        }
        // <hp recovery>

        let context = this.world.context;
        // <render shadow>
        context.shadowBlur = 5;
        context.shadowColor = "black";
        context.fillStyle = "rgba(0,0,0,.3)";
        context.beginPath();
        context.ellipse(screen.width / 2 + 20, screen.height / 2 + 12, 12, 6, 0, 0, 2 * Math.PI);
        context.fill();
        context.shadowBlur = 0;
        // </render shadow>

        context.drawImage(this.sprite, Math.floor(this.counter / 8) * 64, this.direction * 64, 64, 64, screen.width / 2 - 12, screen.height / 2 - 42, 64, 64);

        //69x96

        // <render hp bar>
        let soldierPosition = {
            x: screen.width / 2,
            y: screen.height / 2
        }
        context.lineWidth = 0.8;
        context.strokeRect(soldierPosition.x - 10, soldierPosition.y - 50, 52, 7);
        context.fillStyle = "lightgreen";
        context.fillRect(soldierPosition.x - 9, soldierPosition.y - 49, 50 / this.maxHP * this.hp, 5);
        context.font = "8px Arial";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText(this.hp, soldierPosition.x + 16, soldierPosition.y - 44);
        // </render hp bar>

        if (this.damageList.length > 0) {
            let _damageList = Object.assign([], this.damageList);
            let damageStartPosition = {
                x: screen.width / 2 + 20,
                y: screen.height / 2 - 90
            }
            context.fillStyle = "red";
            context.textAlign = "center"; 
            for (let i = 0; i < _damageList.length; i++) {
                context.font = 12 + _damageList[i].counter + "px Arial";
                context.fillText(_damageList[i].amount, damageStartPosition.x, damageStartPosition.y + _damageList[i].counter * 2);
                _damageList[i].counter--;
                if (_damageList[i].counter <= 0) {
                    this.damageList.splice(this.damageList.indexOf(_damageList[i]), 1);
                }
            }
        }
    };

    gainExp = (exp) => {
        this.exp += exp;
        if (this.exp >= Math.pow(this.level, 2) * 100) {
            this.levelUp();
        }        
    }

    levelUp = () => {
        this.level++;
        this.ap = this.level * this.level * 1.5 + 5;
        this.maxHP += 10;
        this.hp = this.maxHP;
    }

    receiveDamage = (amount) => {
        if (this.hp > 0) {
            this.hp -= amount;
            this.hp = this.hp < 0 ? 0 : this.hp;
            this.damageList.push({amount, counter: 22});
        } else {
            // <death with xp penalty>
            this.exp -= 100;
            if (this.exp < 0) {
                this.exp = 0;
            }
            this.level = this.exp == 0 ? 1 : Math.ceil((Math.sqrt(this.exp / 100)));
            this.ap = Math.pow(this.level, 2) * 1.5 + 5;
            this.maxHP = 200 + (this.level - 1) * 10;
            this.hp = this.maxHP;
            this.x = (this.world.size * this.world.tileWidth) / 2;
            this.y = (this.world.size * this.world.tileWidth) / 2;            
            this.direction = this.world.directions.downRight;
            this.target = {
                x: parseInt(this.world.size / 2),
                y: parseInt(this.world.size / 2)
            };
            this.currentStep = 0,
            this.steps = [{
                x: this.target.x,
                y: this.target.y
            }];
            // </death with xp penalty>
        }
    }    

    showCoordinates = () => {
        this.world.context.fillText(`Coords: ${Math.floor(this.x / this.world.tileWidth)}, ${Math.floor(this.y / this.world.tileWidth)}`, 10, 150);
    }
}