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

        case "Delete":
          player.debug.invuln = !player.debug.invuln;
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

