//=== Setup ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// === Game State == 

const player = {
    x: 220,
    y:320,
    targetX: 220
};

// Input 
canvas.addEventListener('mousemove', (e) => {const rect = canvas.getBoundingClientRect(); player.targetX = e.clientX - rect.left;});

// == Draving ==
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