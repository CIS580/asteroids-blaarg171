"use strict;"

/* Classes */
const Game = require("./game");
const Player = require("./player");
const Rock = require("./rock")

/* Global variables */
var canvas = document.getElementById("screen");
var game = new Game(canvas, update, render);
var player = new Player({ x: canvas.width / 2, y: canvas.height / 2 }, canvas);

var mainState = "prep";
var data = {
  score: 0,
  lives: 3
}

var rocks = [
  new Rock({ x: 200, y: 200 }, rollRandom(0, 2 * Math.PI), 0, canvas),
  new Rock({ x: 200, y: 100 }, rollRandom(0, 2 * Math.PI), 1, canvas),
  new Rock({ x: 150, y: 150 }, rollRandom(0, 2 * Math.PI), 2, canvas)
];

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
  player.update(elapsedTime);

  for (var i = 0; i < rocks.length; i++) {
    rocks[i].update();
  }
  rocks = rocks.filter(function (rock) { return !rock.dead; });

  checkForCollisions(player, rocks);
  // if (player.dead) game.gameOver = true;
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

  ctx.textAlign = "right";
  ctx.fillText("Lives: " + data.lives, canvas.width - 5, 10);

  player.render(elapsedTime, ctx);

  for (var i = 0; i < rocks.length; i++) {
    rocks[i].render(ctx);
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
          player.weapon.shooting = true;
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
          player.weapon.shooting = false;
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

function checkForCollisions(aPlayer, aRocks) {
  var playCollider = aPlayer.collider;
  var rockCollider;
  var shotCollider;
  var collides = false;
  var distance = 0;
  var radii = 0;
  var potentials = new Array();

  // Rocks Loop
  for (var i = 0; i < aRocks.length; i++) {
    rockCollider = aRocks[i].collider;

    // Player
    radii = rockCollider.radius + playCollider.radius;
    distance = calcDistance({ x: rockCollider.x, y: rockCollider.y }, { x: playCollider.x, y: playCollider.y });
    collides = distance <= radii;
    if (collides && !aPlayer.invulnerable) playerDie();

    // Shot
    for (var j = 0; j < aPlayer.weapon.shots.length; j++) {
      collides = false;
      shotCollider = aPlayer.weapon.shots[j].collider;
      radii = rockCollider.radius + shotCollider.radius;
      distance = calcDistance({ x: rockCollider.x, y: rockCollider.y }, { x: shotCollider.x, y: shotCollider.y });
      collides = distance <= radii;
      if (collides) {
        potentials.push([aRocks[i], aPlayer.weapon.shots[j]]);
      }
    }
  }
}

function playerDie() {
  if (--data.lives > 0) {
    player.invulnerable = true;
    player.reset();
  }
  else {
    data.lives = 0;
    player.dead = true;
    player.position = { x: -100, y: -100 };
  }
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

game.initialize();

