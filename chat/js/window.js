const jsFrame = new JSFrame();//jsFrameオブジェクトを作る
const frames = [];

/* ===============================
   グローバル状態
================================ */
let isResizing = false;

function makeDraggable(el) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;

  el.style.position = 'absolute';
  el.style.touchAction = 'none';

  /* ===== ドラッグ開始 ===== */
  function dragStart(e, clientX, clientY) {
    // ★ リサイズ中はドラッグ無効
    if (isResizing) return;

    // ★ タイトル文字 span 以外を操作している時は無効
    if (!e.target.closest('span[id^="window_"][id$="_titleBarText"]')) return;

    isDragging = true;
    startX = clientX;
    startY = clientY;

    const rect = el.getBoundingClientRect();
    baseX = rect.left + window.scrollX;
    baseY = rect.top + window.scrollY;
  }

  /* ===== ドラッグ中 ===== */
  function dragMove(clientX, clientY) {
    if (!isDragging) return;

    const dx = clientX - startX;
    const dy = clientY - startY;

    el.style.left = baseX + dx + 'px';
    el.style.top  = baseY + dy + 'px';
  }

  /* ===== ドラッグ終了 ===== */
  function dragEnd() {
    isDragging = false;
  }

  /* ===== マウス ===== */
  el.addEventListener('mousedown', e => {
    e.preventDefault();
    dragStart(e, e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', e => {
    dragMove(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', dragEnd);

  /* ===== タッチ ===== */
  el.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    dragStart(e, t.clientX, t.clientY);
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    dragMove(t.clientX, t.clientY);
  }, { passive: false });

  document.addEventListener('touchend', dragEnd);
}

function WindowTouchEvent(){
  let spans = document.querySelectorAll(
    'span[id^="htmlElement_window_"]:not([id*="canvas"])'
  );

  if (!spans) return;

  spans.forEach(el => {
    makeDraggable(el);
  });
}

function createWindow(title, url, x, y, width, height){
  const frame = jsFrame.create({
    name: title,
    title: title,
    left: x || 360,
    top: y || 50,
    width: width || 320,
    height: height || 220,
    appearanceName: 'yosemite',
    style: {
      backgroundColor: 'rgb(255,255,255)',
      overflow: 'auto'
    },
    url: url
  }).show();

  frame.setControl({
    styleDisplay:'inline',
    maximizeButton: 'zoomButton',
    demaximizeButton: 'dezoomButton',
    minimizeButton: 'minimizeButton',
    deminimizeButton: 'deminimizeButton',
    hideButton: 'closeButton',
    animation: true,
    animationDuration: 150,
  });

  frame.control.on('hid', () => {
    frame.closeFrame();
  });

  /* ===== リサイズ監視（★追加）===== */
  frame.on('resizestart', () => {
    isResizing = true;
  });

  frame.on('resizeend', () => {
    isResizing = false;
  });

  frames.push(frame);
  WindowTouchEvent();
}

/* ===== 起動ボタン ===== */
document.getElementById("openYoutube").onclick = () => {
  createWindow("youtube-player",
    "https://tool-webs.onrender.com/youtube",
    50, 100, 1200, 450
  );
};

document.getElementById("openVoice").onclick = () => {
  createWindow("Voice",
    "https://tool-webs.onrender.com/voice",
    50, 100, 1200, 450
  );
};
