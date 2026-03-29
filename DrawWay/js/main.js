//Matter.jsの読み込み
const { Engine, Render, Runner, Bodies, World, Composite } = Matter;

const engine = Engine.create();

const render = Render.create({
  element: document.getElementById("game"),
  engine: engine,
  options:{
    width: window.innerWidth,
    height: window.innerHeight,
    background: "#fff",
    //デバッグ表示
    wireframes: false,
    showVelocity: true,
    showCollisions: true,
    hasBounds: true,
  },
});

Render.run(render);
var runner = Runner.create();
Runner.run(runner, engine);

//画面リサイズ
window.addEventListener("resize", ()=>{
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;
});


//ユーティリティー関数
function isMobile(){
  return window.matchMedia("(pointer: coarse)").matches;
}

//定数
const tilesize = 32;
const playersize = 30;

//ゲーム内設定フラグ変数
const gs = {
  isPC: false,
};

//ゲームループ保持関数
let loopfunc = null;

//オブジェクト変数
var Title, player, ground;


//ゲーム画面内のボタンのタッチ判定
function isPointerOver(body){
  return Matter.Bounds.contains(body.bounds, {
    x: pointer.x,
    y: pointer.y
  });
}

let lastPointerDown = false;

let pressTarget = null;

function button(body, onClick){

  const over = isPointerOver(body);

  // ホバー
  body.render.opacity = over ? 0.6 : 1;

  // 押した瞬間
  if(pointer.isdown && !lastPointerDown && isPointerOver(body)){
    if(over){
      pressTarget = body; // 押した対象を記録
    }
  }

  // 離した瞬間
  if(!pointer.isdown && lastPointerDown && !isPointerOver(body)){
    if(over && pressTarget === body){
      onClick(); // クリック成立
    }
    pressTarget = null;
  }
}

//シーン定義関数群

//タイトル画面
function StartLoop(){
  const ctx = render.context;
  // Matter.js の標準描画
  Render.world(render);

  // タイトル描画
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.font = `${window.innerWidth<500 ? window.innerHeight/10:window.innerHeight/4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DrawWay', Title.position.x, Title.position.y);

}

function StartScene(){
  Composite.clear(engine.world, false);
  
  //タイトル
  Title = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2-100, 200, 100, {
    render: { fillStyle: 'transparent' }, // 透明な枠を作る
    isStatic: true,
  });

  //プレイヤー
  player = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2-200, tilesize, tilesize, {
    render: {
      fillStyle: '#fff',
      strokeStyle: '#000',
      lineWidth: 10,
    },
    friction: 10,       // 動摩擦
    frictionStatic: 10, // 静止摩擦
    frictionAir: 10,   // 空気抵抗
  });

  ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2+200, 500, 80, {
    isStatic: true,
    render: {
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 10,
    }
  });

  Composite.add(engine.world, [Title]);
  document.getElementById("startBtn").addEventListener("click", ()=>{
    document.getElementById("startBtn").style.display="none";
    PlayScene();
  });
  loopfunc=StartLoop;
}
StartScene();


//プレイ中の画面
function PlayLoop(){

  let vx = player.velocity.x;

  if(Inputs.left) vx -= 0.25;
  if(Inputs.right) vx += 0.25;

  // 減速
  vx *= 0.99;

  Matter.Body.setVelocity(player, {
    x: vx,
    y: player.velocity.y
  });

  // ジャンプ
  if(Inputs.jumpPressed){
    Matter.Body.setVelocity(player, {
      x: player.velocity.x,
      y: -10
    });
    Inputs.jumpPressed = false;
  }
}

function PlayScene(){
  if(isMobile()) document.querySelector("#UI").style.display="flex";
  Composite.clear(engine.world, false);

  Composite.add(engine.world, [player, ground]);

  loopfunc = PlayLoop;
}


//コース編集中の画面
function EditorLoop(){
  
}

function EditorScene(){
  loopfunc=EditorLoop;
}



//入力統合管理
const Inputs = {
  left: false,
  right: false,
  jump: false,
  draw: false,
  jumpPressed: false,
};

//イベント付与
function bindButton(id, key){
  const btn = document.getElementById(id);
  function t(){
    Inputs[key]=true;
    if(key=="jump"&&!Inputs.jumpPressed) Inputs.jumpPressed=true;
  }
  function f(){Inputs[key]=false;}
  btn.addEventListener("touchstart", t);
  btn.addEventListener("touchend", f);

  btn.addEventListener("mousedown", t);
  btn.addEventListener("mouseup", f);
}
bindButton("left", "left");
bindButton("right", "right");
bindButton("jump", "jump");
bindButton("makeobject", "draw");

//キーボードの入力処理の反映
function Keycontrols(f,e){
  if(f === 1 && !e.repeat){
    if(e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space"){
      Inputs.jumpPressed = true;
    }
  }
  if(e.code === "ArrowRight" || e.code === "KeyD") Inputs.right = f;
  if(e.code === "ArrowLeft" || e.code === "KeyA") Inputs.left = f;
  if(e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") Inputs.jump = f;
  if(e.code === "ArrowDown" || e.code === "KeyE") Inputs.draw = f;
}
window.addEventListener("click", ()=>{
  window.focus();
});
document.addEventListener("keydown", (e)=>{Keycontrols(1,e)});
document.addEventListener("keyup", (e)=>{Keycontrols(0,e)});

//タッチ座標を変数に反映
let pointer = {
  x:0,
  y:0,
  isdown:false,
}
window.addEventListener("pointermove", (e)=>{
  const rect = render.canvas.getBoundingClientRect();
  pointer.x = e.clientX - rect.left;
  pointer.y = e.clientY - rect.top;
});
window.addEventListener("pointerdown", (e)=>{
  pointer.isdown = true;
  e.preventDefault(); // ←スクロール防止
});
window.addEventListener("pointerup", (e)=>{
  pointer.isdown = false;
});


//全体的なループ処理
function loop(){
  if(loopfunc) loopfunc();
  requestAnimationFrame(loop);

  lastPointerDown = pointer.isdown;
}
loop();