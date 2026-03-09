import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../config';
import { Level } from '../constants';
import { Particle, Player } from '../../app/types';

export function drawFrame(params: {
    ctx: CanvasRenderingContext2D;
    player: Player;
    level: Level;
    particles: Particle[];
    coinsCollected: Set<number>;
    frameCount: number;
}): void {
    const { ctx, player, level, particles, coinsCollected, frameCount } = params;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background Gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, '#1a2a6c');
    skyGradient.addColorStop(0.5, '#b21f1f');
    skyGradient.addColorStop(1, '#fdbb2d');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    const drawCloud = (x: number, y: number, size: number) => {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y - size * 0.4, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x + size * 1.2, y, size * 0.9, 0, Math.PI * 2);
        ctx.fill();
    };
    drawCloud(100 + (frameCount * 0.2) % 900 - 100, 80, 20);
    drawCloud(400 + (frameCount * 0.1) % 900 - 100, 120, 25);
    drawCloud(700 + (frameCount * 0.15) % 900 - 100, 60, 18);

    // Draw Platforms
    for (const platform of level.platforms) {
        // Main body
        const grad = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
        grad.addColorStop(0, '#5d4037');
        grad.addColorStop(1, '#3e2723');
        ctx.fillStyle = grad;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Grass top
        ctx.fillStyle = '#43a047';
        ctx.fillRect(platform.x, platform.y, platform.width, 6);
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(platform.x, platform.y + 6, platform.width, 2);

        // Detail lines
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        for (let i = 10; i < platform.width; i += 20) {
            ctx.moveTo(platform.x + i, platform.y + 8);
            ctx.lineTo(platform.x + i, platform.y + platform.height);
        }
        ctx.stroke();
    }

    // Draw Coins (Animated)
    const bob = Math.sin(frameCount * 0.1) * 5;
    for (const coin of level.coins) {
        if (!coinsCollected.has(coin.id)) {
            ctx.save();
            ctx.translate(coin.x, coin.y + bob);

            // Outer glow
            const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 12);
            glow.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
            glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();

            // Coin body
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();

            // Inner detail
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#DAA520';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);

            ctx.restore();
        }
    }

    // Draw Exit (Better Door)
    const exit = level.exit;
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 3;
    ctx.strokeRect(exit.x, exit.y, exit.width, exit.height);
    // Door arch
    ctx.beginPath();
    ctx.arc(exit.x + exit.width / 2, exit.y, exit.width / 2, Math.PI, 0);
    ctx.fill();
    // Doorknob
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(exit.x + exit.width - 10, exit.y + exit.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Particles
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Draw Player (Better Character)
    ctx.save();
    ctx.translate(player.x, player.y);

    // Body
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(0, 0, player.width, player.height);

    // Overalls
    ctx.fillStyle = '#2980B9';
    ctx.fillRect(0, player.height * 0.6, player.width, player.height * 0.4);
    ctx.fillRect(player.width * 0.2, player.height * 0.4, player.width * 0.1, player.height * 0.2);
    ctx.fillRect(player.width * 0.7, player.height * 0.4, player.width * 0.1, player.height * 0.2);

    // Hat
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(-2, -4, player.width + 4, 8);
    ctx.fillRect(2, -8, player.width - 4, 4);

    // Eyes
    ctx.fillStyle = 'white';
    const eyeX = player.facing === 'right' ? 18 : 2;
    ctx.fillRect(eyeX, 6, 10, 8);
    ctx.fillStyle = 'black';
    const pupilX = player.facing === 'right' ? eyeX + 6 : eyeX + 2;
    ctx.fillRect(pupilX, 8, 3, 4);

    ctx.restore();
}
