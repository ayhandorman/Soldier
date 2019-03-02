export class Monster {
    constructor(world) {
        this.id = 0;
        this.world = world;
        this.spawnPoint = 0;
        this.x = 0;
        this.y = 0;
        this.counter = 0;
        this.name = "";
        this.maxHP = 0;
        this.hp = 0;
        this.level = 1;
        this.yielded = false;
        this.attackSpeed = 3;
        this.attackCounter = 0;
        this.damageList = [];
        this.aggressive = false;
        this.direction = this.world.directions.down;
        this.target = {
            x: 0,
            y: 0
        }
    }

    render = (screen, renderScope, soldier) => {
        let world = this.world;
        if ((this.hp < this.maxHP || this.aggressive) && Math.abs(this.x - soldier.x) < 300 && Math.abs(this.y - soldier.y) < 300) {
            this.target = {
                x: parseInt(soldier.x / world.tileWidth),
                y: parseInt(soldier.y / world.tileWidth)
            }
        }
        if (this.x == this.target.x * world.tileWidth && this.y == this.target.y * world.tileWidth) {
            let availableDirections = [];
            if (this.x / world.tileWidth > 0 && !world.tiles[this.x / world.tileWidth - 1][this.y / world.tileWidth].blocking) availableDirections.push(world.directions.left);
            if (this.x / world.tileWidth < world.size && !world.tiles[this.x / world.tileWidth + 1][this.y / world.tileWidth].blocking) availableDirections.push(world.directions.right);
            if (this.y / world.tileWidth > 0 && !world.tiles[this.x / world.tileWidth][this.y / world.tileWidth - 1].blocking) availableDirections.push(world.directions.up);
            if (this.y / world.tileWidth < world.size && !world.tiles[this.x / world.tileWidth][this.y / world.tileWidth + 1].blocking) availableDirections.push(world.directions.down);
            let selectedDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            switch(selectedDirection) {
                case world.directions.left: this.target.x--; break;
                case world.directions.right: this.target.x++; break;
                case world.directions.up: this.target.y--; break;
                case world.directions.down: this.target.y++; break;
            }
        } else {
            this.counter = (this.counter + 1) % 30;
            
            if (this.x != this.target.x * world.tileWidth) {
                this.x += this.x < this.target.x * world.tileWidth && !world.tiles[Math.round((this.x + 1) / world.tileWidth)][Math.round(this.y / world.tileWidth)].blocking ? 1 : 0;
                this.x += this.x > this.target.x * world.tileWidth && !world.tiles[Math.round((this.x - 1) / world.tileWidth)][Math.round(this.y / world.tileWidth)].blocking ? -1 : 0;
            }
            if (this.y != this.target.y * world.tileWidth) {
                this.y += this.y < this.target.y * world.tileWidth && !world.tiles[Math.round(this.x / world.tileWidth)][Math.round((this.y + 1) / world.tileWidth)].blocking ? 1 : 0;
                this.y += this.y > this.target.y * world.tileWidth && !world.tiles[Math.round(this.x / world.tileWidth)][Math.round((this.y - 1) / world.tileWidth)].blocking ? -1 : 0;
            }
        }
        this.attackCounter = (this.attackCounter + 1) % (30 - this.attackSpeed);
        if (Math.abs(this.x - soldier.x) < world.tileWidth + 10 && Math.abs(this.y - soldier.y) < world.tileWidth + 10 && (this.hp < this.maxHP || this.aggressive) && this.attackCounter == 0 && this.hp > 0) {
            soldier.receiveDamage(Math.ceil(this.level * 1.5));
        }
        switch (true) {
            case (this.x < this.target.x * world.tileWidth): this.direction = world.directions.right; break;
            case (this.x > this.target.x * world.tileWidth): this.direction = world.directions.left; break;
            case (this.y < this.target.y * world.tileWidth): this.direction = world.directions.down; break;
            case (this.y > this.target.y * world.tileWidth): this.direction = world.directions.up; break;
        }
        let position = {
            x: this.x / world.tileWidth,
            y: this.y / world.tileWidth
        }
        if (position.x >= renderScope.x1 - 1 && 
            position.x <= renderScope.x2 + 1 &&
            position.y >= renderScope.y1 - 1 &&
            position.y <= renderScope.y2 + 1) {
            let monsterPosition = {
                x: this.x - soldier.x + screen.width / 2,
                y: this.y - soldier.y + screen.height / 2
            }
            let context = world.context;
            
            if (this.hp > 0) {
                context.drawImage(this.sprite, Math.floor(this.counter / 10) * 48, this.direction * 48, 48, 48, monsterPosition.x - 4, monsterPosition.y - 15, 48, 48);
                context.font = "14px Arial";
                context.textAlign = "center"; 
                context.fillStyle = this.aggressive ? "#ad1414" : "#f4c842";
                context.fillText(`${this.name} (${this.level - soldier.level >= 5 ? '💀' : this.level})`, monsterPosition.x + 20, monsterPosition.y - 20);
                context.lineWidth = 0.8;
                context.strokeRect(monsterPosition.x - 4, monsterPosition.y - 40, 48, 8);
                context.fillStyle = "red";
                context.fillRect(monsterPosition.x - 3, monsterPosition.y - 39, 46 / this.maxHP * this.hp, 6);
                context.font = "8px Arial";
                context.fillStyle = "white";
                context.fillText(this.hp, monsterPosition.x + 20, monsterPosition.y - 33);
            }

            if (this.damageList.length > 0) {
                let _damageList = Object.assign([], this.damageList);
                context.fillStyle = "white";
                for (let i = 0; i < _damageList.length; i++) {
                    context.font = 12 + _damageList[i].counter + "px Arial";
                    context.fillText(_damageList[i].amount, monsterPosition.x + 20, monsterPosition.y - 75 + _damageList[i].counter * 2);
                    _damageList[i].counter--;
                    if (_damageList[i].counter <= 0) {
                        this.damageList.splice(this.damageList.indexOf(_damageList[i]), 1);
                    }
                }
            }
        }
    }

    receiveDamage = (ap) => {
        let amount = Math.round(ap + ((ap + 1) * 0.2 * Math.random() - ap * 0.1));
        this.damageList.push({amount, counter: 22});
        this.hp -= amount;
    }
}