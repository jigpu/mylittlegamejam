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
function Building() {
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
		if (event.type === gamejs.event.KEY_UP) {
			this.x_speed = 0;
			this.y_speed = 0;
		}
		else if (event.type === gamejs.event.KEY_DOWN) {
			if (event.key === gamejs.event.K_LEFT)
				this.x_speed = -10;
			else if (event.key === gamejs.event.K_RIGHT)
				this.x_speed = 10;
			else if (event.key === gamejs.event.K_UP)
				this.y_speed = -10;
			else if (event.key === gamejs.event.K_DOWN)
				this.y_speed = 10;
		}
		else if (event.type === gamejs.event.MOUSE_MOTION) {
			this.x = event.pos[0];
			this.y = event.pos[1];
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

	this.notify = function(event) {
		this.player.notify(event);
	}

	this.update = function(msDuration) {
		this.player.update(msDuration);
	}

	this.draw = function(surface) {
		surface.fill(this.color);
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

// gamejs.preload([]);
gamejs.ready(main);
