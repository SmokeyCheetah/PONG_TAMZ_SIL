var canvas;
var canvasContext;
var ballX = 750;
var ballY = 384;
var ballSpeedX = 10;
var ballSpeedY = 0;
var randX = 1300;
var randY = 380;
var player1Score = 0;
var player2Score = 0;
var bestScoreP1;
var bestScoreP2;
const WINNING_SCORE = 5;
var showingWinScreen = false;
var paddle1Y = 0;
var paddle2Y = 0;
const PADDLE_THICKNESS = 20;
const PADDLE_HEIGHT = 200;


let sound = new Audio('sound.mp3');
let endSound = new Audio ('background_music.m4a');
let backgroundSound = new Audio ('fireplac_theme.mp3');
let hitSound = new Audio('hit2.wav');
let hitSound1 = new Audio('hit1.wav');


let ball = document.querySelector("#ball-id");

function calculateMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  var mouseX = evt.clientX - rect.left - root.scrollLeft;
  var mouseY = evt.clientY - rect.top - root.scrollTop;
  return {
    x: mouseX,
    y: mouseY,
  };
}

function handleMouseClick(evt) {
  if (showingWinScreen) {
    player1Score = 0;
    player2Score = 0;
    showingWinScreen = false;
    location.reload();
  }
}

window.onload = function () {
  canvas = document.getElementById("gameCanvas");
  canvasContext = canvas.getContext("2d");

  var framesPerSecond = 60;
  setInterval(function () {
    moveEverything();
    drawEverything();
  }, 1000 / framesPerSecond);

  canvas.addEventListener("mousedown", handleMouseClick);

  canvas.addEventListener("mousemove", function (evt) {
    var mousePos = calculateMousePos(evt);
    paddle1Y = mousePos.y - PADDLE_HEIGHT / 2;
  });

  // Zápis jednotlivých textů do HTML
  document.getElementById("humanScore").innerHTML = 0;
  document.getElementById("botScore").innerHTML = 0;
  document.getElementById("bestScoreP1").innerHTML = localStorage.getItem("bestScoreP1", player1Score);
  document.getElementById("bestScoreP2").innerHTML = localStorage.getItem("bestScoreP2", player2Score);
  
};

function ballReset() {
  if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
    showingWinScreen = true;
    // Zvuk do pozadí se zastaví, aby nerušil zvuk, který se spouští na konci, po odkliknutí hráčem se zvuk pozadí opětovně spustí
    backgroundSound.pause();
    endSound.play();
  }
  ballSpeedY = 0;
  ballSpeedX = 10;
  if (player2Score >= player1Score) {
    ballSpeedX = -ballSpeedX;
  }

  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
}

function computerMovement() {
  if (paddle2Y <= 0) {
    paddle2Y = 0;
  }
  if (paddle2Y >= 576) {
    paddle2Y = 576;
  }

  var paddle2YCenter = paddle2Y + PADDLE_HEIGHT / 2 + 5;
  if (paddle2YCenter < ballY - 35) {
    paddle2Y = paddle2Y + 15;
  } else if (paddle2YCenter > ballY + 35) {
    paddle2Y = paddle2Y - 15;
  }
}


function moveEverything() {
  if (showingWinScreen) {
    return;
  }
  computerMovement();
  //funkce, díky níž se AI nedostane mimo obrazovku
  if (paddle1Y <= 0) {
    paddle1Y = 0;
  }
  if (paddle1Y >= 576) {
    paddle1Y = 576;
  }

  ballX = ballX + ballSpeedX;
  ballY = ballY + ballSpeedY;


  //míček změní rychlost, jestliže narazí do prkna více na kraj či nikoliv
  if (ballX < 60) {
    if (ballY > paddle1Y && ballY < paddle1Y + PADDLE_HEIGHT) {
      ballSpeedX = -ballSpeedX;
      // Přehrání zvuku, když míček koliduje s paddle na AI straně
      hitSound.play();
      hitSound.volume = 0.2;
      
      var deltaY = ballY - (paddle1Y + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * 0.25;
      
    } else {
      player2Score++;
      document.getElementById("botScore").innerHTML = player2Score;
      // Přehrání zvuku, kdy míček proletí mimo paddle na AI straně
      sound.play();
      ballReset();


      //Zapsání nejlepšího skóre do local storage AI (spolu s porovnávací podmínkou, kdy se nejlepší skóre zapíše jen tehdy, kdy je opravdu nejlepší (větší))
      bestScoreP2 = localStorage.getItem("bestScoreP2", player2Score);
      if (bestScoreP2 < player2Score){
        bestScoreP2 = player2Score;
      }
      
      localStorage.setItem("bestScoreP2", bestScoreP2);
    }
    
  }
  //míček změní rychlost, jestliže narazí do prkna více na kraj či nikoliv
  if (ballX > canvas.width - 60) {
    if (ballY > paddle2Y && ballY < paddle2Y + PADDLE_HEIGHT) {
      ballSpeedX = -ballSpeedX;

      // Přehrání zvuku, když míček koliduje s paddle na hráčově straně
      hitSound.play();
      hitSound.volume = 0.2;

      var deltaY = ballY - (paddle2Y + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * 0.2;
    } else {
      player1Score++; 
      document.getElementById("humanScore").innerHTML = player1Score;
      
      // Přehrání zvuku, kdy míček proletí mimo paddle na hráčově straně
      sound.play();
      ballReset();

      //Zapsání nejlepšího skóre do local storage hráče (spolu s porovnávací podmínkou, kdy se nejlepší skóre zapíše jen tehdy, kdy je opravdu nejlepší (větší))
      bestScoreP1 = localStorage.getItem("bestScoreP1", player1Score);
      if (bestScoreP1 < player1Score){
        bestScoreP1 = player1Score;
      }
      
      localStorage.setItem("bestScoreP1", bestScoreP1);

    }
  }
  if (ballY < 0) {

    // Přehrání zvuku, když míček koliduje s hranou canvasu
    hitSound1.play();
    hitSound1.volume = 0.2;
    ballSpeedY = -ballSpeedY;
  }
  if (ballY > canvas.height) {
    // Přehrání zvuku, když míček koliduje s hranou canvasu
    hitSound1.play();
    hitSound1.volume = 0.2;
    ballSpeedY = -ballSpeedY;
  }
}
//vykreslení středové čáry
function drawNet() {
  for (var i = 0; i < canvas.height; i += 40) {
    colorRect(canvas.width / 2 - 1, i, 2, 20, "white");
  }
// Zvuk do pozadí
  backgroundSound.play();
}

function drawEverything() {
  // pozadí
  colorRect(0, 0, canvas.width, canvas.height, "#0b0b0f");

  canvasContext.font = "bold 12px verdana, sans-serif ";

  //výherní obrazovka
  if (showingWinScreen) {



    
    clearInterval(particleInterval)
    canvasContext.fillStyle = "white";
    if (player1Score >= WINNING_SCORE) {
      canvasContext.fillText("Hráč vyhrál, dobrá práce.", 730, 200);
    } else if (player2Score >= WINNING_SCORE) {
      canvasContext.fillText("AI vyhrálo, snaž se více.", 730, 200);
    }
    
    
    canvasContext.fillText("Klikni kdekoliv pro pokračování.", 700, 500);
    
    return;

  }

  drawNet();

  // hráčovo prkno
  colorRect(20, paddle1Y, PADDLE_THICKNESS, PADDLE_HEIGHT, "orange");

  // AI prkno
  colorRect(
    canvas.width - PADDLE_THICKNESS - 20,
    paddle2Y,
    PADDLE_THICKNESS,
    PADDLE_HEIGHT,
    "orange"
  );

  // vykreslení míčku

  var img = new Image();
  img.src = "fireball.png";
  var div = document.getElementById("x");

  drawBall(ballX, ballY, 20);

  img.onload = function () {
  };
/*
  // vykreslení (náhodné) entity
  var img1 = new Image();
  img1.src = "img/rand.png";
  var div = document.getElementById("x");

  drawRand(randX, randY, 20);

  img1.onload = function () {
  };
 
 */

  
}

function colorCircle(centerX, centerY, radius, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  canvasContext.fill();
}

function drawBall(centerX, centerY, radius) {
  var img = new Image();
  img.src = "fireball.png";
  var diameter = radius * 2;
  canvasContext.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    centerX - radius,
    centerY - radius,
    diameter,
    diameter
  );
}

/*
function drawRand(centerX, centerY, radius) {
  var img1 = new Image();
  img1.src = "img/rand.png";
  var diameter = radius * 2;
  canvasContext.drawImage(
    img1,
    0,
    0,
    img1.width,
    img1.height,
    centerX - radius,
    centerY - radius,
    diameter,
    diameter
  );
}

function speedBall(ballSpeedX){
  ballSpeedX = 45;
}

*/


function colorRect(leftX, topY, width, height, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.fillRect(leftX, topY, width, height);
}

let particleInterval = setInterval(() => {
  //vytvoření efektu střípků za míčkem
  let newParticle = document.createElement("span");

  newParticle.className = "particle";

  //nastavení lokace střípků
  newParticle.style.left = ballX + 210 ;
  newParticle.style.top = ballY + 95;

  newParticle.style.zIndex = "11111";

  //nastavení animace dle "Style.css"
  newParticle.style.animation = "fade-out 1s ease";

  //vykreslení střípků
  document.getElementsByTagName("content")[0].appendChild(newParticle);

  //smazání střípků, jakmile animace skončí
  setTimeout(() => {
    newParticle.remove();
  }, 200);

  //dle tohoto parametru se nastavuje interval, za jak dlouho se střípek zase vytvoří (ve finále to určuje, kolik střípků za míčkem na obrazovce uvidíme)
}, 50);
