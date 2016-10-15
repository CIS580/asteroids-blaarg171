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
    x: 0,
    y: 0,
    radius: this.mass / 2 + 1
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
  this.collider.x = this.position.x + this.collider.radius;
  this.collider.y = this.position.y + this.collider.radius;
}

Rock.prototype.render = function (ctx) {
  ctx.beginPath();
  ctx.arc(this.position.x + this.collider.radius, this.position.y + this.collider.radius, this.collider.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();

  // // debug collider render
  // ctx.strokeStyle = "red";
  // ctx.lineWidth = 1;
  // ctx.beginPath();
  // ctx.arc(this.collider.x, this.collider.y, this.collider.radius, 0, 2 * Math.PI);
  // ctx.stroke();
}

