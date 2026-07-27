/**
 * Ninja Battle: Chakra Showdown - Game Engine
 * -------------------------------------------
 * Features:
 * - Canvas 2D game loop with smooth camera tracking.
 * - Procedural vector rendering for players, enemies, and skills.
 * - Web Audio API procedural sound synthesizer (slashes, explosions, level-ups).
 * - Multi-layered parallax scrolling backgrounds.
 * - Projectile & Particle systems.
 * - LocalStorage state saving and Upgrade Shop.
 * - HTML5 screen blend video triggers.
 */

// --- SOUND SYNTHESIZER ---
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.noiseBuffer = null;
    this.muted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.createNoiseBuffer();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds of noise
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  playSelect() {
    if (this.muted || !this.ctx) return;
    this.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playSlash() {
    if (this.muted || !this.ctx || !this.noiseBuffer) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    source.start();
    source.stop(this.ctx.currentTime + 0.18);
  }

  playShuriken() {
    if (this.muted || !this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  playDash() {
    if (this.muted || !this.ctx || !this.noiseBuffer) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.1);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    source.start();
    source.stop(this.ctx.currentTime + 0.12);
  }

  playHurt() {
    if (this.muted || !this.ctx || !this.noiseBuffer) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    source.start();
    source.stop(this.ctx.currentTime + 0.15);
  }

  playExplosion() {
    if (this.muted || !this.ctx || !this.noiseBuffer) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 1.2);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.3);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    source.start();
    source.stop(this.ctx.currentTime + 1.3);
  }

  playCharge(duration = 0.1) {
    if (this.muted || !this.ctx) return;
    // Tiny crackling high-pitch pulse for charging
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120 + Math.random() * 80, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playLevelUp() {
    if (this.muted || !this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4 -> E4 -> G4 -> C5
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime + i * 0.08);
      osc.stop(this.ctx.currentTime + i * 0.08 + 0.25);
    });
  }

  playVictory() {
    if (this.muted || !this.ctx) return;
    const notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // E4 -> G4 -> C5 -> E5 -> G5 -> C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.4);
    });
  }

  playDefeat() {
    if (this.muted || !this.ctx) return;
    const notes = [293.66, 261.63, 220.00, 174.61]; // D4 -> C4 -> A3 -> F3
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.15 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.15);
      osc.stop(this.ctx.currentTime + i * 0.15 + 0.5);
    });
  }
}

const sfx = new SoundSynth();

// --- STATE CONSTANTS & SETUP ---
const STATE_MENU = 'menu';
const STATE_SELECT = 'select';
const STATE_BATTLE = 'battle';
const STATE_SHOP = 'shop';
const STATE_GAMEOVER = 'gameover';
const STATE_VICTORY = 'victory';
const STATE_HOWTO = 'howto';
const STATE_HIGHSCORES = 'highscores';

let gameState = STATE_MENU;

// --- CANVAS ENGINE ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- GAME CONFIG & SYSTEM VARIABLES ---
const WORLD_WIDTH = 3200;
const GROUND_Y_OFFSET = 120; // from bottom of viewport
let groundY = window.innerHeight - GROUND_Y_OFFSET;

// Dynamic Camera object
const camera = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  shakeIntensity: 0,
  shakeDecay: 0.9,
  update: function(targetX, viewportWidth, viewportHeight) {
    groundY = viewportHeight - GROUND_Y_OFFSET;
    
    // Target camera centered on player
    this.targetX = targetX - viewportWidth / 2;
    
    // Keep camera within boundaries
    this.targetX = Math.max(0, Math.min(WORLD_WIDTH - viewportWidth, this.targetX));
    
    // Smooth camera shift
    this.x += (this.targetX - this.x) * 0.1;
    
    // Camera shake decay
    if (this.shakeIntensity > 0.05) {
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
    }
  },
  shake: function(amount) {
    this.shakeIntensity = Math.min(30, this.shakeIntensity + amount);
  },
  getX: function() {
    if (this.shakeIntensity > 0) {
      return this.x + (Math.random() * 2 - 1) * this.shakeIntensity;
    }
    return this.x;
  },
  getY: function() {
    if (this.shakeIntensity > 0) {
      return (Math.random() * 2 - 1) * this.shakeIntensity;
    }
    return 0;
  }
};

// --- CONTROLS INPUT ---
const keys = {};
const mouse = { x: 0, y: 0, isDown: false };

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (gameState === STATE_BATTLE) {
    if (e.code === 'KeyQ' || e.code === 'KeyI') triggerUltimateJutsu();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Avoid opening browser context menu on canvas right click
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

canvas.addEventListener('mousemove', (e) => {
  const bounds = canvas.getBoundingClientRect();
  mouse.x = e.clientX - bounds.left;
  mouse.y = e.clientY - bounds.top;
});

canvas.addEventListener('mousedown', (e) => {
  if (gameState !== STATE_BATTLE || ultimateActive) return;
  sfx.init();
  
  if (e.button === 0) {
    // Left click basic attack
    triggerPlayerMeleeAttack();
  } else if (e.button === 2) {
    // Right click shuriken
    triggerPlayerRangedAttack();
  }
});

// Map standard secondary letters J, K, L for users on laptops/trackpads
window.addEventListener('keypress', (e) => {
  if (gameState !== STATE_BATTLE || ultimateActive) return;
  
  if (e.key === 'j' || e.key === 'J') {
    triggerPlayerMeleeAttack();
  } else if (e.key === 'k' || e.key === 'K') {
    triggerPlayerRangedAttack();
  } else if (e.key === 'l' || e.key === 'L') {
    triggerPlayerDash();
  }
});

// --- ENTITIES & SYSTEM DATA ---
let player = null;
let enemies = [];
let shurikens = [];
let particles = [];
let scrolls = [];

let wave = 1;
let enemiesRemainingToKill = 0;
let enemiesSpawnedThisWave = 0;
let totalEnemiesInWave = 0;
let spawnTimer = 0;
let ultimateActive = false;

// High scores
let personalHighScore = parseInt(localStorage.getItem('ninja_highscore')) || 0;

// Shop Stats upgrades levels
const shopStats = {
  hpLevel: 1,
  chakraLevel: 1,
  damageLevel: 1,
  regenLevel: 1,
  getCost: function(stat) {
    if (stat === 'hp') return 4 + this.hpLevel;
    if (stat === 'chakra') return 6 + this.chakraLevel * 2;
    if (stat === 'damage') return 5 + this.damageLevel;
    if (stat === 'regen') return 4 + this.regenLevel;
  },
  getMaxHp: function() { return 100 + (this.hpLevel - 1) * 20; },
  getMaxChakra: function() { return 100 + (this.chakraLevel - 1) * 15; },
  getDamageMult: function() { return 1.0 + (this.damageLevel - 1) * 0.2; },
  getRegenMult: function() { return 1.0 + (this.regenLevel - 1) * 0.25; }
};

// --- INIT PLAYER ---
function createPlayer(type) {
  player = {
    x: 300,
    y: 100,
    vx: 0,
    vy: 0,
    width: 60,
    height: 90,
    type: type, // 'naruto' or 'sasuke'
    hp: shopStats.getMaxHp(),
    maxHp: shopStats.getMaxHp(),
    chakra: 0,
    maxChakra: shopStats.getMaxChakra(),
    ammo: 10,
    maxAmmo: 10,
    ammoRegenTimer: 0,
    
    facing: 1, // 1 = right, -1 = left
    state: 'idle', // 'idle', 'run', 'charge', 'dash', 'hurt'
    
    dashCooldown: 0,
    dashActive: 0, // timer for invulnerability frame
    attackActive: 0, // timer for attack hitbox active
    combo: 0,
    comboTimer: 0,
    
    scrollCount: parseInt(localStorage.getItem('ninja_scrolls')) || 0,
    score: 0,
    kills: 0,
    
    trails: [],
    
    grounded: false
  };
  
  // Style wrapper on body for custom CSS triggers
  document.getElementById('gameBody').className = (type === 'sasuke') ? 'player-sasuke' : 'player-naruto';
  updateHud();
}

// --- RENDERING ROUTINES (PROCEDURAL) ---

// 1. Draw Parallax Background
function drawParallaxBackground(ctx) {
  const scroll = camera.getX();
  const h = canvas.height;
  const w = canvas.width;

  // Sky Gradient
  let skyGrad = ctx.createLinearGradient(0, 0, 0, h - GROUND_Y_OFFSET);
  skyGrad.addColorStop(0, '#040508');
  skyGrad.addColorStop(0.5, '#0c0e18');
  skyGrad.addColorStop(1, '#181223');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Large Moon
  ctx.save();
  const moonX = w * 0.15 - scroll * 0.05;
  const moonY = h * 0.22;
  const moonR = Math.min(100, h * 0.18);
  let moonGrad = ctx.createRadialGradient(moonX, moonY, moonR * 0.2, moonX, moonY, moonR);
  moonGrad.addColorStop(0, '#ffffff');
  moonGrad.addColorStop(0.3, '#f5effa');
  moonGrad.addColorStop(0.8, '#bfa8e0');
  moonGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw Jagged Mountains (Layer 1 - Far)
  ctx.fillStyle = '#0f1124';
  ctx.beginPath();
  ctx.moveTo(0, h);
  let m1Step = 120;
  for (let x = 0; x <= w + m1Step; x += m1Step) {
    const worldX = x + scroll * 0.2; // slow parallax scroll
    const heightIndex = Math.sin(worldX * 0.003) * 80 + Math.cos(worldX * 0.007) * 40;
    const mountainY = groundY - 140 - heightIndex;
    ctx.lineTo(x, mountainY);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Draw Jagged Mountains (Layer 2 - Nearer)
  ctx.fillStyle = '#17142b';
  ctx.beginPath();
  ctx.moveTo(0, h);
  let m2Step = 80;
  for (let x = 0; x <= w + m2Step; x += m2Step) {
    const worldX = x + scroll * 0.45; // faster parallax scroll
    const heightIndex = Math.cos(worldX * 0.004) * 60 + Math.sin(worldX * 0.009) * 30;
    const mountainY = groundY - 70 - heightIndex;
    ctx.lineTo(x, mountainY);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Draw Pine Trees (Parallax Forest)
  ctx.fillStyle = '#0b0817';
  let treeStep = 180;
  const treeScroll = scroll * 0.7;
  // Compute starting offset
  const firstTreeIndex = Math.floor(treeScroll / treeStep) - 1;
  const lastTreeIndex = Math.ceil((treeScroll + w) / treeStep) + 1;
  
  for (let i = firstTreeIndex; i <= lastTreeIndex; i++) {
    const treeX = i * treeStep - treeScroll;
    const treeY = groundY - 5;
    const treeH = 75 + Math.sin(i * 12.3) * 25;
    const treeW = 35 + Math.cos(i * 8.7) * 10;
    
    // Draw procedural tree
    ctx.beginPath();
    ctx.moveTo(treeX, treeY);
    ctx.lineTo(treeX - treeW/2, treeY);
    ctx.lineTo(treeX - treeW/3, treeY - treeH * 0.35);
    ctx.lineTo(treeX - treeW * 0.4, treeY - treeH * 0.35);
    ctx.lineTo(treeX - treeW/6, treeY - treeH * 0.7);
    ctx.lineTo(treeX - treeW * 0.25, treeY - treeH * 0.7);
    ctx.lineTo(treeX, treeY - treeH);
    ctx.lineTo(treeX + treeW * 0.25, treeY - treeH * 0.7);
    ctx.lineTo(treeX + treeW/6, treeY - treeH * 0.7);
    ctx.lineTo(treeX + treeW * 0.4, treeY - treeH * 0.35);
    ctx.lineTo(treeX + treeW/3, treeY - treeH * 0.35);
    ctx.lineTo(treeX + treeW/2, treeY);
    ctx.closePath();
    ctx.fill();
  }

  // Draw Ground Path Layer
  ctx.fillStyle = '#1c1f2b';
  ctx.fillRect(0, groundY, w, h - groundY);
  
  // Highlight border (Grass/Floor top line)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();

  // Grid/Ground texture segments
  ctx.strokeStyle = '#282d3e';
  ctx.lineWidth = 1;
  let floorSegStep = 200;
  const floorScroll = scroll % floorSegStep;
  for (let x = -floorScroll; x < w; x += floorSegStep) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x - 50, h);
    ctx.stroke();
  }
}

// 2. Draw Player Avatar (Procedural vector shapes and glows)
function drawPlayer(ctx) {
  const pX = player.x - camera.getX();
  const pY = player.y - camera.getY();
  
  ctx.save();
  ctx.translate(pX, pY);

  // Shadow on ground
  if (player.grounded) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, player.height, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw dash shadow clones / trails if dashing
  if (player.state === 'dash') {
    player.trails.forEach((trail, index) => {
      ctx.save();
      // Draw faded clone slightly offset
      ctx.translate(trail.x - player.x, trail.y - player.y);
      ctx.scale(player.facing, 1);
      ctx.fillStyle = player.type === 'naruto' ? `rgba(0, 240, 255, ${0.15 * (index / player.trails.length)})` : `rgba(199, 125, 255, ${0.15 * (index / player.trails.length)})`;
      
      // Rough outline shape of body
      ctx.beginPath();
      ctx.arc(0, -player.height/2 + 25, 18, 0, Math.PI*2);
      ctx.rect(-15, -player.height/2 + 35, 30, 40);
      ctx.fill();
      ctx.restore();
    });
  }

  // Mirror face direction based on state
  ctx.scale(player.facing, 1);

  // 🌀 Active Chakra Charging Aura
  if (player.state === 'charge') {
    const isSasuke = player.type === 'sasuke';
    const auraColor = isSasuke ? 'rgba(199, 125, 255, ' : 'rgba(0, 240, 255, ';
    const flameCount = 12;
    for (let i = 0; i < flameCount; i++) {
      ctx.save();
      ctx.fillStyle = auraColor + (0.1 + Math.random() * 0.3) + ')';
      ctx.strokeStyle = isSasuke ? '#fff' : '#e0f7fa';
      ctx.lineWidth = 1;
      
      const flameH = 40 + Math.random() * 60;
      const flameW = 15 + Math.random() * 25;
      const flameX = (Math.random() - 0.5) * 45;
      const flameY = player.height - Math.random() * 20;
      
      ctx.beginPath();
      ctx.moveTo(flameX - flameW / 2, flameY);
      ctx.quadraticCurveTo(flameX, flameY - flameH * 0.4, flameX + (Math.random() - 0.5) * 15, flameY - flameH);
      ctx.quadraticCurveTo(flameX + flameW / 2, flameY - flameH * 0.4, flameX + flameW / 2, flameY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Hurt state red overlay
  if (player.state === 'hurt') {
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ff4d4d';
  } else if (player.chakra >= player.maxChakra) {
    // Ultimate Ready Glow!
    ctx.shadowBlur = 20;
    ctx.shadowColor = player.type === 'naruto' ? varColor('naruto-primary') : varColor('sasuke-primary');
  }

  // Draw Legs
  ctx.fillStyle = player.type === 'naruto' ? '#ff8c00' : '#1c1d24'; // Orange for Naruto, dark grey for Sasuke
  ctx.fillRect(-16, player.height - 35, 10, 35);
  ctx.fillRect(6, player.height - 35, 10, 35);
  
  // Draw Torso
  ctx.fillStyle = player.type === 'naruto' ? '#ff8c00' : '#2d303f'; // Orange jacket / Dark high-collar shirt
  ctx.beginPath();
  ctx.roundRect(-20, player.height - 75, 40, 45, [8, 8, 2, 2]);
  ctx.fill();
  
  // Custom details: Naruto's blue collar patches or Sasuke's back logo Uchiha fan outline
  if (player.type === 'naruto') {
    // Blue neck guards
    ctx.fillStyle = '#1c1f2e';
    ctx.fillRect(-20, player.height - 75, 10, 10);
    ctx.fillRect(10, player.height - 75, 10, 10);
    // Orange arms
    ctx.fillStyle = '#ff8c00';
    ctx.fillRect(-27, player.height - 70, 8, 25);
    ctx.fillRect(19, player.height - 70, 8, 25);
  } else {
    // Sasuke: High collar back
    ctx.fillStyle = '#222533';
    ctx.beginPath();
    ctx.moveTo(-16, player.height - 75);
    ctx.lineTo(-24, player.height - 90);
    ctx.lineTo(-8, player.height - 75);
    ctx.closePath();
    ctx.fill();
    // Purple cord waist belt (Shimenawa)
    ctx.strokeStyle = '#c77dff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-22, player.height - 35);
    ctx.lineTo(22, player.height - 35);
    ctx.stroke();
    // Dark arms
    ctx.fillStyle = '#2d303f';
    ctx.fillRect(-26, player.height - 70, 7, 22);
    ctx.fillRect(19, player.height - 70, 7, 22);
  }

  // Draw Head
  ctx.fillStyle = '#fce2c6'; // Skin color
  ctx.beginPath();
  ctx.arc(0, player.height - 88, 18, 0, Math.PI * 2);
  ctx.fill();

  // Spiky Anime Hair!
  ctx.fillStyle = player.type === 'naruto' ? '#ffd700' : '#0b0c16'; // Gold/Black
  ctx.beginPath();
  if (player.type === 'naruto') {
    // Naruto's short spiky blonde hair
    ctx.moveTo(-18, player.height - 92);
    ctx.lineTo(-24, player.height - 105);
    ctx.lineTo(-12, player.height - 98);
    ctx.lineTo(-10, player.height - 112);
    ctx.lineTo(0, player.height - 100);
    ctx.lineTo(8, player.height - 113);
    ctx.lineTo(12, player.height - 98);
    ctx.lineTo(24, player.height - 104);
    ctx.lineTo(18, player.height - 92);
  } else {
    // Sasuke's wild layered dark blue-black bangs
    ctx.moveTo(-18, player.height - 90);
    ctx.lineTo(-26, player.height - 102);
    ctx.lineTo(-12, player.height - 100);
    ctx.lineTo(-15, player.height - 114);
    ctx.lineTo(-2, player.height - 105);
    ctx.lineTo(1, player.height - 118);
    ctx.lineTo(6, player.height - 104);
    ctx.lineTo(18, player.height - 110);
    ctx.lineTo(15, player.height - 96);
    ctx.lineTo(24, player.height - 90);
  }
  ctx.closePath();
  ctx.fill();

  // Headband
  ctx.fillStyle = player.type === 'naruto' ? '#2c3540' : '#222533';
  ctx.fillRect(-17, player.height - 96, 34, 7);
  // Metal plate
  ctx.fillStyle = '#cfd8dc';
  ctx.fillRect(-8, player.height - 96, 16, 6);
  // Leaf insignia point dot
  ctx.fillStyle = '#37474f';
  ctx.fillRect(-2, player.height - 94, 4, 2);

  // Eyes (Sage mode / Sharingan details)
  ctx.save();
  ctx.fillStyle = '#fff';
  // Face direction right (scale is already flipped, draw eyes facing forward/right)
  ctx.beginPath();
  ctx.arc(8, player.height - 88, 3, 0, Math.PI * 2);
  ctx.fill();
  // Iris
  ctx.fillStyle = player.type === 'naruto' ? '#ff9800' : '#f44336'; // Sage orange vs Sharingan red
  ctx.beginPath();
  ctx.arc(9, player.height - 88, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Attack visual indicators (active weapons)
  if (player.attackActive > 0) {
    ctx.save();
    ctx.translate(15, player.height - 50);
    
    if (player.type === 'naruto') {
      // Swirling Rasengan in hand during melee strike
      let rasGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
      rasGrad.addColorStop(0, '#fff');
      rasGrad.addColorStop(0.3, '#e0f7fa');
      rasGrad.addColorStop(0.7, 'rgba(0, 240, 255, 0.7)');
      rasGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rasGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      
      // Swirling orbit lines
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 6, Math.PI/4 + Date.now()*0.02, 0, Math.PI*2);
      ctx.stroke();
    } else {
      // Sasuke's Chidori or Katana strike
      ctx.strokeStyle = '#e0aaff';
      ctx.lineWidth = 3;
      // Draw sword slash swipe arc
      ctx.beginPath();
      ctx.arc(-5, 0, 30, -Math.PI/4, Math.PI/3);
      ctx.stroke();
      
      // Sparking crackling lightning
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(-10 + i * 8, -10 + (Math.random() - 0.5) * 16);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

// 3. Draw Enemy Units
function drawEnemy(ctx, enemy) {
  const eX = enemy.x - camera.getX();
  const eY = enemy.y - camera.getY();

  ctx.save();
  ctx.translate(eX, eY);

  // Enemy Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, enemy.height, 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face direction
  ctx.scale(enemy.facing, 1);

  // Red damage flash overlay
  if (enemy.state === 'hurt') {
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff4d4d';
  }

  // Draw Legs
  ctx.fillStyle = '#1c1f24';
  ctx.fillRect(-12, enemy.height - 30, 8, 30);
  ctx.fillRect(4, enemy.height - 30, 8, 30);

  // Draw Torso (Dark ninja jacket)
  ctx.fillStyle = '#2b2e3a';
  ctx.beginPath();
  ctx.roundRect(-16, enemy.height - 65, 32, 38, 5);
  ctx.fill();

  // Draw Head (Dark mask, glowing red eyes)
  ctx.fillStyle = '#383b48';
  ctx.beginPath();
  ctx.arc(0, enemy.height - 76, 14, 0, Math.PI * 2);
  ctx.fill();

  // Face mask wrap details
  ctx.fillStyle = '#1e2029';
  ctx.fillRect(-13, enemy.height - 78, 26, 8);

  // Glowing red eyes
  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.arc(5, enemy.height - 80, 2.5, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#ff3333';
  ctx.fillRect(3, enemy.height - 81, 4, 2);

  // Dark hair/headband spikes
  ctx.fillStyle = '#14151b';
  ctx.beginPath();
  ctx.moveTo(-14, enemy.height - 84);
  ctx.lineTo(-20, enemy.height - 95);
  ctx.lineTo(-8, enemy.height - 88);
  ctx.lineTo(-2, enemy.height - 100);
  ctx.lineTo(4, enemy.height - 88);
  ctx.lineTo(12, enemy.height - 94);
  ctx.lineTo(12, enemy.height - 82);
  ctx.closePath();
  ctx.fill();

  // Draw warning indicator when preparing to strike
  if (enemy.state === 'chase' && enemy.attackTimer > 40) {
    ctx.restore(); // escape flip scale to keep text upright
    ctx.save();
    ctx.translate(eX, eY);
    ctx.fillStyle = '#ff4d4d';
    ctx.font = 'bold 16px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, -10);
    
    // Warning attack circle area on floor
    ctx.strokeStyle = 'rgba(255, 77, 77, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, enemy.height, 45, 8, 0, 0, Math.PI*2);
    ctx.stroke();
  }

  ctx.restore();
}

// 4. Draw Projectiles (Shurikens)
function drawShurikens(ctx) {
  const scroll = camera.getX();
  ctx.save();
  shurikens.forEach(s => {
    ctx.save();
    ctx.translate(s.x - scroll, s.y);
    ctx.rotate(s.angle);
    
    // Glowing path shadow
    ctx.shadowBlur = 10;
    ctx.shadowColor = s.owner === 'player' ? 'rgba(255,255,255,0.4)' : 'rgba(255,77,77,0.4)';

    // Four point metal shuriken star path
    ctx.fillStyle = s.owner === 'player' ? '#cfd8dc' : '#78909c';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(3, -3);
    ctx.lineTo(12, 0);
    ctx.lineTo(3, 3);
    ctx.lineTo(0, 12);
    ctx.lineTo(-3, 3);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-3, -3);
    ctx.closePath();
    ctx.fill();
    
    // Center ring hole
    ctx.fillStyle = '#0a0b0e';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  });
  ctx.restore();
}

// 5. Draw Scrolls
function drawScrolls(ctx) {
  const scroll = camera.getX();
  ctx.save();
  scrolls.forEach(scr => {
    ctx.save();
    ctx.translate(scr.x - scroll, scr.y + scr.bob);
    
    // Glowing gold aura
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffd700';

    // Draw scroll rolls (gold parchment)
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-12, -6, 6, 12);
    ctx.fillRect(6, -6, 6, 12);

    ctx.fillStyle = '#ff8c00';
    ctx.fillRect(-12, -4, 24, 8);
    
    ctx.fillStyle = '#fffdf0';
    ctx.fillRect(-9, -4, 18, 8);

    ctx.fillStyle = '#d32f2f'; // Red tie ribon
    ctx.fillRect(-2, -5, 4, 10);

    ctx.restore();
  });
  ctx.restore();
}

// 6. Draw Particle System
function drawParticles(ctx) {
  const scroll = camera.getX();
  ctx.save();
  particles.forEach(p => {
    ctx.save();
    ctx.translate(p.x - scroll, p.y);

    if (p.type === 'text') {
      ctx.fillStyle = p.color;
      ctx.font = `900 ${p.size}px Orbitron`;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#000';
      ctx.fillText(p.text, 0, 0);
    } else {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.shadowBlur = p.type === 'lightning' || p.type === 'aura' ? 8 : 0;
      ctx.shadowColor = p.color;
      
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
  ctx.restore();
}

// Helper utility to read CSS variables dynamically
function varColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

// --- GAME LOGIC UPDATES ---

function triggerPlayerMeleeAttack() {
  if (player.state === 'hurt' || player.dashActive > 0 || player.attackActive > 0) return;
  
  player.state = 'idle';
  player.attackActive = 15; // hitbox duration frames
  sfx.playSlash();
  
  // Emit swipe slash particles
  const px = player.x + (player.facing === 1 ? player.width/2 : -player.width/2);
  const py = player.y + player.height/2;
  const isNaruto = player.type === 'naruto';
  const color = isNaruto ? '#00f0ff' : '#e0aaff';
  
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: px,
      y: py + (Math.random() - 0.5) * 40,
      vx: (player.facing * (5 + Math.random() * 5)) + (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 6,
      color: color,
      size: 2 + Math.random() * 3,
      gravity: 0,
      life: 20,
      maxLife: 20,
      type: 'strike'
    });
  }
}

function triggerPlayerRangedAttack() {
  if (player.state === 'hurt' || player.dashActive > 0 || player.ammo <= 0) return;
  
  player.ammo--;
  sfx.playShuriken();
  
  const pX = player.x + (player.facing === 1 ? player.width/2 : -player.width/2);
  const pY = player.y + player.height/3;
  
  // Calculate angle toward mouse cursor
  const canvasMouseX = mouse.x + camera.getX();
  const dx = canvasMouseX - pX;
  const dy = mouse.y - pY;
  const angle = Math.atan2(dy, dx);
  
  // Fly speeds
  const speed = 16;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  shurikens.push({
    x: pX,
    y: pY,
    vx: vx,
    vy: vy,
    angle: angle,
    rotationSpeed: 0.25,
    owner: 'player',
    damage: 15 * shopStats.getDamageMult()
  });

  updateHud();
}

function triggerPlayerDash() {
  if (player.state === 'hurt' || player.dashCooldown > 0 || player.dashActive > 0) return;
  
  player.dashActive = 12; // invulnerability and dash speed frames
  player.dashCooldown = 45; // cooldown frames
  sfx.playDash();
  
  // Quick forward force
  player.vx = player.facing * 20;
  player.vy = 0; // lock height
  player.state = 'dash';

  // Dust puff particles
  const py = player.y + player.height;
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: player.x,
      y: py - Math.random() * 10,
      vx: -player.facing * (2 + Math.random() * 4),
      vy: -Math.random() * 3,
      color: 'rgba(255,255,255,0.4)',
      size: 4 + Math.random() * 6,
      gravity: 0,
      life: 25,
      maxLife: 25,
      type: 'smoke'
    });
  }
}

// Spawns enemies around player camera field
function spawnEnemy() {
  const side = Math.random() < 0.5 ? -1 : 1;
  const cameraX = camera.getX();
  const screenW = canvas.width;
  
  let spawnX = cameraX + (side === 1 ? screenW + 80 : -80);
  
  // Constrain to world boundary
  spawnX = Math.max(50, Math.min(WORLD_WIDTH - 50, spawnX));

  const enemyHealth = 40 + wave * 18;
  const enemySpeed = 2.0 + Math.random() * 1.5 + (wave * 0.15);

  enemies.push({
    x: spawnX,
    y: groundY - 90,
    vx: 0,
    vy: 0,
    width: 50,
    height: 85,
    hp: enemyHealth,
    maxHp: enemyHealth,
    speed: enemySpeed,
    state: 'chase', // 'chase', 'attack', 'hurt'
    facing: -side,
    attackTimer: 0,
    animFrame: 0,
    grounded: true
  });
  
  enemiesSpawnedThisWave++;
}

// Trigger screen-blending Ultimate Jutsu cinematic using workspace MP4 files
function triggerUltimateJutsu() {
  if (player.chakra < player.maxChakra || ultimateActive || player.state === 'hurt') return;
  
  ultimateActive = true;
  player.chakra = 0;
  updateHud();

  // Pause elements and reveal Overlay
  const isNaruto = player.type === 'naruto';
  const vidId = isNaruto ? 'vidNaruto' : 'vidSasuke';
  const overlayId = isNaruto ? 'narutoUltimateVideo' : 'sasukeUltimateVideo';

  const overlayNode = document.getElementById(overlayId);
  const videoNode = document.getElementById(vidId);

  // Play synthetic cinematic rumble
  sfx.playExplosion();

  // Display announcement banner
  const nameBanner = document.getElementById('jutsuAnnouncement');
  const txtTitle = document.getElementById('announcementText');
  const txtSub = document.getElementById('announcementSubText');

  txtTitle.innerText = isNaruto ? 'RASENGAN' : 'CHIDORI';
  txtSub.innerText = isNaruto ? 'Ultimate Wind Style' : 'Ultimate Lightning Blade';
  nameBanner.classList.add('active');

  setTimeout(() => {
    // Show blended video overlay
    overlayNode.style.display = 'block';
    
    try {
      videoNode.currentTime = 0;
      videoNode.play();
      
      // Mirror screen shake on video play
      camera.shake(15);
      document.body.classList.add('shake');
      
      // Video end listener
      videoNode.onended = () => {
        completeUltimate(overlayNode, videoNode, nameBanner);
      };
      
      // Fallback timer in case video fails to fireended event
      setTimeout(() => {
        if (ultimateActive && overlayNode.style.display === 'block') {
          completeUltimate(overlayNode, videoNode, nameBanner);
        }
      }, 3500);

    } catch (e) {
      console.error("Video playback failed", e);
      // fallback immediately
      completeUltimate(overlayNode, videoNode, nameBanner);
    }
  }, 600);
}

function completeUltimate(overlayNode, videoNode, nameBanner) {
  // Hide Overlay and clear video
  overlayNode.style.display = 'none';
  videoNode.pause();
  nameBanner.classList.remove('active');
  document.body.classList.remove('shake');

  // Trigger White Flash Screen
  const flash = document.getElementById('jutsuFlash');
  flash.style.opacity = 1;
  setTimeout(() => {
    flash.style.opacity = 0;
  }, 200);

  // Shaking impact blast
  camera.shake(25);
  sfx.playExplosion();

  // Calculate damage area of effect (all active enemies on camera)
  const leftCam = camera.getX();
  const rightCam = leftCam + canvas.width;
  const killDamage = 100 * shopStats.getDamageMult();

  enemies.forEach(e => {
    if (e.x >= leftCam - 100 && e.x <= rightCam + 100) {
      e.hp -= killDamage;
      e.state = 'hurt';
      
      // Explode visual sparks on each enemy
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: e.x,
          y: e.y + e.height/2,
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 12,
          color: player.type === 'naruto' ? '#00f0ff' : '#c77dff',
          size: 4 + Math.random() * 5,
          gravity: 0.2,
          life: 30,
          maxLife: 30,
          type: 'spark'
        });
      }
      
      // Damage label
      particles.push({
        x: e.x,
        y: e.y - 15,
        text: `-${Math.round(killDamage)}`,
        color: '#ff4d4d',
        size: 24,
        life: 50,
        maxLife: 50,
        type: 'text'
      });
    }
  });

  ultimateActive = false;
}

// --- UPDATE COMBAT LOGIC ---
function updateGame() {
  if (gameState !== STATE_BATTLE || ultimateActive) return;

  // 1. Inputs & Player Movement
  const moveSpeed = player.state === 'dash' ? 14 : 5.5;
  
  if (player.state !== 'hurt') {
    let moving = false;
    
    // Default drag friction
    player.vx *= 0.82;

    if (keys['KeyA'] || keys['ArrowLeft']) {
      player.vx = -moveSpeed;
      player.facing = -1;
      moving = true;
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
      player.vx = moveSpeed;
      player.facing = 1;
      moving = true;
    }

    // Passive active charging
    if ((keys['KeyR'] || keys['KeyO']) && player.grounded && player.state !== 'dash') {
      player.state = 'charge';
      player.vx = 0; // halt during charge
      
      // Slowly increase chakra
      const chargeSpeed = 0.45 * shopStats.getRegenMult();
      player.chakra = Math.min(player.maxChakra, player.chakra + chargeSpeed);
      sfx.playCharge(0.06);
      
      // Charging particle trails rising
      if (Math.random() < 0.3) {
        particles.push({
          x: player.x + (Math.random() - 0.5) * 30,
          y: player.y + player.height - 10,
          vx: (Math.random() - 0.5) * 2,
          vy: -3 - Math.random() * 4,
          color: player.type === 'naruto' ? '#00f0ff' : '#c77dff',
          size: 2 + Math.random() * 3,
          gravity: 0,
          life: 25,
          maxLife: 25,
          type: 'aura'
        });
      }
      updateHud();
    } else if (player.state === 'charge') {
      player.state = 'idle';
    }

    if (moving && player.state !== 'dash') {
      player.state = 'run';
    } else if (player.state !== 'dash' && player.state !== 'charge') {
      player.state = 'idle';
    }

    // Jump key
    if ((keys['KeyW'] || keys['ArrowUp']) && player.grounded && player.state !== 'dash') {
      player.vy = -14.5;
      player.grounded = false;
      sfx.playDash(); // clean whoosh
    }
  }

  // Dash timer decrement
  if (player.dashActive > 0) {
    player.dashActive--;
    // Store tail shadow coordinates
    player.trails.push({ x: player.x, y: player.y });
    if (player.trails.length > 5) player.trails.shift();
    if (player.dashActive === 0) {
      player.state = 'idle';
      player.trails = [];
    }
  } else {
    player.trails = [];
  }

  if (player.dashCooldown > 0) player.dashCooldown--;
  if (player.attackActive > 0) player.attackActive--;

  // Apply basic physics (Gravity and floor bounds)
  player.vy += 0.55; // gravity force
  player.x += player.vx;
  player.y += player.vy;

  // Lock within screen boundaries
  player.x = Math.max(20, Math.min(WORLD_WIDTH - 60, player.x));
  
  if (player.y >= groundY - player.height) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  // Shuriken Ammo Regen
  player.ammoRegenTimer++;
  if (player.ammoRegenTimer >= 70) {
    player.ammoRegenTimer = 0;
    if (player.ammo < player.maxAmmo) {
      player.ammo++;
      updateHud();
    }
  }

  // Combo timer decrement
  if (player.comboTimer > 0) {
    player.comboTimer--;
    if (player.comboTimer === 0) {
      player.combo = 0;
      document.getElementById('comboContainer').classList.remove('active');
    }
  }

  // Camera tracking
  camera.update(player.x, canvas.width, canvas.height);

  // 2. Projectiles update
  for (let i = shurikens.length - 1; i >= 0; i--) {
    let s = shurikens[i];
    s.x += s.vx;
    s.y += s.vy;
    s.angle += s.rotationSpeed;

    // Remove if leaves arena boundaries
    if (s.x < 0 || s.x > WORLD_WIDTH || s.y < 0 || s.y > canvas.height) {
      shurikens.splice(i, 1);
      continue;
    }

    // Hits enemies
    if (s.owner === 'player') {
      let hit = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        let e = enemies[j];
        if (checkCollision(s, e)) {
          // Apply damage
          e.hp -= s.damage;
          e.state = 'hurt';
          e.vx = player.facing * 5; // knockback
          hit = true;
          
          // Spawn impact sparks
          for (let pCount = 0; pCount < 6; pCount++) {
            particles.push({
              x: s.x,
              y: s.y,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 5,
              color: '#ffd700',
              size: 2 + Math.random() * 2,
              gravity: 0.15,
              life: 18,
              maxLife: 18,
              type: 'spark'
            });
          }

          // Damage indicator text
          particles.push({
            x: e.x,
            y: e.y - 10,
            text: `-${Math.round(s.damage)}`,
            color: '#fff',
            size: 15,
            life: 30,
            maxLife: 30,
            type: 'text'
          });

          // Add to combo
          incrementCombo();
          break;
        }
      }
      if (hit) {
        shurikens.splice(i, 1);
        continue;
      }
    } else {
      // Enemy projectile hits player
      if (player.dashActive === 0 && checkCollision(s, player)) {
        playerHit(s.damage);
        shurikens.splice(i, 1);
        continue;
      }
    }
  }

  // 3. Update Scrolls logic
  for (let i = scrolls.length - 1; i >= 0; i--) {
    let scr = scrolls[i];
    scr.bob = Math.sin(Date.now() * 0.005 + i) * 6; // bob floating animation
    
    // Magnet pull towards player
    const dist = Math.hypot(player.x + player.width/2 - scr.x, player.y + player.height/2 - scr.y);
    if (dist < 180) {
      scr.x += (player.x + player.width/2 - scr.x) * 0.15;
      scr.y += (player.y + player.height/2 - scr.y) * 0.15;
    }

    if (dist < 40) {
      // Collect scroll
      player.scrollCount++;
      sfx.playSelect();
      
      // Shiny sparkles
      for (let pCount = 0; pCount < 8; pCount++) {
        particles.push({
          x: scr.x,
          y: scr.y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          color: '#ffd700',
          size: 2 + Math.random() * 3,
          gravity: 0,
          life: 20,
          maxLife: 20,
          type: 'spark'
        });
      }
      
      // Save details
      localStorage.setItem('ninja_scrolls', player.scrollCount);
      updateHud();
      scrolls.splice(i, 1);
    }
  }

  // 4. Update Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    
    if (e.hp <= 0) {
      // Slain!
      enemies.splice(i, 1);
      player.kills++;
      enemiesRemainingToKill = Math.max(0, enemiesRemainingToKill - 1);
      
      // Score calculation
      player.score += 100 * wave;
      
      // Chance to drop scroll (e.g. 70%)
      if (Math.random() < 0.70) {
        scrolls.push({
          x: e.x,
          y: e.y + e.height - 20,
          bob: 0
        });
      }

      // Large death puff of smoke particles
      for (let pCount = 0; pCount < 12; pCount++) {
        particles.push({
          x: e.x,
          y: e.y + e.height/2,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: 'rgba(255,255,255,0.25)',
          size: 6 + Math.random() * 8,
          gravity: -0.05,
          life: 35,
          maxLife: 35,
          type: 'smoke'
        });
      }
      
      updateHud();
      checkWaveStatus();
      continue;
    }

    // Handle physical friction and gravity on enemy
    e.vx *= 0.85;
    e.vy += 0.55;
    e.x += e.vx;
    e.y += e.vy;

    if (e.y >= groundY - e.height) {
      e.y = groundY - e.height;
      e.vy = 0;
    }

    // AI movement states
    if (e.state === 'hurt') {
      if (Math.abs(e.vx) < 0.5) {
        e.state = 'chase';
      }
    } else {
      // Pursuit player
      const dx = player.x - e.x;
      e.facing = dx > 0 ? 1 : -1;
      
      if (Math.abs(dx) > 65) {
        e.x += e.facing * e.speed;
        e.attackTimer = 0;
      } else {
        // Melee range attack speed charger
        e.attackTimer++;
        if (e.attackTimer >= 55) {
          e.attackTimer = 0;
          // Attack player if not dodging
          if (player.dashActive === 0) {
            playerHit(18 + wave * 2);
          }
        }
      }
    }

    // Player melee hitbox intersection check
    if (player.attackActive > 0 && e.state !== 'hurt') {
      const slashRange = 85;
      const withinSlash = Math.abs(player.x - e.x) < slashRange && Math.abs(player.y - e.y) < 80;
      const correctDirection = (player.facing === 1 && e.x > player.x) || (player.facing === -1 && e.x < player.x);
      
      if (withinSlash && correctDirection) {
        // Apply damage
        const damage = 22 * shopStats.getDamageMult();
        e.hp -= damage;
        e.state = 'hurt';
        e.vx = player.facing * 8; // heavy knockback
        
        // Accumulate chakra on melee hits
        player.chakra = Math.min(player.maxChakra, player.chakra + 12);
        updateHud();

        // Blood/hit sparks
        for (let pCount = 0; pCount < 8; pCount++) {
          particles.push({
            x: e.x,
            y: e.y + e.height/3 + Math.random() * 20,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 6,
            color: player.type === 'naruto' ? '#00f0ff' : '#c77dff',
            size: 2 + Math.random() * 3,
            gravity: 0.18,
            life: 20,
            maxLife: 20,
            type: 'spark'
          });
        }

        // Hit pop text
        particles.push({
          x: e.x,
          y: e.y - 12,
          text: `-${Math.round(damage)}`,
          color: player.type === 'naruto' ? '#00f0ff' : '#c77dff',
          size: 16,
          life: 30,
          maxLife: 30,
          type: 'text'
        });

        incrementCombo();
      }
    }
  }

  // 5. Spawn controller
  if (enemiesSpawnedThisWave < totalEnemiesInWave) {
    spawnTimer++;
    const spawnRate = Math.max(60, 180 - wave * 15);
    if (spawnTimer >= spawnRate) {
      spawnTimer = 0;
      spawnEnemy();
    }
  }

  // 6. Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity || 0;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// Player hit trigger
function playerHit(damage) {
  if (player.state === 'hurt' || player.dashActive > 0) return;
  
  player.hp = Math.max(0, player.hp - damage);
  player.state = 'hurt';
  player.vx = -player.facing * 7;
  camera.shake(8);
  sfx.playHurt();

  // Reset combo
  player.combo = 0;
  player.comboTimer = 0;
  document.getElementById('comboContainer').classList.remove('active');

  // Red ring blast sparks on player
  for (let pCount = 0; pCount < 8; pCount++) {
    particles.push({
      x: player.x + player.width/2,
      y: player.y + player.height/2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      color: '#ff4d4d',
      size: 3 + Math.random() * 3,
      gravity: 0,
      life: 20,
      maxLife: 20,
      type: 'spark'
    });
  }

  updateHud();

  // Check Game Over
  if (player.hp <= 0) {
    triggerGameOver();
  }
}

function incrementCombo() {
  player.combo++;
  player.comboTimer = 180; // 3 seconds window

  const comboNode = document.getElementById('comboContainer');
  const comboText = document.getElementById('comboCount');
  
  comboText.innerText = `${player.combo} HITS`;
  comboNode.classList.add('active');

  // Trigger floating combo pop animation class
  comboText.style.transform = 'scale(1.3)';
  setTimeout(() => {
    comboText.style.transform = 'scale(1)';
  }, 100);
}

function checkCollision(objA, objB) {
  // simple box overlap
  const widthA = objA.width || 10;
  const heightA = objA.height || 10;
  
  // Account for centering shuriken coord
  const ax = objA.vx ? objA.x - widthA/2 : objA.x;
  const ay = objA.vx ? objA.y - heightA/2 : objA.y;

  return ax < objB.x + objB.width &&
         ax + widthA > objB.x &&
         ay < objB.y + objB.height &&
         ay + heightA > objB.y;
}

// --- WAVE MANAGER & STATS ---

function startWave(wNumber) {
  wave = wNumber;
  gameState = STATE_BATTLE;
  
  enemies = [];
  shurikens = [];
  particles = [];
  scrolls = [];
  
  // Wave configurations
  totalEnemiesInWave = 4 + wave * 3;
  enemiesRemainingToKill = totalEnemiesInWave;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;
  
  player.x = 300;
  player.y = groundY - player.height;
  player.vx = 0;
  player.vy = 0;
  player.hp = player.maxHp; // Heal to full on new wave starts
  
  // Restore details
  updateHud();
  
  // Screen transitions
  showScreen('hudOverlay'); // activate game overlay HUD
  document.getElementById('hudOverlay').classList.add('active');
  
  // Display wave start announcement banner
  const nameBanner = document.getElementById('jutsuAnnouncement');
  const txtTitle = document.getElementById('announcementText');
  const txtSub = document.getElementById('announcementSubText');

  txtTitle.innerText = `WAVE ${wave}`;
  txtSub.innerText = wave === 10 ? 'Final Showdown: Legendary Battle' : 'Defeat the Rogue Ninjas';
  nameBanner.classList.add('active');
  sfx.playLevelUp();

  setTimeout(() => {
    nameBanner.classList.remove('active');
  }, 1800);
}

function checkWaveStatus() {
  if (enemiesRemainingToKill <= 0) {
    if (wave >= 10) {
      // Conquer Victory!
      triggerVictory();
    } else {
      // Wave clear, transition to Academy training shop
      setTimeout(() => {
        openShop();
      }, 1000);
    }
  }
}

function updateHud() {
  if (!player) return;

  // Health Fill
  const hpPercent = (player.hp / player.maxHp) * 100;
  document.getElementById('healthBarFill').style.width = `${hpPercent}%`;
  document.getElementById('healthValue').innerText = `${Math.round(player.hp)} / ${player.maxHp}`;

  // Chakra Fill
  const chakraPercent = (player.chakra / player.maxChakra) * 100;
  document.getElementById('chakraBarFill').style.width = `${chakraPercent}%`;
  document.getElementById('chakraValue').innerText = `${Math.round(chakraPercent)}%`;

  // HUD items
  document.getElementById('hudScrollCount').innerText = player.scrollCount;
  document.getElementById('hudAmmoCount').innerText = player.ammo;
  document.getElementById('hudWaveNum').innerText = `Wave ${wave}`;
  document.getElementById('hudEnemiesRemaining').innerText = `Ninjas Remaining: ${enemiesRemainingToKill}`;
}

// --- SCREEN SYSTEM CONTROLS ---

function showScreen(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));

  // Disable HUD
  document.getElementById('hudOverlay').classList.remove('active');

  // Show specific screen if it exists
  const activeScreen = document.getElementById(screenId);
  if (activeScreen) {
    activeScreen.classList.add('active');
  }
}

// --- UPGRADE SHOP ---

function openShop() {
  gameState = STATE_SHOP;
  showScreen('shopOverlay');
  sfx.playLevelUp();

  // Populate dynamic UI
  document.getElementById('shopScrollBalance').innerText = player.scrollCount;
  
  // Item 1: HP
  document.getElementById('shopHpLevel').innerText = `Level ${shopStats.hpLevel}`;
  const hpCost = shopStats.getCost('hp');
  const btnHp = document.getElementById('btnBuyHp');
  btnHp.innerText = `📜 ${hpCost} Scrolls`;
  btnHp.disabled = player.scrollCount < hpCost;

  // Item 2: Chakra
  document.getElementById('shopChakraLevel').innerText = `Level ${shopStats.chakraLevel}`;
  const chakraCost = shopStats.getCost('chakra');
  const btnChakra = document.getElementById('btnBuyChakra');
  btnChakra.innerText = `📜 ${chakraCost} Scrolls`;
  btnChakra.disabled = player.scrollCount < chakraCost;

  // Item 3: Damage
  document.getElementById('shopDamageLevel').innerText = `Level ${shopStats.damageLevel}`;
  const damageCost = shopStats.getCost('damage');
  const btnDamage = document.getElementById('btnBuyDamage');
  btnDamage.innerText = `📜 ${damageCost} Scrolls`;
  btnDamage.disabled = player.scrollCount < damageCost;

  // Item 4: Regen
  document.getElementById('shopRegenLevel').innerText = `Level ${shopStats.regenLevel}`;
  const regenCost = shopStats.getCost('regen');
  const btnRegen = document.getElementById('btnBuyRegen');
  btnRegen.innerText = `📜 ${regenCost} Scrolls`;
  btnRegen.disabled = player.scrollCount < regenCost;
}

// Bind shop buy events
document.getElementById('btnBuyHp').addEventListener('click', () => buyStat('hp'));
document.getElementById('btnBuyChakra').addEventListener('click', () => buyStat('chakra'));
document.getElementById('btnBuyDamage').addEventListener('click', () => buyStat('damage'));
document.getElementById('btnBuyRegen').addEventListener('click', () => buyStat('regen'));

function buyStat(stat) {
  const cost = shopStats.getCost(stat);
  if (player.scrollCount < cost) return;

  player.scrollCount -= cost;
  localStorage.setItem('ninja_scrolls', player.scrollCount);

  if (stat === 'hp') {
    shopStats.hpLevel++;
    player.maxHp = shopStats.getMaxHp();
    player.hp = player.maxHp; // Heal to full on buy
  } else if (stat === 'chakra') {
    shopStats.chakraLevel++;
    player.maxChakra = shopStats.getMaxChakra();
  } else if (stat === 'damage') {
    shopStats.damageLevel++;
  } else if (stat === 'regen') {
    shopStats.regenLevel++;
  }

  sfx.playVictory();
  openShop(); // refresh view
}

document.getElementById('btnNextWave').addEventListener('click', () => {
  sfx.playSelect();
  startWave(wave + 1);
});

// --- STATE SCENE TRANSITIONS ---

function triggerGameOver() {
  gameState = STATE_GAMEOVER;
  sfx.playDefeat();
  
  // Calculate score persistence
  if (player.score > personalHighScore) {
    personalHighScore = player.score;
    localStorage.setItem('ninja_highscore', personalHighScore);
  }

  // Populate panel stats
  document.getElementById('goWaves').innerText = wave - 1;
  document.getElementById('goKills').innerText = player.kills;
  document.getElementById('goScrolls').innerText = player.scrollCount;
  document.getElementById('goHighScore').innerText = personalHighScore;

  showScreen('gameOverScreen');
}

function triggerVictory() {
  gameState = STATE_VICTORY;
  sfx.playVictory();

  if (player.score > personalHighScore) {
    personalHighScore = player.score;
    localStorage.setItem('ninja_highscore', personalHighScore);
  }

  document.getElementById('vicWaves').innerText = wave;
  document.getElementById('vicKills').innerText = player.kills;
  document.getElementById('vicHighScore').innerText = personalHighScore;

  showScreen('victoryScreen');
}

// Main Menu bindings
document.getElementById('btnPlay').addEventListener('click', () => {
  sfx.init();
  sfx.playSelect();
  showScreen('charSelectScreen');
});

document.getElementById('btnHighScores').addEventListener('click', () => {
  sfx.init();
  sfx.playSelect();
  document.getElementById('highScoreValue').innerText = personalHighScore;
  showScreen('highScoreScreen');
});

document.getElementById('btnHowToPlay').addEventListener('click', () => {
  sfx.init();
  sfx.playSelect();
  showScreen('howToPlayScreen');
});

// Back buttons
document.getElementById('btnBackToMenu').addEventListener('click', () => {
  sfx.playSelect();
  showScreen('mainMenu');
});
document.getElementById('btnBackFromHowTo').addEventListener('click', () => {
  sfx.playSelect();
  showScreen('mainMenu');
});
document.getElementById('btnBackFromHighScores').addEventListener('click', () => {
  sfx.playSelect();
  showScreen('mainMenu');
});

// Retry / Reset binds
document.getElementById('btnRetry').addEventListener('click', restartGame);
document.getElementById('btnVictoryRetry').addEventListener('click', restartGame);

document.getElementById('btnExitToMenu').addEventListener('click', exitToMenu);
document.getElementById('btnVictoryExit').addEventListener('click', exitToMenu);

function restartGame() {
  sfx.playSelect();
  createPlayer(player.type);
  startWave(1);
}

function exitToMenu() {
  sfx.playSelect();
  showScreen('mainMenu');
  gameState = STATE_MENU;
}

// Character selection cards click
document.getElementById('cardNaruto').addEventListener('click', () => {
  sfx.init();
  sfx.playSelect();
  createPlayer('naruto');
  startWave(1);
});

document.getElementById('cardSasuke').addEventListener('click', () => {
  sfx.init();
  sfx.playSelect();
  createPlayer('sasuke');
  startWave(1);
});

// --- CHARACTER ANIMATION IN CARDS ---
// Tiny secondary preview canvas loop in selection screen
const nPreviewCanvas = document.getElementById('narutoPreviewCanvas');
const sPreviewCanvas = document.getElementById('sasukePreviewCanvas');

const previewState = {
  nCtx: nPreviewCanvas.getContext('2d'),
  sCtx: sPreviewCanvas.getContext('2d'),
  narutoDummy: { x: 65, y: 30, width: 45, height: 65, type: 'naruto', facing: 1, state: 'idle', grounded: true, trails: [], chakra: 100, maxChakra: 100 },
  sasukeDummy: { x: 65, y: 30, width: 45, height: 65, type: 'sasuke', facing: 1, state: 'idle', grounded: true, trails: [], chakra: 100, maxChakra: 100 }
};

function loopPreviews() {
  // Clean
  previewState.nCtx.clearRect(0, 0, 130, 130);
  previewState.sCtx.clearRect(0, 0, 130, 130);
  
  // Animate mini charge visual effect
  previewState.narutoDummy.state = (Math.sin(Date.now() * 0.003) > 0) ? 'charge' : 'idle';
  previewState.sasukeDummy.state = (Math.sin(Date.now() * 0.003 + Math.PI) > 0) ? 'charge' : 'idle';

  drawDummy(previewState.nCtx, previewState.narutoDummy);
  drawDummy(previewState.sCtx, previewState.sasukeDummy);

  requestAnimationFrame(loopPreviews);
}

function drawDummy(ctxNode, d) {
  ctxNode.save();
  // Center drawing bounds
  ctxNode.translate(d.x, d.y);
  ctxNode.scale(d.facing, 1);
  
  // Small ground shadow
  ctxNode.fillStyle = 'rgba(0,0,0,0.3)';
  ctxNode.beginPath();
  ctxNode.ellipse(0, d.height, 20, 4, 0, 0, Math.PI*2);
  ctxNode.fill();

  // Draw Aura if charging
  if (d.state === 'charge') {
    ctxNode.fillStyle = d.type === 'naruto' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(199, 125, 255, 0.2)';
    for (let i = 0; i < 6; i++) {
      const fh = 20 + Math.random()*25;
      const fx = (Math.random() - 0.5) * 25;
      ctxNode.beginPath();
      ctxNode.moveTo(fx - 10, d.height);
      ctxNode.quadraticCurveTo(fx, d.height - fh * 0.4, fx + (Math.random() - 0.5)*8, d.height - fh);
      ctxNode.quadraticCurveTo(fx + 10, d.height - fh * 0.4, fx + 10, d.height);
      ctxNode.closePath();
      ctxNode.fill();
    }
  }

  // Body
  ctxNode.fillStyle = d.type === 'naruto' ? '#ff8c00' : '#2d303f';
  ctxNode.beginPath();
  ctxNode.roundRect(-14, d.height - 52, 28, 32, [6, 6, 2, 2]);
  ctxNode.fill();

  // Head
  ctxNode.fillStyle = '#fce2c6';
  ctxNode.beginPath();
  ctxNode.arc(0, d.height - 61, 12, 0, Math.PI*2);
  ctxNode.fill();

  // Spikes
  ctxNode.fillStyle = d.type === 'naruto' ? '#ffd700' : '#0b0c16';
  ctxNode.beginPath();
  if (d.type === 'naruto') {
    ctxNode.moveTo(-12, d.height - 64);
    ctxNode.lineTo(-17, d.height - 74);
    ctxNode.lineTo(-8, d.height - 69);
    ctxNode.lineTo(-6, d.height - 79);
    ctxNode.lineTo(0, d.height - 70);
    ctxNode.lineTo(6, d.height - 79);
    ctxNode.lineTo(8, d.height - 69);
    ctxNode.lineTo(17, d.height - 74);
    ctxNode.lineTo(12, d.height - 64);
  } else {
    ctxNode.moveTo(-12, d.height - 63);
    ctxNode.lineTo(-18, d.height - 72);
    ctxNode.lineTo(-8, d.height - 70);
    ctxNode.lineTo(-10, d.height - 80);
    ctxNode.lineTo(-1, d.height - 74);
    ctxNode.lineTo(1, d.height - 83);
    ctxNode.lineTo(4, d.height - 73);
    ctxNode.lineTo(12, d.height - 77);
    ctxNode.lineTo(10, d.height - 68);
    ctxNode.lineTo(17, d.height - 63);
  }
  ctxNode.closePath();
  ctxNode.fill();

  // Headband
  ctxNode.fillStyle = d.type === 'naruto' ? '#2c3540' : '#222533';
  ctxNode.fillRect(-12, d.height - 67, 24, 5);

  ctxNode.restore();
}

loopPreviews();

// --- CORE GAME LOOP ---

function gameLoop() {
  // 1. Logic Update
  updateGame();

  // 2. Render Screen
  if (gameState === STATE_BATTLE) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Camera translate viewport
    ctx.save();
    ctx.translate(-camera.getX(), -camera.getY());

    // Draw world boundaries
    // Far layers
    drawParallaxBackground(ctx);

    // Draw Items
    drawScrolls(ctx);
    drawShurikens(ctx);

    // Enemies
    enemies.forEach(e => drawEnemy(ctx, e));

    // Player
    if (player) drawPlayer(ctx);

    // Particles
    drawParticles(ctx);

    ctx.restore();
  } else {
    // Menu background loop
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Slow float drift menu simulation
    const fakeScroll = Date.now() * 0.05;
    ctx.save();
    ctx.translate(-fakeScroll % WORLD_WIDTH, 0);
    drawParallaxBackground(ctx);
    ctx.restore();
  }

  requestAnimationFrame(gameLoop);
}

// Fire Loop
gameLoop();
