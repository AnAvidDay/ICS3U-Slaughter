// David Xiao
// main.js

// Retrieve HTML elements
const player = document.getElementById("player"),
	enemy_canv = document.getElementById("enemy_canv"),
	bullet_canv = document.getElementById("bullet_canv");

// Initialize Player Position in window centre
let player_x = window.innerWidth/2, player_y = window.innerHeight/2;

// Set drawing context for enemies and bullets
const ectx = enemy_canv.getContext("2d"),
	bctx = bullet_canv.getContext("2d");

// display size is entire window
enemy_canv.width = window.innerWidth;
enemy_canv.height = window.innerHeight;
bullet_canv.width = window.innerWidth;
bullet_canv.height = window.innerHeight;

// Initialize Event Listeners
document.addEventListener("keydown", on_key_press);
document.addEventListener("keyup", on_key_release);
document.addEventListener("mouseup", on_mouse_release);

// Variables to maintain boolean state of WASD keys
let up = down = right = left = false;

// allows image positions to change
player.style.position = "absolute";

// Determine if and what key is pressed
// Store pressed state to true for each WASD
function on_key_press(e) {
	// W pressed
	if (e.keyCode == 83) up = true;

	// D pressed
	else if (e.keyCode == 68) right = true;

	// S pressed
	else if (e.keyCode == 87) down = true;

	// A pressed
	else if (e.keyCode == 65) left = true;
}

// Determine if and what key is released
// Store pressed state to false for each WASD
function on_key_release(e) {
	// W pressed
	if (e.keyCode == 83) up = false;

	// D pressed
	else if (e.keyCode == 68) right = false;

	// S pressed
	else if (e.keyCode == 87) down = false;

	// A pressed
	else if (e.keyCode == 65) left = false;
}

// create bullet object with properties to store (X, Y) values and direction
function Bullet(X, Y, dirX, dirY) {
	this.X = X;
	this.Y = Y;
	this.dirX = dirX;
	this.dirY = dirY;
}

Bullet.prototype.create = function() {
	bctx.beginPath();
	bctx.arc(this.X, this.Y, 10, 0, Math.PI*2);
	bctx.fillStyle = "#9800ff"; // violet colour
	bctx.fill();
	bctx.closePath();
}

// array to store bullet instances
let bullet_store = [];

// When the mouse is released (click and release), create instance of bullet
function on_mouse_release(e) {
	let mouse_x = e.clientX, mouse_y = e.clientY;
	// calculate incrementing values for bullet x and y
	// determines direction and speed of bullet
	const b_speed = 70;
	let bullet_dir = Math.atan2(mouse_y - player_y, mouse_x - player_x),
		move_x = Math.cos(bullet_dir) * b_speed,
		move_y = Math.sin(bullet_dir) * b_speed;

	// initial x and y of bullet
	bullet_store.push(new Bullet(player_x, player_y, move_x, move_y));
}

// redraws each bullet for each call
function draw_bullet() {
	bctx.clearRect(0, 0, bullet_canv.width, bullet_canv.height); // clear canvas to remove past drawings
	let update_bullet = [];
	for (i = 0; i < bullet_store.length; ++i) {
		let bx = bullet_store[i].X, by = bullet_store[i].Y;
		bullet_store[i].create();
		// update bullet location with targetted direction
		bullet_store[i].X += bullet_store[i].dirX;
		bullet_store[i].Y += bullet_store[i].dirY;

		// HITBOX logic
		// calculate distance between bullet and enemy, and given a certain threshold
		// it will be considered a hit
		// note: O(#enemy * #bullets) complexity will be fast enough given the small amount of objects
		// to check
		let update_enemy = [];	// if enemy not within threshold, save it in this array
		let remove = false; // check if bullet should be removed
		for (j = 0; j < enemy_store.length; ++j) {
			let ex = enemy_store[j].X, ey = enemy_store[j].Y;
			dist = Math.sqrt((bx - ex)**2 + (by - ey)**2);
			if (dist > 40) {
				update_enemy.push(enemy_store[j]);
			} else {
				remove = true;
			}
		}
		enemy_store = update_enemy.concat();	// update number of enemies

		// check if bullet when out of window bounds
		// remove it to increase game performance
		if (bx <= 0 || bx > window.innerWidth) {
			remove = true;
		} else if (by <= 0 || by > window.innerHeight) {
			remove = true;
		}

		if (!remove) update_bullet.push(bullet_store[i]);
	}
	bullet_store = update_bullet.concat();
}

// create enemy object with properties to store (X, Y) values
function Enemy(X, Y) {
	this.X = X;
	this.Y = Y;
}

// create drawing of each enemy instance
Enemy.prototype.create = function() {
	ectx.beginPath();
	ectx.arc(this.X, this.Y, 30, 0, Math.PI*2);
	ectx.fillStyle = "#0095DD";
	ectx.fill();
	ectx.closePath();
}

// array to store each enemy instance
let enemy_store = []; // Initially empty

// spawn enemies for each wave
function spawn_enemy(n_enemy) {
	// Initialize new enemy x and y
	let x, y;
	for (i = 0; i < n_enemy; ++i) {
		// randomly select whether enemy will spawn up/down/left/right
		let rand_location = Math.floor(Math.random() * 4);

		// x and y are dependent on which side of the screen enemy will spawn
		// 0 --> up, 1 --> down, 2 --> left, 3 --> right
		if (rand_location == 0) {
			y = 0;
			x = Math.floor(Math.random() * (window.innerWidth+1));
		} else if (rand_location == 1) {
			y = window.innerHeight;
			x = Math.floor(Math.random() * (window.innerWidth+1));
		} else if (rand_location == 2) {
			y = Math.floor(Math.random() * (window.innerHeight+1));
			x = 0;
		} else {
			y = Math.floor(Math.random() * (window.innerHeight+1));
			x = window.innerWidth;
		}

		// push into enemy storage array
		enemy_store.push(new Enemy(x, y));
	}
}

// called in update (gameloop)
// redraws each enemy at each call
function draw_enemy() {
	const e_speed = 2;
	ectx.clearRect(0, 0, enemy_canv.width, enemy_canv.height); // clear canvas to remove past drawings
	for (i = 0; i < enemy_store.length; ++i) {
		enemy_store[i].create();
		// direction: enemy moves towards player
		let enemy_dir = Math.atan2(player_y - enemy_store[i].Y, player_x - enemy_store[i].X);
			move_ex = Math.cos(enemy_dir) * e_speed;
			move_ey = Math.sin(enemy_dir) * e_speed;
		// update enemy x and y
		enemy_store[i].X += move_ex;
		enemy_store[i].Y += move_ey;
	}
}

// temp spawn enemies
spawn_enemy(4);

// update game events about 60 times per second
// game loop
function update() {
	// PLAYER WASD movement logic
	if (up && player_y + 5 < window.innerHeight) player_y += 5;
	else if (down && player_y - 5 > 0) player_y -= 5;
	else if (left && player_x - 5 > 0) player_x -= 5;
	else if (right && player_x + 5 < window.innerWidth) player_x += 5;
	player.style.left = player_x + "px";
	player.style.top = player_y + "px";

	// redraw enemy to display movement
	draw_enemy();

	// redraw bullet to display movement
	draw_bullet();

	// update again.
	window.requestAnimationFrame(update);
}

// updates 60 times per second
window.requestAnimationFrame(update);
