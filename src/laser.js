"use strict;"

module.exports = exports = Laser;

const speed = 5;

var size = 2;

function Laser(position, angle) {
  this.x = position.x;
  this.y = position.y;
  this.angle = angle;
  this.velocity = { x: Math.sin(this.angle), y: Math.cos(this.angle) };
  this.dead = false;
}

Laser.prototype.update = function () {
  this.x -= speed * this.velocity.x;
  this.y -= speed * this.velocity.y;
}

Laser.prototype.render = function (ctx) {
  ctx.fillRect(this.x, this.y, size, size);
}
