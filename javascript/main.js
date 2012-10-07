var gamejs = require('gamejs');
var WIDTH  = 960
var HEIGHT = 720

function getX(percent) {
	return WIDTH*percent;
}

function getY(percent) {
	return HEIGHT*percent;
}

function loadImages(files, size) {
	var images = [];
	for (var i = 0; i < files.length; i++) {
		images[i] = gamejs.transform.scale(gamejs.image.load(files[i]), size);
	}
	return images;
}

function overlaps(a, b, aloc, bloc) {
	var amask = gamejs.mask.fromSurface(a);
	var bmask = gamejs.mask.fromSurface(b);
	var x_offset = getX(aloc[0]) - getX(bloc[0]);
	var y_offset = getY(aloc[1]) - getY(bloc[1]);

	return bmask.overlap(amask, [x_offset, y_offset]);
}


/**
 * Class representing a building on the stage. Buildings have HP (only
 * one for now) and can be destroyed upon taking damage.
 *
 * TODO:
 *  - Implement a "draw" function which draws the Building differently
 *    depending on relative HP.
 *  - Implement a "damage" function which decreases the amount of HP
 *    available.
 *  - Implement a "destroy" function to update variables, collision mask,
 *    etc. when the building's HP has reached zero.
 */
function Building(x, y) {
	this.x = x;
	this.y = y;
	this.size = 0.15;
	this.image = gamejs.transform.scale(gamejs.image.load("resources/cottage1.png"), [getX(this.size), getX(this.size)]);
	this.hp = 1;

	this.draw = function(surface) {
		surface.blit(this.image, [getX(this.x), getY(this.y)]);
	}

	this.destroy = function() {
		this.hp = 0;
		this.image = gamejs.transform.scale(gamejs.image.load("resources/cottage0.png"), [getX(this.size), getX(this.size)]);
	}

	return this;
}

/**
 * Class representing a milk chocolate "grenade" to be tossed by Discord.
 *
 * TODO:
 *  - Implement a "draw" function which draws the Grenade as it moves
 *    along its path.
 *  - Implement a "launch" function which follows a parabolic path to a
 *    destination point.
 *  - Implement a "destroy" function which called whenever the Grenade
 *    is no more (either detonated or fire-breathed).
 *  - Implement a "detonate" function which causes the draw function to
 *    make a detonation animation and finds nearby Buildings on the Stage
 *    to damage.
 */
function Grenade(x, y, stage) {
	this.x = x;
	this.y = y;
	this.stage = stage;
	this.size = 0.02;
	this.crater_size = 0.1;
	this.y_dest = (Math.random() * 0.5) + 0.48
	this.x_sp_toss = 3/640 * Math.random();
	this.y_sp_toss = -3/480;
	this.detonated = false;
	this.destroyed = false;

	this.image = loadImages(["resources/milk_grenade_01.png", "resources/milk_grenade_02.png",
	                         "resources/milk_grenade_03.png", "resources/milk_grenade_04.png",
	                         "resources/milk_grenade_05.png", "resources/milk_grenade_06.png"],
	                        [getX(this.size), getY(this.size)]);

	this.crater = gamejs.transform.scale(gamejs.image.load("resources/cottage0.png"), [getX(this.crater_size), getY(this.crater_size)]);

	this.delay = 90;
	this.movetime = 0;

	this.detonate = function() {
		if (this.detonated)
			return;

		this.detonated = true;

		for (var i = 0; i < this.stage.buildings.length; i++) {
			var building = this.stage.buildings[i];
			if (building.hp == 0)
				continue;
			var hit = overlaps(this.crater, building.image,
			                   [this.x-0.015, this.y-0.025], [building.x, building.y]);
			if (hit)
				building.destroy();
		}
		this.detonate_done = true;
	}

	this.getframe = function() {
		var frame = Math.floor((this.movetime/this.delay)) % this.image.length;
		return frame;
	}

	this.draw = function (surface) {
		if (this.destroyed)
			return;

		if (!this.detonated) {
			var image = this.image[this.getframe()]
			surface.blit(image, [getX(this.x), getY(this.y)]);
		}
		else {
			var image = this.crater;
			surface.blit(image, [getX(this.x-0.015), getY(this.y-0.025)]);
		}
	}

	this.update = function(msDuration) {
		if (this.destroyed)
			this.detonated = true;

		if (!this.detonated) {
			this.movetime = this.movetime + msDuration;
			var y_speed = this.y_sp_toss + (this.movetime * 0.001/480);
			var x_speed = this.x_sp_toss;
			this.y = this.y + y_speed;
			this.x = this.x + x_speed;

			if (this.y > this.y_dest)
				this.detonate();
		}
	}
}

/**
 * Class representing the villian in this game. He shouldn't need to be
 * a graphic which periodically spawns Grenades.
 *
 * DONE:
 *  - Implement a "draw" function which draws Discord on his throne.
 *
 * TODO:
 *  - Start a worker thread which causes him to periodically throw
 *    a new Grenade.
 *  - Animate Discord and the chocolate milk cloud
 */
function Discord(stage) {
	this.stage = stage;
	this.x = 50/640;
	this.y = 150/480;
	this.size = 0.2;
	this.grenade = [];
	this.image = loadImages(["resources/throne_00.png", "resources/throne_01.png",
	                         "resources/throne_02.png", "resources/throne_03.png"],
	                        [getX(this.size), getX(this.size)]);
	this.renderimage = this.image[0];
	this.movetime = 0;
	this.waittime = 0;
	this.difficulty = 1.0;
	this.nadedelay = 0;

	this.cloud = new Cloud(this.x - 20/640, this.y - 20/480);

	this.toss = function() {
		this.nextnade = this.movetime + Math.random() * 10000 / this.difficulty;
		this.grenade.push(new Grenade(this.x+90/640, this.y+60/480, this.stage));
		this.difficulty = Math.log(10+this.grenade.length);
	}

	this.draw = function(surface) {
		this.cloud.draw(surface);
		surface.blit(this.renderimage, [getX(this.x), getY(this.y)]);
		for (var i = 0; i < this.grenade.length; i++) {
			this.grenade[i].draw(surface);
		}
	}

	this.update = function(msDuration) {
		this.movetime += msDuration;
		this.cloud.update(msDuration);
		for (var i = 0; i < this.grenade.length; i++) {
			this.grenade[i].update(msDuration);
		}
		if (this.grenade.length == 0 || this.movetime > this.nextnade) {
			if (this.renderimage == this.image[0]) {
				this.renderimage = this.image[1];
				this.waittime = this.movetime + (1000 / this.difficulty) + Math.random() * 100;
			}
			else if (this.renderimage == this.image[1] && this.waittime <= this.movetime) {
				this.renderimage = this.image[2];
				this.waittime = this.movetime + (1500 / this.difficulty) + Math.random() * 150;
			}
			else if (this.renderimage == this.image[2] && this.waittime <= this.movetime) {
				this.renderimage = this.image[3];
				this.waittime = this.movetime + (500 / this.difficulty) + Math.random() * 50;
				this.toss();
			}
		}
		if (this.renderimage == this.image[3] && this.waittime <= this.movetime) {
			this.renderimage = this.image[0];
			this.waittime = 0;
		}
	}
}

function Cloud(x, y) {
	this.x = x;
	this.y = y;
	this.size = 0.15;
	this.image = loadImages(["resources/cloud_00.png", "resources/cloud_01.png",
	                         "resources/cloud_02.png", "resources/cloud_03.png",
	                         "resources/cloud_04.png"],
	                        [getX(this.size), getX(this.size)]);

	this.movetime = 0;
	this.delay = 100;

	this.getframe = function() {
		var frame = Math.floor((this.movetime/this.delay)) % this.image.length;
		return frame;
	}

	this.draw = function(surface) {
		surface.blit(this.image[this.getframe()], [getX(this.x), getY(this.y)]);
	}

	this.update = function(msDuration) {
		this.movetime = this.movetime + msDuration;
	}
}

/**
 * Class representing the player.
 *
 * DONE:
 *  - Move around the screen in response to arrow keys
 *
 * TODO:
 *  - Collide with Buildings present on the Stage.
 *  - Produce Dragons Breath when the spacebar is pressed
 */
function Player(stage) {
	this.stage = stage;
	this.x = 0.5;
	this.y = 0.5;
	this.size = 32/640;
	this.x_speed = 0;
	this.y_speed = 0;
	this.image = loadImages(["resources/spike_run_N_01.png", "resources/spike_run_N_02.png",
	                         "resources/spike_run_N_03.png", "resources/spike_run_N_04.png"],
	                        [getX(this.size), getX(this.size)]);
	this.fire  = loadImages(["resources/breath_00.png", "resources/breath_01.png",
	                         "resources/breath_02.png", "resources/breath_03.png",
	                         "resources/breath_04.png", "resources/breath_05.png"],
	                        [getX(this.size), getX(this.size)]);

	this.delay = 50;
	this.movetime = 0;
	this.burninate = false;
	this.burntime = 0;
	this.burndelay = 100;
	this.firex = 0;
	this.firey = 0;

	this.getframe = function() {
		var frame = Math.floor((this.movetime/this.delay)) % this.image.length;
		return frame;
	}

	this.getframe_fire = function() {
		var frame = Math.floor((this.burntime/this.burndelay));
		if (frame >= this.fire.length) {
			frame = this.fire.length - 1;
			this.burninate = false;
		}
		return frame;
	}

	this.draw = function (surface) {
		if (this.burninate)
			surface.blit(this.fire[this.getframe_fire()], [getX(this.firex), getY(this.firey)]);
		surface.blit(this.image[this.getframe()], [getX(this.x), getY(this.y)]);
	}

	this.notify = function(event) {
		if (event.type === gamejs.event.KEY_UP || event.type === gamejs.event.KEY_DOWN) {
			var speed = 0.0001;
			if (event.type === gamejs.event.KEY_UP)
				speed = 0;

			switch (event.key) {
				case gamejs.event.K_LEFT:  this.x_speed = -speed;  break;
				case gamejs.event.K_RIGHT: this.x_speed = speed; break;
				case gamejs.event.K_UP:    this.y_speed = -speed; break;
				case gamejs.event.K_DOWN:  this.y_speed = speed;  break;

				case gamejs.event.K_TAB:
					if (event.type === gamejs.event.KEY_DOWN)
						this.stage.destroy();
					break;

				case gamejs.event.K_SPACE:
					if (event.type === gamejs.event.KEY_DOWN)
						this.burninate = true;
					break;
				default:
			}
		}
	}

	this.update = function(msDuration) {
		/* Update location */
		var x = this.x + this.x_speed * msDuration;
		var y = this.y + this.y_speed * msDuration;
		if (x < 0) x = 0;
		if (x + this.size > 1.0) x = 1.0 - this.size;
		if (y < 0.4) y = 0.4;
		if (y + this.size > 1.0) y = 1.0 - this.size;

		var buildings = this.stage.buildings;
		for (var i = 0; i < buildings.length; i++) {
			var building = buildings[i];
			if (building.hp <= 0)
				continue;

			if (overlaps(this.image[this.getframe()], building.image,
			             [x, y], [building.x, building.y])) {
				x = this.x;
				y = this.y;
			}
		}

		if (this.x != x || this.y != y)
			this.movetime = this.movetime + msDuration;
		this.x = x;
		this.y = y;

		/* Handle burnination */
		if (this.burninate) {
			this.burntime += msDuration;
			this.firex = this.x;
			this.firey = this.y-0.05;

			var nades = this.stage.discord.grenade;
			for (var i = 0; i < nades.length; i++) {
				var nade = nades[i];
				if (!nade.detonated) {
					var hit = overlaps(nade.image[nade.getframe()], this.fire[this.getframe_fire()],
						           [nade.x, nade.y], [this.firex, this.firey]);
					if (hit) {
						nade.destroyed = true;
					}
				}
			}
		}
		else {
			this.burntime = 0;
		}
	}

	return this;
}

/**
 * The stage on which the game takes place -- Ponyville.
 *
 * DONE:
 *  - Populate with Player
 *  - Populate with Buildings
 *
 * TODO:
 *  - Populate with Discord
 */
function Stage() {
	this.color = "#FFFFFF";
	this.image = gamejs.transform.scale(gamejs.image.load("resources/background.png"), [getX(1.0), getY(1.0)]);

	this.player = new Player(this);
	this.discord = new Discord(this);
	this.buildings = [new Building(420/640,275/480), new Building(250/640,400/480), new Building(180/640, 275/480),
	                  new Building(500/640,400/480), new Building(575/640, 250/480)];
	this.playtime = 0;
	this.gameover = false;

	this.destroy = function(event) {
		var i = Math.floor(Math.random()*this.buildings.length);
		this.buildings[i].destroy();
	}

	this.notify = function(event) {
		this.player.notify(event);
	}

	this.update = function(msDuration) {
		var gameover = true;
		for (var i = 0; i < this.buildings.length; i++) {
			if (this.buildings[i].hp != 0) {
				gameover = false;
				break;
			}
		}

		if (gameover) {
			this.gameover = true;
		}
		else {
			this.playtime += msDuration;
		}

		this.player.update(msDuration);
		this.discord.update(msDuration);
	}

	this.draw = function(surface) {
		//surface.fill(this.color);
		surface.blit(this.image, [0,0]);
		this.discord.draw(surface);
		for (var i = 0; i < this.buildings.length; i++)
			this.buildings[i].draw(surface);
		this.player.draw(surface);

		var font = new gamejs.font.Font('2em sans-serif');
		var millis = this.playtime % 1000;
		var seconds = Math.floor(this.playtime / 1000) % 60;
		var text = "You've survived: " + seconds + "." + millis + " seconds";
		if (this.gameover)
			text += ". Refresh to play again.";
		surface.blit(font.render(text), [10, 10]);
	}
}


function main() {

	var display = gamejs.display.setMode([WIDTH, HEIGHT]);
	var stage = new Stage()

	function tick(msDuration) {
		var events = gamejs.event.get();
		events.forEach(function(event) {stage.notify(event)});

		stage.update(msDuration);
		stage.draw(display);
		return;
	};

	gamejs.time.fpsCallback(tick, this, 26);
}

gamejs.preload(["resources/breath_00.png", "resources/breath_01.png", "resources/breath_02.png", "resources/breath_03.png",
"resources/breath_04.png", "resources/breath_05.png", 
"resources/background.png",
"resources/cloud_00.png", "resources/cloud_01.png", "resources/cloud_02.png", "resources/cloud_03.png",
"resources/cloud_04.png",
"resources/throne_00.png", "resources/throne_01.png", "resources/throne_02.png",
"resources/throne_03.png", "resources/milk_grenade_01.png", "resources/milk_grenade_02.png",
"resources/milk_grenade_03.png", "resources/milk_grenade_04.png", "resources/milk_grenade_05.png",
"resources/milk_grenade_06.png", "resources/cottage0.png", "resources/cottage1.png",
"resources/spike_run_N_01.png", "resources/spike_run_N_02.png", "resources/spike_run_N_03.png",
"resources/spike_run_N_04.png"]);
gamejs.ready(main);
