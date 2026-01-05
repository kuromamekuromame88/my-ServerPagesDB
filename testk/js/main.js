const SUBJECTS = [
  { name: "国語", id: "kokugo" },
  { name: "数学", id: "suugaku" },
  { name: "英語", id: "eigo" },
  { name: "社会", id: "shakai" },
  { name: "理科", id: "rika" },
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
    scores: {}
  });

  saveRows(rows);
  renderRows();
}

/* ===== 行の描画 ===== */

function renderRows() {
  const rows = loadRows();
  let html = "";

  rows.forEach((row, rowIndex) => {
    html += `<div style="margin-bottom:8px;">`;

    html += `
      <input type="date"
        value="${row.date}"
        onchange="updateDate(${rowIndex}, this.value)" width="150px">
    `;

    SUBJECTS.forEach((sub, subIndex) => {
      const v = row.scores[sub.id] ?? "";
      html += `${SUBJECTS[subIndex].name}:
        <input type="number"
          min="0" max="100"
          value="${v}"
          style="width:60px"
          onchange="updateScore(${rowIndex}, '${sub.id}', this.value)">
      `;
    });

    html += `</div>`;
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

function updateScore(index, subjectId, value) {
  const rows = loadRows();
  rows[index].scores[subjectId] = Number(value);
  saveRows(rows);
  renderStats();
}

/* ===== 統計 ===== */

function renderStats() {
  const rows = loadRows();
  let html = "<h3>教科別平均</h3>";

  SUBJECTS.forEach(sub => {
    const values = rows
      .map(r => r.scores[sub.id])
      .filter(v => v !== undefined);

    if (values.length === 0) return;

    const avg = (
      values.reduce((a, b) => a + b, 0) / values.length
    ).toFixed(1);

    html += `<div>${sub.name}: 平均 ${avg}</div>`;
  });

  document.querySelector(".cells").innerHTML = html;
}

/* ===== 初期表示 ===== */

renderRows();
