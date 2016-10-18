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