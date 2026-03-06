//Matter.jsの読み込み
const { Engine, Render, Runner, Bodies, World, Composite } = Matter;

const engine = Engine.create();

const render = Render.create({
  element: document.getElementById("game"),
  engine: engine,
  options:{
    width: window.innerWidth,
    height: window.innerHeight,
  },
});


var boxA = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2, 80, 80);

var ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2+100, 500, 80, {isStatic: true});

Composite.add(engine.world, [boxA]);


Render.run(render);
var runner = Runner.create();
Runner.run(runner, engine);

//画面リサイズ
window.addEventListener("resize", ()=>{
  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;
});

