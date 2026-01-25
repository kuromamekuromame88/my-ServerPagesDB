const containerDiv = document.getElementById("container");

// ===== 卒業日 =====
const graduationDate = new Date('2026-03-17T00:00:00');

// ===== デフォルト背景 =====
const DEFAULT_BACKGROUND_URL =
  "https://tool-webs.onrender.com/countdown/img/background.webp";

// ===== 写真ステージ =====
const photoStages = [
  {
    count: 10,
    url: "https://tool-webs.onrender.com/countdown/img/10.jpg",
    mode: "frame",
  },
  {
    count : 20,
    url: "https://tool-webs.onrender.com/countdown/img/20.jpg",
    mode: "frame",
  },
  {
    count: 40,
    url: "https://tool-webs.onrender.com/countdown/img/40.jpg",
    mode: "frame",
  },
  {
    count: 80,
    url: "https://tool-webs.onrender.com/countdown/img/80.jpg",
    mode: "frame",
  },
  {
    count: 160,
    url: "https://tool-webs.onrender.com/countdown/img/160.jpg",
    mode: "frame",
  }
  {
    count: 320,
    url: "https://tool-webs.onrender.com/countdown/img/320.jpg",
    mode: "frame",
  },
  {
    count: 640,
    url: "https://tool-webs.onrender.com/countdown/img/640.jpg",
    mode: "frame",
  },
  //mode: background
];

let currentPhotoIndex = -1;

// ===== 日数 =====
function getDiffDays() {
  const today = new Date();
  return Math.max(
    0,
    Math.ceil((graduationDate - today) / (1000 * 60 * 60 * 24))
  );
}

let diffDays = getDiffDays();
let clickCount = 0;
let gameStarted = false;

// ===== Pixi =====
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x95c0ec,
});
containerDiv.appendChild(app.view);

// ===== 背景 =====
const backgroundSprite = new PIXI.Sprite();
backgroundSprite.anchor.set(0.5);
backgroundSprite.alpha = 0;
app.stage.addChild(backgroundSprite);

// ===== フォトフレームレイヤ =====
const photoLayer = new PIXI.Container();
app.stage.addChild(photoLayer);

// ===== 桜 =====
const petals = [];
function createPetal() {
  const p = new PIXI.Graphics();
  p.beginFill(0xffc0cb);
  p.drawEllipse(0, 0, 6, 4);
  p.endFill();

  p.x = Math.random() * app.screen.width;
  p.y = -10;
  p.speed = 1 + Math.random() * 2;
  p.rotationSpeed = (Math.random() - 0.5) * 0.05;

  app.stage.addChild(p);
  petals.push(p);
}

// ===== テキスト =====
const textStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 36,
  fill: "white",
  dropShadow: true,
  dropShadowBlur: 4,
});

const countdown = new PIXI.Text("", textStyle);
countdown.anchor.set(0.5);
countdown.alpha = 0;
app.stage.addChild(countdown);

function updateText() {
  countdown.text =
    diffDays <= 0
      ? `🎓 ついに卒業！\n思い出数：${clickCount}`
      : `卒業まであと ${diffDays} 日\n思い出カウンター: ${clickCount}`;

  countdown.x = app.screen.width / 2;
  countdown.y = app.screen.height * 0.75;
}

// ===== フォトフレーム =====
function createPhotoFrame(texture) {
  const frame = new PIXI.Container();

  const maxW = app.screen.width * 0.35;
  const maxH = app.screen.height * 0.35;

  const scale = Math.min(
    maxW / texture.width,
    maxH / texture.height,
    1
  );

  const photo = new PIXI.Sprite(texture);
  photo.anchor.set(0.5);
  photo.scale.set(scale);

  const border = new PIXI.Graphics();
  border.lineStyle(6, 0xffffff);
  border.drawRect(
    -photo.width / 2,
    -photo.height / 2,
    photo.width,
    photo.height
  );

  frame.addChild(border);
  frame.addChild(photo);

  frame.x =
    Math.random() * (app.screen.width - photo.width) + photo.width / 2;
  frame.y =
    Math.random() * (app.screen.height * 0.5) + photo.height / 2;
  frame.rotation = (Math.random() - 0.5) * 0.1;
  frame.alpha = 0;

  photoLayer.addChild(frame);

  app.ticker.add(function fade() {
    frame.alpha += 0.02;
    if (frame.alpha >= 1) app.ticker.remove(fade);
  });
}

// ===== 背景設定（cover） =====
function setBackground(texture) {
  const scale = Math.max(
    app.screen.width / texture.width,
    app.screen.height / texture.height
  );

  backgroundSprite.texture = texture;
  backgroundSprite.scale.set(scale);
  backgroundSprite.x = app.screen.width / 2;
  backgroundSprite.y = app.screen.height / 2;

  backgroundSprite.alpha = 0;
  app.ticker.add(function fade() {
    backgroundSprite.alpha += 0.02;
    if (backgroundSprite.alpha >= 1) app.ticker.remove(fade);
  });
}

// ===== 写真更新 =====
async function updatePhotos() {
  for (let i = photoStages.length - 1; i >= 0; i--) {
    if (clickCount >= photoStages[i].count && i !== currentPhotoIndex) {
      const tex = await PIXI.Assets.load(photoStages[i].url);

      if (photoStages[i].mode === "background") {
        setBackground(tex);
      } else {
        createPhotoFrame(tex);
      }

      currentPhotoIndex = i;
      break;
    }
  }
}

// ===== ループ =====
app.ticker.add(() => {
  if (petals.length < 50) createPetal();

  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    p.y += p.speed;
    p.rotation += p.rotationSpeed;

    if (p.y > app.screen.height + 20) {
      app.stage.removeChild(p);
      petals.splice(i, 1);
    }
  }
});

// ===== 初期化 =====
async function init() {
  // デフォルト背景
  const bgTex = await PIXI.Assets.load(DEFAULT_BACKGROUND_URL);
  setBackground(bgTex);

  // 校章
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
    updateText();
    updatePhotos();
    createPetal();
  });

  app.stage.addChild(logo);

  app.ticker.add(function fade() {
    countdown.alpha += 0.02;
    if (countdown.alpha >= 1) app.ticker.remove(fade);
  });

  updateText();
}

init();

// ===== 日数更新 =====
setInterval(() => {
  diffDays = getDiffDays();
  updateText();
}, 60000);
