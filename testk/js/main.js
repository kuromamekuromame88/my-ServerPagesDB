const SUBJECTS = [
  { name: "技術家庭科", id: "gizyutukateika" },
  { name: "音楽", id: "onngaku" },
  { name: "美術", id: "bizyutu" },
  { name: "保健体育", id: "hokenntaiiku" },
  { name: "英語", id: "eigo" },
  { name: "数学", id: "suugaku" },
  { name: "社会", id: "shakai" },
  { name: "理科", id: "rika" },
  { name: "国語", id: "kokugo" }
];

const STORAGE_KEY = "test_scores";

/* ========= localStorage ========= */

function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ========= 入力UI ========= */

function setinput(count) {
  let html = "";

  for (let i = count - 1; i >= 0; i--) {
    html += `
      <div>
        ${SUBJECTS[i].name}
        <input type="number" id="${SUBJECTS[i].id}" min="0" max="100">
      </div>
    `;
  }

  html += `<button onclick="addScores()">保存</button>`;
  document.getElementById("subjects").innerHTML = html;
}

/* ========= 点数追加 ========= */

function addScores() {
  const data = loadData();

  SUBJECTS.forEach(sub => {
    const input = document.getElementById(sub.id);
    if (!input || input.value === "") return;

    const score = Number(input.value);
    if (!data[sub.id]) data[sub.id] = [];
    data[sub.id].push(score);

    input.value = "";
  });

  saveData(data);
  renderStats();
}

/* ========= 統計 ========= */

function calcStats(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return {
    avg: (sum / arr.length).toFixed(1),
    max: Math.max(...arr),
    min: Math.min(...arr),
    lastDiff: arr.length >= 2 ? arr[arr.length - 1] - arr[arr.length - 2] : 0
  };
}

/* ========= 表示 ========= */

function renderStats() {
  const data = loadData();
  let html = "<h3>成績統計</h3>";

  SUBJECTS.forEach(sub => {
    const scores = data[sub.id];
    if (!scores) return;

    const s = calcStats(scores);
    html += `
      <div>
        <b>${sub.name}</b><br>
        回数: ${scores.length}　
        平均: ${s.avg}　
        最高: ${s.max}　
        最低: ${s.min}　
        前回差: ${s.lastDiff >= 0 ? "+" : ""}${s.lastDiff}
      </div>
    `;
  });

  document.querySelector(".cells").innerHTML = html;
}

/* ========= 初期描画 ========= */

renderStats();
