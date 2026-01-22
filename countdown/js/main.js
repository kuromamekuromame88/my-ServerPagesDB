const containerDiv = document.getElementById("container");

// ===== 状態 =====
const STATE_INTRO = 0;
const STATE_CLICKER = 1;

let mode = STATE_INTRO;

// ===== 卒業日 =====
const graduationDate = new Date('2026-03-17T00:00:00');

function getDiffDays() {
  const today = new Date();
  const diffTime = graduationDate - today;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

let diffDays = getDiffDays();

// ===== クリッカー関連 =====
let clickCount = 0;
let autoPower = 0; // 自動増加量（/秒）

// ===== Pixi =====
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x95c0ec,
});
containerDiv.appendChild(app.view);

// ===== テキスト =====
const mainStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fill: 'white',
  align: 'center',
});

const subStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 22,
  fill: 'white',
  align: 'center',
});

// 残り日数（常時）
const daysText = new PIXI.Text('', mainStyle);
daysText.anchor.set(0.5);
app.stage.addChild(daysText);

// 思い出数
const scoreText = new PIXI.Text('', subStyle);
scoreText.anchor.set(0.5);
app.stage.addChild(scoreText);

// ===== 校章 =====
let logo;

// ===== 桜 =====
const petals = [];

// ===== テキスト更新 =====
function updateTexts() {
  daysText.text = `卒業まであと ${diffDays} 日`;
  daysText.x = app.renderer.width / 2;
  daysText.y = app.renderer.height * 0.15;

  scoreText.text =
    `思い出数：${Math.floor(clickCount)}\n` +
    `自動増加：${autoPower}/秒`;

  scoreText.x = app.renderer.width / 2;
  scoreText.y = app.renderer.height * 0.75;
}

// ===== 桜生成 =====
function spawnPetal(x, strong = false) {
  const g = new PIXI.Graphics();
  g.beginFill(0xffa2b5);
  g.drawEllipse(0, 0, 8, 4);
  g.endFill();

  g.x = x;
  g.y = -10;
  g.vy = (strong ? 2.5 : 1) + Math.random() * 2;
  g.vx = (Math.random() - 0.5) * 0.6;
  g.rotationSpeed = (Math.random() - 0.5) * 0.03;

  app.stage.addChild(g);
  petals.push(g);
}

// ===== 初期化 =====
async function init() {
  const texture = await PIXI.Assets.load(
    'https://tool-webs.onrender.com/countdown/img/schoolLogo.png'
  );

  logo = new PIXI.Sprite(texture);
  logo.anchor.set(0.5);
  logo.scale.set(0.2);
  logo.x = app.renderer.width / 2;
  logo.y = app.renderer.height * 0.4;
  logo.interactive = true;
  logo.buttonMode = true;

  logo.on('pointerdown', () => {
    if (mode === STATE_INTRO) {
      mode = STATE_CLICKER;
    } else {
      clickCount++;

      // 一定数で自動増加解放
      if (clickCount === 20) autoPower = 1;
      if (clickCount === 100) autoPower = 3;
      if (clickCount === 300) autoPower = 6;

      for (let i = 0; i < 6; i++) {
        spawnPetal(
          logo.x + (Math.random() - 0.5) * app.renderer.width,
          true
        );
      }
    }
    updateTexts();
  });

  app.stage.addChild(logo);
  updateTexts();
}

// ===== アニメーション =====
app.ticker.add((delta) => {
  // 常時桜
  if (Math.random() < 0.05) {
    spawnPetal(Math.random() * app.renderer.width);
  }

  // 自動増加（クリッカー中のみ）
  if (mode === STATE_CLICKER && autoPower > 0) {
    clickCount += autoPower * (delta / 60);
  }

  // 桜落下
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    p.y += p.vy;
    p.x += p.vx;
    p.rotation += p.rotationSpeed;

    if (p.y > app.renderer.height + 20) {
      app.stage.removeChild(p);
      petals.splice(i, 1);
    }
  }

  updateTexts();
});

// ===== 日数更新 =====
setInterval(() => {
  diffDays = getDiffDays();
  updateTexts();
}, 60000);

// ===== 起動 =====
init();
