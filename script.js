const canvas = document.getElementById('gravityCanvas');
const ctx = canvas.getContext('2d');
const forceDisplay = document.getElementById('forceDisplay');
const tickSound = document.getElementById('tickSound');

// State Global
let isHidden = false;
let logCount = 0;
const G_SIM = 0.02; // Konstanta skala simulasi

// Inisialisasi Ukuran Canvas sesuai wadahnya
function initCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', initCanvas);
initCanvas();

// Fungsi menggambar grid yang melengkung (Space-Time Warp)
function drawWarpedGrid(m1, m2, dist) {
    ctx.strokeStyle = "rgba(77, 184, 255, 0.15)";
    ctx.lineWidth = 1;
    
    const step = 40;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const p1 = { x: cx - dist / 2, y: cy, m: m1 };
    const p2 = { x: cx + dist / 2, y: cy, m: m2 };

    // Gambar garis vertikal yang melengkung
    for (let x = 0; x <= canvas.width; x += step) {
        ctx.beginPath();
        for (let y = 0; y <= canvas.height; y += 10) {
            let nx = x;
            let ny = y;
            
            [p1, p2].forEach(p => {
                const dx = x - p.x;
                const dy = y - p.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                const strength = (p.m * 60) / (d + 60);
                
                nx += (p.x - x) * (strength / 100);
                ny += (p.y - y) * (strength / 100);
            });
            
            y === 0 ? ctx.moveTo(nx, ny) : ctx.lineTo(nx, ny);
        }
        ctx.stroke();
    }
}

// Fungsi menggambar planet dengan efek 3D
function drawPlanet(x, y, radius, color, label) {
    ctx.shadowBlur = radius * 1.2;
    ctx.shadowColor = color;

    const grad = ctx.createRadialGradient(x - radius/3, y - radius/3, radius/10, x, y, radius);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, color);
    grad.addColorStop(1, "#000000");

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Poppins";
    ctx.textAlign = "center";
    ctx.fillText(label.toUpperCase(), x, y + radius + 25);
}

// Loop Utama Simulasi
function update() {
    ctx.fillStyle = '#020205';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ambil nilai dari input
    const m1 = parseFloat(document.getElementById('mass1').value);
    const m2 = parseFloat(document.getElementById('mass2').value);
    const r = parseFloat(document.getElementById('distance').value);

    // Update Label Teks
    document.getElementById('m1Value').innerText = m1 + " kg";
    document.getElementById('m2Value').innerText = m2 + " kg";
    document.getElementById('distValue').innerText = r + " m";

    // Hitung Gaya
    const force = (G_SIM * m1 * m2) / Math.pow(r / 100, 2);
    document.getElementById('forceValue').innerText = force.toFixed(2);

    // Gambar Background Grid Melengkung
    drawWarpedGrid(m1, m2, r);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const p1x = cx - r / 2;
    const p2x = cx + r / 2;

    // Gambar Planet
    drawPlanet(p1x, cy, Math.sqrt(m1) * 5, "#4db8ff", "Benda 1");
    drawPlanet(p2x, cy, Math.sqrt(m2) * 5, "#e94560", "Benda 2");

    requestAnimationFrame(update);
}

// Fitur: Sembunyikan Angka (Challenge Mode)
document.getElementById('btnHide').onclick = () => {
    isHidden = !isHidden;
    forceDisplay.classList.toggle('hidden');
    document.getElementById('btnHide').innerText = isHidden ? "👁️ Tampilkan Angka" : "🙈 Sembunyikan Angka";
};

// Fitur: Simpan Data ke Tabel
document.getElementById('btnLog').onclick = () => {
    logCount++;
    const m1 = document.getElementById('mass1').value;
    const m2 = document.getElementById('mass2').value;
    const r = document.getElementById('distance').value;
    const f = document.getElementById('forceValue').innerText;

    const tableBody = document.querySelector('#dataTable tbody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td>${logCount}</td>
        <td>${m1}</td>
        <td>${m2}</td>
        <td>${r}</td>
        <td>${f}</td>
        <td><button onclick="this.parentElement.parentElement.remove()" class="btn-delete">Hapus</button></td>
    `;
    
    tableBody.appendChild(newRow);
    if (tickSound) tickSound.play().catch(() => {});
};

// Fitur: Reset
document.getElementById('btnReset').onclick = () => {
    location.reload();
};

// Jalankan Simulasi
update();
