(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

/* Classes */
const Game = require("./game");
const Player = require("./player");
const Rock = require("./rock");
const SFX = require("./sfx");
const UFO = require("./ufo");

/* Global variables */
var canvas = document.getElementById("screen");
var sfx = new SFX();
var game = new Game(canvas, update, render);
var rocks = [];
var shots = [];
var ufos = [];
var player = new Player({ x: canvas.width / 2, y: canvas.height / 2 }, canvas, addShot, sfx);

var mainState = "prep";
var data = {
  score: 0,
  lives: 3,
  level: 3,
  kills: 0
}

var UFOTimer = 15000;

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function (timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  handleUFOs(elapsedTime);

  player.update(elapsedTime);

  for (var i = 0; i < ufos.length; i++) {
    ufos[i].update(elapsedTime);
  }
  ufos = ufos.filter(function (ufo) { return !ufo.dead });

  for (var i = 0; i < rocks.length; i++) {
    rocks[i].update();
  }
  rocks = rocks.filter(function (rock) { return !rock.dead; });

  for (var i = 0; i < shots.length; i++) {
    shots[i].update();
  }
  shots = shots.filter(function (laser) { return !laser.dead; });

  checkForCollisions(player, rocks);

  if (rocks.length <= 0) {
    data.level++;
    generateRocks(canvas);
  }
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "15px Verdana";

  ctx.textAlign = "left";
  ctx.fillText("Score: " + data.score, 5, 10);
  ctx.fillText("Level: " + (data.level - 2), 5, 30);

  ctx.textAlign = "right";
  ctx.fillText("Lives: " + data.lives, canvas.width - 5, 10);

  if (!player.dead) player.render(elapsedTime, ctx);
  else game.drawEnd();

  for (var i = 0; i < ufos.length; i++) {
    ufos[i].render(ctx);
  }

  for (var i = 0; i < rocks.length; i++) {
    rocks[i].render(ctx);
  }

  for (var i = 0; i < shots.length; i++) {
    shots[i].render(ctx);
  }
}

window.onkeydown = function (event) {
  switch (mainState) {
    case "prep":
      switch (event.key) {
        case " ":
          event.preventDefault();
          if (game.initialized) {
            game.start(masterLoop);
            mainState = "running";
          }
          break;
      }
      break;

    case "running":
      switch (event.key) {
        case "ArrowUp": // up
        case "w":
          event.preventDefault();
          player.thrusting = true;
          break;

        case "ArrowLeft": // left
        case "a":
          event.preventDefault();
          player.steerLeft = true;
          break;

        case "ArrowRight": // right
        case "d":
          event.preventDefault();
          player.steerRight = true;
          break;

        case "ArrowDown":
        case "s":
          event.preventDefault();
          // player.braking = true;
          break;

        case " ": // Really JavaScript?! "Space" doesnt work but " " does?
          event.preventDefault();
          player.shooting = true;
          break;
      }
      break;
  }
}

window.onkeyup = function (event) {
  switch (mainState) {
    case "running":
      switch (event.key) {
        case "ArrowUp": // up
        case "w":
          event.preventDefault();
          player.thrusting = false;
          break;

        case "ArrowLeft": // left
        case "a":
          event.preventDefault();
          player.steerLeft = false;
          break;

        case "ArrowRight": // right
        case "d":
          event.preventDefault();
          player.steerRight = false;
          break;

        case "ArrowDown":
        case "s":
          event.preventDefault();
          // player.braking = false;
          break;

        case " ": // Really JavaScript?! "Space" doesnt work but " " does?
          event.preventDefault();
          player.shooting = false;
          break;

        // case "ShiftLeft":
        // case "ShiftRight":
        case "Enter":
          event.preventDefault();
          player.warp({ x: rollRandom(0, canvas.width), y: rollRandom(0, canvas.height) });
          break;
      }
      break;
  }
}

canvas.onclick = function (event) {
  event.preventDefault();
}

canvas.oncontextmenu = function (event) {
  event.preventDefault();
}

function checkForCollisions() {
  var playPos = player.position;
  var rockPos;
  var shotPos;
  var collides = false;
  var distance = 0;
  var radii = 0;
  // var potentials = new Array();

  // Rocks Loop
  for (var i = 0; i < rocks.length; i++) {
    rockPos = rocks[i].position;

    // Player
    radii = rocks[i].radius + player.radius - 2;
    distance = calcDistance(rockPos, playPos);
    collides = distance <= radii;
    if (collides && !player.dead) {
      if (!player.invulnerable) playerDie();
      rocks[i].split(rocks);
      break;
    }

    // Shot
    for (var j = 0; j < shots.length; j++) {
      collides = false;
      shotPos = shots[j].position;
      radii = rocks[i].radius + shots[j].radius;
      distance = calcDistance(rockPos, shotPos);
      collides = distance <= radii;
      if (collides) {
        shots[j].dead = true;
        rocks[i].split(rocks);
        data.score += rocks[i].mass;
      }
    }

    // // Other rocks
    // for (var k = 0; k < aRocks.length; k++) {
    //   if (i == k) continue;
    //   collides = false;
    //   var rockCollider2 = aRocks[k].collider;
    //   radii = rockCollider.radius + rockCollider2.radius;
    //   distance = calcDistance({ x: rockCollider.x, y: rockCollider.y }, { x: rockCollider2.x, y: rockCollider2.y })
    //   collides = distance <= radii;
    //   if (collides) {
    //     aRocks[i].split(aRocks);
    //     aRocks[k].split(aRocks);
    //     break;
    //   }
    // }

    // UFOs
    for (var j = 0; j < ufos.length; j++) {
      collides = false;
      radii = rocks[i].radius + ufos[j].radius;
      distance = calcDistance(rockPos, ufos[j].position);
      collides = distance <= radii;
      if (collides) {
        rocks[i].split(rocks);
        sfx.play("ufoHit");
        ufos[j].dead = true;
      }
    }
  }

  // UFOs
  for (var i = 0; i < ufos.length; i++) {
    // Player
    radii = ufos[i].radius + player.radius - 2;
    distance = calcDistance(ufos[i].position, playPos);
    collides = distance <= radii;
    if (collides && !player.dead) {
      if (!player.invulnerable) playerDie();
      sfx.play("ufoHit");
      ufos[i].dead = true;
      break;
    }

    //Shots
    for (var j = 0; j < shots.length; j++) {
      collides = false;
      switch (shots[j].type) {
        case 0:
          distance = calcDistance(shots[j].position, ufos[i].position);
          radii = shots[j].radius + ufos[i].radius;
          collides = distance <= radii;
          if (collides) {
            sfx.play("ufoHit");
            ufos[i].dead = true;
            data.kills++;
            data.lives++;
          }
          break;

        case 1:
          distance = calcDistance(shots[j].position, playPos);
          radii = shots[j].radius + player.radius - 2;
          collides = distance <= radii;
          if (collides && !player.dead) {
            if (!player.invulnerable) playerDie();
          }
          break;
      }
    }
  }
}

function playerDie() {
  if (--data.lives > 0) {
    sfx.play("playerHit");
    player.invulnerable = true;
    player.reset();
  } else {
    data.lives = 0;
    sfx.play("die");
    // sfx.stop("flame");
    player.dead = true;
    player.position = { x: -1000, y: -1000 };
  }
}

function handleUFOs(time) {
  UFOTimer -= time;
  if (UFOTimer <= 0) {
    UFOTimer = rollRandom(10000, 30000);
    ufos.push(new UFO({ x: canvas.width, y: rollRandom(20, canvas.height - 20) }, canvas, addShot, sfx));
  }
}

function generateRocks(canvas) {
  var type;
  var x = {
    x: -1,
    min: canvas.width / 4,
    max: canvas.width / 2 + canvas.width / 4
  }
  var y = {
    y: -1,
    min: canvas.height / 4,
    max: canvas.height / 2 + canvas.height / 4
  }

  var numToSpawn = data.level + data.kills;
  for (var i = 0; i < numToSpawn; i++) {
    do {
      x.x = rollRandom(0, canvas.width);
    } while (x.x > x.min && x.x < x.max)
    do {
      y.y = rollRandom(0, canvas.height);
    } while (y.y > y.min && y.y < y.max)

    type = rollRandom(0, 20);
    if (type < 10) {
      rocks.push(new Rock({ x: x.x, y: y.y }, rollRandom(0, 2 * Math.PI), 0, canvas, sfx));
    } else if (type > 17) {
      rocks.push(new Rock({ x: x.x, y: y.y }, rollRandom(0, 2 * Math.PI), 2, canvas, sfx));
    } else {
      rocks.push(new Rock({ x: x.x, y: y.y }, rollRandom(0, 2 * Math.PI), 1, canvas, sfx));
    }
  }
}

function addShot(shot) {
  shots.push(shot);
}

function rollRandom(aMinimum, aMaximum) {
  return Math.floor(Math.random() * (aMaximum - aMinimum) + aMinimum);
}

function calcDistance(a, b) {
  var deltaX = b.x - a.x;
  var deltaY = b.y - a.y;
  var sum = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
  return Math.sqrt(sum);
}

generateRocks(canvas);
game.initialize();


},{"./game":2,"./player":4,"./rock":5,"./sfx":6,"./ufo":7}],2:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
  this.initialized = false;
  this.gameOver = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function (flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function (newTime) {
  // if (this.gameOver) return;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if (!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

Game.prototype.initialize = function () {
  this.frontCtx.fillStyle = "black";
  this.frontCtx.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);
  this.drawStart();

  this.initialized = true;
  this.gameOver = false;
}

Game.prototype.start = function (loop) {
  this.initialized = false;
  window.requestAnimationFrame(loop);
}

Game.prototype.drawStart = function () {
  this.frontCtx.fillStyle = "white";
  this.frontCtx.font = "bold 40px Verdana";
  this.frontCtx.textAlign = "center";
  this.frontCtx.textBaseline = "middle";
  this.frontCtx.fillText("Press Space to start!", this.backBuffer.width / 2, this.backBuffer.height / 2);
}

Game.prototype.drawEnd = function () {
  this.frontCtx.fillStyle = "white";
  this.frontCtx.font = "bold 50px Verdana";
  this.frontCtx.textAlign = "center";
  this.frontCtx.textBaseline = "middle";
  this.frontCtx.fillText("GAME OVER", this.backBuffer.width / 2, this.backBuffer.height / 2);
}


},{}],3:[function(require,module,exports){
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


},{}],4:[function(require,module,exports){
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
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function (time) {
  if (this.invulnerable) {
    this.timers.invuln += time;
    if (this.timers.invuln >= invulnTime) {
      this.invulnerable = false;
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
    this.shoot(new Laser(0, this.position, this.angle, { width: this.worldWidth, height: this.worldHeight }));
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


},{"./laser":3}],5:[function(require,module,exports){
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
  // ctx.fillStyle = "red";
  // ctx.fillRect(this.position.x, this.position.y, 1, 1);
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
},{}],6:[function(require,module,exports){
"use strict;"

module.exports = exports = SFX;

var pew = new Audio();
var die = new Audio();
var pew2 = new Audio();
var warp = new Audio();
var ufoHit = new Audio();
// var flame = new Audio();
var shipHit = new Audio();
var breakBig = new Audio();
var breakMed = new Audio();
var breakSma = new Audio();
var background = new Audio();

function SFX() {
  pew.src = encodeURI("assets/pew.wav");
  pew.volume = 0.25;
  die.src = encodeURI("assets/die.wav");
  die.volume = 0.75;
  pew2.src = encodeURI("assets/pew2.wav");
  pew2.volume = 0.25;
  warp.src = encodeURI("assets/warp.wav");
  warp.volume = 0.25;
  ufoHit.src = encodeURI("assets/ufoHit.wav");
  ufoHit.volume = 0.75;
  // flame.src = encodeURI("assets/flame.wav");
  // flame.volume = 0.25;
  shipHit.src = encodeURI("assets/shipHit.wav");
  shipHit.volume = 0.75;
  breakBig.src = encodeURI("assets/breakBig.wav");
  breakBig.volume = 0.25;
  breakMed.src = encodeURI("assets/breakMed.wav");
  breakMed.volume = 0.25;
  breakSma.src = encodeURI("assets/breakSma.wav");
  breakSma.volume = 0.25;
  background.src = encodeURI("assets/Dark-Techno-City_Looping.mp3");
  background.volume = 0.1;
  background.loop = true;
  background.play();
}

SFX.prototype.play = function (sound) {
  switch (sound) {
    case "pew":
      pew.play();
      break;

    case "die":
      die.play();
      break;

    case "pew2":
      pew2.play();
      break;

    case "warp":
      warp.play();
      break;

    // case "flame":
    //   flame.loop = true;
    //   flame.play();
    //   break;

    case "playerHit":
      shipHit.play();
      break;

    case "ufoHit":
      shipHit.play();
      break;

    case "big":
      breakBig.play();
      break;

    case "med":
      breakMed.play();
      break;

    case "sma":
      breakSma.play();
      break;
  }
}

SFX.prototype.stop = function (sound) {
  switch (sound) {
    // case "flame":
    //   flame.loop = false;
    //   break;
  }
}
},{}],7:[function(require,module,exports){
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


},{"./laser":3}]},{},[1]);
