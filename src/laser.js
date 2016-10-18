"use strict;"

module.exports = exports = Laser;

const speed = 10;

function Laser(position, angle) {
  this.position = { x: position.x, y: position.y };
  this.angle = angle;
  this.velocity = { x: Math.sin(this.angle), y: Math.cos(this.angle) };
  this.dead = false;

  this.radius = 1
}

Laser.prototype.update = function () {
  if (this.dead) return;
  this.position.x -= speed * this.velocity.x;
  this.position.y -= speed * this.velocity.y;
}

Laser.prototype.render = function (ctx) {
  if (this.dead) return;
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.stroke();

  // debug render
  ctx.fillStyle = "red";
  ctx.fillRect(this.position.x, this.position.y, 1, 1);
}

