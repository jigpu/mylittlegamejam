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
	this.image = gamejs.image.load("resources/cottage1.png")

	var dims = this.image.getSize();
	dims[0] = dims[0] * 0.5;
	dims[1] = dims[1] * 0.5;
	this.image = gamejs.transform.scale(this.image, dims);

	this.draw = function(surface) {
		//var rect = new gamejs.Rect(this.x, this.y, this.width, this.height)
		//gamejs.draw.rect(surface, this.color, rect, 0);
		surface.blit(this.image, [this.x, this.y]);
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
function Grenade() {
}

/**
 * Class representing the villian in this game. He shouldn't need to be
 * a graphic which periodically spawns Grenades.
 *
 * TODO:
 *  - Implement a "draw" function which draws Discord on his throne.
 *  - Start a worker thread which causes him to periodically throw
 *    a new Grenade.
 */
function Discord() {

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
function Player() {
	this.x = 100;
	this.y = 50;
	this.x_speed = 0;
	this.y_speed = 0;

	this.draw = function (surface) {
		gamejs.draw.circle(surface, "#00AAFF", [this.x,this.y], 50, 0);
	}

	this.notify = function(event) {
		if (event.type === gamejs.event.KEY_UP || event.type === gamejs.event.KEY_DOWN) {
			var speed = 10;
			if (event.type === gamejs.event.KEY_UP)
				speed = 0;

			switch (event.key) {
				case gamejs.event.K_LEFT:  this.x_speed = -speed;  break;
				case gamejs.event.K_RIGHT: this.x_speed = speed; break;
				case gamejs.event.K_UP:    this.y_speed = -speed; break;
				case gamejs.event.K_DOWN:  this.y_speed = speed;  break;
				default:
			}
		}
	}

	this.update = function(msDuration) {
		this.x = this.x + this.x_speed;
		this.y = this.y + this.y_speed;
	}

	return this;
}

/**
 * The stage on which the game takes place -- Ponyville.
 *
 * DONE:
 *  - Populate with Player
 *
 * TODO:
 *  - Populate with Discord and Buildings
 */
function Stage() {
	this.color = "#FFFFFF";
	this.player = new Player();
	this.buildings = [new Building(470,300), new Building(250,400), new Building(180, 325),
	                  new Building(500,400), new Building(38, 350), new Building(575, 275)];

	this.notify = function(event) {
		this.player.notify(event);
	}

	this.update = function(msDuration) {
		this.player.update(msDuration);
	}

	this.draw = function(surface) {
		surface.fill(this.color);
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

gamejs.preload(["resources/cottage1.png"]);
gamejs.ready(main);
