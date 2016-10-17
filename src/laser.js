"use strict;"

module.exports = exports = Laser;

const speed = 10;

function Laser(position, angle) {
  this.position = { x: position.x, y: position.y };
  this.angle = angle;
  this.velocity = { x: Math.sin(this.angle), y: Math.cos(this.angle) };
  this.dead = false;

  this.collider = {
    x: 0,
    y: 0,
    radius: 1
  }
}

Laser.prototype.update = function () {
  if (this.dead) return;
  this.position.x -= speed * this.velocity.x;
  this.position.y -= speed * this.velocity.y;

  // Update collider
  this.collider.x = this.position.x + this.collider.radius;
  this.collider.y = this.position.y + this.collider.radius;
}

Laser.prototype.render = function (ctx) {
  if (this.dead) return;
  ctx.beginPath();
  ctx.arc(this.position.x + this.collider.radius, this.position.y + this.collider.radius, this.collider.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.stroke();

  // // debug collider render
  // ctx.strokeStyle = "red";
  // ctx.lineWidth = 1;
  // ctx.beginPath();
  // ctx.arc(this.collider.x, this.collider.y, this.collider.radius, 0, 2 * Math.PI);
  // ctx.stroke();
}

