// ------------------- Pixi.js ボード（無限キャンバス + グリッド + パン/ズーム + ピンチズーム） -------------------
    const boardUI = document.getElementById('boardUI');

    // Pixi アプリ
    const app = new PIXI.Application({
      resizeTo: boardUI,
      background: 0xf0f0f0,
      antialias: true,
      resolution: devicePixelRatio || 1,
      autoDensity: true
    });
    boardUI.appendChild(app.view);

    // world コンテナ
    const world = new PIXI.Container();
    app.stage.addChild(world);

    // ==========================
    // グリッドテクスチャ
    // ==========================
    function createGridTexture(cellSize = 40, minorColor = 'rgba(0,0,0,0.06)', majorEvery = 5, majorColor = 'rgba(0,0,0,0.12)') {
      const size = cellSize * majorEvery;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0,0,size,size);

      // minor lines
      ctx.strokeStyle = minorColor;
      ctx.lineWidth = 1;
      for (let x = 0; x <= size; x += cellSize) {
        ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, size); ctx.stroke();
      }
      for (let y = 0; y <= size; y += cellSize) {
        ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(size, y + 0.5); ctx.stroke();
      }

      // major lines
      ctx.strokeStyle = majorColor;
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= size; x += cellSize * majorEvery) {
        ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, size); ctx.stroke();
      }
      for (let y = 0; y <= size; y += cellSize * majorEvery) {
        ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(size, y + 0.5); ctx.stroke();
      }

      return PIXI.Texture.from(canvas);
    }

    const GRID_CELL = 40;
    const gridTexture = createGridTexture(GRID_CELL);

    const BIG = 20000;
    const gridSprite = new PIXI.TilingSprite(gridTexture, BIG, BIG);
    gridSprite.position.set(-BIG/2, -BIG/2);
    world.addChild(gridSprite);

    

    // 初期カメラ位置
    world.x = 750;
    world.y = 300;
    world.scale.set(1,1);

    // ==========================
    // パン（ドラッグ移動）
    // ==========================
    let dragging = false;
    let dragStart = {x:0,y:0};
    let worldStart = {x:0,y:0};
    let pinching = false;

    app.stage.interactive = true;

    app.stage.on('pointerdown', (ev) => {
      if (pinching) return;
      dragging = true;
      const p = ev.data.global;
      dragStart.x = p.x;
      dragStart.y = p.y;
      worldStart.x = world.x;
      worldStart.y = world.y;
      ev.data.originalEvent.preventDefault();
    });

    app.stage.on('pointerup', () => { dragging = false; });
    app.stage.on('pointerupoutside', () => { dragging = false; });

    app.stage.on('pointermove', (ev) => {
      if (dragging && !pinching) {
        const p = ev.data.global;
        const dx = p.x - dragStart.x;
        const dy = p.y - dragStart.y;
        world.x = worldStart.x + dx;
        world.y = worldStart.y + dy;
      }
    });

    // ==========================
    // ホイールズーム（マウス）
    // ==========================
    app.view.addEventListener('wheel', (e) => {
      e.preventDefault();

      // deltaY の大きさに応じてスムーズに変わるズーム量
      const zoomSpeed = 0.0015;  // ズーム感度（下げれば滑らかに）
      const delta = e.deltaY * zoomSpeed;

      // マウス位置を取得
      const mousePos = new PIXI.Point(e.offsetX, e.offsetY);

      // ズーム前のワールド座標
      const worldPosBefore = {
        x: (mousePos.x - world.x) / world.scale.x,
        y: (mousePos.y - world.y) / world.scale.y
      };

      // 新しいスケール
      let newScale = world.scale.x * (1 - delta);

      // クランプ（最大・最小制限）
      newScale = Math.max(0.2, Math.min(4, newScale));

      world.scale.set(newScale, newScale);

      // マウス位置を中心に拡大縮小
      world.x = mousePos.x - worldPosBefore.x * newScale;
      world.y = mousePos.y - worldPosBefore.y * newScale;
    }, { passive: false });


    // ==========================
    // ピンチズーム（2本指）
    // ==========================
    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let pinchStartCenter = {x:0,y:0};

    function touchDistance(e) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    function touchCenter(e) {
      return {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }

    app.view.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        pinching = true;
        dragging = false;

        pinchStartDist = touchDistance(e);
        pinchStartScale = world.scale.x;
        pinchStartCenter = touchCenter(e);
      }
    });

    app.view.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const newDist = touchDistance(e);
        let newScale = pinchStartScale * (newDist / pinchStartDist);
        newScale = Math.max(0.2, Math.min(4, newScale));

        const center = pinchStartCenter;
        const before = {
          x: (center.x - world.x) / world.scale.x,
          y: (center.y - world.y) / world.scale.y
        };

        world.scale.set(newScale);

        world.x = center.x - before.x * newScale;
        world.y = center.y - before.y * newScale;
      }
    });

    app.view.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        pinching = false;
      }
    });

    // ==========================
    // サンプルカード（ドラッグ可能）
    // ==========================
function createCard(x=0, y=0, text='card') {
  const g = new PIXI.Container();

  const rect = new PIXI.Graphics();
  rect.beginFill(0xffffff);
  rect.lineStyle(2, 0x999999);
  rect.drawRoundedRect(-100, -30, 200, 60, 8);
  rect.endFill();
  g.addChild(rect);

  const label = new PIXI.Text(text, {fontFamily:'Arial', fontSize:16, fill:0x111111});
  label.anchor.set(0.5);
  g.addChild(label);

  g.x = x; 
  g.y = y;

  g.interactive = true;
  g.cursor = "pointer";

  // ---------------------------
  // ★ テキスト編集処理
  // ---------------------------
  g.on("rightclick", () => {
    startEditText();
  });

  g.on("pointertap", (ev) => {
    if (ev.data.originalEvent.detail === 2) {
      startEditText();
    }
  });

  function startEditText() {
    // Pixi の座標 → 画面座標へ変換
    const pos = g.getGlobalPosition();
    const scale = world.scale.x;

    // input を作成
    const input = document.createElement("input");
    input.type = "text";
    input.value = label.text;

    // 位置とサイズをカードの表示に合わせる
    input.style.position = "absolute";
    input.style.left = (pos.x - 80 * scale) + "px";
    input.style.top = (pos.y - 15 * scale) + "px";
    input.style.width = (160 * scale) + "px";
    input.style.height = (30 * scale) + "px";
    input.style.fontSize = (16 * scale) + "px";
    input.style.padding = "4px";
    input.style.border = "1px solid #666";
    input.style.borderRadius = "6px";
    input.style.zIndex = 9999;

    document.body.appendChild(input);
    input.focus();
    input.select();

    // 編集確定
    const finish = () => {
      label.text = input.value;
      document.body.removeChild(input);
    };

    // Enter or blur
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finish();
    });
    input.addEventListener("blur", finish);
  }

  // ---------------------------
  // ★ カードドラッグ処理（ズレなし版）
  // ---------------------------
  let dragActive = false;
  let offsetX = 0;
  let offsetY = 0;
  let moveHandler = null;

  g.on("pointerdown", (ev) => {
    ev.stopPropagation();

    dragActive = true;

    const global = ev.data.global;
    offsetX = (global.x - world.x) / world.scale.x - g.x;
    offsetY = (global.y - world.y) / world.scale.y - g.y;

    moveHandler = (e) => {
      if (!dragActive) return;

      const worldX = (e.clientX - world.x) / world.scale.x;
      const worldY = (e.clientY - world.y) / world.scale.y;

      g.x = worldX - offsetX;
      g.y = worldY - offsetY - 60;
    };

    window.addEventListener("pointermove", moveHandler);
  });

  const endDrag = () => {
    dragActive = false;
    window.removeEventListener("pointermove", moveHandler);
  };

  g.on("pointerup", endDrag);
  g.on("pointerupoutside", endDrag);

  world.addChild(g);
  return g;
}
