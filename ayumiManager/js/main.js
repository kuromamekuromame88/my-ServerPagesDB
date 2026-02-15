const sbody = document.getElementById("sbody");

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
}

async function openSchedule(day){
  if(!day) return;
  const sp = day.split("-");
  const d = `${sp[0]}${sp[1]>9?sp[1]:"0"+sp[1]}${sp[2]>9?sp[2]:"0"+sp[2]}`;
  const s = await fetch(`https://tool-webs.onrender.com/ayumi?day=${d}`);
  const res = await s.json();
  if(res.day != d || !res) return;
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


//slideはcheckboxで作成
const slide = document.getElementById("slide");

slide.addEventListener("on" ,async()=>{
  alert("on");
});

slide.addEventListener("off" ,async()=>{
  alert("off");
});