// cockroach_game.js
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

// 蟑螂角色
const cockroach = {
  x: 80,
  y: H - 60,
  w: 40,
  h: 24,
  vy: 0,
  onGround: true,
  color: '#4b2e05',
};

// 障礙物（鞋子）
let obstacles = [];
let obstacleTimer = 0;

// 背景滾动
let bgX = 0;
let speed = 4;

let gameOver = false;
let score = 0;
let bestScore = 0;
let frameCount = 0;

function drawCockroach() {
  ctx.save();
  ctx.translate(cockroach.x + cockroach.w/2, cockroach.y + cockroach.h/2);
  ctx.rotate(Math.sin(Date.now()/100) * 0.05); // 微微晃動
  // 身體
  ctx.fillStyle = '#4b2e05';
  ctx.beginPath();
  ctx.ellipse(0, 6, cockroach.w/2, cockroach.h/2, 0, 0, Math.PI*2);
  ctx.fill();
  // 頭
  ctx.beginPath();
  ctx.ellipse(0, -8, cockroach.w/3, cockroach.h/2.5, 0, 0, Math.PI*2);
  ctx.fillStyle = '#6d3b09';
  ctx.fill();
  // 眼睛
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-6, -10, 3, 0, Math.PI*2);
  ctx.arc(6, -10, 3, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-6, -10, 1.2, 0, Math.PI*2);
  ctx.arc(6, -10, 1.2, 0, Math.PI*2);
  ctx.fill();
  // 觸鬚
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, -16);
  ctx.lineTo(-18, -26);
  ctx.moveTo(8, -16);
  ctx.lineTo(18, -26);
  ctx.stroke();
  // 腳
  ctx.strokeStyle = '#3a1e00';
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-10, 2 + i*6);
    ctx.lineTo(-22, 12 + i*8);
    ctx.moveTo(10, 2 + i*6);
    ctx.lineTo(22, 12 + i*8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawObstacle(ob) {
  ctx.save();
  ctx.translate(ob.x + ob.w/2, ob.y + ob.h/2);
  ctx.rotate(-0.18);
  // 鞋底
  ctx.fillStyle = '#b97a56';
  ctx.fillRect(-ob.w/2, ob.h/4, ob.w, ob.h/3);
  // 鞋面
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, 0, ob.w/2, ob.h/2, 0, 0, Math.PI*2);
  ctx.fill();
  // 鞋帶
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-ob.w/4, i*6);
    ctx.lineTo(ob.w/4, i*6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBg() {
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, W, H);
  // 跑道線
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo((bgX + i*80)%W, H-40);
    ctx.lineTo((bgX + i*80 + 40)%W, H-40);
    ctx.stroke();
  }
}

function update() {
  if (gameOver) return;
  // 背景滾动
  bgX -= speed;
  if (bgX < -80) bgX += 80;

  // 蟑螂重力與跳躍
  cockroach.vy += 0.7;
  cockroach.y += cockroach.vy;
  if (cockroach.y > H - 60) {
    cockroach.y = H - 60;
    cockroach.vy = 0;
    cockroach.onGround = true;
  } else {
    cockroach.onGround = false;
  }

  // 障礙物生成
  obstacleTimer--;
  if (obstacleTimer <= 0) {
    obstacles.push({
      x: W,
      y: H - 70,
      w: 40,
      h: 30,
    });
    obstacleTimer = 60 + Math.random()*60;
  }
  // 障礙物移動
  for (let ob of obstacles) {
    ob.x -= speed;
  }
  // 移除離開畫面的障礙物
  obstacles = obstacles.filter(ob => ob.x + ob.w > 0);

  // 計分：每秒+1分（60幀為1秒）
  frameCount++;
  if (frameCount % 60 === 0) score++;

  // 碰撞檢查
  for (let ob of obstacles) {
    if (
      cockroach.x + cockroach.w > ob.x &&
      cockroach.x < ob.x + ob.w &&
      cockroach.y + cockroach.h > ob.y &&
      cockroach.y < ob.y + ob.h
    ) {
      gameOver = true;
      if (score > bestScore) bestScore = score;
    }
  }
}

function draw() {
  drawBg();
  drawCockroach();
  for (let ob of obstacles) drawObstacle(ob);
  // 計分顯示
  ctx.fillStyle = '#222';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('分數：' + score, 20, 40);
  ctx.font = '16px sans-serif';
  ctx.fillText('最高：' + bestScore, 20, 65);
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, H/2-40, W, 80);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('遊戲結束', W/2, H/2+12);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// 鍵盤控制
window.addEventListener('keydown', e => {
  if (gameOver && e.key === ' ') {
    // 重新開始
    obstacles = [];
    cockroach.x = 80;
    cockroach.y = H - 60;
    cockroach.vy = 0;
    score = 0;
    frameCount = 0;
    gameOver = false;
    return;
  }
  if (e.key === 'ArrowLeft') cockroach.x -= 24;
  if (e.key === 'ArrowRight') cockroach.x += 24;
  if (e.key === ' ' && cockroach.onGround) cockroach.vy = -12;
});

loop();
