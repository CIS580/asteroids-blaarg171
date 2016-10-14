"use strict";

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

const Laser = require("./laser");

const turnSpeed = 0.075;
const maxVelocity = 7.5;
const cooldown = 200;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.thrusting = false;
  this.braking = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.dead = false;

  this.weapon = {
    shooting: false,
    shots: [],
    timer: 0,

  }

  this.collider = {
    left: 0,
    right: 0,
    up: 0,
    down: 0
  }

  // var self = this;
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function (time) {
  // Apply angular velocity
  if (this.steerLeft) this.angle += turnSpeed;
  if (this.steerRight) this.angle -= turnSpeed;

  // Apply acceleration
  if (this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle) / 10,
      y: Math.cos(this.angle) / 10
    }
    this.velocity.x -= acceleration.x;
    if (this.velocity.x < -maxVelocity) this.velocity.x = -maxVelocity;
    else if (this.velocity.x > maxVelocity) this.velocity.x = maxVelocity;
    this.velocity.y -= acceleration.y;
    if (this.velocity.y < -maxVelocity) this.velocity.y = -maxVelocity;
    else if (this.velocity.y > maxVelocity) this.velocity.y = maxVelocity;
  }
  // else if (this.braking) {
  //   this.velocity.x *= 0.9;
  //   this.velocity.y *= 0.9;
  // }

  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if (this.position.x < 0) this.position.x += this.worldWidth;
  if (this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if (this.position.y < 0) this.position.y += this.worldHeight;
  if (this.position.y > this.worldHeight) this.position.y -= this.worldHeight;


  // Update collider
  this.collider.left = this.position.x - 10;
  this.collider.right = this.position.x + 10;
  this.collider.up = this.position.y - 10;
  this.collider.down = this.position.y + 10;

  this.weapon.timer += time;
  if (this.weapon.shooting && this.weapon.timer > cooldown) {
    this.weapon.timer = 0;
    this.weapon.shots.push(new Laser(this.position, this.angle));

  }
  for (var i = 0; i < this.weapon.shots.length; i++) {
    this.weapon.shots[i].update();
    if (this.weapon.shots[i].x < 0 || this.weapon.shots[i].x > this.worldWidth) this.weapon.shots[i].dead = true;
    if (this.weapon.shots[i].y < 0 || this.weapon.shots[i].y > this.worldHeight) this.weapon.shots[i].dead = true;
  }
  this.weapon.shots = this.weapon.shots.filter(function (laser) { return !laser.dead; });
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function (time, ctx) {
  ctx.save();

  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw engine thrust
  if (this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }
  ctx.restore();

  for (var i = 0; i < this.weapon.shots.length; i++) {
    this.weapon.shots[i].render(ctx);
  }

  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI);
  ctx.stroke();
}

