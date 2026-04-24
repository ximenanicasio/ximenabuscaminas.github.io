const CONFIG = {
    facil: { filas: 9, cols: 9, minas: 10 },
    medio: { filas: 16, cols: 16, minas: 40 },
    dificil: { filas: 16, cols: 30, minas: 99 },
    experto: { filas: 20, cols: 20, minas: 80 }
};

let tablero = [];
let filas, cols, totalMinas;
let minasRestantes, celdasAbiertas, primerClick;
let juegoActivo, tiempo, timer;
let dificultadActual = 'medio';
let audioDesbloqueado = false;
let intentosTotales = 0;

const tableroDiv = document.getElementById('tablero');
const minasSpan = document.getElementById('minas');
const tiempoSpan = document.getElementById('tiempo');
const intentosSpan = document.getElementById('intentos');
const mensaje = document.getElementById('mensaje');
const btnCara = document.getElementById('btnCara');
const selectDificultad = document.getElementById('dificultad');
const musicaFondo = document.getElementById('musicaFondo');
const avisoAudio = document.getElementById('avisoAudio');
const modalBoom = document.getElementById('modalBoom');

let audioCtx;

const explosion1 = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_8b4f0e4b7a.mp3');
const explosion2 = new Audio('https://cdn.pixabay.com/download/audio/2022/03/24/audio_d1718ab41c.mp3');
const explosion3 = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3');
explosion1.volume = 1.0;
explosion2.volume = 1.0;
explosion3.volume = 1.0;

function desbloquearAudio() {
    if (!audioDesbloqueado) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtx.resume();
        audioDesbloqueado = true;
        avisoAudio.style.display = 'none';
        explosion1.load();
        explosion2.load();
        explosion3.load();
    }
}

function reproducirExplosion() {
    if (!audioDesbloqueado) return;

    explosion1.currentTime = 0;
    explosion2.currentTime = 0;
    explosion3.currentTime = 0;

    explosion1.play().catch(() => {});
    setTimeout(() => explosion2.play().catch(() => {}), 30);
    setTimeout(() => explosion3.play().catch(() => {}), 60);

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.frequency.value = 40;
    osc2.frequency.value = 80;
    gain.gain.setValueAtTime(1.0, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 1.2);
    osc2.stop(audioCtx.currentTime + 1.2);

    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 800);
}

function sonido(tipo) {
    if (!audioDesbloqueado) return;

    if (tipo === 'mina') {
        reproducirExplosion();
        return;
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (tipo === 'click') {
        osc