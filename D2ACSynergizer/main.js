Array.prototype.notifiedPush = function(item, addToChessBoard) {
	if(addToChessBoard) {
		window.chessBoard.set(item.name, 0);
		//Entfernen von addToChessBoard von den Argumenten, aufgrund des Original-Push (sonst wird 'true' in das Array gepusht)
		arguments.length = 1;
	}
	callbackAfterPush = [];
	if(this.listeners) {
		this.listeners.forEach(func => {
			let callback = func(item, "push");
			if(callback) {
				callbackAfterPush.push(callback);
			}
		});
	}
	Array.prototype.push.apply(this,arguments);
	callbackAfterPush.forEach(cb => {
		cb();
	});
}

Array.prototype.notifiedSplice = function(item) {
	callbackAfterPush = [];
	if(this.listeners) {
		this.listeners.forEach(func => {
			let callback = func(item, "splice");
			if(callback) {
				callbackAfterPush.push(callback);
			}
		});
	}
	Array.prototype.splice.apply(this,arguments);
	callbackAfterPush.forEach(cb => {
		cb();
	});
}

Array.prototype.register = function(func) {
	if(!this.listeners) {
		this.listeners = [];
	}
	this.listeners.push(func);
};

Array.prototype.get = function(name) {
	for(let i=0; i < this.length; i++) {
		if(this[i].name == name) {
			return this[i];
		}
	}
	return undefined;
};

//Allgemeine Klassen
//----------------------------------------------------------------------------------
class ChessBoard extends Map {
	constructor()
	{
		super();
		this.activeMonsters = [];
	}
	
	notifiedSet(key, value) {
		let self = this;
		if(this.listeners) {
			this.listeners.forEach(func => {
				func(self);
			});
		}
		return Map.prototype.set.apply(this,arguments);
	}
	
	register(func) {
		if(!this.activeMonsters.listeners) {
			this.listeners = [];
		}
		this.listeners.push(func);
	};
	
	getActiveMonsters() {
		return this.activeMonsters;
	}
	
	getMaxLength() {
		return 10;
	}
	
	getCurLength() {
		return this.activeMonsters.length;
	}
	
	addMonster(monstername) {
		let monsterAlreadyOnBoard = false;
		let count = this.getActiveMonsters().length;
		for(let i=0; i < count; i++) {
			let actMonster = this.getActiveMonsters()[i];
			if(actMonster.name == monstername) {
				monsterAlreadyOnBoard = true;
				break;
			}
		}
		
		if(this.getCurLength() < this.getMaxLength()) {
			let monster = monsters.get(monstername);
			if(!monsterAlreadyOnBoard) {
				this.updateChessBoardState(monster, 1);
			}
			this.activeMonsters.notifiedPush(monster);
		}
	}
	
	removeMonster(monstername) {
		let monsterCountOnBoard = 0;
		let count = this.getActiveMonsters().length;

		for(let i=0; i < count; i++) {
			let actMonster = this.getActiveMonsters()[i];
			if(actMonster.name == monstername) {
				monsterCountOnBoard++;
			}
		}

		for(let i=0; i < count; i++) {
			let actMonster = this.getActiveMonsters()[i];
			if(actMonster.name == monstername) {
				if(monsterCountOnBoard <= 1) {
					this.updateChessBoardState(actMonster, -1);
				}
				this.getActiveMonsters().notifiedSplice(i,1);
				break;
			}
		}
	}
	
	updateChessBoardState(monster, count) {
		if(monster.species1) {
			this.set(monster.species1.name, this.get(monster.species1.name) + count)
		}
		if(monster.species2) {
			this.set(monster.species2.name, this.get(monster.species2.name) + count)
		}
		if(monster.class1) {
			this.set(monster.class1.name, this.get(monster.class1.name) + count)
		}
		if(monster.class2) {
			this.set(monster.class2.name, this.get(monster.class2.name) + count)
		}
	}
	
	isOnBoard(monstername) {
		let count = this.getActiveMonsters().length;
		for(let i=0; i < count; i++) {
			let actMonster = this.getActiveMonsters()[i];
			if(actMonster.name == monstername) {
				return true;
			}
		}
		return false;
	}
}
//----------------------------------------------------------------------------------

//Klassen für Monster, Spezies, Rassen
//----------------------------------------------------------------------------------
var species = [];
var classes = [];
var monsters = [];
var prioColors = new Map();
var existingBonis;

class Monster {
	constructor(name, species1, species2, class1, class2, cost)
	{
		this.name = name;
		this.species1 = species.get(species1);
		this.species2 = species.get(species2);
		this.class1 = classes.get(class1);
		this.class2 = classes.get(class2);
		this.cost = cost;
	}
}

class Species {
	constructor(name, boni)
	{
		this.name = name;
		this.boni = boni;
	}
}

class Class {
	constructor(name, boni)
	{
		this.name = name;
		this.boni = boni;
	}
}
//----------------------------------------------------------------------------------

//Initialisierung der Monster, Spezies, Rassen
//----------------------------------------------------------------------------------
function initSpecies() {
	species.notifiedPush(new Species("Beast", [
		{count: 2, boni:"10% Attack for all allies"},
		{count: 4, boni:"15% Attack for all allies", add:true},
		{count: 6, boni:"20% Attack for all allies", add:true}
	]), true);
	
	species.notifiedPush(new Species("Demon", [
		{count: 1, boni:"Demons deal 50% extra pure damage to targets"}
	]), true);
	
	species.notifiedPush(new Species("Dragon", [
		{count: 3, boni:"All friendly dragons have 100 mana when battle starts"}
	]), true);
	
	species.notifiedPush(new Species("Dwarf", [
		{count: 1, boni:"Attack range increased by 300"}
	]), true);
	
	species.notifiedPush(new Species("Element", [
		{count: 2, boni:"30% chance to turn attacker into stone for 3s when attacked by melee chesses"}
	]), true);
	
	species.notifiedPush(new Species("Goblin", [
		{count: 3, boni:"Armor and HP regeneration increased by 15 for a random ally"},
		{count: 6, boni:"Armor and HP regeneration increased by 15 for all friendly goblins", add:true}
	]), true);
	
	species.notifiedPush(new Species("Human", [
		{count: 2, boni:"All friendly humans have 20% chance to disarm target for 3s on damage deal"},
		{count: 4, boni:"All friendly humans have 25% chance to disarm target for 3s on damage deal"},
		{count: 6, boni:"All friendly humans have 30% chance to disarm target for 3s on damage deal"}
	]), true);
	
	species.notifiedPush(new Species("Naga", [
		{count: 2, boni:"Magic resistance increased by 20 for all allies"},
		{count: 4, boni:"Magic resistance increased by 40 for all allies", add:true}
	]), true);
	
	species.notifiedPush(new Species("Elf", [
		{count: 3, boni:"Evasion increased by 25% for all friendly elfs"},
		{count: 6, boni:"Evasion increased by 25% for all friendly elfs", add:true}
	]), true);
	
	species.notifiedPush(new Species("Ogre", [
		{count: 1, boni:"Max hp increased by 10% (for Ogres)"}
	]), true);
	
	species.notifiedPush(new Species("Orc", [
		{count: 2, boni:"Max HP increased by 250 for all friendly orcs"},
		{count: 4, boni:"Max HP increased by 350 for all friendly orcs", add:true}
	]), true);
	
	species.notifiedPush(new Species("Troll", [
		{count: 2, boni:"Attack speed increased by 35 for all friendly trolls"},
		{count: 4, boni:"Attack speed increased by 35 for all allies", add:true}
	]), true);
	
	species.notifiedPush(new Species("Undead", [
		{count: 2, boni:"Armor decreased by 5 for all enemies"},
		{count: 4, boni:"Armor decreased by 7 for all enemies", add:true}
	]), true);
}

function initClasses() {
	classes.notifiedPush(new Class("Assassin", [
		{count: 3, boni:"All friendly assassins have 10% chance to deal 3.5x damage"},
		{count: 6, boni:"All friendly assassins have 20% chance to deal 4.5x damage", add:true}
	]), true);
	
	classes.notifiedPush(new Class("Demon Hunter", [
		{count: 1, boni:"Negates enemy Demon's Fel Power"},
		{count: 2, boni:"All ally demons keep their power"}
	]), true);
	
	classes.notifiedPush(new Class("Druid", [
		{count: 2, boni:"two 1 star druids can upgrade to a 2 star druid"},
		{count: 4, boni:"two 2 start druids can upgrade to a 3 star druid", add:true}
	]), true);
	
	classes.notifiedPush(new Class("Knight", [
		{count: 2, boni:"All friendly knights have 25% chance to get a shield (75% magic resistance and 30 armor for 3 seconds)"},
		{count: 4, boni:"All friendly knights have 35% chance to get a shield (75% magic resistance and 30 armor for 3 seconds)"},
		{count: 6, boni:"All friendly knights have 45% chance to get a shield (75% magic resistance and 30 armor for 3 seconds)"}
	]), true);
	
	classes.notifiedPush(new Class("Hunter", [
		{count: 3, boni:"Attack damage increased by 25% for all friendly hunters"},
		{count: 6, boni:"Attack damage increased by 35% for all friendly hunters", add:true}
	]), true);
	
	classes.notifiedPush(new Class("Mage", [
		{count: 3, boni:"Magic resistance decreased by 50% for all enemies"},
		{count: 6, boni:"Magic resistance decreased by 30% for all enemies", add:true}
	]), true);
	
	classes.notifiedPush(new Class("Mech", [
		{count: 2, boni:"HP regeneration increased by 15 for all friendly mechs"},
		{count: 4, boni:"HP regeneration increased by 25 for all friendly mechs", add:true}
	]), true);
	
	classes.notifiedPush(new Class("Shaman", [
		{count: 2, boni:"Hex an enemy when battle starts"}
	]), true);
	
	classes.notifiedPush(new Class("Warlock", [
		{count: 3, boni:"Lifesteal increased by 20% for all allies"},
		{count: 6, boni:"Lifesteal increased by 30% for all allies", add:true}
	]), true);
	
	classes.notifiedPush(new Class("Warrior", [
		{count: 3, boni:"Armor increased by 7 for all friendly warriors"},
		{count: 6, boni:"Armor increased by 8	 for all friendly warriors", add:true},
		{count: 9, boni:"Armor increased by 9 for all friendly warriors", add:true}
	]), true);
}

function initPrioColors() {
	prioColors.set(1, "#009900");
	prioColors.set(2, "#33cc33");
	prioColors.set(3, "#ffff00");
	prioColors.set(4, "#ffff99");
	prioColors.set(5, "#ffcc00");
	prioColors.set(6, "#ff9933");
	prioColors.set(7, "#ff6600");
	prioColors.set(8, "#ff3300");
	prioColors.set(9, "#ff0000");
//	prioColors.set(10, "#ff6600");
//	prioColors.set(11, "#ff5050");
	prioColors.set(12, "#ff0000");
}

function initMonsters() {
	monsters.notifiedPush(new Monster("Axe", "Orc", undefined, "Warrior", undefined, 1));
	monsters.notifiedPush(new Monster("Enchantress", "Beast", undefined, "Druid", undefined, 1));
	monsters.notifiedPush(new Monster("Ogre Magi", "Ogre", undefined, "Mage", undefined, 1));
	monsters.notifiedPush(new Monster("Tusk", "Beast", undefined, "Warrior", undefined, 1));
	monsters.notifiedPush(new Monster("Drow Ranger", "Undead", undefined, "Hunter", undefined, 1));
	monsters.notifiedPush(new Monster("Bounty Hunter", "Goblin", undefined, "Assassin", undefined, 1));
	monsters.notifiedPush(new Monster("Clockwerk", "Goblin", undefined, "Mech", undefined, 1));
	monsters.notifiedPush(new Monster("Shadow Shaman", "Troll", undefined, "Shaman", undefined, 1));
	monsters.notifiedPush(new Monster("Bat Rider", "Troll", undefined, "Knight", undefined, 1));
	monsters.notifiedPush(new Monster("Tinker", "Goblin", undefined, "Mech", undefined, 1));
	monsters.notifiedPush(new Monster("Anti Mage", "Elf", undefined, "Demon Hunter", undefined, 1));
	monsters.notifiedPush(new Monster("Tiny", "Element", undefined, "Warrior", undefined, 1));
	monsters.notifiedPush(new Monster("Crystal Maiden", "Human", undefined, "Mage", undefined, 2));
	monsters.notifiedPush(new Monster("Beast Master", "Orc", undefined, "Hunter", undefined, 2));
	monsters.notifiedPush(new Monster("Juggernaut", "Orc", undefined, "Warrior", undefined,  2));
	monsters.notifiedPush(new Monster("Timbersaw", "Goblin", undefined, "Mech", undefined, 2));
	monsters.notifiedPush(new Monster("Queen of Pain", "Demon", undefined, "Assassin", undefined, 2));
	monsters.notifiedPush(new Monster("Puck", "Elf", "Dragon", "Mage", undefined, 2));
	monsters.notifiedPush(new Monster("Witch Doctor", "Troll", undefined, "Warlock", undefined, 2));
	monsters.notifiedPush(new Monster("Slardar", "Naga", undefined, "Warrior", undefined, 2));
	monsters.notifiedPush(new Monster("Chaos Knight", "Demon", undefined, "Knight", undefined, 2));
	monsters.notifiedPush(new Monster("Treant Protector", "Elf", undefined, "Druid", undefined, 2));
	monsters.notifiedPush(new Monster("Morphling", "Element", undefined, "Assassin", undefined, 2));
	monsters.notifiedPush(new Monster("Luna", "Elf", undefined, "Knight", undefined, 2));
	monsters.notifiedPush(new Monster("Furion", "Elf", undefined, "Druid", undefined, 2));
	monsters.notifiedPush(new Monster("Lycan", "Human", "Beast", "Warrior", undefined, 3));
	monsters.notifiedPush(new Monster("Venomancer", "Beast", undefined, "Warlock", undefined, 3));
	monsters.notifiedPush(new Monster("Omni Knight", "Human", undefined, "Knight", 3));
	monsters.notifiedPush(new Monster("Razor", "Element", undefined, "Mage", undefined, 3));
	monsters.notifiedPush(new Monster("Wind Ranger", "Elf", undefined, "Hunter", undefined, 3));
	monsters.notifiedPush(new Monster("Phantom Assassin", "Elf", undefined, "Assassin", undefined, 3));
	monsters.notifiedPush(new Monster("Abaddon", "Undead", undefined, "Knight", undefined, 3));
	monsters.notifiedPush(new Monster("Sand King", "Beast", undefined, "Assassin", undefined, 3));
	monsters.notifiedPush(new Monster("Slark", "Naga", undefined, "Assassin", undefined, 3));
	monsters.notifiedPush(new Monster("Sniper", "Dwarf", undefined, "Hunter", undefined, 3));
	monsters.notifiedPush(new Monster("Terrorblade", "Demon", undefined, "Demon Hunter", undefined, 3));
	monsters.notifiedPush(new Monster("Viper", "Dragon", undefined, "Assassin", undefined, 3));
	monsters.notifiedPush(new Monster("Shadow Fiend", "Demon", undefined, "Warlock", undefined, 3));
	monsters.notifiedPush(new Monster("Lina", "Human", undefined, "Mage", undefined, 3));
	monsters.notifiedPush(new Monster("Doom", "Demon", undefined, "Warrior", undefined, 4));
	monsters.notifiedPush(new Monster("Kunkka", "Human", undefined, "Warrior", undefined, 4));
	monsters.notifiedPush(new Monster("Troll Warlord", "Troll", undefined, "Warrior", undefined, 4));
	monsters.notifiedPush(new Monster("Light Keeper", "Human", undefined, "Mage", undefined, 4));
	monsters.notifiedPush(new Monster("Necrophos", "Undead", undefined, "Warlock", undefined, 4));
	monsters.notifiedPush(new Monster("Templar Assassin", "Elf", undefined, "Assassin", undefined, 4));
	monsters.notifiedPush(new Monster("Alchemist", "Goblin", undefined, "Warlock", undefined, 4));
	monsters.notifiedPush(new Monster("Disruptor", "Orc", undefined, "Shaman", undefined, 4));
	monsters.notifiedPush(new Monster("Medusa", "Naga", undefined, "Hunter", undefined, 4));
	monsters.notifiedPush(new Monster("Dragon Knight", "Human", "Dragon", "Knight", undefined, 4));
	monsters.notifiedPush(new Monster("Lone Druid", "Beast", undefined, "Druid", undefined, 4));
	monsters.notifiedPush(new Monster("Gyrocopter", "Dwarf", undefined, "Mech", undefined, 5));
	monsters.notifiedPush(new Monster("Lich", "Undead", undefined, "Mage", undefined, 5));
	monsters.notifiedPush(new Monster("Tide Hunter", "Naga", undefined, "Hunter", undefined, 5));
	monsters.notifiedPush(new Monster("Enigma", "Element", undefined, "Warlock", undefined, 5));
	monsters.notifiedPush(new Monster("Techies", "Goblin", undefined, "Mech", undefined, 5));
	
}
//----------------------------------------------------------------------------------

//Starten der Initialisierungen
//----------------------------------------------------------------------------------
function init() {
	this.chessBoard = new ChessBoard();
	initSpecies();
	initClasses();
	initPrioColors();
	initMonsters();
	
	createChessBoardTable();
	createBoniOverview();
	createMonsterList();
	
	updateBoni();
	
//	//1 Demon
//	this.chessBoard.addMonster("Axe");
//	this.chessBoard.addMonster("Juggernaut");
//	this.chessBoard.addMonster("Kunkka");
//	this.chessBoard.addMonster("Queen of Pain");
//	
//	//2 Demon
//	this.chessBoard.addMonster("Axe");
//	this.chessBoard.addMonster("Juggernaut");
//	this.chessBoard.addMonster("Kunkka");
//	this.chessBoard.addMonster("Queen of Pain");
//	this.chessBoard.addMonster("Doom");
//	
//	//2 Demon + 1 Demon Hunter
//	this.chessBoard.addMonster("Axe");
//	this.chessBoard.addMonster("Juggernaut");
//	this.chessBoard.addMonster("Kunkka");
//	this.chessBoard.addMonster("Queen of Pain");
//	this.chessBoard.addMonster("Doom");
//	this.chessBoard.addMonster("Terrorblade");
//	
//	//2 Demon + 2 Demon Hunter
//	this.chessBoard.addMonster("Axe");
//	this.chessBoard.addMonster("Juggernaut");
//	this.chessBoard.addMonster("Kunkka");
//	this.chessBoard.addMonster("Queen of Pain");
//	this.chessBoard.addMonster("Doom");
//	this.chessBoard.addMonster("Terrorblade");
//	this.chessBoard.addMonster("Anti Mage");
}
//----------------------------------------------------------------------------------

function createChessBoardTable() {
	let table = document.createElement("table");
	table.className = "chessBoard fullWidth";
	
	let tr = document.createElement("tr");
	tr.id = "chessBoard";
	table.appendChild(tr);
	
//	for(let i=0; i<10; i++) {
//		let td = document.createElement("td");
//		td.id = "cb" + i;
//		
//		tr.appendChild(td);
//	}
	
	this.chessBoard.getActiveMonsters().register(function(monster, typ) {
		if(typ == "push") {
			let td = createMonsterTd(monster);
			td.id = "cb_" + td.id;
			td.onclick = function() {
				window.chessBoard.removeMonster(monster.name);
				tr.removeChild(td);
			}
			tr.appendChild(td);
		}
		return updateBoni;
	});
	
	document.body.appendChild(table);
}

function updateBoni() {
	let prioMons = new Map();
	
	existingBonis = new Map();
	
	prioMons.set("blue", []);
	for(let i=1; i<=12; i++) {
		prioMons.set(i, []);
	}
	
	let demonBuff = checkDemon();
	let demonHunterBuff = checkDemonHunter();
	let bonis = [];
	let forNextLevel = new Map();
	
	let speciesFinished = false;
	let classesFinished = false;
	
	let sCount = 0;
	species.forEach(sp => {
		sCount++;
		let boni = undefined;
		let level = undefined;
		let stage = 0;
		if(sp.name == "Demon") {
			if(demonBuff) {
				if(demonHunterBuff) {
					forNextLevel.set(sp.name, 1);
				} else {
					forNextLevel.set(sp.name, 12);
				}
				bonis.push(sp.boni[0].boni);
			} else {
				if(window.chessBoard.get("Demon") > 0) {
					if(demonHunterBuff) {
						forNextLevel.set(sp.name, 1);
					} else {
						forNextLevel.set(sp.name, 12);
					}
				} else {
					forNextLevel.set(sp.name, 1);
				}
			}
		} else {
			sp.boni.forEach(bo => {
				if(window.chessBoard.get(sp.name) >= bo.count) {
					if(boni === undefined) {
						boni = bo.boni;
						level = bo.count;
						stage++;
					} else {
						boni += ", " + bo.boni;
						level = bo.count;
						stage++;
					}
				} else {
					if(!forNextLevel.get(sp.name)) {
						if(bo.count - window.chessBoard.get(sp.name) == 0) {
							forNextLevel.set(sp.name, 1);
						} else {
							forNextLevel.set(sp.name, bo.count - window.chessBoard.get(sp.name));
						}
					}
				}
				if(forNextLevel.get(sp.name) - window.chessBoard.get(sp.name) < 1) {
					forNextLevel.set(sp.name, 1);
				} else {
					forNextLevel.set(sp.name, forNextLevel.get(sp.name) - window.chessBoard.get(sp.name));
				}
				if(!forNextLevel.get(sp.name)) {
					forNextLevel.set(sp.name, 0);
				}
			});
		}
		if(boni) {
			bonis.push(sp.name + " (" + level + ") : " + boni);
			existingBonis.set(sp.name, stage);
		}
		if(sCount == classes.length) {
			speciesFinished = true;
		}
	});
	
	let cCount = 0;
	classes.forEach(cl => {
		cCount++;
		let boni = undefined;
		let level = undefined;
		let stage = 0;
		cl.boni.forEach(bo => {
			if(window.chessBoard.get(cl.name) >= bo.count) {
				if(boni === undefined) {
					boni = bo.boni;
					level = bo.count;
				} else {
					boni += ", " + bo.boni;
					level = bo.count;
				}
			} else {
				if(!forNextLevel.get(cl.name)) {
					if(bo.count - window.chessBoard.get(cl.name) == 0) {
						forNextLevel.set(cl.name, 1);
					} else {
						forNextLevel.set(cl.name, bo.count - window.chessBoard.get(cl.name));
					}
				}
			}
		});
		if(boni) {
			bonis.push(cl.name + " (" + level + ") : " + boni);
			existingBonis.set(cl.name, stage);
		}
		if(cCount == classes.length) {
			classesFinished = true;
		}
	});
	
	if(classesFinished && speciesFinished) {
		setBoniText(bonis);
	}
	
	monsters.forEach(monster => {
		let title = undefined;
		let addLevel = 0;
		if(monster.species1) {
			if(existingBonis.get(monster.species1.name)) {
				if(forNextLevel.get(monster.species1.name) - (existingBonis.get(monster.species1.name)) > 1) {
					addLevel += forNextLevel.get(monster.species1.name) - (existingBonis.get(monster.species1.name));
				} else {
					addLevel += 0;
				}
			} else {
				addLevel += forNextLevel.get(monster.species1.name);
			}
		}
		if(monster.species2) {
			if(existingBonis.get(monster.species2.name)) {
				if(forNextLevel.get(monster.species2.name) - (existingBonis.get(monster.species2.name)) > 1) {
					addLevel += forNextLevel.get(monster.species2.name) - (existingBonis.get(monster.species2.name));
				} else {
					addLevel += 0;
				}
			} else {
				addLevel += forNextLevel.get(monster.species2.name);
			}
		}
		if(monster.class1) {
			if(existingBonis.get(monster.class1.name)) {
				if(forNextLevel.get(monster.class1.name) - (existingBonis.get(monster.class1.name)) > 1) {
					addLevel += forNextLevel.get(monster.class1.name) - (existingBonis.get(monster.class1.name));
				} else {
					addLevel += 0;
				}
			} else {
				addLevel += forNextLevel.get(monster.class1.name);
			}
		}
		if(monster.class2) {
			if(existingBonis.get(monster.class2.name)) {
				if(forNextLevel.get(monster.class2.name) - (existingBonis.get(monster.class2.name)) > 1) {
					addLevel += forNextLevel.get(monster.class2.name) - (existingBonis.get(monster.class2.name));
				} else {
					addLevel += 0;
				}
			} else {
				addLevel += forNextLevel.get(monster.class2.name);
			}
		}
		if(addLevel) {
			if(addLevel >= 0 && addLevel <= 12) {
				if(window.chessBoard.isOnBoard(monster.name)) {
					title == monster.name;
					document.getElementById(monster.name).style.borderColor = "blue";
					prioMons.get("blue").push(monster);
				} else {
					document.getElementById(monster.name).style.borderColor = prioColors.get(addLevel);
					prioMons.get(addLevel).push(monster);
				}
//				document.getElementById("td" + monster.name).style.opacity = (1 / addLevel);
			} else {
				if(window.chessBoard.isOnBoard(monster.name)) {
					title == monster.name;
					document.getElementById( monster.name).style.borderColor = "blue";
					prioMons.get("blue").push(monster);
				} else {
					document.getElementById( monster.name).style.borderColor = prioColors.get(12);
					prioMons.get(12).push(monster);
				}
//				document.getElementById("td" + monster.name).style.opacity = (1 / 12);
			}
		} else {
			if(window.chessBoard.isOnBoard(monster.name)) {
				document.getElementById(monster.name).style.borderColor = "blue";
				prioMons.get("blue").push(monster);
			} else {
				document.getElementById(monster.name).style.borderColor = prioColors.get(1);
				prioMons.get(1).push(monster);
			}
//			document.getElementById("td" + monster.name).style.opacity = (1 / 1);
		}
		if(title === undefined) {
			title = '';
			if(monster.species1) {
				if(!(monster.species1.name == "Demon")) {
					if(title == '') {
						title += monster.species1.name + " - " + forNextLevel.get(monster.species1.name);
					} else {
						title += ", " + monster.species1.name + " - " + forNextLevel.get(monster.species1.name);
					}
				} 
			}
			if(monster.species2) {
				if(!(monster.species2.name == "Demon")) {
					if(title == '') {
						title += monster.species2.name + " - " + forNextLevel.get(monster.species2.name);
					} else {
						title += ", " + monster.species2.name + " - " + forNextLevel.get(monster.species2.name);
					}
				}
			}
			if(monster.class1) {
				if(title == '') {
					title += monster.class1.name + " - " + forNextLevel.get(monster.class1.name);
				} else {
					title += ", " + monster.class1.name + " - " + forNextLevel.get(monster.class1.name);
				}
			}
			if(monster.class2) {
				if(title == '') {
					title += monster.class2.name + " - " + forNextLevel.get(monster.class2.name);
				} else {
					title += ", " + monster.class2.name + " - " + forNextLevel.get(monster.class2.name);
				}
			}
		} 
		document.getElementById(monster.name).title = title;
	});
	reorderMonsters(prioMons);
}

function reorderMonsters(prioMons) {
	let arr = Array.from(prioMons);
	
	let tds = new Map();
	
	document.getElementById("monsterList").childNodes.forEach(child => {
		child.childNodes.forEach(td => {
			tds.set(td.id, td);
		});
	});
	
	document.getElementById("monsterList").innerHTML = "";
	
	let count = 0;
	let rowCount = 0;
	
	let tr;
	arr.forEach(prio => {
		prio[1].forEach(monster => {
			if(count==0) {
				tr = document.createElement("tr");
				tr.style.height = "10%";
				tr.id = "row" + rowCount;
				document.getElementById("monsterList").appendChild(tr);
				rowCount++;
			}
			
			let td = tds.get(monster.name);
			tr.appendChild(td);
			
			count++;
			if(count>= 10) {
				count = 0;
			}
		});
	});
}

function setBoniText(arr) {
	let ov = document.getElementById("boniOverview");
	
	ov.innerHTML = "";
	
	let ul = document.createElement("ul");
	
	arr.forEach(text => {
		let li = document.createElement("li");
		li.innerHTML = text;
		ul.appendChild(li);
	});
	
	ov.appendChild(ul);
}

function createBoniOverview() {
	let div = document.createElement("div");
	div.className = "boniOverview";
	div.id = "boniOverview";
	
	document.body.appendChild(div);
}

function createMonsterList() {
	let count = 0;
	let rowCount = 0;
	
	let table = document.createElement("table");
	table.className = "monsterList fullWidth";
	table.id = "monsterList";
	
	document.body.appendChild(table);
	
	let tr;
	monsters.forEach(monster => {
		if(count==0) {
			tr = document.createElement("tr");
			tr.style.height = "10%";
			tr.id = "row" + rowCount;
			table.appendChild(tr);
			rowCount++;
		}
		
		let td = createMonsterTd(monster);
		td.title = monster.name;
		td.onclick = function() {
			window.chessBoard.addMonster(monster.name);
		}
		tr.appendChild(td);
		
		count++;
		if(count>= 10) {
			count = 0;
		}
	});
}

function createMonsterTd(monster) {
	let td = document.createElement("td");
	td.id = monster.name;
	td.style.background = "url('media/monster/" + monster.name + ".png') no-repeat center";
  td.style.backgroundRepeat = "no-repeat";
  td.style.backgroundSize = "cover";
  td.className = "monsterTd";
//	td.innerHTML = monster.name; 	
	
	let heading = document.createElement("div");
	heading.innerHTML = monster.name;
	heading.className = "monsterTitle";
	
	td.appendChild(heading)
	
	return td;
}

function checkDemon() {
	let demonCount = window.chessBoard.get("Demon");
	let demonHunterCount = window.chessBoard.get("Demon Hunter");
	if(demonCount == 0) {
		return false;
	} else {
		if(demonHunterCount == 2) {
			return true;
		} else {
			if(demonCount > 1) {
				return false;
			} else {
				return true;
			}
		}
	}
}

function checkDemonHunter() {
	let demonHunterCount = window.chessBoard.get("Demon Hunter");
	if(demonHunterCount > 1) {
		return true;
	} else {
		return false;
	}
}