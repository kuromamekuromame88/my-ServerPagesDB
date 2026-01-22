const containerDiv = document.getElementById("container");

// ===== 状態定義 =====
const STATE_COUNTDOWN = 0;
const STATE_TRANSITION = 1;
const STATE_CLICKER = 2;

let mode = STATE_COUNTDOWN;

// ===== 卒業日設定 =====
const graduationDate = new Date('2026-03-17T00:00:00');

function getDiffDays() {
  const today = new Date();
  const diffTime = graduationDate - today;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

let diffDays = getDiffDays();
let clickCount = 0;

// ===== Pixi.js 初期化 =====
const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x95c0ec,
});

containerDiv.appendChild(app.view);

// ===== テキスト =====
const style = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fill: 'white',
  align: 'center',
});

const message = new PIXI.Text('', style);
message.anchor.set(0.5);
app.stage.addChild(message);

// ===== 隠しボタン（透明） =====
const secretButton = new PIXI.Graphics();
secretButton.beginFill(0xffffff, 0.001); // ほぼ透明
secretButton.drawRect(-100, -50, 200, 100);
secretButton.endFill();
secretButton.anchor?.set?.(0.5);
secretButton.x = app.renderer.width / 2;
secretButton.y = app.renderer.height * 0.85;
secretButton.interactive = true;
secretButton.buttonMode = true;
app.stage.addChild(secretButton);

// ===== 校章スプライト =====
let logo;

// ===== 桜の花びら管理 =====
const petals = [];

// ===== メッセージ更新 =====
function updateMessage() {
  message.text = `卒業まであと ${diffDays} 日`;
  message.x = app.renderer.width / 2;
  message.y = app.renderer.height / 2;
}

// ===== 桜生成 =====
function spawnPetal(x) {
  const g = new PIXI.Graphics();
  g.beginFill(0xffb7c5);
  g.drawEllipse(0, 0, 8, 4);
  g.endFill();

  g.x = x;
  g.y = -10;
  g.vy = 1 + Math.random() * 2;
  g.vx = (Math.random() - 0.5) * 0.5;
  g.rotationSpeed = (Math.random() - 0.5) * 0.02;

  app.stage.addChild(g);
  petals.push(g);
}

// ===== 初期化 =====
async function init() {
  updateMessage();

  const texture = await PIXI.Assets.load(
    'https://tool-webs.onrender.com/countdown/img/schoolLogo.png'
  );

  logo = new PIXI.Sprite(texture);
  logo.anchor.set(0.5);
  logo.x = app.renderer.width / 2;
  logo.y = app.renderer.height * 0.4;
  logo.scale.set(0.2);
  logo.visible = false;

  logo.interactive = true;
  logo.buttonMode = true;

  logo.on('pointerdown', () => {
    if (mode !== STATE_CLICKER) return;

    clickCount++;
    for (let i = 0; i < 5; i++) {
      spawnPetal(logo.x + (Math.random() - 0.5) * 200);
    }
  });

  app.stage.addChild(logo);
}

// ===== 隠しボタン動作 =====
secretButton.on('pointerdown', () => {
  if (mode !== STATE_COUNTDOWN) return;
  mode = STATE_TRANSITION;
});

// ===== アニメーションループ =====
app.ticker.add(() => {
  // フェードアウト
  if (mode === STATE_TRANSITION) {
    message.alpha -= 0.03;
    if (message.alpha <= 0) {
      message.visible = false;
      logo.visible = true;
      mode = STATE_CLICKER;
    }
  }

  // 桜の落下処理
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
});

// ===== 日数更新 =====
setInterval(() => {
  diffDays = getDiffDays();
  if (mode === STATE_COUNTDOWN) updateMessage();
}, 60000);

// ===== 起動 =====
init();
