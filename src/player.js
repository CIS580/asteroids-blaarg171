"use strict";

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

const Laser = require("./laser");

const turnSpeed = 0.075;
const maxVelocity = 7.5;
const weaponTime = 225;
const invulnTime = 1500;
const warpTime = 5000;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas, shoot, sfx) {
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
  this.invulnerable = false;
  this.warping = false;
  this.shooting = false;
  this.shoot = shoot;

  this.radius = 15;

  this.timers = {
    weapon: 0,
    invuln: 0,
    warp: warpTime
  }

  this.sfx = sfx;

  this.debug = {
    invuln: false
  }
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function (time) {
  if (this.invulnerable) {
    this.timers.invuln += time;
    if (this.timers.invuln >= invulnTime) {
      this.invulnerable = this.debug.invuln;
      this.timers.invuln = 0;
    }
  }

  if (this.warping) {
    this.timers.warp -= time;
    if (this.timers.warp <= 0) {
      this.timers.warp = warpTime;
      this.warping = false;
    }
  }

  if (!this.dead) {
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
  }

  this.timers.weapon += time;
  if (this.shooting && this.timers.weapon > weaponTime && !this.dead) {
    this.timers.weapon = 0;
    this.shoot(new Laser(this.position, this.angle, { width: this.worldWidth, height: this.worldHeight }));
    this.sfx.play("pew");
  }
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function (time, ctx) {
  if (this.warping) {
    ctx.fillStyle = "white";
    ctx.font = "15px Verdana";
    ctx.textAlign = "left";
    ctx.fillText("Warp Cooldown: " + (this.timers.warp / 1000).toFixed(1), 5, this.worldHeight - 10);
  }

  if (!this.dead) {
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
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw engine thrust
    if (this.thrusting) {
      // this.sfx.play("flame");
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(5, 10);
      ctx.arc(0, 10, 5, 0, Math.PI, true);
      ctx.closePath();
      ctx.strokeStyle = 'orange';
      ctx.stroke();
    } //else this.sfx.stop("flame");
    ctx.restore();

    if (this.invulnerable) {
      ctx.beginPath();
      ctx.strokeStyle = "#314dea";
      ctx.lineWidth = 3;
      ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}

Player.prototype.reset = function () {
  this.position = { x: this.worldWidth / 2, y: this.worldHeight / 2 };
  this.velocity = { x: 0, y: 0 };
  this.angle = 0;
  this.thrusting = false;
  this.braking = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.timers.weapon = 0;
}

Player.prototype.warp = function (position) {
  if (this.timers.warp == warpTime && !this.dead) {
    this.sfx.play("warp");
    this.position = position;
    this.warping = true;
    this.invulnerable = true;
  }
}

