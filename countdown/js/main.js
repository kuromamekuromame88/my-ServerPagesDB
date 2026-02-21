const containerDiv = document.getElementById("container");

// ===== 卒業日 =====
const graduationDate = new Date("2026-03-17T00:00:00");

// ===== 表示済み管理 =====
const shownPhotoCounts = new Set();
const logoRects = [];
const photoRects = [];

// ===== 背景 =====
const DEFAULT_BACKGROUND_URL =
  "https://tool-webs.onrender.com/countdown/img/background.jpg";

// ===== 写真ステージ =====
const photoStages = [
  { count: 10, url: "https://tool-webs.onrender.com/countdown/img/10.jpg" },
  { count: 20, url: "https://tool-webs.onrender.com/countdown/img/20.jpg" },
  { count: 40, url: "https://tool-webs.onrender.com/countdown/img/40.jpg" },
  { count: 80, url: "https://tool-webs.onrender.com/countdown/img/80.jpg" },
  { count: 160, url: "https://tool-webs.onrender.com/countdown/img/160.jpg" },
  { count: 320, url: "https://tool-webs.onrender.com/countdown/img/320.jpg" },
  { count: 640, url: "https://tool-webs.onrender.com/countdown/img/640.jpg" },
  { count: 1280, url: "https://tool-webs.onrender.com/countdown/img/1280.jpg" },
  { count: 2560, url: "https://tool-webs.onrender.com/countdown/img/2560.jpg" },
];

const musics = [
  { count: 3090, url: "https://tool-webs.onrender.com/music/3月9日.mp3" }
];

// ===== 日数 =====
function getDiffDays() {
  return Math.max(
    0,
    Math.ceil((graduationDate - new Date()) / 86400000)
  );
}

let diffDays = getDiffDays();
let clickCount = 0;
let targetPetalCount = 0;
let gameStarted = false;

// ===== 音声管理 =====
let currentAudio = null;
const playedMusicCounts = new Set();

async function playAudioIfNeeded() {
  for (const music of musics) {
    if (clickCount >= music.count && !playedMusicCounts.has(music.count)) {

      playedMusicCounts.add(music.count);

      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      currentAudio = new Audio(music.url);

      try {
        await currentAudio.play();
      } catch (e) {
        console.warn("音声再生に失敗:", e);
      }
    }
  }
}

// ===== 風 =====
let windActive = false;
let windX = 0;
let windY = 0;
const WIND_RADIUS = 130;
const WIND_POWER = 0.45;

// ===== Pixi =====
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x95c0ec,
});
containerDiv.appendChild(app.view);
app.stage.sortableChildren = true;

// ===== レイヤ =====
const bgLayer = new PIXI.Container();
const petalLayer = new PIXI.Container();
const photoLayer = new PIXI.Container();
const uiLayer = new PIXI.Container();

bgLayer.zIndex = 0;
petalLayer.zIndex = 5;
photoLayer.zIndex = 10;
uiLayer.zIndex = 20;

app.stage.addChild(bgLayer, petalLayer, photoLayer, uiLayer);

// ===== 背景 =====
const backgroundSprite = new PIXI.Sprite();
backgroundSprite.anchor.set(0.5);
bgLayer.addChild(backgroundSprite);

// ===== 桜 =====
const petals = [];

function createPetal() {
  const p = new PIXI.Graphics();
  p.beginFill(0xffc0cb);
  p.drawEllipse(0, 0, 6, 4);
  p.endFill();

  p.x = Math.random() * app.screen.width;
  p.y = -10;

  p.vx = (Math.random() - 0.5) * 0.4;
  p.vy = 0.5 + Math.random() * 1.5;
  p.rotationSpeed = (Math.random() - 0.5) * 0.03;

  p.eventMode = "none";

  petalLayer.addChild(p);
  petals.push(p);
}

// ===== テキスト =====
const countdown = new PIXI.Text("", {
  fontSize: 36,
  fill: "white",
  dropShadow: true,
});
countdown.anchor.set(0.5);
uiLayer.addChild(countdown);

function updateText() {
  countdown.text =
    diffDays <= 0
      ? `🎓 卒業！\n思い出数：${clickCount}`
      : `卒業まであと ${diffDays} 日\n思い出数：${clickCount}`;

  countdown.x = app.screen.width / 2;
  countdown.y = app.screen.height * 0.8;
}

// ===== 写真更新 =====
async function updatePhotos() {
  for (const stage of photoStages) {
    if (clickCount < stage.count) continue;
    if (shownPhotoCounts.has(stage.count)) continue;

    shownPhotoCounts.add(stage.count);
    const tex = await PIXI.Assets.load(stage.url);
    createPhotoFrame(tex);
  }
}

// ===== 初期化 =====
async function init() {
  const bgTex = await PIXI.Assets.load(DEFAULT_BACKGROUND_URL);
  backgroundSprite.texture = bgTex;
  backgroundSprite.scale.set(
    Math.max(
      app.screen.width / bgTex.width,
      app.screen.height / bgTex.height
    )
  );
  backgroundSprite.x = app.screen.width / 2;
  backgroundSprite.y = app.screen.height / 2;

  const logoTex = await PIXI.Assets.load(
    "https://tool-webs.onrender.com/countdown/img/schoolLogo2.png"
  );
  const logo = new PIXI.Sprite(logoTex);
  logo.anchor.set(0.5);
  logo.scale.set(0.4);
  logo.x = app.screen.width / 2;
  logo.y = app.screen.height * 0.4;
  logo.interactive = true;
  logo.buttonMode = true;

  logo.on("pointerdown", () => {
    if (!gameStarted) {
      gameStarted = true;
      return;
    }

    clickCount++;
    targetPetalCount = clickCount;

    updateText();
    updatePhotos();
    playAudioIfNeeded();   // ← ここで再生判定
  });

  uiLayer.addChild(logo);
  updateText();
}

init();