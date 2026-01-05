const SUBJECTS_5 = [
  { name: "国語", id: "kokugo" },
  { name: "数学", id: "suugaku" },
  { name: "英語", id: "eigo" },
  { name: "社会", id: "shakai" },
  { name: "理科", id: "rika" }
];

const SUBJECTS_9 = [
  ...SUBJECTS_5,
  { name: "音楽", id: "onngaku" },
  { name: "美術", id: "bizyutu" },
  { name: "保健体育", id: "hokenntaiiku" },
  { name: "技術家庭科", id: "gizyutukateika" }
];

const STORAGE_KEY = "test_rows";

/* ===== localStorage ===== */

function loadRows() {
  const d = localStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : [];
}

function saveRows(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

/* ===== 新しい行を追加 ===== */

function setinput() {
  const rows = loadRows();

  rows.push({
    date: new Date().toISOString().slice(0, 10),
    type: 5,        // デフォルトは5教科
    scores: {}
  });

  saveRows(rows);
  renderRows();
}

/* ===== 行削除 ===== */

function deleteRow(index) {
  const rows = loadRows();
  rows.splice(index, 1);
  saveRows(rows);
  renderRows();
}

/* ===== 行描画 ===== */

function renderRows() {
  const rows = loadRows();
  let html = "";

  rows.forEach((row, rowIndex) => {
    const subjects = row.type === 9 ? SUBJECTS_9 : SUBJECTS_5;

    html += `<div style="margin-bottom:8px;">`;

    // 日付
    html += `
      <input type="date"
        value="${row.date}"
        onchange="updateDate(${rowIndex}, this.value)">
    `;

    // テスト種別
    html += `
      <select onchange="updateType(${rowIndex}, this.value)">
        <option value="5" ${row.type === 5 ? "selected" : ""}>5教科</option>
        <option value="9" ${row.type === 9 ? "selected" : ""}>9教科</option>
      </select>
    `;

    // 教科入力
    subjects.forEach(sub => {
      const v = row.scores[sub.id] ?? "";
      html += `
        ${sub.name}:
        <input type="number"
          min="0" max="100"
          value="${v}"
          style="width:60px"
          onchange="updateScore(${rowIndex}, '${sub.id}', this.value)">
        |
      `;
    });

    html += `
      <button onclick="deleteRow(${rowIndex})">削除</button>
    </div>`;
  });

  document.getElementById("subjects").innerHTML = html;
  renderStats();
}

/* ===== 更新処理 ===== */

function updateDate(index, value) {
  const rows = loadRows();
  rows[index].date = value;
  saveRows(rows);
}

function updateType(index, value) {
  const rows = loadRows();
  rows[index].type = Number(value);
  saveRows(rows);
  renderRows(); // 教科枠を再構築
}

function updateScore(index, subjectId, value) {
  const rows = loadRows();
  rows[index].scores[subjectId] = Number(value);
  saveRows(rows);
  renderStats();
}

/* ===== 統計 ===== */

function renderStats() {
  const rows = loadRows();
  let html = "<h3>教科別統計</h3>";

  const ALL_SUBJECTS = SUBJECTS_9;

  ALL_SUBJECTS.forEach(sub => {
    const values = rows
      .map(r => r.scores[sub.id])
      .filter(v => typeof v === "number");

    if (values.length === 0) return;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = (sum / values.length).toFixed(1);
    const min = Math.min(...values);
    const max = Math.max(...values);

    html += `
      <div>
        <b>${sub.name}</b>｜
        平均: ${avg}｜
        最低: ${min}｜
        最高: ${max}
      </div>
    `;
  });

  document.querySelector(".cells").innerHTML = html;
}

/* ===== 初期表示 ===== */

renderRows();
