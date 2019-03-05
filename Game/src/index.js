/*
MIT License

Copyright (c) 2019 Ayhan Dorman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { World, Soldier, Monster, NPC } from './entities';
import config from './config.json';
import questList from './data/quests.json';
import monsterTypes from './data/monsters.json';

var world = new World(), 
    canvas, hud, arrows, attackButton, cursorPosition, touchStartPosition, soldier, renderScope,
    screen = {
        width: 0,
        height: 0
    },
    loading = true,
    questWindow,
    questDetail,
    questLog,
    selectedQuest = null,
    selectedNPC = null,
    spawnPoints,
    monsters = [],
    npcs = [],
    keysPressed = {
        left: false,
        up: false,
        right: false,
        down: false,
        attack: false
    };

for (let mt of monsterTypes) {
    mt.sprite = new Image();
    mt.sprite.src = `${config.assetsPath}monsters/${mt.image}.png`;
}

const setCookie = (name, value, days) => {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const getCookie = (name) => {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

const setCanvasSize = () => {
    setTimeout(() => {
        canvas.width = screen.width = window.innerWidth;
        canvas.height = screen.height = window.innerHeight;
    }, 500);
}

const spawnNPCs = (npcInfos) => {
    for (let npcInfo of npcInfos) {
        var npc = new NPC(world);
        npc.name = npcInfo.name;
        npc.x = npcInfo.x;
        npc.y = npcInfo.y;
        npc.sprite = new Image();
        npc.sprite.src = `${config.assetsPath}npcs/${npcInfo.image}.png`;
        npc.sequence = npcInfo.sequence;
        npc.questList = questList.filter(x => npcInfo.quests.includes(x.id));
        npc.shadow = npcInfo.shadow;
        npcs.push(npc);
    }
}



const spawnSoldier = (startingPosition) => {
    soldier.world = world;
    soldier.x = startingPosition.x * world.tileWidth;
    soldier.y = startingPosition.y * world.tileWidth;
}

const loadMap = (mapName) => {
    loading = true;
    fetch(`${config.domain}/assets/maps/${mapName}.json`)
    .then(response => response.json())
    .then(mapData => {
        monsters = [];
        npcs = [];
        world.loadMap(mapData.tiles);
        spawnPoints = mapData.spawnPoints;
        spawnNPCs(mapData.npcs);
        spawnSoldier(mapData.startingPosition);
        loading = false;
    });    
}

const update = () => {

    if (Math.floor(soldier.x / world.tileWidth) == 137 && Math.floor(soldier.y / world.tileWidth) == 119) {
        loadMap('map2');
    }
    if (Math.floor(soldier.x / world.tileWidth) == 5 && Math.floor(soldier.y / world.tileWidth) == 10) {
        loadMap('map1');
    }

    renderScope = {
        x1: (() => {let x1 = parseInt((soldier.x - screen.width / 2) / world.tileWidth); return x1 > 0 ? x1 : 0})(),
        y1: (() => {let y1 = parseInt((soldier.y - screen.height / 2) / world.tileWidth); return y1 > 0 ? y1 : 0})(),
        x2: (() => {let x2 = parseInt((soldier.x + screen.width / 2) / world.tileWidth); return x2 <= world.size ? x2 : world.size})(),
        y2: (() => {let y2 = parseInt((soldier.y + screen.height / 2) / world.tileWidth); return y2 <= world.size ? y2 : world.size})()
    };

    // <render world>
    world.render(screen, renderScope, soldier);
    // </render world>

    // <new monster spawn>
    for (let spawnPoint of spawnPoints) {
        if (monsters.filter(x => x.spawnPoint == spawnPoint.id).length < spawnPoint.maxSpawn && Math.floor(Math.random() * 50) == 0) {
            let monster = new Monster(world);
            let pointToSpawn = {
                x: spawnPoint.x + Math.ceil(spawnPoint.radius * 2 * Math.random()) - 10,
                y: spawnPoint.y + Math.ceil(spawnPoint.radius * 2 * Math.random()) - 10
            }
            if (pointToSpawn.x < 0) {
                pointToSpawn.x = 0;
            }
            if (pointToSpawn.x > world.size) {
                pointToSpawn.x = world.size;
            }
            if (pointToSpawn.y < 0) {
                pointToSpawn.y = 0;
            }
            if (pointToSpawn.y > world.size) {
                pointToSpawn.y = world.size;
            }
            if (!world.tiles[pointToSpawn.x][pointToSpawn.y].blocking) {
                monster.x = pointToSpawn.x * world.tileWidth;
                monster.y = pointToSpawn.y * world.tileWidth;
                let monsterType = monsterTypes.find(x => x.id == spawnPoint.monster);
                monster.id = monsterType.id;
                monster.spawnPoint = spawnPoint.id;
                monster.sprite = monsterType.sprite;
                monster.name = monsterType.name;
                monster.maxHP = monsterType.maxHP;
                monster.hp = monster.maxHP;
                monster.level = monsterType.level;
                monster.attackSpeed = monsterType.attackSpeed;
                monster.aggressive = monsterType.aggressive;
                monster.target = {
                    x: pointToSpawn.x,
                    y: pointToSpawn.y
                }
                monsters.push(monster);
            }
        }
    }
    // </new monster spawn>

    // <interaction>
    if (keysPressed.attack) {
        let attackArea;
        switch (soldier.direction) {
            case world.directions.up: attackArea = {x1: soldier.x - 40, y1: soldier.y - 70, x2: soldier.x + 55, y2: soldier.y + 40 }; break;
            case world.directions.down: attackArea = {x1: soldier.x - 40, y1: soldier.y - 20, x2: soldier.x + 55, y2: soldier.y + 70 }; break;
            case world.directions.left: attackArea = {x1: soldier.x - 65, y1: soldier.y - 60, x2: soldier.x + 20, y2: soldier.y + 40 }; break;
            case world.directions.right: attackArea = {x1: soldier.x - 20, y1: soldier.y - 50, x2: soldier.x + 65, y2: soldier.y + 50 }; break;
            case world.directions.downLeft: attackArea = {x1: soldier.x - 65, y1: soldier.y - 20, x2: soldier.x + 30, y2: soldier.y + 75 }; break;
            case world.directions.downRight: attackArea = {x1: soldier.x - 30, y1: soldier.y - 20, x2: soldier.x + 65, y2: soldier.y + 75 }; break;
            case world.directions.upLeft: attackArea = {x1: soldier.x - 65, y1: soldier.y - 45, x2: soldier.x + 30, y2: soldier.y + 30 }; break;
            case world.directions.upRight: attackArea = {x1: soldier.x - 30, y1: soldier.y - 45, x2: soldier.x + 65, y2: soldier.y + 30 }; break;
        }

        // <attack monsters>    
        monsters.filter(monster => monster.x > attackArea.x1 && monster.x < attackArea.x2 && monster.y > attackArea.y1 && monster.y < attackArea.y2)
                .map((monster) => {
            if (monster.hp <= 0 && !monster.yielded) {
                soldier.gainExp(monster.level * 5);
                monster.yielded = true;
                let currentQuest = soldier.questList.find(x => x.monster == monster.id);
                if (currentQuest && currentQuest.counter < currentQuest.slainCount) {
                    currentQuest.counter++;
                    if (currentQuest.counter == currentQuest.slainCount) {
                        document.querySelector(".quest-log [data-id='"+currentQuest.id+"'] section").innerHTML = "<i>Completed!</i>";
                    } else {
                        document.querySelector(".quest-log [data-id='"+currentQuest.id+"'] span").innerHTML = currentQuest.counter;
                    }
                }
            } else if (soldier.attackCounter == 0 && monster.hp > 0 && monster.damageList.length < 2) {
                monster.receiveDamage(soldier.ap);
            }
        });

        monsters.filter(monster => monster.hp <= 0 && monster.damageList.length == 0)
                .map((monster) => monsters.splice(monsters.indexOf(monster), 1));
        // </attack monsters>

        // <npc interaction>
        npcs.filter(npc => npc.x + 40 > attackArea.x1 && npc.x < attackArea.x2 && npc.y > attackArea.y1 && npc.y < attackArea.y2)
            .map((npc) => {
            if (npc.currentQuest < npc.questList.length && soldier.questList.findIndex(x => x.id == npc.questList[npc.currentQuest].id) == -1) {
                selectedQuest = npc.questList[npc.currentQuest];
                questWindow.style.display = "flex";
                let questMonster = monsterTypes.find(x => x.id == selectedQuest.monster);
                questDetail.innerHTML = `<h3>${selectedQuest.title}</h3><h4>${questMonster.name} slain: ${selectedQuest.slainCount}</h4><h4>Reward: ${selectedQuest.exp} exp</h4>${selectedQuest.log}`;
                document.querySelector(".quest-window button").innerHTML = "Accept";
            } else { 
                let currentQuest = soldier.questList.find(x => x.id == npc.questList[npc.currentQuest].id);
                if (currentQuest && currentQuest.counter == currentQuest.slainCount) {
                    selectedQuest = npc.questList[npc.currentQuest];
                    let questMonster = monsterTypes.find(x => x.id == selectedQuest.monster);
                    questWindow.style.display = "flex";
                    questDetail.innerHTML = `<h3>${selectedQuest.title}</h3><h4>${questMonster.name} slain: ${selectedQuest.slainCount}</h4><h4>Reward: ${selectedQuest.exp} exp</h4>${selectedQuest.log}`;
                    document.querySelector(".quest-window button").innerHTML = "Complete";
                    selectedNPC = npc;
                }
            }
        });
        // </npc interaction>
    }
    // </interaction>

    // <calculate render order>
    let renderOrder = monsters.slice();
    renderOrder.push(soldier);
    renderOrder.push(...npcs);
    renderOrder.sort((a, b) => a.y - b.y);
    // </calculate render order>

    // <render monsters and the player>
    for (let item of renderOrder) {
        item.render(screen, renderScope, soldier, keysPressed);
    }
    // </render monsters and the player>

    // <hud>
    let ctx = world.context;
    ctx.fillStyle = "#826729";
    ctx.fillRect(60, 48, 162, 19)
    ctx.fillStyle = "#f2c254";
    let expBarWidth = 162 / ((Math.pow(soldier.level, 2) * 100) - (Math.pow(soldier.level - 1, 2) * 100)) * (soldier.exp - (Math.pow(soldier.level - 1, 2) * 100))
    ctx.fillRect(60, 48, expBarWidth, 19)
    ctx.fillStyle = "#dbac41";
    ctx.fillRect(60, 57, expBarWidth, 10)
    ctx.font = "15px Arial";
    ctx.textAlign = "center"; 
    ctx.fillStyle = "black";
    ctx.fillText(`${soldier.exp}/${Math.pow(soldier.level, 2) * 100}`, 140, 63);
    ctx.drawImage(hud, 10, 20);
    ctx.font = "bold 12px Arial";
    ctx.fillText(soldier.level, 21, 77);
    // </hud>

    // <display stats>
    world.showFPS();
    world.showMonsterCount(monsters.length);
    soldier.showCoordinates();
    // </display stats>

    if (touchStartPosition && touchStartPosition.status) {
        ctx.drawImage(arrows, touchStartPosition.x, touchStartPosition.y);
    }
}

const downloadMap = () => {
    document.querySelector("[download]").setAttribute("href", "data:text/json;charset=utf-8," + JSON.stringify(world.tiles));
}

const saveProgress = () => {
    if (localStorage) {
        localStorage.setItem("exp", soldier.exp);
        localStorage.setItem("hp", soldier.hp);
    } else {
        setCookie("exp", soldier.exp, 3650);
        setCookie("hp", soldier.hp, 3650);
    }
}

document.oncontextmenu = (e) => e.preventDefault();

window.onresize = () => setCanvasSize();
window.onorientationchange = () => setCanvasSize();

window.onload = () => {

    // <init canvas>
    canvas = document.querySelector("canvas");
    world.context = canvas.getContext("2d");
    setCanvasSize();
    // </init canvas>

    // <init ui>
    hud = new Image();
    hud.src = `${config.assetsPath}hud.png`;
    arrows = new Image();
    arrows.src = `${config.assetsPath}arrows.png`;
    attackButton = document.querySelector('.attack');
    // <//init ui>

    // <init quest window>
    questLog = document.querySelector(".quest-log ol");
    questWindow = document.querySelector(".quest-window");
    questDetail = document.querySelector(".quest-window content");
    document.querySelector(".quest-window span").onclick = () => questWindow.style.display = 'none';
    document.querySelector(".quest-window button").onclick = () => acceptQuest();
    const acceptQuest = () => {
        questWindow.style.display = 'none';
        if (selectedQuest && selectedQuest.counter == selectedQuest.slainCount) {
            document.querySelector(`.quest-log li[data-id="${selectedQuest.id}"]`).remove();
            soldier.gainExp(selectedQuest.exp);
            soldier.questList.splice(soldier.questList.indexOf(selectedQuest), 1);
            selectedQuest = null;
            selectedNPC.currentQuest++;
        } else if (soldier.questList.findIndex(x => x.id == selectedQuest.id) == -1) {
            soldier.questList.push(selectedQuest)
            selectedQuest.counter = 0;
            let questMonster = monsterTypes.find(x => x.id == selectedQuest.monster);
            questLog.innerHTML += `<li data-id="${selectedQuest.id}"><b>${selectedQuest.title}</b><section>${questMonster.name} slain: <span>${selectedQuest.counter}</span>/${selectedQuest.slainCount}</section></li>`;
            selectedQuest = null;
        }
    }
    // </init quest>

    // <attach listeners>
    window.onpagehide = () => saveProgress();

    window.onbeforeunload = () => saveProgress();

    document.onkeydown = (e) => {
        switch (e.key) {
            case "a": keysPressed.left = true; break;
            case "w": keysPressed.up = true; break;
            case "d": keysPressed.right = true; break;
            case "s": keysPressed.down = true; break;
            case "e": keysPressed.attack = true; break;
        }
    }

    document.onkeyup = (e) => {
        switch (e.key) {
            case "a": keysPressed.left = false; break;
            case "w": keysPressed.up = false; break;
            case "d": keysPressed.right = false; break;
            case "s": keysPressed.down = false; break;
            case "e": keysPressed.attack = false; break;
            case "\"": 
                let input = prompt("Please enter command (e.g. movementSpeed=10, hpRecovery=10, ap=50, maxHP=500, hp=500):", "ap=5");
                if (input) {
                    let command = input.split('=');
                    if (command.length > 1) {
                        soldier[command[0]] = parseInt(command[1]);
                    }
                }
            break;
        }
    }

    canvas.onmousemove = (e) => {
        cursorPosition = {
            x: parseInt((soldier.x - (screen.width / 2) + e.clientX) / world.tileWidth),
            y: parseInt((soldier.y - (screen.height / 2) + e.clientY) / world.tileWidth)
        };
    }

    canvas.onmousedown = (e) => {
        if (e.button == 0) {
            keysPressed.attack = true;
        }
    }

    canvas.onmouseup = () => keysPressed.attack = false;

    canvas.ontouchstart = (e) => {
        touchStartPosition = {
            x: e.touches[0].pageX,
            y: e.touches[0].pageY,
            status: true
        }        
    }

    canvas.ontouchmove = (e) => {
        e.preventDefault();
        let t = e.touches[0];

        switch (true) {
            case (touchStartPosition.x - t.pageX > 10): keysPressed.left = true; keysPressed.right = false; break;
            case (touchStartPosition.y - t.pageY > 10): keysPressed.up = true; keysPressed.down = false; break;
            case (t.pageX - touchStartPosition.x > 10): keysPressed.right = true; keysPressed.left = false; break;
            case (t.pageY - touchStartPosition.y > 10): keysPressed.down = true; keysPressed.up = false; break;
        }
    }

    canvas.ontouchend = () => {
        keysPressed = {
            left: false,
            up: false,
            right: false,
            down: false,
            attack: keysPressed.attack
        }
        touchStartPosition.status = false;
    }

    attackButton.ontouchstart = (e) => {
        e.preventDefault();
        keysPressed.attack = true;
    }

    attackButton.ontouchend = (e) => {
        e.preventDefault();
        keysPressed.attack = false;
    }
    // </attach listeners>

    // <init soldier>
    soldier = new Soldier(world);
    let storedHP = 0;
    if (localStorage) {
        soldier.exp = parseInt(localStorage.getItem("exp") || 0);
        storedHP = parseInt(localStorage.getItem("hp") || 0);
    } else {
        soldier.exp = parseInt(getCookie("exp") || 0);
        storedHP = parseInt(getCookie("hp") || 0);
    }
    soldier.level = soldier.exp == 0 ? 1 : Math.ceil((Math.sqrt(soldier.exp / 100)));
    soldier.ap = Math.pow(soldier.level, 2) * 1.5 + 5;
    soldier.maxHP = 200 + (soldier.level - 1) * 10;
    if (storedHP > soldier.maxHP) {
        storedHP = soldier.maxHP;
    }
    soldier.hp = storedHP > 0 ? storedHP : soldier.maxHP;
    // </init soldier>

    // <start the game>
    loadMap('map1');
    (function mainLoop() {
        window.requestAnimationFrame(mainLoop);
        if (!loading) {
            update();
        }
    })();    
    // </start the game>
}

module.exports = {
    generateMap: function () {
        downloadMap();
    }
};