var gamejs = require('gamejs');
var WIDTH  = 640
var HEIGHT = 480

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
