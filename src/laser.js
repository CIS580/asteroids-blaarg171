"use strict;"

module.exports = exports = Laser;

const speed = 10;
const size = 3;

function Laser(position, angle) {
  this.position = { x: position.x, y: position.y };
  this.angle = angle;
  this.velocity = { x: Math.sin(this.angle), y: Math.cos(this.angle) };
  this.dead = false;

  this.collider = {
    left: 0,
    right: 0,
    up: 0,
    down: 0
  }
}

Laser.prototype.update = function () {
  this.position.x -= speed * this.velocity.x;
  this.position.y -= speed * this.velocity.y;

  // Update collider
  this.collider.left = this.position.x - size;
  this.collider.right = this.position.x + size;
  this.collider.up = this.position.y - size;
  this.collider.down = this.position.y + size;
}

Laser.prototype.render = function (ctx) {
  ctx.fillRect(this.x, this.y, size, size);
}

