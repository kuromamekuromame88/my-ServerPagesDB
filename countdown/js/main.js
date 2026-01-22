const containerDiv = document.getElementById("container");

// ===== 卒業日 =====
const graduationDate = new Date('2026-03-17T00:00:00');

// ===== 思い出写真 =====
const photoStages = [
  { count: 50, url: "https://tool-webs.onrender.com/countdown/img/50.png" }
  /*{ count: 30, url: "https://example.com/photo2.jpg" },
  { count: 60, url: "https://example.com/photo3.jpg" },*/
];

let currentPhotoIndex = -1;

// ===== 日数計算 =====
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

// ===== Pixi 初期化 =====
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x95c0ec,
});
containerDiv.appendChild(app.view);

// ===== 背景写真 =====
const backgroundSprite = new PIXI.Sprite();
backgroundSprite.alpha = 0;
app.stage.addChild(backgroundSprite);

// ===== 雲レイヤー =====
const clouds = [];

function createCloud() {
  const cloud = new PIXI.Graphics();
  cloud.beginFill(0xffffff, 0.8);
  cloud.drawEllipse(0, 0, 60, 30);
  cloud.drawEllipse(40, -10, 50, 25);
  cloud.drawEllipse(-40, -10, 50, 25);
  cloud.endFill();

  cloud.x = -100;
  cloud.y = Math.random() * app.screen.height * 0.4;
  cloud.speed = 0.2 + Math.random() * 0.4;
  cloud.scale.set(0.5 + Math.random() * 0.7);

  app.stage.addChild(cloud);
  clouds.push(cloud);
}

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
  align: "center",
  dropShadow: true,
  dropShadowBlur: 4,
});

const countdown = new PIXI.Text("", textStyle);
countdown.anchor.set(0.5);
countdown.alpha = 0;
app.stage.addChild(countdown);

// ===== 更新 =====
function updateText() {
  countdown.text =
    diffDays <= 0
      ? `🎓 ついに卒業！\n思い出数：${clickCount}`
      : `卒業まであと ${diffDays} 日\n思い出数：${clickCount}`;

  countdown.x = app.screen.width / 2;
  countdown.y = app.screen.height * 0.75;
}

// ===== 背景切替 =====
async function updateBackground() {
  for (let i = photoStages.length - 1; i >= 0; i--) {
    if (clickCount >= photoStages[i].count && i !== currentPhotoIndex) {
      const tex = await PIXI.Assets.load(photoStages[i].url);
      backgroundSprite.texture = tex;
      backgroundSprite.width = app.screen.width;
      backgroundSprite.height = app.screen.height;
      backgroundSprite.alpha = 0;

      app.ticker.add(function fade() {
        backgroundSprite.alpha += 0.02;
        if (backgroundSprite.alpha >= 1) {
          app.ticker.remove(fade);
        }
      });

      currentPhotoIndex = i;
      break;
    }
  }
}

// ===== アニメーションループ =====
app.ticker.add(() => {
  // 雲
  if (clouds.length < 6 && Math.random() < 0.01) createCloud();
  clouds.forEach((c, i) => {
    c.x += c.speed;
    if (c.x > app.screen.width + 150) {
      app.stage.removeChild(c);
      clouds.splice(i, 1);
    }
  });

  // 桜
  if (petals.length < 50) createPetal();
  petals.forEach((p, i) => {
    p.y += p.speed;
    p.rotation += p.rotationSpeed;
    if (p.y > app.screen.height + 10) {
      app.stage.removeChild(p);
      petals.splice(i, 1);
    }
  });
});

// ===== 初期化 =====
async function init() {
  const tex = await PIXI.Assets.load(
    "https://tool-webs.onrender.com/countdown/img/schoolLogo.png"
  );

  const logo = new PIXI.Sprite(tex);
  logo.anchor.set(0.5);
  logo.x = app.screen.width / 2;
  logo.y = app.screen.height * 0.4;
  logo.scale.set(0.2);
  logo.interactive = true;
  logo.buttonMode = true;

  logo.on("pointerdown", () => {
    if (!gameStarted) {
      gameStarted = true;
      return;
    }
    clickCount++;
    updateText();
    updateBackground();
  });

  app.stage.addChild(logo);

  // テキストフェードイン
  app.ticker.add(function fadeIn() {
    countdown.alpha += 0.02;
    if (countdown.alpha >= 1) app.ticker.remove(fadeIn);
  });

  updateText();
}

// ===== 起動 =====
init();

// ===== 日数更新 =====
setInterval(() => {
  diffDays = getDiffDays();
  updateText();
}, 60000);
