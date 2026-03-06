//Matter.jsの読み込み
const { Engine, Render, Runner, Bodies, World, Composite } = Matter;

//エンジン作成
const engine = Engine.create();

//レンダラーの作成
const render = Render.create({
  element: document.getElementById("game"),
  engine: engine,
  width: window.innerWidth,
  height: window.innerHeight,
});

//テスト用にオブジェクトの追加
var boxA = Bodies.rectangle(window.innerWidth/2, window.innerHeight/2, 80, 80);

//物体を世界に追加
Composite.add(engine.world, [boxA]);

//レンダラー内で実行
Render.run(render);

//レンダラーの作成
var runner = Runner.create();

//本体のエンジンを起動
Runner.run(runner, engine);