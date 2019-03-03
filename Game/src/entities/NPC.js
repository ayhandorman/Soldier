export class NPC {
    constructor(world) {
        this.world = world;
        this.x = 0;
        this.y = 0;
        this.counter = 0;
        this.name = "";
        this.questList = [];
        this.currentQuest = 0;
        this.sprite = null;
        this.sequence = 0;
        this.shadow = {
            x: 0,
            y: 0
        };
    }

    render = (screen, renderScope, soldier) => {
        let world = this.world;
        let position = {
            x: this.x / world.tileWidth,
            y: this.y / world.tileWidth
        }
        if (position.x >= renderScope.x1 - 1 && 
            position.x <= renderScope.x2 + 1 &&
            position.y >= renderScope.y1 - 1 &&
            position.y <= renderScope.y2 + 1) {
            let npcPosition = {
                x: this.x - soldier.x + screen.width / 2,
                y: this.y - soldier.y + screen.height / 2
            }
            let context = world.context;
            this.counter = (this.counter + 1) % (this.sequence * 15);
            
            // <render shadow>
            context.shadowBlur = 5;
            context.shadowColor = "black";
            context.fillStyle = "rgba(0,0,0,.3)";
            context.beginPath();
            context.ellipse(npcPosition.x + this.shadow.x, npcPosition.y + this.shadow.y, 16, 8, 0, 0, 2 * Math.PI);
            context.fill();
            context.shadowBlur = 0;
            // </render shadow>
            context.drawImage(this.sprite, Math.floor(this.counter / 15) * 113, 0, 113, 118, npcPosition.x + 10, npcPosition.y - 40, 60, 60);
            context.font = "14px Arial";
            context.textAlign = "center"; 
            context.fillStyle = "white";
            context.fillText(`${this.name}`, npcPosition.x + 45, npcPosition.y - 45);
        }
    }
}