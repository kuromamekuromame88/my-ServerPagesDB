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
let clickCount = 0;

// ===== Pixi =====
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
message.alpha = 0;
app.stage.addChild(message);

// ===== 校章 =====
let logo;

// ===== 桜 =====
const petals = [];

// ===== メッセージ更新 =====
function updateMessage() {
  if (mode === STATE_INTRO) {
    message.text = `卒業まであと ${diffDays} 日`;
  } else {
    message.text = `思い出数：${clickCount}`;
  }

  message.x = app.renderer.width / 2;
  message.y = app.renderer.height * 0.7;
}

// ===== 桜生成 =====
function spawnPetal(x, strong = false) {
  const g = new PIXI.Graphics();
  g.beginFill(0xffb7c5);
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
      message.alpha = 1;
      updateMessage();
    } else {
      clickCount++;
      updateMessage();
      for (let i = 0; i < 6; i++) {
        spawnPetal(logo.x + (Math.random() - 0.5) * 120, true);
      }
    }
  });

  app.stage.addChild(logo);
  updateMessage();
}

// ===== アニメーション =====
app.ticker.add(() => {
  // フェードイン
  if (mode === STATE_INTRO && message.alpha < 1) {
    message.alpha += 0.01;
  }

  // 常時桜
  if (Math.random() < 0.05) {
    spawnPetal(Math.random() * app.renderer.width);
  }

  // 落下処理
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
  if (mode === STATE_INTRO) updateMessage();
}, 60000);

// ===== 起動 =====
init();
