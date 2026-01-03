const devices = {};

let a;

let ws;

function connect(){

ws = new WebSocket("wss://tool-webs.onrender.com/ws/wmqtt");

ws.onopen = () => {
  console.log("Connected to server");
  console.log("Registing to server...");
};


ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
  if(data.app !== "wmqtt") return;

  a = data;

  if (data.type === "device_online") {
    addDeviceCard(data.data.DeviceName, data.data.DeviceType, data.data.MACID);
  } else if (data.type === "device_offline") {
    removeDeviceCard(data.MACID);
  } else if (data.type === "recieve") {
    updateDeviceData(data.MACID, data.DataType, data.Data);
  }
};

ws.onclose = () => {
  connect();
}

}

connect();

function addDeviceCard(name, types, MACID) {
  if (devices[MACID]) return; // 既に存在するなら無視

  const card = document.createElement("div");
  card.className = "card";
  card.id = `card-${MACID}`;
  card.innerHTML = `
    <div class="title">${name}</div>
    <div class="status" id="status-${MACID}">online</div>
    <div class="data" id="data-${MACID}">待機中...</div>
    <div class="actions" id="actions-${MACID}"></div>
  `;

  document.getElementById("devices").appendChild(card);
  devices[MACID] = { types, card };

  // デバイスがlightならON/OFFボタンを追加
  if (types.includes("Light")) {
    const actions = document.getElementById(`actions-${MACID}`);
    const onBtn = document.createElement("button");
    onBtn.innerText = "ON";
    onBtn.className = "on";
    onBtn.onclick = () => sendCommand(MACID, "onoff", true);
    const offBtn = document.createElement("button");
    offBtn.innerText = "OFF";
    offBtn.className = "off";
    offBtn.onclick = () => sendCommand(MACID, "onoff", false);
    actions.appendChild(onBtn);
    actions.appendChild(offBtn);
  }
}

function removeDeviceCard(MACID) {
  const card = document.getElementById(`card-${MACID}`);
  if (card) card.remove();
  delete devices[MACID];
}

function updateDeviceData(MACID, dataType, data) {
  const dataDiv = document.getElementById(`data-${MACID}`);
  if (dataDiv) {
    dataDiv.innerHTML = `<b>${dataType}:</b> ${data}`;
  }
}

async function sendCommand(deviceID, setType, data) {
  if(!ws.readyState){
    console.warn("Websocket is not ready!");
    return;
  }
  ws.send(JSON.stringify({
    app: "wmqtt",
    type: "set",
    MACID: deviceID,
    setType: setType,
    state: data
  }));
}

function RequestThingsData(){
  if(!ws.readyState) return;
  ws.send(JSON.stringify({
    app: "wmqtt",
    type: "ODR"
  }));
}

RequestThingsData();
setInterval(RequestThingsData, 10000);
