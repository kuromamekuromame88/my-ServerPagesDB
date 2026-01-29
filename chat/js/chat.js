/*
* やるべきことリスト
* fetchAPIをwebsocketに統一
* ログインの強化
* UIの改善
* 不明ユーザーへの即時対処
* メタバースの完成
*/

/*チャットのJS*/

// 🌟 モバイルでのユーザーリスト表示/非表示の切り替えロジック 🌟
const userStatusBar = document.getElementById('userStatusBar');
const toggleUserListBtn = document.getElementById('toggleUserList');

window.onresize = () => {
  if (window.innerWidth <= 1000) {
    // モバイルサイズの場合、ユーザーリストボタンを表示
    toggleUserListBtn.style.display = 'block';

    // ユーザーリストの表示/非表示を切り替える関数
    toggleUserListBtn.addEventListener('click', () => {
      userStatusBar.classList.toggle('open');
    });

    // 画面をタップした際にユーザーリストを閉じる（簡単な実装）
    document.addEventListener('click', (event) => {
      const isClickInsideBar = userStatusBar.contains(event.target);
      const isClickOnToggleBtn = toggleUserListBtn.contains(event.target);
        
      if (userStatusBar.classList.contains('open') && !isClickInsideBar && !isClickOnToggleBtn) {
        userStatusBar.classList.remove('open');
      }
    });
  }else{
    toggleUserListBtn.style.display = 'none';
  }
}

const SERVER_URL = "wss://tool-webs.onrender.com/ws/chat";
const chatContainer = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const usernameSetup = document.getElementById("usernameSetup");
const chatUI = document.getElementById("chatUI");
const usernameInput = document.getElementById("usernameInput");
const saveUsername = document.getElementById("saveUsername");

const openUserSettingsChange = document.getElementById("openUserSettingsChange");
const UserSettingsChangeModal = document.getElementById("UserSettingsChangeModal");
const newNicknameInput = document.getElementById("newNicknameInput");
const changeNickname = document.getElementById("changeNickname");
const cancelNicknameChange = document.getElementById("cancelNicknameChange");

const currentPasswordInput = document.getElementById("currentPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const changePassword = document.getElementById("changePassword");

const loginUI = document.getElementById("loginUI");
const loginUserIDInput = document.getElementById("loginUserIDInput");
const loginPasswordInput = document.getElementById("loginPasswordInput");
const loginButton = document.getElementById("loginButton");

let wr = new URL(window.location.href);
const params = new URLSearchParams(wr.search);
wr = params.get('room');
 

//ルームの保持変数
let room = wr || "Main";
document.getElementById("room").innerText = room;
console.log("移動:", room);
    
//ルーム切り替え用
const roomToggleBtn = document.getElementById("roomToggleBtn");
const roomMenu = document.getElementById("roomMenu");

//画像送信用
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

  containerDiv.style.display = "none";
};

openBoard.onclick = () => {
  chatUI.style.display = "none";
  document.getElementById("room").style.display = "none";
  roomToggleBtn.style.display = "none";
  roomMenu.style.display = "none";
  document.getElementById("userStatusBar").style.display = "none";

  containerDiv.style.display = "block";
  // resize Pixi app so canvas fits new layout

  app.resize();
};

// ------------------- ニックネーム & userID -------------------
let nickname = localStorage.getItem("nickname");

let userID = localStorage.getItem("userID") || null;

let PASSWORD = localStorage.getItem("PASSWORD") || "PASSWORD";



if (!userID || userID == "null" && localStorage.getItem("AlrRgt") !== "true") {
  /*console.log("nullユーザーを検知! 新しいuserIDを発行します。");
  function generateUserID() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  }
  userID = generateUserID();
  localStorage.setItem("userID", userID);
  localStorage.setItem("AlrRgt", true);*/
  localStorage.setItem("logout", true);
}else{
  console.log("nullユーザーを検知しませんでした。");
  console.log("AlrRgtフラグを設定します。");
  localStorage.setItem("AlrRgt", true);
}

document.getElementById("logout").addEventListener("click", ()=>{
  localStorage.setItem("logout", true);
  location.reload();
});


if(localStorage.getItem("AlrRgt") === "true" && localStorage.getItem("Logout") === "true"){
  loginUI.style.display = "block";
  usernameSetup.style.display = "none";
}else{
  if(!localStorage.getItem("logout")) localStorage.setItem("logout", false);
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


//既読機能用observer

// メッセージを監視するオブザーバ
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const msgId = entry.target.dataset.messageId;

      // WebSocket で既読を送信
      ws.send(JSON.stringify({
        app: "webchat",
        type: "read",
        channel: room,
        messageId: msgId,
        user: getFullUsername()
      }));
      //console.log("既読:", msgId);

      // 一度既読にしたら監視を外す
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1  // 60% 見えたら既読
});


//ルーム移動時の既読処理
function observeAllMessagesInView() {
  document.querySelectorAll(".message").forEach(msg => {
    observeMessage(msg);
  });
}


// ▼ ルーム移動

// ---- visitedroom 初期化 ----
let visitedroom = JSON.parse(localStorage.getItem("visitedroom"));
if (!visitedroom) {
  visitedroom = ["Main"];
  localStorage.setItem("visitedroom", JSON.stringify(visitedroom));
}


async function callRoomAuth(room, pass) {
  try {
    const params = new URLSearchParams();
    if (room != null) params.set("room", room);
    if (pass != null) params.set("pass", pass);

    const url = `https://tool-webs.onrender.com/webchat/roomauth?${params.toString()}`;

    const res = await fetch(url, { method: "GET" });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    return {
      result: data.result,
      reason: data.reason
    };
  } catch (e) {
    console.warn("Authment room failed:", e);
    return { result: false, reason: "network_error" };
  }
}


// ---- ルーム切り替えイベント ----
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("room-btn")) {

    const roomName = e.target.dataset.room;
    const roomPass = e.target.dataset.pass; // null または 文字列


    // roomPass が null でない → パスワード保護ルーム
    if ((/true/).test(roomPass)) {

      // 訪問済みではない
      if (!visitedroom.includes(roomName)) {

        const entered = prompt("このルームのパスワードを入力してください");

        // キャンセル
        if (entered === null) {
          alert("パスワードが入力されていません。");
          return;
        }

        let res = await callRoomAuth(roomName, entered);
        if(!res.result){
          alert("認証に失敗しました。");
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

    // チャットを描画したら、画面内の全メッセージを監視
    setTimeout(() => {
      observeAllMessagesInView();
    }, 500);

    const url = new URL(location);
    url.searchParams.set("room", room);
    history.pushState({}, "", url);

    console.log("移動:", room);
    document.getElementById("room").innerText = room;
    roomMenu.style.display = "none";

    setTimeout(() => {
      if(!chatContainer.innerHTML){
        console.log("チャットが読み込まれてないなあ...");
        onReachTop(100000000000);
        console.log("しょうがないから読み込んだよ");
      }
    }, 1000);
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

  const url = `https://tool-webs.onrender.com/webchat/roomregist?name=${name}&id=${id}&onwer=${userID}`;

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

async function clipcopy(text){
  try{
    if(!text) return;
    await navigator.clipboard.writeText(text);
    alert('📋 コピーしました！');
  }catch(e){
    alert('❌ コピーに失敗しました: '+e.message);
  }
}

function mcopy(id){
  if(!id) return;
  const content = chatContainer.querySelector(`[id="${id}"]`).getElementsByClassName("hide_text")[0]?.innerText;
  (async () => {
    await clipcopy(content);
  })();
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
  chatContainer.querySelector(`[id="${id}"]`)?.remove();
}

let RUID;
const RUIDAPI = "https://tool-webs.onrender.com/api/RUID";

async function checkupdate(){
  try {
    const res = await fetch(RUIDAPI);
    const data = await res.json();
    RUID = localStorage.getItem("RUID");
    if(!RUID){
      localStorage.setItem("RUID", data.RUID);
    }else{
      if(RUID != data.RUID && data.update){
        localStorage.setItem("RUID", data.RUID);
        alert("サーバーの更新を検知しました。ページをリロードします...");
        location.reload();
      }
    }
  } catch (err) {
    console.error("RUID取得エラー:", err);
  }
}

//古いメッセージ取得をリクエスト
function onReachTop(id) {
  const firstMsg = chatContainer.getElementsByClassName("message")[0];
  if (!firstMsg && !id) return;
  let firstMessageId;
  if(firstMsg){
    firstMessageId = firstMsg.dataset.messageId || id;
  }
  firstMessageId = firstMessageId || 100000000000000;

  console.log("ページの一番上までスクロールされました！");
  console.log("最初のメッセージのID:", firstMessageId);

  console.log("サーバーにリクエストを送ります");
  ws.send(JSON.stringify({
    app: "webchat",
    type: "loadMore",
    room: room,
    beforeID: firstMessageId
  }));
}

let loadingOld = false;

//位置保持用
let prevHeight;

chatContainer.addEventListener("scroll", () => {
  if (chatContainer.scrollTop === 0 && !loadingOld && chatContainer.scrollHeight > chatContainer.clientHeight || !chatContainer.innerHTML) {
    loadingOld = true;
    prevHeight = chatContainer.scrollHeight;
    onReachTop();
  }
});



// 重要------------------- WebSocket接続 -------------------
function connectWebSocket() {
  if (!userID || userID == "null" && localStorage.getItem("AlrRgt") !== "true") return;
  ws = new WebSocket(SERVER_URL);

  checkupdate();
  loadMuteState();

  if(ws){
    ws.addEventListener("open", () => {
      resetChat();
      ws.send(JSON.stringify({
        app: "webchat",
        type: "getAll",
        channel: room
      }));
    });
  }

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if(msg.app !== "webchat") return;
    const fullUsername = getFullUsername();
    if(msg.type !== "view" && msg.type !== "userstatus") console.log("受信:",msg);

    if(msg.type === "userstatus"){
      newUserStatus(msg.data);
      return;
    }

    if(msg.type === "authresult"){
      if(msg.state || msg.state === "true"){
        alert("認証に成功しました！");
        localStorage.setItem("logout", false);
        userID = loginUserIDInput.value;
        PASSWORD = loginPasswordInput.value;
        localStorage.setItem("userID", userID);
        localStorage.setItem("userID", PASSWORD);
        showChatUI();
      }else{
        alert("認証に失敗しました。");
      }
    }

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

    if(msg.type === "view"){
      let message = chatContainer.querySelector(`[id="${msg.id}"]`);
      if(!message) return;
      message.getElementsByClassName("views")[0].innerHTML = `既読数:${msg.count}`;
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
            // iframe も全てのドメインを許可
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
        <div class="views" style="font-size:12px;color:gray;">既読数:0</div>
        ${createdAt ? `<div style="font-size:12px;color:gray;">${createdAt}</div>` : ""}
        <div style="font-size:10px;opacity:0.5;" class="comid">#${id? id: ''}</div>
        ${displayID === userID && id ? `<div class="message_remove"><button class="remove_button" onclick="msgdel(${id})">削除</button>`:""}
        <div class="message_copy"><button class="copy_button" onclick="mcopy(${id})">コピー</button></div>
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
      if (displayID === "other") div.classList.add("other");

      div.id = id;

      div.dataset.messageId = id;

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
        <div class="views" style="font-size:12px;color:gray;">既読数:0</div>
        ${createdAt ? `<div style="font-size:12px;color:gray;">${createdAt}</div>` : ""}
        <div style="font-size:10px;opacity:0.5;" class="comid">#${id? id: ''}</div>
        ${displayID === userID && id ? `<div class="message_remove"><button class="remove_button" onclick="msgdel(${id})">削除</button></div>`:""}
        <div class="message_copy"><button class="copy_button" onclick="mcopy(${id})">コピー</button></div>
      `;
      
      notifyNewMessage();

      if(msg.isHistory){
        chatContainer.prepend(div);
        observer.observe(div);
        loadingOld = false;

        let newHeight = chatContainer.scrollHeight;
        chatContainer.scrollTop = newHeight - prevHeight;

      }else{
        chatContainer.appendChild(div);
        observer.observe(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }


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

function waitwscon(ws, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    // すでに接続済みなら即解決
    if (ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("WebSocket 接続タイムアウト"));
    }, timeoutMs);
    function onOpen() {
      cleanup();
      resolve();
    }
    function onError(e) {
      cleanup();
      reject(new Error("WebSocket 接続エラー"));
    }
    function cleanup() {
      clearTimeout(timeoutId);
      ws.removeEventListener("open", onOpen);
      ws.removeEventListener("error", onError);
    }
    ws.addEventListener("open", onOpen);
    ws.addEventListener("error", onError);
  });
}

// ------------------- UI表示 -------------------
function showChatUI() {
  loginUI.style.display = "none";
  usernameSetup.style.display = "none";
  chatUI.style.display = "block";
}

async function init(){
  if (nickname) {
    await waitwscon(ws);
    showChatUI();
    ws.send(JSON.stringify({
      app:"webchat",
      type:"regist",
      userID:userID,
      nickname:nickname,
      pass: localStorage.getItem("PASSWORD") || "PASSWORD",
      quiet: true
    }));
  }
}

init();

// ------------------- 初回ニックネーム登録 -------------------
saveUsername.addEventListener("click", async() => {
  const name = usernameInput.value.trim();
  if (!name) return alert("ニックネームを入力してください");
  localStorage.setItem("nickname", name);
  nickname = name;
  PASSWORD = document.getElementById("passwordInput").value.trim();
  if(!PASSWORD) return alert("パスワードを入力してください。");
  localStorage.setItem("PASSWORD", PASSWORD);

  function generateUserID(key=5) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for (let i = 0; i < key; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  }
  localStorage.setItem("AlrRgt", true);
  localStorage.setItem("logout", false);
  if (!userID) {
    userID = generateUserID();
    localStorage.setItem("userID", userID);
  }

  connectWebSocket();
  await waitwscon(ws);
  localStorage.removeItem("muted");
  
  if(ws){
    ws.send(JSON.stringify({
      app:"webchat",
      type:"regist",
      userID:userID,
      nickname:nickname,
      pass:PASSWORD,
      quiet: true
    }));
  }else{
    alert("WebSocketに接続されていません。しばらく待ってからもう一度お試しください。");
    return;
  }
  showChatUI();
});

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

  if(text.includes("しね") || text.includes("シネ") || text.includes("死ね") || text.includes("4545") || text.includes("４５４５") || text.includes("デブ") ){
    alert("言葉遣いは丁寧に");
    return;
  }

  if(text.startsWith('/delgroup')){
    const parts = text.split(' ');
    const id = Number(parts[1]);
    if(confirm(`voiceのグループ${id}を削除しますか？`)){
      ws.send(JSON.stringify({
        app: "voice",
        type: "group-delete",
        groupId: id
      }));
    }
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

// ------------------- ユーザー設定変更UI -------------------
UserSettingsChangeModal.onclick = (e) => {
  if (e.target === UserSettingsChangeModal) UserSettingsChangeModal.style.display = "none";
}

openUserSettingsChange.onclick = () => {
  newNicknameInput.value = nickname;
  UserSettingsChangeModal.style.display = "flex";
  currentPasswordInput.value = localStorage.getItem("PASSWORD");
};

cancelNicknameChange.onclick = () => {
  UserSettingsChangeModal.style.display = "none";
};

newNicknameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.isComposing) changeNickname.click();
});

changeNickname.onclick = () => {
  const newName = newNicknameInput.value.trim();
  if (!newName) return alert("ニックネームを入力してください");
  localStorage.setItem("nickname", newName);
  nickname = newName;
  UserSettingsChangeModal.style.display = "none";
};


//パスワード変更用

changePassword.onclick = () => {
  const currentpass = currentPasswordInput.value.trim();
  const newpass = newPasswordInput.value.trim();
  if (!currentpass || !newpass) return alert("現在のパスワードと新しいパスワードを入力してください");
  if (currentpass === newpass) return alert("新しいパスワードは現在のパスワードと異なる必要があります。");
  localStorage.setItem("PASSWORD", newpass);
  if(!ws) return;
  ws.send(JSON.stringify({
    app: "webchat",
    type: "changepass",
    userID: userID,
    cpass: currentpass,
    npass: newpass
  }));
  alert("パスワード変更リクエストを送信しました。");
}


//ログイン画面認証関係

loginButton.addEventListener("click", async()=>{
  const luser = loginUserIDInput.value;
  const lpass = loginPasswordInput.value;
  if(!luser || !lpass){
    alert("ユーザーIDとパスワードを入力してください。");
    return;
  }
  await waitwscon(ws);
  ws.send(JSON.stringify({
    app: "webchat",
    type: "login",
    user: luser,
    pass: lpass
  }));
});


//定期登録系

// ------------------- mute・ステータス表示用 定期登録 API -------------------
async function sendRegistPing() {
  // WebSocket 状態チェック（OPEN のときだけ送る）
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  await waitwscon(ws);
  ws.send(JSON.stringify({
    app:"webchat",
    type:"chatping",
    userID:userID,
  }));
  ws.send(JSON.stringify({
    app:"webchat",
    type:"getUserStatus"
  }));
}

sendRegistPing();

const channelAPI = "https://tool-webs.onrender.com/webchat/channelList";

// ルームリスト部分（この中だけを動的に書き換える）
const roomListDiv = document.querySelector(".room-menu .room-list");

// 既に追加したチャンネルIDを記録
let renderedChannelIds = new Set();

async function updateChannelListUI() {
  // ネットワーク状態チェック
  if (!navigator.onLine) return;
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
      btn.dataset.pass = ch.data.pass ? true:false;
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
async function newUserStatus(data) {
  const users = data;
  userListDiv.innerHTML = ""; // 毎回リセット
  users.forEach(u => {
    const status = detectStatus(u.last_ping);
    const div = document.createElement("div");
    div.classList.add("user-item");
    div.innerHTML = `
      <div class="status-dot status-${status}"></div>
      <div class="user-nick">${u.nickname} | ${u.userID}</div>
    `;
    userListDiv.appendChild(div);
  });
}


//全部まとめて繰り返し
async function repeatprocess(){
  if(navigator.onLine){
    await sendRegistPing();
    await updateChannelListUI();
  }
}

// 5秒ごとに実行
setInterval(repeatprocess, 5000);
