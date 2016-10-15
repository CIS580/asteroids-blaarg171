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
  var game = this;
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
  this.frontCtx.fillStyle = "white";
  this.frontCtx.font = "bold 40px Verdana";
  this.frontCtx.textAlign = "center";
  this.frontCtx.textBaseline = "middle";
  this.frontCtx.fillText("Press Space to start!", this.backBuffer.width / 2, this.backBuffer.height / 2);

  this.initialized = true;
  this.gameOver = false;
}

Game.prototype.start = function (loop) {
  this.initialized = false;
  window.requestAnimationFrame(loop);
}

