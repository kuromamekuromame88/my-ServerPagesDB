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

  // ★ 必ず画面上部から
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

// ===== 衝突判定 =====
function intersects(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

// ===== 位置探索 =====
function findPosition(w, h, strict = true) {
  for (let i = 0; i < 100; i++) {
    const rect = {
      x: Math.random() * (app.screen.width - w),
      y: Math.random() * (app.screen.height * 0.55),
      w, h,
    };

    const avoid = strict
      ? [...logoRects, ...photoRects]
      : logoRects;

    if (!avoid.some(r => intersects(r, rect))) {
      return rect;
    }
  }
  return null;
}

// ===== フォトフレーム =====
function createPhotoFrame(texture) {
  const maxW = app.screen.width * 0.35;
  const maxH = app.screen.height * 0.35;
  const scale = Math.min(maxW / texture.width, maxH / texture.height, 1);

  const photo = new PIXI.Sprite(texture);
  photo.anchor.set(0.5);
  photo.scale.set(scale);

  const w = photo.width;
  const h = photo.height;

  let pos = findPosition(w, h, true);
  if (!pos) pos = findPosition(w, h, false);
  if (!pos) {
    pos = {
      x: app.screen.width / 2 - w / 2,
      y: app.screen.height * 0.2,
      w, h,
    };
  }

  const frame = new PIXI.Container();
  frame.x = pos.x + w / 2;
  frame.y = pos.y + h / 2;
  frame.alpha = 0;
  frame.rotation = (Math.random() - 0.5) * 0.1;

  const border = new PIXI.Graphics();
  border.lineStyle(6, 0xffffff);
  border.drawRect(-w / 2, -h / 2, w, h);

  frame.addChild(border, photo);
  photoLayer.addChild(frame);
  photoRects.push(pos);

  app.ticker.add(function fade() {
    frame.alpha += 0.03;
    if (frame.alpha >= 1) app.ticker.remove(fade);
  });
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

// ===== 風操作 =====
app.stage.eventMode = "static";

app.stage.on("pointerdown", (e) => {
  if (!logoRects.some(r =>
    e.global.x >= r.x &&
    e.global.x <= r.x + r.w &&
    e.global.y >= r.y &&
    e.global.y <= r.y + r.h
  )) {
    windActive = true;
    windX = e.global.x;
    windY = e.global.y;
  }
});

app.stage.on("pointermove", (e) => {
  if (windActive) {
    windX = e.global.x;
    windY = e.global.y;
  }
});

app.stage.on("pointerup", () => {
  windActive = false;
});

// ===== ループ =====
app.ticker.add(() => {
  while (petals.length < targetPetalCount) createPetal();

  petals.forEach(p => {
    if (windActive) {
      const dx = p.x - windX;
      const dy = p.y - windY;
      const dist = Math.hypot(dx, dy);
      if (dist < WIND_RADIUS && dist > 0.1) {
        p.vx += (dx / dist) * WIND_POWER;
        p.vy += (dy / dist) * WIND_POWER;
      }
    }

    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;

    const MARGIN = 20;
    if (
      p.x < -MARGIN ||
      p.x > app.screen.width + MARGIN ||
      p.y < -MARGIN ||
      p.y > app.screen.height + MARGIN
    ) {
      p.x = Math.random() * app.screen.width;
      p.y = -10;
      p.vx = (Math.random() - 0.5) * 0.4;
      p.vy = 0.5 + Math.random() * 1.5;
    }
  });
});


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

  logoRects.push({
    x: logo.x - logo.width / 2,
    y: logo.y - logo.height / 2,
    w: logo.width,
    h: logo.height,
  });

  logo.on("pointerdown", () => {
    if (!gameStarted) {
      gameStarted = true;
      return;
    }
    clickCount++;
    targetPetalCount = clickCount;
    updateText();
    updatePhotos();
  });

  uiLayer.addChild(logo);
  updateText();
}

init();
