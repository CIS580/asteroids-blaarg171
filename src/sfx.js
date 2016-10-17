"use strict;"

module.exports = exports = SFX;

var pew = new Audio();
var warp = new Audio();
var breakBig = new Audio();
var breakMed = new Audio();
var breakSma = new Audio();
var background = new Audio();

function SFX() {
  pew = encodeURI("assets/pew.wav");
  warp = encodeURI("assets/warp.wav");
  breakBig = encodeURI("assets/breakBig.wav");
  breakMed = encodeURI("assets/breakMed.wav");
  breakSma = encodeURI("assets/breakSma.wav");
  background = encodeURI("assets/Dark-Techno-City_Looping.mp3");
  background.loop = true;
  background.play();
}

SFX.prototype.play = function (sound) {
  switch (sound) {
    case "pew":
      pew.play();
      break;

    case "warp":
      warp.play();
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
