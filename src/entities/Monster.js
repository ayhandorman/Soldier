export class Monster {
    constructor(world) {
        this.world = world;
        this.x = 0;
        this.y = 0;
        this.counter = 0;
        this.name = "";
        this.maxHP = 0;
        this.hp = 0;
        this.direction = this.world.directions.down;
        this.target = {
            x: 0,
            y: 0
        }
    }

    render = (screen, renderScope, soldier) => {
        if (this.x == this.target.x * this.world.tileWidth && this.y == this.target.y * this.world.tileWidth) {
            let availableDirections = [];
            if (this.x / this.world.tileWidth > 0 && !this.world.tiles[this.x / this.world.tileWidth - 1][this.y / this.world.tileWidth].blocking) availableDirections.push(this.world.directions.left);
            if (this.x / this.world.tileWidth < this.world.size && !this.world.tiles[this.x / this.world.tileWidth + 1][this.y / this.world.tileWidth].blocking) availableDirections.push(this.world.directions.right);
            if (this.y / this.world.tileWidth > 0 && !this.world.tiles[this.x / this.world.tileWidth][this.y / this.world.tileWidth - 1].blocking) availableDirections.push(this.world.directions.up);
            if (this.y / this.world.tileWidth < this.world.size && !this.world.tiles[this.x / this.world.tileWidth][this.y / this.world.tileWidth + 1].blocking) availableDirections.push(this.world.directions.down);
            this.direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            switch(this.direction) {
                case this.world.directions.left: this.target.x--; break;
                case this.world.directions.right: this.target.x++; break;
                case this.world.directions.up: this.target.y--; break;
                case this.world.directions.down: this.target.y++; break;
            }
        } else {
            this.counter = (this.counter + 1) % 30;
            this.x = this.x > this.target.x * this.world.tileWidth ? this.x - 1 : this.x + 1;
            this.y = this.y > this.target.y * this.world.tileWidth ? this.y - 1 : this.y + 1;
        }
        let position = {
            x: this.x / this.world.tileWidth,
            y: this.y / this.world.tileWidth
        }
        if (position.x >= renderScope.x1 - 1 && 
            position.x <= renderScope.x2 + 1 &&
            position.y >= renderScope.y1 - 1 &&
            position.y <= renderScope.y2 + 1) {
            let monsterPosition = {
                x: this.x - soldier.x + screen.width / 2,
                y: this.y - soldier.y + screen.height / 2
            }
            this.world.context.drawImage(this.sprite, Math.floor(this.counter / 10) * 48, this.direction * 48, 48, 48, monsterPosition.x - 4, monsterPosition.y - 15, 48, 48);

            this.world.context.font = "14px Arial";
            this.world.context.textAlign = "center"; 
            this.world.context.fillStyle = "#ad1414";
            this.world.context.fillText(this.name, monsterPosition.x + 20, monsterPosition.y - 20);
            this.world.context.lineWidth = 0.8;
            this.world.context.strokeRect(monsterPosition.x - 4, monsterPosition.y - 40, 48, 6);
            this.world.context.fillStyle = "red";
            this.world.context.fillRect(monsterPosition.x - 3, monsterPosition.y - 39, 46 / this.maxHP * this.hp, 4);
        }
    }
}