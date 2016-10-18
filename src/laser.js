"use strict;"

module.exports = exports = Laser;

const speed = 10;

function Laser(type, position, angle, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.type = type;
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

  if (this.position.x < 0 || this.position.x > this.worldWidth) this.dead = true;
  if (this.position.y < 0 || this.position.y > this.worldHeight) this.dead = true;
}

Laser.prototype.render = function (ctx) {
  if (this.dead) return;
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = (this.type == 0) ? "#32ff00" : "#ff1414";
  ctx.lineWidth = 1;
  ctx.stroke();

  // debug render
  // ctx.fillStyle = "red";
  // ctx.fillRect(this.position.x, this.position.y, 1, 1);
}

