// David Xiao
// main.js

// Retrieve HTML elements
const player = document.getElementById("player");
const enemy_canv = document.getElementById("enemy_canv");

// Initialize Player Position in window centre
let player_x = window.innerWidth/2, player_y = window.innerHeight/2;

// Set drawing context for enemies
const ctx = enemy_canv.getContext("2d");
enemy_canv.width  = window.innerWidth;
enemy_canv.height = window.innerHeight;

// Initialize Event Listeners
document.addEventListener("keydown", on_key_press);
document.addEventListener("keyup", on_key_release);
document.addEventListener("mouseup", on_mouse_release);

// Variables to maintain boolean state of WASD keys
let up = down = right = left = false;

// allows object positions to change
player.style.position = "absolute";
//bullet.style.position = "absolute";

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

// Initialize variables associated with shooting
let shot=false, bullet_x, bullet_y, bullet, move_x, move_y;
const b_speed = 50;

// Shoot a single bullet when mouse is released
function on_mouse_release(e) {
	// you may only shoot once your last bullet is finished its travel
	if (shot) return;

	// maintain mouse x and y coordinates
	let mouse_x = event.clientX, mouse_y = event.clientY;

	// calculate incrementing values for bullet x and y
	// determines direction and speed of bullet
	let bullet_dir = Math.atan2(mouse_y - player_y, mouse_x - player_x);
		move_x = Math.cos(bullet_dir) * b_speed;
		move_y = Math.sin(bullet_dir) * b_speed;

	// initial x and y of bullet
	bullet_x = player_x;
	bullet_y = player_y;

	// create our bullet via smaller image of player
	bullet = document.createElement("IMG");
	bullet.setAttribute("src", "player.png");
	bullet.setAttribute("width", "30");
	bullet.setAttribute("height", "30");
	bullet.style.left = player_x + "px";
	bullet.style.top = player_y + "px";
	bullet.style.position = "absolute";
	document.body.appendChild(bullet);

	// maintain state of whether bullet is active
	shot = true;
}

// create enemy object with properties to store (X, Y) values
function Enemy(X, Y) {
	this.X = X;
	this.Y = Y;
}

// create drawing of each enemy instance
Enemy.prototype.create = function() {
	ctx.beginPath();
	ctx.arc(this.X, this.Y, 30, 0, Math.PI*2);
	ctx.fillStyle = "#0095DD";
	ctx.fill();
	ctx.closePath();
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
function draw_enemy(n_enemy) {
	const e_speed = 2;
	ctx.clearRect(0, 0, enemy_canv.width, enemy_canv.height); // clear canvas to remove past drawings
	for (i = 0; i < n_enemy; ++i) {
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
	draw_enemy(enemy_store.length);

	// PLAYER shooting logic
	// check if there is an active bullet
	if (shot) {
		// increment bullet coordinates gradually based on its slope
		bullet_x += move_x;
		bullet_y += move_y;

		// if the bullet passes the window's dimensions AND exists then stop it
		if ((bullet_x < 0 || bullet_x > window.innerWidth) && document.body.contains(bullet)) {
			shot = false;
			bullet.parentNode.removeChild(bullet);
		}

		if ((bullet_y < 0 || bullet_y > window.innerHeight) && document.body.contains(bullet)) {
			shot = false;
			bullet.parentNode.removeChild(bullet);
		}

		// update bullet position given bullet is active
		if (document.body.contains(bullet)) {
			bullet.style.left = bullet_x + "px";
			bullet.style.top = bullet_y + "px";

			// HITBOX logic
			// calculate distance between bullet and enemy, and given a certain threshold
			// it will be considered a hit
			// note: O(n^2) complexity will be fast enough given the small amount of objects
			// to check
			let update_enemy = [];
			for (i = 0; i < enemy_store.length; ++i) {
				let ex = enemy_store[i].X, ey = enemy_store[i].Y,
				dist = Math.sqrt((bullet_x - ex)**2 + (bullet_y - ey)**2);
				if (dist > 30) update_enemy.push(enemy_store[i]);
			}
			enemy_store = update_enemy.concat()
		}
	}

	// update again.
	window.requestAnimationFrame(update);
}

// updates 60 times per second
window.requestAnimationFrame(update);
