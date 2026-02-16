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
    tb_e.classList.add("notEdit");
    tb_a.textContent = e[0];
    tb_b.textContent = e[1];
    tb_c.textContent = e[2].join(", ");

    tr.append(tb_e, tb_a, tb_b, tb_c);
    sbody.appendChild(tr);
  });
  loading.style.display = "none";
}

async function openSchedule(day, cde, ){
  if(!day) return;
  document.getElementById("calendar").querySelectorAll("td").forEach(e=>{
    e.style.outline = "solid 1px #ddd;";
  });
  cde.style.outline = "solid 2px #000";
  const sp = day.split("-");
  const d = `${sp[0]}${sp[1]>9?sp[1]:"0"+sp[1]}${sp[2]>9?sp[2]:"0"+sp[2]}`;
  loading.style.display = "block";
  const s = await fetch(`https://tool-webs.onrender.com/ayumi?day=${d}`);
  const res = await s.json();
  if(!res || res.day != d){
    let tr = document.createElement("tr");
    let tb_e = document.createElement("td");
    let tb_a = document.createElement("td");
    tb_e.textContent = "まだ予定が書き込まれていません。";
    tb_e.classList.add("undef");
    tb_a.innerHTML = `<button onclick="make(true)" class="make">予定を書き込む</button>`;
    tb_a.classList.add("undef");
    sbody.innerHTML = "";
    tr.append(tb_e, tb_a);
    sbody.appendChild(tr);
    loading.style.display = "none";
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

function make(f){
  if(f){
    const d = [["","",[""]],["","",[""]],["","",[""]],["","",[""]],["","",[""]],["","",[""]]];
    dc(d);
  }
  const el = document.querySelectorAll(`#sbody td:not(.notEdit)`);
  el.forEach(e=>{
    let a = e.textContent;
    e.innerHTML=`<textarea id="s">${a}</textarea>`;
  });
  slide.checked = true;
}

function resave(){
  const el = document.querySelectorAll(`#sbody td:not(.notEdit)`);
  el.forEach(e=>{
    const text = e.querySelector("textarea");
    let a = text.value;
    e.innerHTML=`${a}`;
  });
  slide.checked = false;
}

const slide = document.getElementById("slide");
slide.addEventListener("change", async()=>{
  //alert(slide.checked);
  if(slide.checked){
    make();
  }else{
    resave();
  }
});