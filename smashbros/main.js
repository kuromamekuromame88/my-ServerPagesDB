const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0xffffff,
});
document.body.appendChild(app.view);

// ===== シーン管理 =====
class SceneManager {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
  }
  changeScene(newScene) {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene.container);
    }
    this.currentScene = newScene;
    this.app.stage.addChild(this.currentScene.container);
    this.currentScene.start();
  }
}

class Scene {
  constructor() {
    this.container = new PIXI.Container();
  }
  start() {}
  update(delta) {}
}

// ===== タイトルシーン =====
class TitleScene extends Scene {
  constructor(manager) {
    super();
    this.manager = manager;
    this.elapsed = 0;

    // タイトルテキスト
    this.titleText = new PIXI.Text("SmashBros Emulator", {
      align: "center",
      fontFamily: "Arial",
      fontSize: 64,
      fill: 0x000000,
      fontWeight: "bold",
      stroke: 0x000000
    });
    this.titleText.anchor.set(0.5);
    this.container.addChild(this.titleText);

    // 初期は透明
    this.titleText.alpha = 0;
  }

  start() {
    this.titleText.x = window.innerWidth / 2;
    this.titleText.y = window.innerHeight / 2;
    this.elapsed = 0;
  }

  update(delta) {
    this.elapsed += delta / 60; // 秒換算

    if (this.elapsed < 0.5) {
      // フェードイン（0〜0.5秒）
      this.titleText.alpha = this.elapsed / 0.5;
    } else if (this.elapsed < 1.0) {
      // 停止（0.5〜1秒）
      this.titleText.alpha = 1;
    } else if (this.elapsed < 1.5) {
      // フェードアウト（1〜1.5秒）
      this.titleText.alpha = 1 - (this.elapsed - 1.0) / 0.5;
    } else {
      // 1.5秒後にメニュー選択シーンへ
      this.manager.changeScene(new MenuScene(this.manager));
    }
  }

}

// ===== メニュー選択シーン =====
class MenuScene extends Scene {
  constructor(manager) {
    super();
    this.manager = manager;

    // 仮のボタンリスト
    this.buttons = [];

    // ボタンの情報を定義
    const menuItems = [
      { x:500, y:0, w:500, h:200, color: 0xff0000, label: "通常戦", onClick: () => this.manager.changeScene(new  CharacterSelectScene(this.manager)) },
      { x:500, y:200, w:500, h:200, color: 0x00ff00, label: "デモプレイ", onClick: () => alert("トレーニング") },
      { x:500, y:400, w:500, h:200, color: 0x0000ff, label: "設定", onClick: () => alert("設定へ") },
    ];

    // ボタン生成
    menuItems.forEach((item, index) => {
      const button = this.createButton(item.label, item.w, item.h, item.color);
      button.x = item.x;
      button.y = item.y;//200 + index * 100; // ← 縦方向の配置（後で調整可）
      button.interactive = true;
      button.buttonMode = true;
      button.on("pointertap", item.onClick);
      this.container.addChild(button);
      this.buttons.push(button);
    });
  }

  // ボタン生成関数
  createButton(label, w, h, color) {
    const container = new PIXI.Container();

    // === ボタンの背景 ===
    const bg = new PIXI.Graphics();
    bg.beginFill(color); // ← 背景色（後で調整可）
    bg.drawRoundedRect(0, 0, w, h, 10); // ← 幅・高さ・角丸半径（後で調整可）
    bg.endFill();
    container.addChild(bg);

    // === ボタンのテキスト ===
    const txt = new PIXI.Text(label, {
      fontFamily: "Arial",
      fontSize: 28,       // ← フォントサイズ（後で調整可）
      fill: 0x000000,     // ← 文字色（後で調整可）
      fontWeight: "bold", // ← 太字（好みに合わせて調整）
    });
    txt.anchor.set(0.5);
    txt.x = w/2; // ← ボタンの中央に配置（横幅の半分）
    txt.y = h/2;  // ← ボタンの高さの中央
    container.addChild(txt);

    return container;
  }

  start() {}
}


class CharacterSelectScene extends Scene {
  constructor(manager) {
    super();
    this.manager = manager;

    // グリッド設定
    this.cols = 4;
    this.rows = 2;
    this.cellSize = 200;

    // キャラデータ仮
    this.characters = [];
    for (let i = 0; i < this.cols * this.rows; i++) {
      this.characters.push({ name: `キャラ${i+1}` });
    }

    // グリッド描画
    this.grid = new PIXI.Container();
    this.container.addChild(this.grid);

    this.charBoxes = [];
    this.characters.forEach((ch, i) => {
      const x = i % this.cols;
      const y = Math.floor(i / this.cols);
      const box = this.createCharacterBox(
        x * this.cellSize + 50,
        y * this.cellSize + 50,
        ch.name
      );
      this.grid.addChild(box);
      this.charBoxes.push(box);
    });

    // バッジカーソル作成 (P1, P2, CP)
    this.badges = [
      this.createBadge("P1", 0xff0000),
      this.createBadge("P2", 0x0000ff),
      this.createBadge("CP", 0x00ff00),
    ];
    this.badges.forEach((b, i) => {
      b.x = 60 + i * 60;
      b.y = 20;
      this.container.addChild(b);
    });

    // 各バッジの位置を管理（どのグリッド上か）
    this.badgePositions = Array(this.badges.length).fill(null);

    // キー入力
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
  }

  // キャラ枠
  createCharacterBox(x, y, name) {
    const box = new PIXI.Graphics();
    box.lineStyle(2, 0x000000); // 黒枠
    box.beginFill(0xcccccc);
    box.drawRect(0, 0, this.cellSize, this.cellSize);
    box.endFill();
    box.x = x;
    box.y = y;

    const txt = new PIXI.Text(name, {
      fontFamily: "Arial",
      fontSize: 20,
      fill: 0x000000,
    });
    txt.anchor.set(0.5);
    txt.x = this.cellSize / 2;
    txt.y = this.cellSize - 20;
    box.addChild(txt);

    return box;
  }

  // バッジ生成
  createBadge(label, color) {
    const container = new PIXI.Container();

    const badge = new PIXI.Graphics();
    badge.beginFill(color);
    badge.drawCircle(0, 0, 20);
    badge.endFill();
    container.addChild(badge);

    const txt = new PIXI.Text(label, {
      fontFamily: "Arial",
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: "bold",
    });
    txt.anchor.set(0.5);
    container.addChild(txt);

    return container;
  }

  // キー操作（とりあえず P1 だけ操作）
  onKeyDown(e) {
    const badge = this.badges[0]; // P1だけ
    if (!badge) return;

    if (e.key === "ArrowRight") badge.x += this.cellSize;
    if (e.key === "ArrowLeft") badge.x -= this.cellSize;
    if (e.key === "ArrowDown") badge.y += this.cellSize;
    if (e.key === "ArrowUp") badge.y -= this.cellSize;
  }
}




// ===== 実行 =====
const manager = new SceneManager(app);
manager.changeScene(new TitleScene(manager));

// 毎フレーム更新
app.ticker.add((delta) => {
  if (manager.currentScene) {
    manager.currentScene.update(delta);
  }
});
