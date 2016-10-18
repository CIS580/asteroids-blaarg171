"use strict;"

module.exports = exports = SFX;

var pew = new Audio();
var warp = new Audio();
var breakBig = new Audio();
var breakMed = new Audio();
var breakSma = new Audio();
var background = new Audio();

function SFX() {
  pew.src = encodeURI("assets/pew.wav");
  pew.volume = 0.25;
  warp.src = encodeURI("assets/warp.wav");
  warp.volume = 0.25;
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
