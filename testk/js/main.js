const subjects = [
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

let scoreData = loadScores();

/* 入力欄生成 */
function setinput(count) {
  let html = "";

  for (let i = count - 1; i >= 0; i--) {
    html += `
      <div>
        ${subjects[i].name}
        <input type="number" id="${subjects[i].id}" min="0" max="100">
      </div>
    `;
  }

  html += `<button onclick="saveScores()">保存</button>`;
  document.getElementById("subjects").innerHTML = html;
}

/* 保存 */
function saveScores() {
  subjects.forEach(sub => {
    const input = document.getElementById(sub.id);
    if (!input || input.value === "") return;

    const score = Number(input.value);
    if (!scoreData[sub.id]) scoreData[sub.id] = [];
    scoreData[sub.id].push(score);
  });

  localStorage.setItem("scores", JSON.stringify(scoreData));
  renderStats();
}

/* 読み込み */
function loadScores() {
  const data = localStorage.getItem("scores");
  return data ? JSON.parse(data) : {};
}

/* 統計計算 */
function calcStats(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return {
    avg: (sum / arr.length).toFixed(1),
    max: Math.max(...arr),
    min: Math.min(...arr)
  };
}

/* 表示 */
function renderStats() {
  let html = "<h3>統計</h3>";

  subjects.forEach(sub => {
    const data = scoreData[sub.id];
    if (!data) return;

    const stats = calcStats(data);
    html += `
      <div>
        <b>${sub.name}</b>  
        平均: ${stats.avg}  
        最高: ${stats.max}  
        最低: ${stats.min}
      </div>
    `;
  });

  document.querySelector(".cells").innerHTML = html;
}

renderStats();
