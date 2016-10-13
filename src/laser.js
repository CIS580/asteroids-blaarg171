"use strict;"

module.exports = exports = Laser;

const speed = 10;
const size = 3;

function Laser(position, angle) {
  this.position = { x: position.x, y: position.y };
  this.angle = angle;
  this.velocity = { x: Math.sin(this.angle), y: Math.cos(this.angle) };
  this.dead = false;
}

Laser.prototype.update = function () {
  this.position.x -= speed * this.velocity.x;
  this.position.y -= speed * this.velocity.y;
}

Laser.prototype.render = function (ctx) {
  ctx.fillRect(this.x, this.y, size, size);
}

