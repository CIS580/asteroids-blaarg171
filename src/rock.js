"use strict;"

module.exports = exports = Rock;

var speeds = [1, 2, 3];
var masses = [64, 32, 8];

function Rock(position, angle, type, canvas) {
  this.position = { x: position.x, y: position.y };
  this.angle = angle;
  this.type = type;
  this.speed = speeds[this.type];
  this.velocity = { x: Math.sin(this.angle), y: Math.cos(this.angle) };
  this.mass = masses[this.type];
  this.dead = false;
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;

  this.collider = {
    left: 0,
    right: 0,
    up: 0,
    down: 0
  }
}

Rock.prototype.update = function () {
  this.position.x -= this.speed * this.velocity.x;
  this.position.y -= this.speed * this.velocity.y;

  // Wrap around the screen
  if (this.position.x < 0) this.position.x += this.worldWidth;
  if (this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if (this.position.y < 0) this.position.y += this.worldHeight;
  if (this.position.y > this.worldHeight) this.position.y -= this.worldHeight;

  // Update collider
  this.collider.left = this.position.x - this.mass / 2;
  this.collider.right = this.position.x + this.mass / 2;
  this.collider.up = this.position.y - this.mass / 2;
  this.collider.down = this.position.y + this.mass / 2;
}

Rock.prototype.render = function (ctx) {
  ctx.beginPath();
  ctx.arc(this.position.x + this.mass / 2, this.position.y + this.mass / 2, this.mass / 2, 0, 2 * Math.PI);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();
}

