/*チャットのJS*/
    
const SERVER_URL = "wss://tool-webs.onrender.com/ws/chat";
const chatContainer = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const usernameSetup = document.getElementById("usernameSetup");
const chatUI = document.getElementById("chatUI");
const usernameInput = document.getElementById("usernameInput");
const saveUsername = document.getElementById("saveUsername");

const openNicknameChange = document.getElementById("openNicknameChange");
const nicknameChangeModal = document.getElementById("nicknameChangeModal");
const newNicknameInput = document.getElementById("newNicknameInput");
const changeNickname = document.getElementById("changeNickname");
const cancelNicknameChange = document.getElementById("cancelNicknameChange");


//ルームの保持変数
let room = "Main";

//ルーム切り替え用
const roomToggleBtn = document.getElementById("roomToggleBtn");
const roomMenu = document.getElementById("roomMenu");

//画像送信用
//const imgSend = document.getElementById("img_send");
const imgUpload = document.getElementById("img_upload");

// チャット / ボード 切替ボタン
const openChat = document.getElementById("openChat");
const openBoard = document.getElementById("openBoard");

openChat.onclick = () => {
  chatUI.style.display = "block";
  document.getElementById("room").style.display = "block";
  roomToggleBtn.style.display = "block";
  roomMenu.style.display = "block";
  document.getElementById("userStatusBar").style.display = "block";

  boardUI.style.display = "none";
};
openBoard.onclick = () => {
  chatUI.style.display = "none";
  document.getElementById("room").style.display = "none";
  roomToggleBtn.style.display = "none";
  roomMenu.style.display = "none";
  document.getElementById("userStatusBar").style.display = "none";


  boardUI.style.display = "block";
  // resize Pixi app so canvas fits new layout
  app.resize();
};

// ------------------- ニックネーム & userID -------------------
let nickname = localStorage.getItem("nickname");

function generateUserID() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

let userID = localStorage.getItem("userID");
if (!userID) {
  userID = generateUserID();
  localStorage.setItem("userID", userID);
}

function getFullUsername() {
  return nickname + "|" + userID;
}

let ws;
let wasmuted = false;

function resetChat() {
  chatContainer.innerHTML = "";
}

let originalTitle = document.title;
let hasUnread = false;

function notifyNewMessage() {
  if (document.hidden) {
    hasUnread = true;
    document.title = "⚠️ 新着メッセージがあります";
  }
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && hasUnread) {
    document.title = originalTitle;
    hasUnread = false;
  }
});


//ルームボタン
// ▼ メニュー開閉
roomToggleBtn.addEventListener("click", () => {
  roomMenu.style.display = roomMenu.style.display === "block" ? "none" : "block";
});

// ▼ メニュー以外をクリックすると閉じる
document.addEventListener("click", (e) => {
  if (!e.target.closest(".roomselect")) {
    roomMenu.style.display = "none";
  }
});

document.getElementById("room").innerText = "Main";
// ▼ ルーム移動

// ---- visitedroom 初期化 ----
let visitedroom = JSON.parse(localStorage.getItem("visitedroom"));
if (!visitedroom) {
  visitedroom = ["Main"];
  localStorage.setItem("visitedroom", JSON.stringify(visitedroom));
}


// ---- ルーム切り替えイベント ----
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("room-btn")) {

    const roomName = e.target.dataset.room;
    const roomPass = e.target.dataset.pass; // null または 文字列

    // --- パスワードチェック ---
    // roomPass が null でない → パスワード保護ルーム
    if (roomPass && roomPass !== "null") {

      // 訪問済みではない
      if (!visitedroom.includes(roomName)) {

        const entered = prompt("このルームのパスワードを入力してください");

        // キャンセル or 不一致
        if (entered === null || entered !== roomPass) {
          alert("パスワードが違います。");
          return;
        }

        // OK → 訪問済みに追加
        visitedroom.push(roomName);
        localStorage.setItem("visitedroom", JSON.stringify(visitedroom));
      }

    }

    // ---- ルーム移動実行 ----
    room = roomName;
    resetChat();
    ws.send(JSON.stringify({
      app: "webchat",
      type: "getAll",
      channel: room
    }));

    console.log("移動:", room);
    document.getElementById("room").innerText = room;
    roomMenu.style.display = "none";
  }
});


async function RegistRoom(name) {
  // ネットワーク状態チェック
  if (!navigator.onLine) return;

  // WebSocket 状態チェック（OPEN のときだけ送る）
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  var q = prompt("ルームを保護しますか？（保護しない場合は何も入力しない）");
  var id = "";
  if(q) {
    id = prompt("保護キーを設定してください（何の文字でも単語でもOK）");
  }

  const url = `https://tool-webs.onrender.com/webchat/roomregist?name=${name}&id=${id}`;

  try {
    await fetch(url, { method: "GET" });
    //console.log("Regist room sent:", url);
  } catch (e) {
    console.warn("Regist room failed:", e);
  }
}

// ▼ 新しいルーム追加
document.getElementById("create-room-btn").addEventListener("click", () => {
  const name = document.getElementById("new-room-name").value.trim();
  if (!name) return alert("ルーム名を入力してください。");

  // UI 追加
  
  RegistRoom(name);

  visitedroom.push(name);
  localStorage.setItem("visitedroom", JSON.stringify(visitedroom));

  console.log("新規ルーム作成:", name);
  document.getElementById("new-room-name").value = "";
});





//オフラインやwebsocketの接続が切れたときのmuteAPI取得関数
async function loadMuteState() {
  const res = await fetch("https://tool-webs.onrender.com/webchat/mute");
  const json = await res.json();
  const muteList = json.mute;

  if (muteList.includes(userID)) {
    // 自分はミュートされている
    wasmuted = true;
    localStorage.setItem("muted", "1");
    alert("あなたはミュートされました。");
  }else{
    wasmuted = false;
    localStorage.removeItem("muted");
  }
}

//削除時に、もし対象のコメントが画像で、自分のサーバーに保存されている画像なら削除リクエストを送る
async function CheckImgDel(id){
  var chat = chatContainer.querySelector(`[id="${id}"]`).getElementsByClassName("hide_text");
  
  if(chat[0].innerText.includes("https://tool-webs.onrender.com/webchat/file")){
    var filename = chat[0].innerText;
    filename = filename.substring(filename.indexOf('tool-webs.onrender.com/webchat/file/') + 36, filename.length-1);

    const url = `https://tool-webs.onrender.com/webchat/delete/${filename}`;
    try {
      await fetch(url, { method: "GET" });
      console.log("削除リクエスト:", url);
      return true;
    } catch (e) {
      console.warn("削除リクエストに失敗:", e);
      return;
   }
  }else{
    return false;
  }
}
    
function msgdel(id){
  //console.log("id:", id);
  if(wasmuted) return;
  if(confirm("本当に削除しますか？")){
    alert("削除しました。");
    CheckImgDel(id);
    const fullUser = getFullUsername();
    ws.send(JSON.stringify({
      app: "webchat",
      type: "message",
      user: fullUser,
      text: `/del ${id}`
    }));
  }else{
    alert("削除しませんでした。");
    return;
  }
}

function qdel(id){
  chatContainer.querySelector(`[id="${id}"]`).remove();
}


// ------------------- WebSocket接続 -------------------
function connectWebSocket() {
  
  loadMuteState();
  ws = new WebSocket(SERVER_URL);
  if(ws) resetChat();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    const fullUsername = getFullUsername();
    console.log("受信:",msg);

    if (msg.type === "mute" && msg.user === userID /*|| msg.user.includes(userID)*/ ) {
      wasmuted = true;
      localStorage.setItem("muted", "1");
      alert("あなたはミュートされました。");
      return;
    }

    if (msg.type === "unmute" && msg.user === userID /*|| msg.user.includes(userID)*/ ) {
      wasmuted = false;
      localStorage.removeItem("muted");
      return;
    }

    if(msg.type === "delete"){
      qdel(msg.id);
      return;
    }

    if(msg.type === "edit"){
          
      const data = msg.data;
      let message = chatContainer.querySelector(`[id="${data.id}"]`);
      if(!message) return;
          

      const rawUser = data.user_name;
      let displayName = rawUser;
      let displayID = rawUser;
      if (rawUser.includes("|")) {
        const s = rawUser.split("|");
        displayName = s[0];
        displayID = s[1];
      }
          
      const markdown = data.content;
      const createdAt = data.created_at ? new Date(data.created_at).toLocaleString() : "";
      const id = data.id;

      const html = DOMPurify.sanitize(marked.parse(markdown, { breaks: true }), {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
        // デフォルトではすべてのsrcに適用する正規表現を無効化
        ALLOWED_URI_REGEXP: /.*/, 
        // beforeSanitizeAttributesフックで個別制御
        BEFORE_SANITIZE_ATTRIBUTES: (node) => {
          if (node.tagName === 'IFRAME') {
            // iframe は特定ドメインのみ許可
            //一旦無効化
            //const allowedIframe = /^(https:\/\/tool-webs\.onrender\.com\/|https:\/\/www\.youtube-nocookie\.com\/embed\/)/;
            //if (!allowedIframe.test(node.src)) {
              //node.removeAttribute('src');
            //}
          }
          if (node.tagName === 'IMG') {
            // img は任意のURLを許可（制限しない場合は何もしない）
            // 例: さらに特定ドメインに制限したい場合はこちらでチェック可能
          }
        }
      });

      message.innerHTML = `
        <div class="user">
          <span class="nickname">${displayName}</span>
          <span class="userid">${displayID}</span>
        </div>
        <div class="hide_text" style="display:none;">${markdown}</div>
        <div class="text">${html}</div>
        ${createdAt ? `<div style="font-size:12px;color:gray;">${createdAt}</div>` : ""}
        <div style="font-size:10px;opacity:0.5;">#${id? id: ''}</div>
        ${displayID === userID && id ? `<div class="message_remove"><button class="remove_button" onclick="msgdel(${id})">削除</button>`:""}
      `;
          
      //<button class="remove_button" id="edit">編集</button></div>
      notifyNewMessage();
    }

    if (msg.type === "reload") location.reload();

    if (msg.type === "chat" && msg.data ) {
      const data = msg.data;
      const rawUser = data.user_name || data.user;
      let displayName = rawUser;
      let displayID = rawUser;
      if (rawUser.includes("|")) {
        const s = rawUser.split("|");
        displayName = s[0];
        displayID = s[1];
      }

      var cr = data.data.room ? data.data.room : "Main";
      
      if(cr !== room && cr != null && cr != "All" ) return;

      const markdown = data.content || data.text;
      const createdAt = data.created_at ? new Date(data.created_at).toLocaleString() : "";
      const id = data.id;

      const div = document.createElement("div");
      div.classList.add("message");

      //
      if (displayID === localStorage.getItem("userID")) div.classList.add("mine");
      if (displayID === "server") div.classList.add("server");

      div.id = id;

      const html = DOMPurify.sanitize(marked.parse(markdown, { breaks: true }), {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
        // デフォルトではすべてのsrcに適用する正規表現を無効化
        ALLOWED_URI_REGEXP: /.*/, 
        // beforeSanitizeAttributesフックで個別制御
        BEFORE_SANITIZE_ATTRIBUTES: (node) => {
          if (node.tagName === 'IFRAME') {
            // iframe は特定ドメインのみ許可
            /*
            const allowedIframe = /^(https:\/\/tool-webs\.onrender\.com\/|https:\/\/www\.youtube-nocookie\.com\/embed\/)/;
            if (!allowedIframe.test(node.src)) {
              node.removeAttribute('src');
            }
            */
          }
          if (node.tagName === 'IMG') {
            // img は任意のURLを許可（制限しない場合は何もしない）
            // 例: さらに特定ドメインに制限したい場合はこちらでチェック可能
          }
        }
      });


      div.innerHTML = `
        <div class="user">
          <span class="nickname">${displayName}</span>
          <span class="userid">${displayID}</span>
        </div>
        <div class="hide_text" style="display:none;">${markdown}</div>
        <div class="text">${html}</div>
        ${createdAt ? `<div style="font-size:12px;color:gray;">${createdAt}</div>` : ""}
        <div style="font-size:10px;opacity:0.5;">#${id? id: ''}</div>
        ${displayID === userID && id ? `<div class="message_remove"><button class="remove_button" onclick="msgdel(${id})">削除</button></div>`:""}
      `;
      
      notifyNewMessage();
      chatContainer.appendChild(div);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      //<button class="remove_button" id="edit">編集</button>
      /*
      var edit = document.getElementById("edit");
      edit.addEventListener("click", (event) => {
        console.log("event:",event);
      });
      */
    }
  });

  ws.addEventListener("close", () => {
    setTimeout(connectWebSocket, 1000);
  });
}

connectWebSocket();

// ------------------- UI表示 -------------------
function showChatUI() {
  usernameSetup.style.display = "none";
  chatUI.style.display = "block";
}
if (nickname) showChatUI();

// ------------------- 初回ニックネーム登録 -------------------
saveUsername.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("ニックネームを入力してください");
  localStorage.setItem("nickname", name);
  nickname = name;
  localStorage.removeItem("muted");
  showChatUI();
};

//-------------------画像アップロード----------------
const MAXSIZE = 800 * 1024;

imgUpload.addEventListener("click", (e) => {
  if (localStorage.getItem("muted")) {
    alert("muteされているのでメッセージを送信できません。");
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';

  input.addEventListener('change', async (event) => {
    let ps = true;
    const file = event.target.files[0];
    //console.log("ファイル;", file);
    if (!file) return;

    if(file.size > MAXSIZE){
      alert("ファイルサイズが800KBを超えているため送信できません。");
      return;
    }

    //ファイル重複確認
    try {
      // fetchでアップロード
      const res = await fetch('https://tool-webs.onrender.com/webchat/filelist', {
        method: 'GET'
      });
      const data = await res.json();
      
      if (data.files.includes(file.name)) {
        //alert("同一ファイルがサーバーに存在しました。");
        ps = false;
      } else {
        console.log('確認完了');
      }
    } catch (err) {
      console.error('ファイル存在確認エラー', err);
    }

    // FormData に追加
    const formData = new FormData();
    formData.append('file', file);

    try {

      let data;
      if(ps){
        // fetchでアップロード
        const res = await fetch('https://tool-webs.onrender.com/webchat/upload', {
          method: 'POST',
          body: formData
        });
        data = await res.json();
      }else{
        data = {
          url: `https://tool-webs.onrender.com/webchat/file/${file.name}`
        };
      }
      
      if (data.url) {
        console.log("画像のURL",data.url);
        // WebSocket で送信
        const fullUser = getFullUsername();
        ws.send(JSON.stringify({
          app: "webchat",
          type: "message",
          user: fullUser,
          room: room,
          text: `![画像](${data.url})`
        }));
        
      } else {
        console.error('アップロードに失敗しました', data);
      }
    } catch (err) {
      console.error('アップロードエラー', err);
    }
  });

  document.body.appendChild(input);
  input.click();
  input.remove();
});




// ------------------- メッセージ送信 -------------------
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  if (localStorage.getItem("muted")) {
    alert("muteされているのでメッセージを送信できません。");
    return;
  }

  if(text.includes("しね") || text.includes("シネ") || text.includes("死ね") || text.includes("4545") || text.includes("４５４５")){
    alert("言葉遣いは丁寧に");
    return;
  }

  if(text.startsWith('/del')){
    const parts = text.split(' ');
    const id = Number(parts[1]);
    msgdel(id);
    return;
  }

  const fullUser = getFullUsername();
  ws.send(JSON.stringify({
    app: "webchat",
    type: "message",
    user: fullUser,
    room: room,
    text: text
  }));

  messageInput.value = "";
}

sendButton.onclick = sendMessage;

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ------------------- ニックネーム変更UI -------------------
openNicknameChange.onclick = () => {
  newNicknameInput.value = nickname;
  nicknameChangeModal.style.display = "flex";
};

cancelNicknameChange.onclick = () => {
  nicknameChangeModal.style.display = "none";
};

newNicknameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.isComposing) changeNickname.click();
});

changeNickname.onclick = () => {
  const newName = newNicknameInput.value.trim();
  if (!newName) return alert("ニックネームを入力してください");
  localStorage.setItem("nickname", newName);
  nickname = newName;
  nicknameChangeModal.style.display = "none";
};


// ------------------- mute用 定期登録 API -------------------
async function sendRegistPing() {
  // ネットワーク状態チェック
  if (!navigator.onLine) return;

  // WebSocket 状態チェック（OPEN のときだけ送る）
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  var date = new Date();

  const url = `https://tool-webs.onrender.com/webchat/regist?user=${encodeURIComponent(userID)}&nick=${nickname}&lasttime=${date.toISOString()}`;

  try {
    await fetch(url, { method: "GET" });
    //console.log("Regist ping sent:", url);
  } catch (e) {
    console.warn("Regist ping failed:", e);
  }
}

// 10秒ごと（10000ms）に送信

setInterval(sendRegistPing, 10000);

// ページ読み込み時に1回実行（任意）
sendRegistPing();




const channelAPI = "https://tool-webs.onrender.com/webchat/channelList";

// ルームリスト部分（この中だけを動的に書き換える）
const roomListDiv = document.querySelector(".room-menu .room-list");

// 既に追加したチャンネルIDを記録
let renderedChannelIds = new Set();

async function updateChannelListUI() {
  try {
    const res = await fetch(channelAPI);
    const channels = await res.json();  
    // 形式: [{ id:1, data:{name:"a", pass:"a"}, created_at:... }]

    // 現UIに残せる ID をセットで準備
    const incomingIds = new Set(channels.map(ch => ch.id));

    // --- 現在のUIから "消えたルーム" を削除 ---
    [...renderedChannelIds].forEach(id => {
      if (!incomingIds.has(id)) {
        const btn = roomListDiv.querySelector(`button[data-room-id="${id}"]`);
        if (btn) btn.remove();
        renderedChannelIds.delete(id);
      }
    });

    // --- 新しいルームを UI に追加 ---
    channels.forEach(ch => {
      const id = ch.id;
      const name = ch.data.name;

      // 追加済みならスキップ
      if (renderedChannelIds.has(id)) return;

      const btn = document.createElement("button");
      btn.classList.add("room-btn");
      btn.textContent = name;
      btn.dataset.pass = ch.data.pass ? ch.data.pass: "";
      btn.dataset.roomId = id;   // ← ID で管理
      btn.dataset.room = name;   // ← 表示名

      roomListDiv.appendChild(btn);

      renderedChannelIds.add(id);
    });

  } catch (err) {
    console.error("チャンネル一覧取得エラー", err);
  }
}

// 初回ロード
updateChannelListUI();

// 3秒ごとに自動更新

setInterval(updateChannelListUI, 3000);


const userAPI = "https://tool-webs.onrender.com/webchat/user";
const userListDiv = document.getElementById("userList");

// 最終ログイン時間からステータスを決定
function detectStatus(lastTime) {
  const now = Date.now();
  const last = new Date(lastTime).getTime();
  const diff = (now - last) / 1000; // 秒

  if (diff < 30) return "online";       // 30秒以内
  if (diff < 60) return "away";         // 1分以内
  return "offline";                      // 1分以上
}

// UI更新関数
async function updateUserStatus() {
  try {
    const res = await fetch(userAPI);
    const users = await res.json();

    userListDiv.innerHTML = ""; // 毎回リセット

    users.forEach(u => {
      const status = detectStatus(u.lastTime);

      const div = document.createElement("div");
      div.classList.add("user-item");

      div.innerHTML = `
        <div class="status-dot status-${status}"></div>
        <div class="user-nick">${u.nick} | ${u.id}</div>
      `;

      userListDiv.appendChild(div);
    });

  } catch (err) {
    console.error("ユーザー一覧取得エラー:", err);
  }
}

// 10秒ごとに更新

setInterval(updateUserStatus, 10000);

// 初回実行
updateUserStatus();


