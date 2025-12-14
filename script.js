// --- SETUP ---
const eye = document.getElementById('eye');
const statusText = document.getElementById('status');
const overlay = document.getElementById('overlay');
const modeSelect = document.getElementById('modeSelect');
let isBreach = false;

// --- MODE SWITCHER ---
function changeMode() {
    const mode = modeSelect.value;
    
    // Hide all
    document.querySelectorAll('.mode-container').forEach(el => el.classList.remove('active'));
    
    // Show selected
    document.getElementById('mode-' + mode).classList.add('active');
    
    statusText.innerText = "SYSTEM ARMED: " + mode.toUpperCase();
}

// --- MODE 1: GYROSCOPE (Sentry) ---
window.addEventListener('deviceorientation', (event) => {
    if (modeSelect.value !== 'sentry') return;
    const x = Math.min(Math.max(event.gamma, -40), 40);
    const y = Math.min(Math.max(event.beta - 45, -40), 40);
    eye.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
});

// --- MODE 2: MATRIX CODE ---
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヂギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロヲゴゾドボポ1234567890';
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    if (modeSelect.value !== 'matrix') return; // Save battery if not in matrix mode

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = katakana.charAt(Math.floor(Math.random() * katakana.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}
setInterval(drawMatrix, 30);

// --- SECURITY LOGIC (Shared) ---
document.body.addEventListener('click', function() {
    // Request permission for sensors
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission();
    }
    
    if (modeSelect.value === 'sentry') {
        triggerAlarm();
    }
});

function triggerAlarm() {
    isBreach = true;
    document.body.classList.add('breach');
    statusText.innerText = "UNAUTHORIZED ACCESS!";
    
    let flashCount = 0;
    const flashInterval = setInterval(() => {
        overlay.style.opacity = overlay.style.opacity === '0' ? '0.5' : '0';
        flashCount++;
        if(flashCount > 10) {
            clearInterval(flashInterval);
            resetSystem();
        }
    }, 200);

    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function resetSystem() {
    isBreach = false;
    document.body.classList.remove('breach');
    overlay.style.opacity = '0';
    changeMode(); // Reset text
}
