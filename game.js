//=== Setup ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// === Game State ===
let gameState = 'start'; // 'start' | 'playing' | 'gameover'
let score = 0;
let highScore = 0;
let lives = 3;
let level = 1;

// === Player State == 

const player = {
    x: 220,
    y: 320,
    targetX: 220,
    width: 24,
    height: 28,
    invincible: false, // Brief invincibility after getting hit
    invincibleTimer: 0
};

// === Arrays - The secret to multiple objects ===
let stars = [];
let bullets = [];
let enemies = [];
let particles = []; // New: Explosion particles


// Setup : create initial stars ... 
for (let i = 0; i < 50; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.8 + 0.2      // Star speed .........
    });
}

// Input : Mouse movement
canvas.addEventListener('mousemove', (e) => {
    if (gameState !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    player.targetX = e.clientX - rect.left;
});
canvas.addEventListener('mousedown', () => {
    if (gameState === 'playing') shoot();
});

// Input : TOUCH (Mobile)
canvas.addEventListener('touchmove', (e) => {
    if (gameState !== 'playing') return;
    e.preventDefault(); // Stop browser from scrolling
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0]; // 1st finger touching
    player.targetX = touch.clientX - rect.left;

}, { passive: false });

canvas.addEventListener('touchstart', (e) => {
    if (gameState === 'playing') {
        e.preventDefault();
        shoot();
    }
}, { passive: false });

// Input : Shooting(click and spacebar)

// -- Timing --
let lastShotTime = 0; //Timestamp of the last shot
const SHOOT_COOLDOWN = 180; // Milliseconds between shots(0.2s) --- > 200 to 100 --> 180


function shoot() {
    const now = Date.now();
    if (now - lastShotTime < SHOOT_COOLDOWN) return; // too soon! ignore this shot. 
    lastShotTime = now;

    //Create a new bullet object and add it to the bullets array.
    bullets.push({
        x: player.x,
        y: player.y - 14,
        radius: 3,
        speed: 7
    });
}
// Shoot on mouse click
canvas.addEventListener('mousedown', () => shoot());

// Shoot on spacebar
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        shoot();
    }
});

//  Enemy spawing
let spawnTimer = 0;
let spawnInterval = 60;  // Starts at 60 frams, gets faster 


function spawnEnemy() {
    const baseSpeed = 1.2 + (level * 0.25); // Faster each level
    enemies.push({
        x: 20 + Math.random() * (canvas.width - 40),
        y: -20,
        width: 24,
        height: 24,
        speed: baseSpeed + Math.random() * 1.5
    });
}

// --- Particle Explosions --- 
function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2; // Random direction
        const speed = Math.random() * 3 + 1;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed, // X velocity
            vy: Math.sin(angle) * speed, // Y velocity
            radius: Math.random() * 3 + 1,
            color: color,
            life: 30, // Frames remaining
            maxLife: 30 //for calculating fade
        });
    }
}

// Collision detection
function checkCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    /* 
    dx= difference in X positions 
    dy= difference in y positions
    distance = straight-line distance between centers (pythagorean theorem)
    */
    const minDistance = (a.radius || 12) + (b.radius || 12);
    /* The || opearator means "use the left value if it exists, else use the right." */
    return distance < minDistance;
}

// === Player Hit ===
function playerHit() {
    if (player.invincible) return; // Can't get twise in a row

    lives--;
    createExplosion(player.x, player.y, '#ef4444');  // Red explosion

    if (lives <= 0) {
        gameOver();
    } else {
        // Breif invincibility so you don't die instantly
        player.invincible = true;
        player.invincibleTimer = 90; // 1.5 seconds at 60 FPS
    }
}

// === Game over === ***
function gameOver() {
    gameState = 'gameover';
    if (score > highScore) highScore = score;
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    spawnInterval = 60;
    spawnTimer = 0;
    bullets = [];
    enemies = [];
    particles = [];
    player.x = 220;
    player.targetX = 220;
    player.invincible = false;
    player.invincibleTimer = 0;
    gameState = 'playing';
}
// == Drawings ==
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Blink when invincible (flash effect)
    if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.3; // Semi-transparent
    }

    //ship body
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(-12, 12);
    ctx.lineTo(0, 6);
    ctx.lineTo(12, 12);
    ctx.closePath();
    ctx.fill();

    //Cockpit
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-6, 8);
    ctx.lineTo(6, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawStars() {
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.globalAlpha = star.size / 3;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        ctx.globalAlpha = 1.0;

    });
}

function drawBullets() {
    ctx.fillStyle = '#fbbf24'; // Golden yellow bullets

    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        // Enemy Body
        ctx.fillStyle = '#f43f5e'; // reddish pink
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(-12, -10);
        ctx.lineTo(0, -4);
        ctx.lineTo(12, -10);
        ctx.closePath();
        ctx.fill();

        // Enemy eyes(white dots)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5, -2, 2.5, 0, Math.PI * 2);
        ctx.arc(5, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    });
}

function drawParticles() {
    particles.forEach(p => {
        const alpha = p.life / p.maxLife; // Fade out as life decreas
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });
}

function drawUI() {
    // Score 
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Score : ' + score, 14, 26);

    // High Score 
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Best: ' + highScore, 14, 44);

    // Level
    ctx.textAlign = 'right';
    ctx.fillStyle = "#a78bfa";
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('Level ' + level, canvas.width - 14, 26);

    // Lives (Hearts❤️)
    ctx.textAlign = 'right';
    ctx.font = '18px sans-serif';
    let hearts = '❤️'.repeat(Math.max(0, lives));
    ctx.fillText(hearts, canvas.width - 14, 48);
}

function drawOverlay() {
    // Semi-transparent dark overlay
    ctx.fillStyle = 'rgba(5, 5, 16, 0.92)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e8f0';

    if (gameState === 'start') {
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.fillText('🚀 Space Shooter', canvas.width / 2, 130);

        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Move: Mouse / Touch', canvas.width / 2, 170);
        ctx.fillText('Shoot: Click / Space / Tap', canvas.width / 2, 192);

        // Start button
        drawButton('START GAME', canvas.width / 2, 240, '#f43f5e');

    } else if (gameState === 'gameover') {
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('GAME OVER', canvas.width / 2, 130);

        ctx.font = '16px system-ui, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('Score: ' + score, canvas.width / 2, 170);
        ctx.fillText('Level: ' + level, canvas.width / 2, 194);

        if (score >= highScore && score > 0) {
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 14px system-ui, sans-serif';
            ctx.fillText('🏆 NEW HIGH SCORE!', canvas.width / 2, 222);
        }

        // Restart Button 
        drawButton('PLAY AGAIN', canvas.width / 2, 260, '#38bdf8');
    }
}

function drawButton(text, x, y, color) {
    const w = 160;
    const h = 40;
    const rx = x - w / 2;
    const ry = y - h / 2;

    // Button background
    ctx.fillStyle = color;
    ctx.beginPath();
    // Manual rounded rectangle (works in ALL browsers)
    const r = 8;
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + w - r, ry);
    ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + r);
    ctx.lineTo(rx + w, ry + h - r);
    ctx.quadraticCurveTo(rx + w, ry + h, rx + w - r, ry + h);
    ctx.lineTo(rx + r, ry + h);
    ctx.quadraticCurveTo(rx, ry + h, rx, ry + h - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
    ctx.fill();

    // Button text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.textBaseline = 'alphabetic'; // Reset
}


// === Game Loop ===
function update() {
    if (gameState !== 'playing') return;

    // --- Player Movement ---
    player.x += (player.targetX - player.x) * 0.15;
    if (player.x < 16) player.x = 16;
    if (player.x > 424) player.x = 424;

    // --- Invincibility Timer ---
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
    // update stars
    stars.forEach(star => {
        star.y += star.speed;

        if (star.y > canvas.height) {
            // star went off the bottom! Rest it to the top.
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    // --- Update Bullets (move them up) ---
    for (let i = bullets.length - 1; i >= 0; i--) {

        bullets[i].y -= bullets[i].speed;

        if (bullets[i].y < -10) {
            //bullets went off the top of the screen. remove it.
            bullets.splice(i, 1);
        }
    }

    // --- Spawn Enemies ---
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
        spawnEnemy();
        spawnTimer = 0;
    }

    // --- Update Enemies ---
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;

        if (enemies[i].y > canvas.height + 20) {
            // Enemy escaped over the bottom. Remove it.
            enemies.splice(i, 1);
            continue;
        }

        // Enemy hits player
        if (checkCollision(enemies[i], player)) {
            enemies.splice(i, 1);
            playerHit();
            continue;
        }
    }

    // --- Collision Detection : Bullets vs Enemies ---
    for (let b = bullets.length - 1; b >= 0; b--) {
        for (let e = enemies.length - 1; e >= 0; e--) {
            // nested loops : check Every bullets against Every enemy.
            if (checkCollision(bullets[b], enemies[e])) {
                // creat explosion at enemy position
                createExplosion(enemies[e].x, enemies[e].y, '#fbbf24');

                // HIT! remove both bullet and enemy.
                bullets.splice(b, 1);
                enemies.splice(e, 1);

                score += 10;   // Add 10 points for each kill.

                // levelup every 100 points
                if (score % 100 === 0) {
                    level++;
                    spawnInterval = Math.max(20, spawnInterval - 6); //Cap at 20 frames
                }

                break;
            }
        }
    }
    // --- Particles ---
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStars(); // Background layer
    drawParticles(); // Draw particles behind bullets/enemies
    drawBullets(); // Middle layer 
    drawEnemies(); // Middle layer 
    drawPlayer(); //Foreground layer (player on top)
    drawUI();

    if (gameState !== 'playing') {
        drawOverlay();
    }
}

// === Game Loop ===

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// === Click to START / RESTART ===
canvas.addEventListener('click', (e) => {
    if (gameState === 'playing') return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if click is inside button area
    // Button is centered at (220, 240 for start / 260 for gameover)
    const btnY = gameState === 'start' ? 240 : 260;
    const btnX = 220;
    const btnW = 160;
    const btnH = 40;

    if (clickX > btnX - btnW / 2 && clickX < btnX + btnW / 2 &&
        clickY > btnY - btnH / 2 && clickY < btnY + btnH / 2) {
        resetGame();
    }
});

// === Start ===
loop();