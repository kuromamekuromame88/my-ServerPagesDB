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
var chengeDevice, Title, player, ground;

//シーン定義関数群

alert(window.innerWidth);
//タイトル画面
function StartLoop(){
  const ctx = render.context;
  ctx.clearRect(0, 0, render.options.width, render.options.height);

  // Matter.js の標準描画
  Render.world(render);

  // タイトル描画
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.font = `${window.innerWidth<500 ? window.innerHeight/10:window.innerHeight/5}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DrawWay', Title.position.x, Title.position.y);
  ctx.restore();



}

function StartScene(){
  Composite.clear(engine.world, false);
  //PC・Mobile切り替え用
  chengeDevice = Bodies.rectangle(window.innerWidth-25, 25, 30, 30, {
    isStatic: true,
    render: {
      fillStyle: '#fff',
      strokeStyle: '#000',
      lineWidth: 10,
      sprite: {
        texture: "./DrawWay/assets/mobile.png",
        xScale: 0.2,
        yScale: 0.2,
      },//pc32.pngも用意
    }
  });
  //タイトル
  Title = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2, 200, 100, {
    render: { /*fillStyle: 'transparent'*/ }, // 透明な枠を作る
    isStatic: true,
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

  Composite.add(engine.world, [player, ground, chengeDevice]);
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
function UScontrol(){
  
}

//タッチ座標を変数に反映
let pointer = {
  x:0,
  y:0,
  isdown:false,
}
window.addEventListener("pointermove", (e)=>{
  pointer.x = e.clientX;
  pointer.y = e.clientY;
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
}
loop();