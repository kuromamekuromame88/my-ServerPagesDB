/* ===============================
   基本設定
================================ */
const TILE_SIZE = 16;
const CHUNK_SIZE = 16;
const ERA_HEIGHT = 150;

const metaUI = document.getElementById("metacanvas");
const canvas = document.getElementById("metaCanvasElement");

/* ===============================
   Pixi.js 初期化
================================ */
const app = new PIXI.Application({
  view: canvas,
  width: canvas.width,
  height: canvas.height,
  backgroundColor: 0x000000,
});

const world = new PIXI.Container();
app.stage.addChild(world);

/* ===============================
   カメラ
================================ */
const camera = {
  x: 0,
  y: 0,
  speed: 5,
};

/* ===============================
   タイル定義
================================ */
const TILE = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WATER: 4,
  SAND: 5,
  ORE: 6,
};

const TILE_COLOR = {
  1: 0x55aa33,
  2: 0x8b5a2b,
  3: 0x888888,
  4: 0x3366ff,
  5: 0xdddd88,
  6: 0xffcc00,
};

/* ===============================
   ノイズ関数（軽量）
================================ */
function hash(x, y) {
  return Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;
}

function noise(x, y) {
  return hash(Math.floor(x), Math.floor(y));
}

/* ===============================
   時代・バイオーム
================================ */
function getEra(y) {
  return Math.floor(y / ERA_HEIGHT);
}

function getBiome(x, era) {
  const n = noise(x * 0.1, era * 10);
  if (n < 0.3) return "forest";
  if (n < 0.5) return "rock";
  if (n < 0.7) return "water";
  return "plain";
}

/* ===============================
   タイル生成
================================ */
function generateTile(x, y) {
  const era = getEra(y);
  const biome = getBiome(x, era);

  // 宇宙層
  if (era >= 4) return TILE.AIR;

  const surface =
    era * ERA_HEIGHT +
    Math.floor(noise(x * 0.05, era) * 10);

  if (y > surface) return TILE.AIR;

  if (y === surface) {
    if (biome === "forest" || biome === "plain") return TILE.GRASS;
    if (biome === "rock") return TILE.STONE;
    if (biome === "water") return TILE.SAND;
  }

  if (y > surface - 3) return TILE.DIRT;

  if (noise(x * 0.2, y * 0.2) > 0.97) return TILE.ORE;

  return TILE.STONE;
}

/* ===============================
   チャンク管理
================================ */
const chunkMap = new Map();

function chunkKey(cx, cy) {
  return `${cx},${cy}`;
}

function generateChunk(cx, cy) {
  const container = new PIXI.Container();
  container.x = cx * CHUNK_SIZE * TILE_SIZE;
  container.y = cy * CHUNK_SIZE * TILE_SIZE;

  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      const x = cx * CHUNK_SIZE + lx;
      const y = cy * CHUNK_SIZE + ly;
      const tile = generateTile(x, y);
      if (tile === TILE.AIR) continue;

      const g = new PIXI.Graphics();
      g.beginFill(TILE_COLOR[tile]);
      g.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
      g.endFill();
      g.x = lx * TILE_SIZE;
      g.y = ly * TILE_SIZE;

      container.addChild(g);
    }
  }

  world.addChild(container);
  chunkMap.set(chunkKey(cx, cy), container);
}

/* ===============================
   チャンクロード
================================ */
function updateChunks() {
  const viewWidth = app.screen.width;
  const viewHeight = app.screen.height;

  const startX = Math.floor((-camera.x) / (CHUNK_SIZE * TILE_SIZE)) - 1;
  const startY = Math.floor((-camera.y) / (CHUNK_SIZE * TILE_SIZE)) - 1;
  const endX = startX + Math.ceil(viewWidth / (CHUNK_SIZE * TILE_SIZE)) + 2;
  const endY = startY + Math.ceil(viewHeight / (CHUNK_SIZE * TILE_SIZE)) + 2;

  for (let cy = startY; cy <= endY; cy++) {
    for (let cx = startX; cx <= endX; cx++) {
      const key = chunkKey(cx, cy);
      if (!chunkMap.has(key)) {
        generateChunk(cx, cy);
      }
    }
  }
}

/* ===============================
   入力
================================ */
const keys = {};
window.addEventListener("keydown", e => (keys[e.key] = true));
window.addEventListener("keyup", e => (keys[e.key] = false));

/* ===============================
   メインループ
================================ */
app.ticker.add(() => {
  if (keys["ArrowLeft"] || keys["a"]) camera.x += camera.speed;
  if (keys["ArrowRight"] || keys["d"]) camera.x -= camera.speed;
  if (keys["ArrowUp"] || keys["w"]) camera.y += camera.speed;
  if (keys["ArrowDown"] || keys["s"]) camera.y -= camera.speed;

  world.x = camera.x;
  world.y = camera.y;

  updateChunks();
});

/* ===============================
   初期ロード
================================ */
updateChunks();
