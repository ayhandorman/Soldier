import config from '../config.json';

export class World {
    
    constructor() {
        this.size = 0;
        this.tileWidth = 30;
        this.tileTypes = 124;
        this.selectedTileType = 1;
        this.images = new Array(this.tileTypes);
        this.tiles = new Array(this.size);
        this.objects = [];
    }

    generateMap = (size) => {
        this.size = size;
        for (let i = 0; i <= this.size; i++) {
            this.tiles[i] = new Array(this.size);
            for (let j = 0; j <= this.size; j++) {
                this.tiles[i][j] = 0;
            }
        }
    }

    loadTiles = () => {
        let tileBar = document.querySelector(".tile-bar");
        for (let i = 0; i < this.tileTypes; i++) {
            this.images[i] = new Image();
            this.images[i].src = `${config.assetsPath}tiles/${i}.png`;
            this.images[i].setAttribute('data-tile', i)
            this.images[i].onclick = (e) => {
                for (let item of document.querySelectorAll('.tile-bar>img')) {
                    item.classList.remove('selected');
                }
                this.selectedTileType = parseInt(e.target.getAttribute('data-tile'));
                e.target.classList.add('selected');
            }
            if (i == 1) {
                this.images[i].classList.add('selected');
            }
            tileBar.appendChild(this.images[i]);
        }
    }

    setTile = (cursorPosition) => {
        this.tiles[cursorPosition.x][cursorPosition.y] = this.selectedTileType;
    }

    render = (screen, renderScope, position) => {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, screen.width, screen.height);
        for (let x = renderScope.x1; x <= renderScope.x2; x++) {
            for (let y = renderScope.y1; y <= renderScope.y2; y++) {
                this.context.drawImage(this.images[this.tiles[x][y]], 0, 0, this.tileWidth, this.tileWidth, x * this.tileWidth - position.x + screen.width / 2, y * this.tileWidth - position.y + screen.height / 2, this.tileWidth, this.tileWidth);
            }
        }
    }
}