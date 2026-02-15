const sbody = document.getElementById("sbody");
const loading = document.getElementById("loading");

function dc(subject){
  sbody.innerHTML = "";

  subject.forEach((e, a) => {
    let tr = document.createElement("tr");
    let tb_e = document.createElement("td");
    let tb_a = document.createElement("td");
    let tb_b = document.createElement("td");
    let tb_c = document.createElement("td");
    tb_e.textContent = a+1;
    tb_a.textContent = e[0];
    tb_b.textContent = e[1];
    tb_c.textContent = e[2].join(", ");

    tr.append(tb_e, tb_a, tb_b, tb_c);
    sbody.appendChild(tr);
  });
  loading.display = "none";
}

async function openSchedule(day){
  if(!day) return;
  const sp = day.split("-");
  const d = `${sp[0]}${sp[1]>9?sp[1]:"0"+sp[1]}${sp[2]>9?sp[2]:"0"+sp[2]}`;
  loading.display = "block";
  const s = await fetch(`https://tool-webs.onrender.com/ayumi?day=${d}`);
  const res = await s.json();
  if(!res || res.day != d){
    let tr = document.createElement("tr");
    let tb_e = document.createElement("td");
    let tb_a = document.createElement("td");
    tb_e.textContent = "まだ予定が書き込まれていません。";
    tb_a.innerHTML = `<button onclick="make()" class="make">予定を書き込む</button>`;
    sbody.innerHTML = "";
    tr.append(tb_e, tb_a);
    sbody.appendChild(tr);
    loading.display = "none";
    return;
  }
  const subjects = res.schedule;
  let sb = [];
  subjects.forEach(e=>{
    var k = Object.keys(e)[0];
    var kk = Object.keys(e[k])[0];
    sb.push([k, kk, e[k][kk]]);
  });
  dc(sb);
  return subjects;
}

//初期は非表示
loading.display = "none";

const slide = document.getElementById("slide");
slide.addEventListener("change" ,async()=>{
  alert(slide.checked);
});