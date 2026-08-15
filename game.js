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
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}
