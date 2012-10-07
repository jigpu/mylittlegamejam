var gamejs = require('gamejs');
var WIDTH  = 640
var HEIGHT = 480

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
	this.width = 64;
	this.height = 64;
	this.image = gamejs.transform.scale(gamejs.image.load("resources/cottage1.png"), [this.width, this.height]);
	this.hp = 1;

	this.draw = function(surface) {
		//var rect = new gamejs.Rect(this.x, this.y, this.width, this.height)
		//gamejs.draw.rect(surface, this.color, rect, 0);
		surface.blit(this.image, [this.x, this.y]);
	}

	this.destroy = function() {
		this.hp = 0;
		this.image = gamejs.transform.scale(gamejs.image.load("resources/cottage0.png"), [this.width, this.height]);
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
function Grenade(x, y) {
	this.x = x;
	this.y = y;
	this.y_dest = Math.random() * HEIGHT;
	this.y_sp_toss = -3;
	this.x_sp_toss = 3 * Math.random();
	this.detonated = false;

	this.image = [gamejs.transform.scale(gamejs.image.load("resources/milk_grenade_01.png"), [16, 16]),
	              gamejs.transform.scale(gamejs.image.load("resources/milk_grenade_02.png"), [16, 16]),
	              gamejs.transform.scale(gamejs.image.load("resources/milk_grenade_03.png"), [16, 16]),
	              gamejs.transform.scale(gamejs.image.load("resources/milk_grenade_04.png"), [16, 16]),
	              gamejs.transform.scale(gamejs.image.load("resources/milk_grenade_05.png"), [16, 16]),
	              gamejs.transform.scale(gamejs.image.load("resources/milk_grenade_06.png"), [16, 16])
	             ];
	this.crater = gamejs.transform.scale(gamejs.image.load("resources/cottage0.png"), [64,64]);

	this.delay = 90;
	this.movetime = 0;

	this.getframe = function() {
		var frame = Math.floor((this.movetime/this.delay)) % this.image.length;
		return frame;
	}

	this.draw = function (surface) {
		var image = this.image[this.getframe()]
		if (this.detonated)
			image = this.crater;

		surface.blit(image, [this.x, this.y]);
	}

	this.update = function(msDuration) {
		if (!this.detonated) {
			this.movetime = this.movetime + msDuration;
			var y_speed = this.y_sp_toss + (this.movetime * 0.001);
			this.y = this.y + y_speed;
			this.x = this.x + this.x_sp_toss;

			if (this.y > this.y_dest)
				this.detonated = true;
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
	this.x = 75;
	this.y = 80;
	this.grenade = null;
	this.image = [gamejs.transform.scale(gamejs.image.load("resources/throne_00.png"), [96, 96]),
	              gamejs.transform.scale(gamejs.image.load("resources/throne_01.png"), [96, 96]),
	              gamejs.transform.scale(gamejs.image.load("resources/throne_02.png"), [96, 96]),
	              gamejs.transform.scale(gamejs.image.load("resources/throne_03.png"), [96, 96])
	             ];

	this.cloud = [gamejs.transform.scale(gamejs.image.load("resources/cloud_00.png"), [64, 64]),
	              gamejs.transform.scale(gamejs.image.load("resources/cloud_01.png"), [64, 64]),
	              gamejs.transform.scale(gamejs.image.load("resources/cloud_02.png"), [64, 64]),
	              gamejs.transform.scale(gamejs.image.load("resources/cloud_03.png"), [64, 64]),
	              gamejs.transform.scale(gamejs.image.load("resources/cloud_04.png"), [64, 64])
	             ];

	this.toss = function() {
		this.grenade = new Grenade(this.x+60, this.y+35);
	}

	this.draw = function(surface) {
		//var rect = new gamejs.Rect(this.x, this.y, 75, 125)
		//gamejs.draw.rect(surface, "#00AAFF", rect, 0);
		this.grenade.draw(surface);
		var image = this.image[3];
		surface.blit(this.cloud[0], [this.x - 20, this.y - 20]);
		surface.blit(image, [this.x, this.y]);
	}

	this.update = function(msDuration) {
		if (this.grenade != null)
			this.grenade.update(msDuration);
		if (this.grenade.detonated)
			this.toss();
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
	this.x = 100;
	this.y = 50;
	this.x_speed = 0;
	this.y_speed = 0;
	this.image = [gamejs.transform.scale(gamejs.image.load("resources/spike_run_N_01.png"), [48, 48]),
	              gamejs.transform.scale(gamejs.image.load("resources/spike_run_N_02.png"), [48, 48]),
	              gamejs.transform.scale(gamejs.image.load("resources/spike_run_N_03.png"), [48, 48]),
	              gamejs.transform.scale(gamejs.image.load("resources/spike_run_N_04.png"), [48, 48])
	             ];
	this.delay = 50;
	this.movetime = 0;

	this.getframe = function() {
		var frame = Math.floor((this.movetime/this.delay)) % this.image.length;
		return frame;
	}

	this.draw = function (surface) {
		//gamejs.draw.circle(surface, "#00AAFF", [this.x,this.y], 50, 0);
		surface.blit(this.image[this.getframe()], [this.x, this.y]);
	}

	this.notify = function(event) {
		if (event.type === gamejs.event.KEY_UP || event.type === gamejs.event.KEY_DOWN) {
			var speed = 0.1;
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
				default:
			}
		}
	}

	this.update = function(msDuration) {
		this.x = Math.round(this.x + this.x_speed * msDuration);
		this.y = Math.round(this.y + this.y_speed * msDuration);

		if (this.x_speed != 0 || this.y_speed != 0)
			this.movetime = this.movetime + msDuration;
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
	this.player = new Player(this);
	this.discord = new Discord(this);
	this.buildings = [new Building(470,300), new Building(250,400), new Building(180, 325),
	                  new Building(500,400), new Building(38, 350), new Building(575, 275)];

	this.discord.toss();

	this.destroy = function(event) {
		var i = Math.floor(Math.random()*this.buildings.length);
		this.buildings[i].destroy();
	}

	this.notify = function(event) {
		this.player.notify(event);
	}

	this.update = function(msDuration) {
		this.player.update(msDuration);
		this.discord.update(msDuration);
	}

	this.draw = function(surface) {
		surface.fill(this.color);
		this.discord.draw(surface);
		for (var i = 0; i < this.buildings.length; i++)
			this.buildings[i].draw(surface);
		this.player.draw(surface);
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

gamejs.preload(["resources/cloud_00.png", "resources/cloud_01.png", "resources/cloud_02.png", "resources/cloud_03.png",
"resources/cloud_04.png",
"resources/throne_00.png", "resources/throne_01.png", "resources/throne_02.png",
"resources/throne_03.png", "resources/milk_grenade_01.png", "resources/milk_grenade_02.png",
"resources/milk_grenade_03.png", "resources/milk_grenade_04.png", "resources/milk_grenade_05.png",
"resources/milk_grenade_06.png", "resources/cottage0.png", "resources/cottage1.png",
"resources/spike_run_N_01.png", "resources/spike_run_N_02.png", "resources/spike_run_N_03.png",
"resources/spike_run_N_04.png"]);
gamejs.ready(main);
