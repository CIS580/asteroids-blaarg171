"use strict";

const MS_PER_FRAME = 1000 / 8;
const maxVelocity = 15;

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.radius = 64;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;

  var self = this;

  window.onkeydown = function (event) {
    switch (event.key) {
      case 'ArrowUp': // up
      case 'w':
        event.preventDefault();
        self.thrusting = true;
        break;

      case 'ArrowLeft': // left
      case 'a':
        event.preventDefault();
        self.steerLeft = true;
        break;

      case 'ArrowRight': // right
      case 'd':
        event.preventDefault();
        self.steerRight = true;
        break;

      case ' ': // Really JavaScript?! 'Space' doesnt work but ' ' does?
        event.preventDefault();
        console.log("BANG");
        break;
    }
  }

  window.onkeyup = function (event) {
    switch (event.key) {
      case 'ArrowUp': // up
      case 'w':
        event.preventDefault();
        self.thrusting = false;
        break;

      case 'ArrowLeft': // left
      case 'a':
        event.preventDefault();
        self.steerLeft = false;
        break;

      case 'ArrowRight': // right
      case 'd':
        event.preventDefault();
        self.steerRight = false;
        break;
    }
  }
}



/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function (time) {
  // Apply angular velocity
  if (this.steerLeft) this.angle += 0.1;
  if (this.steerRight) this.angle -= 0.1;
  // Apply acceleration
  if (this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle) / 4,
      y: Math.cos(this.angle) / 4
    }
    this.velocity.x -= acceleration.x;
    if (this.velocity.x < -maxVelocity) this.velocity.x = -maxVelocity;
    else if (this.velocity.x > maxVelocity) this.velocity.x = maxVelocity;
    this.velocity.y -= acceleration.y;
    if (this.velocity.y < -maxVelocity) this.velocity.y = -maxVelocity;
    else if (this.velocity.y > maxVelocity) this.velocity.y = maxVelocity;
  }
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if (this.position.x < 0) this.position.x += this.worldWidth;
  if (this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if (this.position.y < 0) this.position.y += this.worldHeight;
  if (this.position.y > this.worldHeight) this.position.y -= this.worldHeight;

  // console.log("velocity = " + this.velocity.x + " / " + this.velocity.y);
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
}
