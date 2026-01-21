const containerDiv = document.getElementById("container");

// ===== 卒業日設定 =====
const graduationDate = new Date('2026-03-17T00:00:00');

// 日数計算関数
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

// ===== テキストスタイル =====
const style = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fill: 'white',
  align: 'center',
});

// ===== 表示テキスト =====
const countdown = new PIXI.Text('', style);
countdown.anchor.set(0.5);
app.stage.addChild(countdown);

// ===== 表示更新関数 =====
function updateText() {
  if (diffDays <= 0) {
    countdown.text = `🎓 ついに卒業！\n思い出数：${clickCount}`;
  } else {
    countdown.text =
      `卒業まであと ${diffDays} 日\n` +
      `思い出を集めよう\n` +
      `思い出数：${clickCount}`;
  }
  countdown.x = app.renderer.width / 2;
  countdown.y = app.renderer.height / 2;
}

// ===== クリック処理 =====
countdown.interactive = true;
countdown.buttonMode = true;

countdown.on('pointerdown', () => {
  clickCount++;
  updateText();
});

// ===== リサイズ対応 =====
window.addEventListener('resize', updateText);

// ===== 初期表示 =====
updateText();

// ===== 1分ごとに日数だけ更新（軽量） =====
setInterval(() => {
  diffDays = getDiffDays();
  updateText();
}, 60000);
