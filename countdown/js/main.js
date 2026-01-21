const left = document.getElementById('leftdiv');
const right = document.getElementById('rightdiv');

//Pixi.jsで卒業カウントダウン風クリッカーゲームを作る

const containerDiv = document.getElementById("container");

const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x7ebbf0,
});

containerDiv.appendChild(app.view);

const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 'white',
    align: 'center',
    });
const clickText = new PIXI.Text('Click Me!', style);
clickText.anchor.set(0.5);
clickText.x = app.renderer.width / 2;
clickText.y = app.renderer.height / 2;
app.stage.addChild(clickText);

let clickCount = 0;
let countdownValue = 10;

clickText.interactive = true;
clickText.buttonMode = true;

clickText.on('pointerdown', () => {
    clickCount++;
    countdownValue--;
    clickText.text = `Countdown: ${countdownValue}`
    if (countdownValue <= 0) {
        clickText.text = 'You Win!';
        clickText.interactive = false;
    }
}
);
window.addEventListener('resize', () => {
    clickText.x = app.renderer.width / 2;
    clickText.y = app.renderer.height / 2;
}
);

// 初期カウントダウン表示
clickText.text = `Countdown: ${countdownValue}`;
