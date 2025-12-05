const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width, HEIGHT = canvas.height;

const PADDLE_HEIGHT = 80, PADDLE_WIDTH = 12;
const BALL_RADIUS = 10;

let player = { y: HEIGHT/2 - PADDLE_HEIGHT/2, score: 0 };
let ai = { y: HEIGHT/2 - PADDLE_HEIGHT/2, score: 0 };
let ball = {
  x: WIDTH/2, y: HEIGHT/2,
  vx: Math.random() > 0.5 ? 4 : -4,
  vy: (Math.random() - 0.5) * 6
};

let gameOver = false;
const MAX_SCORE = 5;
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");

// --- Player movement ---
const keys = { ArrowUp: false, ArrowDown: false };
window.addEventListener("keydown", e => {
  if(e.key === "ArrowUp") keys.ArrowUp = true;
  if(e.key === "ArrowDown") keys.ArrowDown = true;
  if(gameOver && e.key === "Enter") resetGame();
});
window.addEventListener("keyup", e => {
  if(e.key === "ArrowUp") keys.ArrowUp = false;
  if(e.key === "ArrowDown") keys.ArrowDown = false;
});

// --- AI Simple movement ---
function updateAI() {
  let target = ball.y - PADDLE_HEIGHT / 2 + BALL_RADIUS;
  if(ai.y + 4 < target) ai.y += 4;
  else if(ai.y - 4 > target) ai.y -= 4;
  ai.y = Math.max(0, Math.min(ai.y, HEIGHT - PADDLE_HEIGHT));
}

// --- Update game ---
function updateGame() {
  // Player
  if(keys.ArrowUp) player.y -= 5;
  if(keys.ArrowDown) player.y += 5;
  player.y = Math.max(0, Math.min(player.y, HEIGHT - PADDLE_HEIGHT));

  // AI
  updateAI();

  // Ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Atas-bawah dinding
  if(ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > HEIGHT) {
    ball.vy *= -1;
    // Membetulkan agar bola tdk nyangsang
    ball.y = Math.max(BALL_RADIUS, Math.min(ball.y, HEIGHT - BALL_RADIUS));
  }

  // Kiri/player paddle
  if(
    ball.x - BALL_RADIUS < PADDLE_WIDTH &&
    ball.y > player.y &&
    ball.y < player.y + PADDLE_HEIGHT
  ) {
    ball.x = PADDLE_WIDTH + BALL_RADIUS;
    ball.vx *= -1.08; // efek speed up tiap dapat!
    // Pantulan acak tergantung posisi kena paddle
    let hit = (ball.y - (player.y + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2); // -1 s/d 1
    ball.vy = hit * 5.5;
  }
  // Kanan/AI paddle
  if(
    ball.x + BALL_RADIUS > WIDTH - PADDLE_WIDTH &&
    ball.y > ai.y &&
    ball.y < ai.y + PADDLE_HEIGHT
  ) {
    ball.x = WIDTH - PADDLE_WIDTH - BALL_RADIUS;
    ball.vx *= -1.08;
    let hit = (ball.y - (ai.y + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
    ball.vy = hit * 5.5;
  }

  // Kemasukan (goal)
  if(ball.x < -10) {
    ai.score++;
    resetBall();
  } else if(ball.x > WIDTH + 10) {
    player.score++;
    resetBall();
  }

  // Skor update & win check
  scoreEl.textContent = `Kamu: ${player.score} | Komputer: ${ai.score}`;
  if(player.score >= MAX_SCORE) {
    gameOver = true;
    scoreEl.textContent += "  -- Kamu menang!";
    restartBtn.style.display = "inline-block";
  }
  if(ai.score >= MAX_SCORE) {
    gameOver = true;
    scoreEl.textContent += "  -- Komputer menang!";
    restartBtn.style.display = "inline-block";
  }
}

// --- Reset bola ke tengah setelah goal ---
function resetBall() {
  ball.x = WIDTH/2;
  ball.y = HEIGHT/2;
  ball.vx = (Math.random()>0.5?1:-1) * (4 + Math.random()*1.7);
  ball.vy = (Math.random() - 0.5) * 7;
}

// --- Draw everything ---
function drawGame() {
  // Bersihkan layar
  ctx.clearRect(0,0,WIDTH,HEIGHT);

  // Tengah
  ctx.strokeStyle = "#fff7";
  ctx.setLineDash([12]);
  ctx.beginPath();
  ctx.moveTo(WIDTH/2, 0);
  ctx.lineTo(WIDTH/2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw paddles
  ctx.fillStyle = "#f1cf11";
  ctx.fillRect(0, player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillStyle = "#32a9e2";
  ctx.fillRect(WIDTH-PADDLE_WIDTH, ai.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, 2*Math.PI);
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#66f";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// --- Main loop ---
function loop() {
  if(!gameOver) updateGame();
  drawGame();
  requestAnimationFrame(loop);
}

// --- Reset all ---
function resetGame() {
  player.y = ai.y = HEIGHT/2-PADDLE_HEIGHT/2;
  player.score = ai.score = 0;
  resetBall();
  restartBtn.style.display = "none";
  gameOver = false;
  scoreEl.textContent = "Kamu: 0 | Komputer: 0";
}

restartBtn.onclick = resetGame;
resetGame();
loop();
