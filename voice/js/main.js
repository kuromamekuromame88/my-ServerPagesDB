/* ===============================
   ユーザーID
================================ */
const userID = localStorage.getItem("userID");
if (!userID) {
  alert("未登録です。webchatで登録してください。");
  location.href = "https://tool-webs.onrender.com/chat";
}

let userList = null;

/* ===============================
   WebSocket
================================ */
const wsURL = "wss://tool-webs.onrender.com/ws/voiceSig";
let ws;
let wsCon = false;

/* ===============================
   DOM
================================ */
const remoteVideosContainer = document.getElementById("remoteVideos");

const remoteAudio = document.getElementById("remoteAudio");
const remoteVideo = document.getElementById("remoteVideo");
const localVideo  = document.getElementById("localVideo");

/* ===============================
   状態管理（★追加）
================================ */
/* ===============================
   状態管理（★修正）
================================ */
let callState = {
  mode: "idle",   // idle | p2p | group
  groupId: null,
  peers: new Map()     // Map (group用)
};

let micEnabled = true;
let camEnabled = true;

function setCallStatus(text) {
  const el = document.getElementById("callStatus");
  if (el) el.textContent = text;
}


function addRemoteVideo(userId, stream) {
  let container = document.querySelector(
    `.remote[data-user-id="${userId}"]`
  );

  if (!container) {
    container = document.createElement("div");
    container.className = "remote";
    container.dataset.userId = userId;

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;

    const audio = document.createElement("audio");
    audio.autoplay = true;
    audio.style.display = "none";

    container.appendChild(video);
    container.appendChild(audio);
    remoteVideosContainer.appendChild(container);
  }

  const video = container.querySelector("video");
  const audio = container.querySelector("audio");

  if (stream) {
    video.srcObject = stream;
    audio.srcObject = stream;
  }
}

function removeRemoteVideo(userId) {
  const el = document.querySelector(
    `.remote[data-user-id="${userId}"]`
  );
  if (el) el.remove();
}



/* ===============================
   WebRTC 状態
================================ */
let pc = null;
let localStream = null;
let remoteStream = null;
let currentTarget = null;

/* 中間管理用 */
let audioTrack = null;
let videoTrack = null;

/* ===============================
   PeerConnection生成
================================ */
function createPeer() {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  pc.ontrack = (e) => {
    remoteVideo.srcObject = e.streams[0];
    remoteAudio.srcObject = e.streams[0];
  };

  pc.onicecandidate = (e) => {
    if (e.candidate && currentTarget) {
      ws.send(JSON.stringify({
        app: "voice",
        type: "ice",
        to: currentTarget,
        candidate: e.candidate
      }));
    }
  };

  pc.onconnectionstatechange = () => {
    if (callState.mode !== "p2p") return;
    if (["failed", "disconnected"].includes(pc.connectionState)) {
      endCall();
    }
  };
}


function attachLocalTracks(pc) {
  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });
}

function removeRemoteVideo(userId) {
  const el = document.querySelector(
    `.remote[data-user-id="${userId}"]`
  );
  if (el) el.remove();
}


//グループ通話用Peerの作成関数
async function createGroupPeer(targetId) {
  if (callState.peers.has(targetId)) {
    return callState.peers.get(targetId);
  }

  if (!localStream) {
    await startMedia();
  }

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  callState.peers.set(targetId, pc);


  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.ontrack = e => addRemoteVideo(targetId, e.streams[0]);

  pc.onicecandidate = e => {
    if (e.candidate) {
      ws.send(JSON.stringify({
        app: "voice",
        type: "group-ice",
        to: targetId,
        candidate: e.candidate
      }));
    }
  };

  return pc;
}





/* ===============================
   メディア取得（中間変数管理）
================================ */
async function startMedia() {
  if (localStream) return;

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  });

  audioTrack = localStream.getAudioTracks()[0];
  videoTrack = localStream.getVideoTracks()[0];

  /* UI初期状態を反映 */
  audioTrack.enabled = document.querySelector(".mic")?.checked ?? true;
  videoTrack.enabled = document.querySelector(".cam")?.checked ?? true;

  localVideo.srcObject = localStream;
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
      if(RUID != data.RUID){
        localStorage.setItem("RUID", data.RUID);
        alert("サーバーの更新を検知しました。ページをリロードします...");
        location.reload();
      }
    }
  } catch (err) {
    console.error("RUID取得エラー:", err);
  }
}

/* ===============================
   WebSocket 接続
================================ */
// グローバル
const iceQueue = new Map(); // userId -> ICE[]

function connectWebSocket(){
  checkupdate();
  ws = new WebSocket(wsURL);

  ws.onopen = () => {
    wsCon = true;
    ws.send(JSON.stringify({
      app: "voice",
      type: "register",
      userId: userID
    }));
  };

  ws.onmessage = async (e) => {
    const msg = JSON.parse(e.data);
    if(msg.app === "webchat"){
      if(msg.type === "userstatus"){
        updateUserStatus(msg.data);
        return;
      }

    }
    if (msg.app !== "voice") return;

    /* 着信 */
    if (msg.type === "incoming-call") {
      if (callState.mode !== "idle") return;

      const user = userList?.find(u => u.id === msg.from);
      const nick = user ? user.nick : "unknown";

      if (!confirm(`${nick} | ${msg.from} から通話のリクエストが来ています`)) return;

      currentTarget = msg.from;
      callState.mode = "p2p";
      setCallStatus("着信中…");

      // ★ ここでは Peer / Media を触らない
    }


    /* offer（着信側開始点） */
    if (msg.type === "offer") {
      // ★ offer が来たら必ず Peer を用意
      if (!pc) {
        createPeer();          // ← 先に作る
        await pc.setRemoteDescription(msg.sdp);
        await startMedia();    // ← メディア後
        attachLocalTracks(pc);
      }

      currentTarget ??= msg.from;

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      ws.send(JSON.stringify({
        app: "voice",
        type: "answer",
        to: currentTarget,
        sdp: answer
      }));

      callState.mode = "p2p";
      setCallStatus("通話中");
    }


    if (msg.type === "answer") {
      await pc.setRemoteDescription(msg.sdp);
      callState.mode = "p2p";
      setCallStatus("通話中");
    }

    if (msg.type === "ice") {
      if (!pc) {
        console.warn("ICE received but pc is null, ignored");
        return;
      }
      await pc.addIceCandidate(msg.candidate);
    }

    if (msg.type === "end") {
      endCall(false);
      alert("通話を終了しました。");
    }

    // ===============================
    // グループ通話 WS
    // ===============================
    if (msg.type === "group-joined") {
      if(msg.to !== userID) return;
      console.log(`まだ入っていない側:グループ(${msg.group})に参加しました。webRTCの接続を開始します...`);
      console.log("メンバー一覧:",msg.members);
      await startMedia();

      for (const uid of msg.members) {
        if (uid === userID){
          console.log("自分を除外:",uid);
          continue;//自分を除外
        }

        // ★ ここで「初対面か」を判断
        /*if (callState.peers.has(uid)){
          console.log("初対面ではないので除外:",uid);
          continue;
        }一旦無効化*/

        const pc = await createGroupPeer(uid);
        console.log(`${uid}とpeerを作成:`, pc);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        ws.send(JSON.stringify({
          app: "voice",
          type: "group-offer",
          to: uid,
          sdp: offer
        }));
      }
    }

    if (msg.type === "user-left") {
      if (callState.mode !== "group") return;

      const pc = callState.peers.get(msg.userId);
      if (pc) {
        pc.close();
        callState.peers.delete(msg.userId);
        removeRemoteVideo(msg.userId);
      }
    }

    if (msg.type === "group-offer") {
      await startMedia();
      console.log(`すでに入っている側: ${msg.from} からofferを受け取りました`);
      const pc = await createGroupPeer(msg.from);
      console.log(`${msg.from}とpeerを作成しました:`, pc);

      // ★ ここでは state を見ない
      await pc.setRemoteDescription(msg.sdp);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      ws.send(JSON.stringify({
        app: "voice",
        type: "group-answer",
        to: msg.from,
        sdp: answer
      }));

      // answer / offer 後 ICEキューを処理
      if (iceQueue.has(msg.from)) {
        for (const c of iceQueue.get(msg.from)) {
          await pc.addIceCandidate(c);
        }
        iceQueue.delete(msg.from);
      }
      setCallStatus("グループ通話中");
    }

    if (msg.type === "group-answer") {
      if (callState.mode !== "group") return;
      console.log("まだ入っていない側:answerを受け取りました");
      const pc = callState.peers.get(msg.from);
      if (pc && pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(msg.sdp);
      }

      // answer / offer 後 ICEキューを処理
      if (iceQueue.has(msg.from)) {
        for (const c of iceQueue.get(msg.from)) {
          await pc.addIceCandidate(c);
        }
        iceQueue.delete(msg.from);
      }
    }

    if (msg.type === "group-ice") {
      const pc = callState.peers.get(msg.from);
      if (!pc) return;

      if (pc.remoteDescription) {
        await pc.addIceCandidate(msg.candidate);
      } else {
        //キューに登録
        if (!iceQueue.has(msg.from)) iceQueue.set(msg.from, []);
        iceQueue.get(msg.from).push(msg.candidate);
      }
    }


    //グループ作成通知
    if (msg.type === "group-created") {
      
      currentGroupId = msg.group.id;

      if(msg.owner === userID){
        console.log("オーナー自動参加:", msg.group.id);
        joinGroupCall(msg.group.id, true);
        //参加処理
      }

    }

    if (msg.type === "group-list-update") {
      //UI更新だけ
      const groups = msg.groups.map(g => ({
        id: g.groupId,
        name: g.groupName,
        callingCount: g.memberCount,
        members:g.member
      }));

      renderGroupList(groups);
      
    }

    if (msg.type === "group-users-update") {
      if (callState.mode !== "group") return;
      //UI更新
      console.log("グループのユーザー更新:", msg.groupId);
      const el = document.querySelector(`.group-joined-user[data-group-id="${msg.groupId}"]`);
      let html = "";
      let k = msg.memberCount;
      while (k > 0) {
        k--; // ← 先にデクリメント
        const id = msg.members[k];
        const nick = userList.find(u => u.id === id)?.nick ?? "unknown";
        html += `<li>${nick} | ${id}</li>`;
      }
      console.log("更新後のhtml:",html);
      el.innerHTML = html;
    }

    if(msg.type === "group-leave-user"){
      if (callState.mode !== "group" || msg.leave === userID) return;
      removeRemoteVideo(msg.leave);
    }

  };

  ws.onclose = () => {
    if (callState.mode === "group") {
      leaveGroupCall();
    }
    wsCon = false;
    setTimeout(connectWebSocket, 1000);
  };
}

connectWebSocket();

/* ===============================
   発信
================================ */
async function startcall(targetId) {
  if (callState.mode !== "idle") return;

  callState.mode = "p2p";
  setCallStatus("発信中…");
  currentTarget = targetId;

  ws.send(JSON.stringify({
    app: "voice",
    type: "call",
    from: userID,
    to: targetId
  }));

  createPeer();
  await startMedia();      // ★ 先
  attachLocalTracks(pc);   // ★ addTrack

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  ws.send(JSON.stringify({
    app: "voice",
    type: "offer",
    to: targetId,
    sdp: offer
  }));
}


/* ===============================
   通話終了
================================ */
function endCall(sendSignal = true) {
  if (sendSignal && currentTarget) {
    ws.send(JSON.stringify({
      app: "voice",
      type: "end",
      to: currentTarget
    }));
  }

  pc?.close();
  pc = null;

  localStream?.getTracks().forEach(t => t.stop());
  localStream = null;

  audioTrack = null;
  videoTrack = null;

  remoteStream = null;
  currentTarget = null;

  remoteAudio.srcObject = null;
  remoteVideo.srcObject = null;
  localVideo.srcObject  = null;

  callState.mode = "idle";
  setCallStatus("待機中");
}

/*
グループ通話終了
*/
function cleanupGroupCall() {
  for (const pc of callState.peers.values()) {
    try {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.close();
    } catch {}
  }

  callState.peers.clear();
  iceQueue.clear();

  callState.groupId = null;
  callState.mode = "idle";

}


function leaveGroupCall() {
  if (callState.mode !== "group") return;

  ws.send(JSON.stringify({
    app: "voice",
    userId: userID,
    type: "group-leave"
  }));

  for (const uid of callState.peers.keys()) {
    removeRemoteVideo(uid);
  }

  cleanupGroupCall();

  //初期化処理
  localStream?.getTracks().forEach(t => t.stop());
  localStream = null;

  audioTrack = null;
  videoTrack = null;
  localVideo.srcObject = null;

  //callState.peers = null;

  setCallStatus("待機中");
}

function endAnyCall() {
  if (callState.mode === "p2p") {
    endCall();
  }
  if (callState.mode === "group") {
    leaveGroupCall();
  }
}




/* ===============================
   UI 操作
================================ */
document.querySelector(".callEnd").onclick = () => {
  if (callState.mode === "idle") return;
  if (confirm("通話を終了しますか？")) endAnyCall();
};

document.querySelector(".mic").onchange = (e) => {
  micEnabled = e.target.checked;
  if (audioTrack) audioTrack.enabled = micEnabled;
};

document.querySelector(".cam").onchange = (e) => {
  camEnabled = e.target.checked;
  if (videoTrack) videoTrack.enabled = camEnabled;
};



//websocket再接続待機関数
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



// ==================================================
// ユーザー一覧・ステータス取得
// ==================================================
const userAPI = "https://tool-webs.onrender.com/webchat/user";
const userListDiv = document.getElementById("userList");

async function requestUserStatus(){
  // WebSocket 状態チェック（OPEN のときだけ送る）
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  await waitwscon(ws);
  /*ws.send(JSON.stringify({
    app:"webchat",
    type:"chatping",
    userID:userID,
  }));*/
  ws.send(JSON.stringify({
    app:"webchat",
    type:"getUserStatus"
  }));
}

// 最終ログイン時間からステータス判定
function detectStatus(lastTime) {
  const now = Date.now();
  const last = new Date(lastTime).getTime();
  const diff = (now - last) / 1000;

  if (diff < 30) return "online";
  if (diff < 60) return "away";
  return "offline";
}

// UI更新

async function updateUserStatus(data) {
  userListDiv.innerHTML = "";
  const users = data; 
  users.forEach(u => {
    if (u.userID === userID) return;
    const status = detectStatus(u.last_ping);
    const div = document.createElement("div");
    div.classList.add("user-item");
    div.innerHTML = `
      <div class="status-dot status-${status}"></div>
      <div class="user-nick">${u.nickname} | ${u.userID}</div>
      ${status === "online" || status === "away" ? `
        <button onclick="startcall('${u.userID}');" class="startCall">
          <svg width="148.31" height="200" viewBox="0 0 148.31 200"><g transform="translate(-16.77 -262.768)"><path class="a" d="M72.1,267.978a10.381,10.381,0,0,0-14.213-3.806L43.9,272.245l-5.322,3.073-16.045,9.263a11.488,11.488,0,0,0-4.214,15.728l41.943,72.648,6.579,11.4L108.789,457a11.489,11.489,0,0,0,15.728,4.214l16.045-9.263,5.322-3.073,13.983-8.073a10.381,10.381,0,0,0,3.81-14.211l-20-34.644a10.384,10.384,0,0,0-14.214-3.809l-13.983,8.073L98.184,366.26l-6.579-11.4L74.31,324.909l13.983-8.073A10.384,10.384,0,0,0,92.1,302.621Z" transform="translate(0 0)"/></g></svg>
        </button>
      ` : ""}
    `;
    userListDiv.appendChild(div);
  });
}
/*async function updateUserStatus() {
  try {
    const res = await fetch(userAPI);
    const users = await res.json();
    userList = users;

    userListDiv.innerHTML = "";

    users.forEach(u => {
      if (u.id === userID) return;

      const status = detectStatus(u.lastTime);

      const div = document.createElement("div");
      div.classList.add("user-item");

      div.innerHTML = `
        <div class="status-dot status-${status}"></div>
        <div class="user-nick">${u.nick} | ${u.id}</div>
        ${status === "online" || status === "away" ? `
          <button onclick="startcall('${u.id}');" class="startCall">
            <svg width="148.31" height="200" viewBox="0 0 148.31 200"><g transform="translate(-16.77 -262.768)"><path class="a" d="M72.1,267.978a10.381,10.381,0,0,0-14.213-3.806L43.9,272.245l-5.322,3.073-16.045,9.263a11.488,11.488,0,0,0-4.214,15.728l41.943,72.648,6.579,11.4L108.789,457a11.489,11.489,0,0,0,15.728,4.214l16.045-9.263,5.322-3.073,13.983-8.073a10.381,10.381,0,0,0,3.81-14.211l-20-34.644a10.384,10.384,0,0,0-14.214-3.809l-13.983,8.073L98.184,366.26l-6.579-11.4L74.31,324.909l13.983-8.073A10.384,10.384,0,0,0,92.1,302.621Z" transform="translate(0 0)"/></g></svg>
          </button>
        ` : ""}
      `;

      userListDiv.appendChild(div);
    });

  } catch (err) {
    console.error("ユーザー一覧取得エラー:", err);
  }
}*/

// 初回 & 定期更新
requestUserStatus();
setInterval(requestUserStatus, 5000);



//グループ通話のUI生成関数群
function createGroupItem(group) {
  const groupItem = document.createElement("div");
  groupItem.className = "group-item";
  groupItem.dataset.groupId = group.id;

  /* ===== グループ名 ===== */
  const groupName = document.createElement("div");
  groupName.className = "group-name";
  groupName.textContent = group.name +" | "+ group.id;

  const callButton = document.createElement("button");
  callButton.className = "group-call startCall";
  callButton.dataset.groupId = group.id;

  callButton.innerHTML = `<svg width="148.31" height="200" viewBox="0 0 148.31 200"><g transform="translate(-16.77 -262.768)"><path class="a" d="M72.1,267.978a10.381,10.381,0,0,0-14.213-3.806L43.9,272.245l-5.322,3.073-16.045,9.263a11.488,11.488,0,0,0-4.214,15.728l41.943,72.648,6.579,11.4L108.789,457a11.489,11.489,0,0,0,15.728,4.214l16.045-9.263,5.322-3.073,13.983-8.073a10.381,10.381,0,0,0,3.81-14.211l-20-34.644a10.384,10.384,0,0,0-14.214-3.809l-13.983,8.073L98.184,366.26l-6.579-11.4L74.31,324.909l13.983-8.073A10.384,10.384,0,0,0,92.1,302.621Z"/></g></svg>`;
  groupName.appendChild(callButton);

  /* ===== 人数 ===== */
  const groupInfo = document.createElement("div");
  groupInfo.className = "group-info";
  groupInfo.textContent = `現在 ${group.callingCount}人 通話中`;

  /* ===== メンバー（空で作る） ===== */
  const groupMember = document.createElement("div");
  groupMember.className = "group-member";

  const details = document.createElement("details");
  details.className = "accordion";

  const summary = document.createElement("summary");
  summary.className = "accordion_title";
  summary.textContent = "参加中のメンバー:";

  const memberList = document.createElement("ul");
  memberList.className = "group-joined-user";
  memberList.dataset.groupId = group.id;

  details.appendChild(summary);
  details.appendChild(memberList);
  groupMember.appendChild(details);

  /* ===== 組み立て ===== */
  groupItem.append(groupName, groupInfo, groupMember);
  return groupItem;
}

//差分更新関数
function updateGroupItem(el, group) {
  const info = el.querySelector(".group-info");
  if (info) {
    info.textContent = `現在 ${group.callingCount}人 通話中`;
  }
}



//差分更新のラッパー関数
function renderGroupList(groups) {
  var groupList = document.getElementById("groupList");
  // 現在DOMに存在する groupId 一覧
  const existingItems = new Map();

  document.querySelectorAll(".group-item").forEach(item => {
    existingItems.set(item.dataset.groupId, item);
  });

  // --- 追加・更新 ---
  groups.forEach(group => {
    const existing = existingItems.get(group.id);

    if (!existing) {
      // 🟢 新規追加
      const el = createGroupItem(group);
      groupList.appendChild(el);
      return;
    }

    // 🟡 既存 → 差分更新
    updateGroupItem(existing, group);

    // 処理済みとして削除
    existingItems.delete(group.id);
  });

  // --- 削除 ---
  existingItems.forEach(item => {
    item.remove();
  });
}



//グループの作成テスト
/*var groupData = {
  id: "KcuDuv",
  name: "グループ名",
  callingCount: 0,
  members: [
    "taisei|kDdKD",
    "user2|AbC12"
  ]
};

var groupList = document.getElementById("groupList");

var groupItemElement = createGroupItem(groupData);
groupList.appendChild(groupItemElement);

*/

function joinGroupCall(groupId, first) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert("WebSocket未接続です");
    return;
  }

  if (callState.mode !== "idle") {
    alert("すでに通話中です");
    return;
  }

  currentTarget = null;


  callState.mode = "group";
  callState.groupId = groupId;
  callState.peers.clear();

  ws.send(JSON.stringify({
    app: "voice",
    type: "group-join",
    groupId,
    first: first?true:false,
    userId: userID
  }));

  setCallStatus("グループ通話に参加中…");
}


document.addEventListener("click", (e) => {
  const btn = e.target.closest(".group-call");
  if (!btn) return;

  const groupId = btn.dataset.groupId;
  if (!groupId) return;

  joinGroupCall(groupId);
});


document.getElementById("makegroup").onclick = () => {
  const name = prompt("グループ名を決めてください。");
  if (!name) return;

  ws.send(JSON.stringify({
    app: "voice",
    type: "group-create",
    owner: userID,
    groupName: name,
  }));
};
