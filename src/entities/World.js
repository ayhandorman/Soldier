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
    }
}