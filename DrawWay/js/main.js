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


//定数
const tilesize = 32;
const playersize = 30;

//ゲームループ保持関数
let loopfunc = null;

//オブジェクト変数
var chengeDevice, Title, StartButton, player, ground;

//シーン定義関数群


//ゲーム画面内のボタンのタッチ判定
function isPointerOver(body){
  return Matter.Bounds.contains(body.bounds, {
    x: pointer.x,
    y: pointer.y
  });
}

let lastPointerDown = false;

function button(body, onClick){
  if(isPointerOver(body)){
    // ホバー演出
    body.render.opacity = 0.6;

    // クリック検知（押した瞬間だけ）
    if(pointer.isdown && !lastPointerDown){
      onClick();
    }
  }else{
    body.render.opacity = 1;
  }
}

//タイトル画面
function StartLoop(){
  const ctx = render.context;
  //ctx.clearRect(0, 0, render.canvas.width, render.canvas.height);

  // Matter.js の標準描画
  Render.world(render);

  // タイトル描画
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.font = `${window.innerWidth<500 ? window.innerHeight/10:window.innerHeight/5}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DrawWay', Title.position.x, Title.position.y);
  ctx.font = `${window.innerWidth<500 ? window.innerHeight/20:window.innerHeight/10}px sans-serif`;
  ctx.fillText('Click To Start', StartButton.position.x, StartButton.position.y);
  ctx.restore();

  // スタートボタン
  button(StartButton, ()=>{
    console.log("ゲーム開始");
    PlayScene();
  });

  // デバイス切り替え
  button(chengeDevice, ()=>{
    console.log("デバイス切り替え");
  });

}

function StartScene(){
  Composite.clear(engine.world, false);
  //PC・Mobile切り替え用
  chengeDevice = Bodies.rectangle(window.innerWidth-50, 50, 30, 30, {
    isStatic: true,
    render: {
      fillStyle: '#fff',
      strokeStyle: '#000',
      lineWidth: 10,
      sprite: {
        texture: "./DrawWay/assets/mobile.png",
        xScale: 0.2,
        yScale: 0.2,
      },
    }
  });
  //タイトル
  Title = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2-100, 200, 100, {
    render: { /*fillStyle: 'transparent'*/ }, // 透明な枠を作る
    isStatic: true,
  });

  //プレイ開始ボタン
  StartButton = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2+200, 300, 100, {
    isStatic: true,
    render: {
      fillStyle: "#fff",
      strokeStyle: "#000",
      lineWidth: 10,
    }
  });

  //プレイヤー
  player = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2-200, tilesize, tilesize, {
    render: {
      fillStyle: '#fff',
      strokeStyle: '#000',
      lineWidth: 10,
    }
  });

  ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2+200, 500, 80, {
    isStatic: true,
    render: {
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 10,
    }
  });

  Composite.add(engine.world, [/*player, ground,*/ chengeDevice, Title, StartButton]);
  loopfunc=StartLoop;
}
StartScene();


//プレイ中の画面
function PlayLoop(){
  
}

function PlayScene(){
  loopfunc=PlayLoop;
}

//入力統合管理
const Inputs = {
  left: false,
  right: false,
  jump: false,
  draw: false,
};

//イベント付与
function bindButton(id, key){
  const btn = document.getElementById(id);

  btn.addEventListener("touchstart", ()=> Inputs[key] = true);
  btn.addEventListener("touchend", ()=> Inputs[key] = false);

  btn.addEventListener("mousedown", ()=> Inputs[key] = true);
  btn.addEventListener("mouseup", ()=> Inputs[key] = false);
}
bindButton("left", "left");
bindButton("right", "right");
bindButton("jump", "jump");
bindButton("makeobject", "draw");

//キーボードの入力処理の反映
function Keycontrols(f,e){
  if(e.key=="Right"||e.key=="A") Inputs["right"] = f;
  if(e.key=="Left"||e.key=="D") Inputs["left"] = f;
  if(e.key=="Up"||e.key=="W"||e.key=="Space") Inputs["jump"] = f;
  if(e.key=="Down"||e.key=="E") Inputs["draw"] = f;
}
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
});
window.addEventListener("pointerup", (e)=>{
  pointer.isdown = false;
});


//ループ処理
function loop(){
  if(loopfunc) loopfunc();
  requestAnimationFrame(loop);


  lastPointerDown = pointer.isdown;
}
loop();