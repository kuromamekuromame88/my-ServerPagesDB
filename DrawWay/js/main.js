//Matter.jsの読み込み
const { Engine, Render, Runner, Bodies, World, Composite } = Matter;

const engine = Engine.create();

const render = Render.create({
  element: document.getElementById("game"),
  engine: engine,
  options:{
    width: window.innerWidth,
    height: window.innerHeight,
    background: "#444",
    //デバッグ表示
    wireframes: true,
    showVelocity: true,
    showCollisions: true,
    hasBounds: true,
  },
});

//定数
const tilesize = 32;
const playersize = 30;



var boxA = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2-200, tilesize, tilesize, {
  render: {
    fillStyle: '#fff',
    strokeStyle: '#000',
    lineWidth: 10,
  }
});

var ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2+200, 500, 80, {isStatic: true});

Composite.add(engine.world, [boxA, ground]);


Render.run(render);
var runner = Runner.create();
Runner.run(runner, engine);

//画面リサイズ
window.addEventListener("resize", ()=>{
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;
});

