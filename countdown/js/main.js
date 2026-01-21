const left = document.getElementById('leftdiv');
const right = document.getElementById('rightdiv');

let today = new Date();
const graduationDate = new Date('2026-03-17T00:00:00');

let diffTime = graduationDate - today;
let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

alert(`卒業まであと${diffDays}日`);
//Pixi.jsで卒業カウントダウン風クリッカーゲームを作る

const containerDiv = document.getElementById("container");

const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x95c0ec,
});

containerDiv.appendChild(app.view);

const style = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fill: 'white',
  align: 'center',
});

const countdown = new PIXI.Text(`卒業まであと${diffDays}日`, style);
countdown.anchor.set(0.5);
countdown.x = app.renderer.width*0.5;
countdown.y = app.renderer.height*0.5;
app.stage.addChild(countdown);

let clickCount = 0;
let countdownValue = 10;

countdown.interactive = true;
countdown.buttonMode = true;

countdown.on('pointerdown', () => {
  clickCount++;
  countdownValue--;
  countdown.text = `卒業まであと${diffDays}日`
  if (countdownValue <= 0) {
    countdown.text = 'You Win!';
    countdown.interactive = false;
  }
}
);
window.addEventListener('resize', () => {
  countdown.x = app.renderer.width*0.5;
  countdown.y = app.renderer.height*0.5;
}
);

// 初期カウントダウン表示
countdown.text = `卒業まであと${diffDays}日`;


app.ticker.add((e) => {
  today = new Date();
  diffTime = graduationDate - today;
  diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  countdown.text = `卒業まであと${diffDays}日。`;

 console.log(e);
  
});