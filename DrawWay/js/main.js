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

//シーン定義関数群


//タイトル画面
function StartLoop(){
  
}

function StartScene(){
  Composite.clear(engine.world, false);
  //PC・Mobile切り替え用
  var chengeDevice = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2-200, 30, 30, {
    isStatic: true,
    render: {
      fillStyle: '#fff',
      strokeStyle: '#000',
      lineWidth: 10,
      sprite: {texture: "./mobile.png"},//pc.pngも用意
    }
  });
  var boxA = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2-200, tilesize, tilesize, {
    render: {
      fillStyle: '#fff',
      strokeStyle: '#000',
      lineWidth: 10,
    }
  });
  var ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2+200, 500, 80, {
    isStatic: true,
    render: {
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 10,
    }
  });

  Composite.add(engine.world, [boxA, ground, chengeDevice]);
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


function loop(){
  if(loopfunc) loopfunc();
  requestAnimationFrame(loop);
}
loop();