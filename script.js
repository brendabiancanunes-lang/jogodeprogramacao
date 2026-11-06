const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estado do Perito
const player = {
    x: 100,
    y: 200,
    radius: 12,
    speed: 2.2, // Velocidade pausada para ritmo de investigação
    angle: 0
};

// Teclas pressionadas
const keys = {};

// Evidências espalhadas pelo cenário
const evidences = [
    { id: 1, x: 250, y: 350, label: "1", title: "Pegada de Lama", desc: "Impressão de calçado tamanho 42 com solo característico de bota tática.", collected: false },
    { id: 2, x: 550, y: 150, label: "2", title: "Copo de Cristal", desc: "Taça contendo resíduos químicos e impressões digitais parciais nas bordas.", collected: false },
    { id: 3, x: 680, y: 300, label: "3", title: "Cartucho .380", desc: "Cápsula deflagrada encontrada próxima ao corpo. Marcação de percussão visível.", collected: false }
];

let collectedCount = 0;

// Ouvintes de teclado
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Tecla espaço para examinar evidência próxima
    if (e.key === ' ' || e.code === 'Space') {
        checkInteraction();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Movimento do Perito
function updatePlayer() {
    let dx = 0;
    let dy = 0;

    if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;

    if (dx !== 0 || dy !== 0) {
        player.angle = Math.atan2(dy, dx);
        player.x += dx * player.speed;
        player.y += dy * player.speed;

        // Limite do mapa (Canvas)
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
    }
}

// Desenhar a Cena do Crime
function drawScene() {
    // Fundo da sala
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grade do piso
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Desenhar a Vítima (Contorno do corpo)
    ctx.save();
    ctx.translate(450, 220);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -20, 10, 0, Math.PI * 2); // Cabeça
    ctx.moveTo(0, -10); ctx.lineTo(0, 30); // Tronco
    ctx.moveTo(0, 0); ctx.lineTo(-20, 15); // Braço Esquerdo
    ctx.moveTo(0, 0); ctx.lineTo(20, 15); // Braço Direito
    ctx.moveTo(0, 30); ctx.lineTo(-15, 60); // Perna Esquerda
    ctx.moveTo(0, 30); ctx.lineTo(15, 60); // Perna Direita
    ctx.stroke();
    ctx.restore();

    // Fita de isolamento
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]);
    ctx.strokeRect(380, 120, 160, 200);
    ctx.setLineDash([]);

    // Desenhar Evidências
    evidences.forEach(ev => {
        ctx.fillStyle = ev.collected ? '#22c55e' : '#eab308';
        ctx.beginPath();
        ctx.arc(ev.x, ev.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ev.label, ev.x, ev.y + 3);
    });

    // Lanterna do Perito (Facho de Luz)
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    const gradient = ctx.createRadialGradient(0, 0, 5, 100, 0, 120);
    gradient.addColorStop(0, 'rgba(253, 224, 71, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 130, -Math.PI / 5, Math.PI / 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Desenhar Perito
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Verificar interação com evidências próximas
function checkInteraction() {
    evidences.forEach(ev => {
        const dist = Math.hypot(player.x - ev.x, player.y - ev.y);
        if (dist < 30) {
            if (!ev.collected) {
                ev.collected = true;
                collectedCount++;
                document.getElementById('evidence-count').innerText = `${collectedCount} / 3`;
            }
            openModal(ev.title, ev.desc);
        }
    });

    if (collectedCount === 3) {
        document.getElementById('status-text').innerText = "Coleta finalizada";
        document.getElementById('status-text').className = "text-green-500 font-bold";
    }
}

function openModal(title, desc) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = desc;
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal').classList.add('flex');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').classList.remove('flex');
}

// Loop principal do jogo
function gameLoop() {
    updatePlayer();
    drawScene();
    requestAnimationFrame(gameLoop);
}

// Iniciar
gameLoop();