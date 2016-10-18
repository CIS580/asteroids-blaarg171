"use strict;"

module.exports = exports = Rock;

var speeds = [0.5, 1, 2];
var masses = [100, 50, 20];
var angles = [Math.PI / 4, Math.PI / 2];

function Rock(position, angle, type, canvas, sfx) {
  this.position = { x: position.x, y: position.y };
  this.angle = angle;
  this.type = type;
  this.speed = speeds[this.type];
  this.velocity = { x: Math.sin(this.angle), y: Math.cos(this.angle) };
  this.mass = masses[this.type];
  this.dead = false;
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;

  this.radius = this.mass / 2

  this.sfx = sfx;
}

Rock.prototype.update = function () {
  if (this.dead) return;
  this.position.x -= this.speed * this.velocity.x;
  this.position.y -= this.speed * this.velocity.y;

  // Wrap around the screen
  if (this.position.x < 0) this.position.x += this.worldWidth;
  if (this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if (this.position.y < 0) this.position.y += this.worldHeight;
  if (this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
}

Rock.prototype.render = function (ctx) {
  if (this.dead) return;
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();

  // debug render
  ctx.fillStyle = "red";
  ctx.fillRect(this.position.x, this.position.y, 1, 1);
}

Rock.prototype.split = function (aRocks) {
  this.dead = true;
  this.sfx.play((this.type == 0) ? "big" : (this.type == 1) ? "med" : "sma");
  switch (this.type) {
    case 0:
      aRocks.push(new Rock(this.position, this.angle - angles[0], 1, { width: this.worldWidth, height: this.worldHeight }, this.sfx));
      aRocks.push(new Rock(this.position, this.angle + angles[0], 1, { width: this.worldWidth, height: this.worldHeight }, this.sfx));
      break;

    case 1:
      aRocks.push(new Rock(this.position, this.angle - angles[0], 2, { width: this.worldWidth, height: this.worldHeight }, this.sfx));
      aRocks.push(new Rock(this.position, this.angle + angles[0], 2, { width: this.worldWidth, height: this.worldHeight }, this.sfx));
      aRocks.push(new Rock(this.position, this.angle - angles[1], 2, { width: this.worldWidth, height: this.worldHeight }, this.sfx));
      aRocks.push(new Rock(this.position, this.angle + angles[1], 2, { width: this.worldWidth, height: this.worldHeight }, this.sfx));
      break;

    case 2:
      break;
  }
}