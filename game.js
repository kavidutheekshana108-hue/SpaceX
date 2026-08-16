//=== Setup ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// === Player State == 

const player = {
    x: 220,
    y:320,
    targetX: 220,
    width: 24,
    height:28
};

// === Arrays - The secret to multiple objects ===
 let stars = [];
 let bullets = [];
 let enemies = [];

 // === Score ===
 let sccore = 0;

 // Setup : create initial stars ... 
 for(let i = 0; i < 50; i++){
    stars.push({
        x:Math.random() * canvas.width,
        y:Math.random()*canvas.height,
        size:Math.random()* 2 + 0.5,
    });
 }

// Input : Mouse movement
canvas.addEventListener('mousemove', (e) => {const rect = canvas.getBoundingClientRect(); player.targetX = e.clientX - rect.left;});

// Input : Shooting(click and spacebar)
let lastShotTime = 0; //Timestamp of the last shot
const SHOOT_COOLDOWN = 200; // Milliseconds between shots(0.2s)

function shoot(){
    const now = Date.now();
    if (now - lastShotTime < SHOOT_COOLDOWN){
        return; // too soon! ignore this shot.
    }
    lastShotTime = now;

    //Create a new bullet object and add it to the bullets array.
    bullets.push({
        x:player.x,
        y:player.y-14,
        radius: 3,
        speed: 6
    });
}
// Shoot on mouse click
canvas.addEventListener('mousedown', () => shoot());

// Shoot on spacebar
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space'){
        shoot();
    }
});

//  Enemy spawing
let spawnTimer = 0;
const SPAWN_INTERVAL = 60; // spawn every 60 frams


function spawnEnemy(){
    enemies.push({
        x: 20+ Math.random()*(canvas.width - 40),
        y: -20,
        width: 24,
        height: 24,
        speed: 1.5 + Math.random()*1.5
    });
}

// Collision detection
function checkCollision(a, b){
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    /* 
    dx= difference in X positions 
    dy= difference in y positions
    distance = straight-line distance between centers (pythagorean theorem)
    */
    const minDistance = (a.radius || 12) + (b.radius || 12);
    /* The || opearator means "use the left value if it exists, else use the right." */
    return distance< minDistance;
}

// == Drawings ==
function drawPlayer(){
    ctx.save();
    ctx.translate(player.x, player.y);

    //ship body
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(-12, 12)
    ctx.lineTo(0, 6);
    ctx.lineTo(12, 12);
    ctx.closePath();
    ctx.fill();

    //Cockpit
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-6, 8)
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawStars(){
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.globalAlpha = star.size/3;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        ctx.globalAlpha = 1.0;

    });
}

function drawBullets(){
    ctx.fillStyle = '#fbbf24'; // Golden yellow bullets

    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI*2);
        ctx.fill();
    });
}

function drawEnemies(){
    enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        // Enemy Body
        ctx.fillStyle = '#f43f5e'; // reddish pink
        ctx.beginPath();
        ctx.moveTo(0,12);
        ctx.lineTo(-12, -10);
        ctx.lineTo(0, -4);
        ctx.lineTo(12, -10);
        ctx.closePath();
        ctx.fill();

        // Enemy eyes(white dots)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5, -2, 2.5, 0, Math.PI*2);
        ctx.arc(5, -2, 2.5, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();

    });
}

function drawScore(){
    ctx.fillStyle= '#e2e8f0';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + ScrollTimeline, 14, 26);
    
}

// === Game Loop ===
function update(){
    player.x += (player.targetX - player.x)*0.15;
    if (player.x<16) player.x = 16;
    if (player.x>424) player.x = 424;
}

function draw(){
    ctx.clearRect(0,0, canvas.clientWidth, canvas.height);
    drawPlayer();
}

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}

// === Start ===
loop();