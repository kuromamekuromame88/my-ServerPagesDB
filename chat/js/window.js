const iw = new IframeWindow();//IframeWindowオブジェクトを作る
const frames = [];

function createWindow(title, url, x, y, width, height){
  const frame = iw.win(
    title, {
      pos:[x,y],
      size:[width,height],
      content:{type:"web",con:url}
    }
  );
  frames.push(frame);
}

/* ===== 起動ボタン ===== */
document.getElementById("openYoutube").onclick = () => {
  createWindow("youtube-player",
    "https://tool-webs.onrender.com/youtube",
    50, 100, window.innerWidth*0.7, window.innerHeight*0.6
  );
};

document.getElementById("openVoice").onclick = () => {
  createWindow("Voice",
    "https://tool-webs.onrender.com/voice",
    50, 100, window.innerWidth*0.7, window.innerHeight*0.6
  );
};

document.getElementById("openCookie").onclick = () => {
  createWindow("Cookieclicker(v2.031,広告なし)",
    "https://kuromamekuromame88.github.io/cookie-clone",
    50, 100, window.innerWidth*0.7, window.innerHeight*0.6
  );
};