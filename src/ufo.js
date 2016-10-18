"use strict;"

module.exports = exports = UFO;

const Laser = require("./laser");

const speed = 1;
const weaponTime = 500;
// const turnTime = 1000;

function UFO(position, canvas, shoot, sfx) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.position = {
    x: position.x,
    y: position.y
  };
  this.angle = 0;
  this.dead = false;
  this.shoot = shoot;
  this.radius = 15;
  this.timers = {
    weapon: 0,
    turn: 0
  }

  this.sfx = sfx;
}

UFO.prototype.update = function (time) {
  if (this.dead) return;

  this.timers.weapon += time;
  if (this.timers.weapon >= weaponTime) {
    this.timers.weapon = 0;
    this.sfx.play("pew2");
    this.shoot(new Laser(1, this.position, rollRandom(0, 2 * Math.PI), { width: this.worldWidth, height: this.worldHeight }))
  }
  this.position.x -= speed;

  if (this.position.x < 0 || this.position.x > this.worldWidth) this.dead = true;
}

UFO.prototype.render = function (ctx) {
  if (this.dead) return;
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.radius / 2 - 1, Math.PI, 0);
  ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI);
  ctx.closePath();
  ctx.strokeStyle = "#c902c6";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function rollRandom(aMinimum, aMaximum) {
  return Math.floor(Math.random() * (aMaximum - aMinimum) + aMinimum);
}

