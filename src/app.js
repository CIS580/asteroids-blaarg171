"use strict;"

/* Classes */
const Game = require("./game.js");
const Player = require("./player.js");

/* Global variables */
var canvas = document.getElementById("screen");
var game = new Game(canvas, update, render);
var player = new Player({ x: canvas.width / 2, y: canvas.height / 2 }, canvas);

var mainState = "prep";
var data = {
  score: 0,
  lives: 3
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function (timestamp) {
  if (game.gameOver) { game.end(); return; }
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
  // TODO: Update the game objects
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

        // case "ArrowDown":
        // case "s":
        //   player.braking = true;
        //   break;

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

        // case "ArrowDown":
        // case "s":
        //   player.braking = false;
        //   break;

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

game.initialize();