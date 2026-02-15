const sbody = document.getElementById("sbody");

function dc(subject){
  const es = [];
  subject.forEach(e=>{
    let tr = document.createElement("tr");
    let tb_a = document.createElement("td");
    let tb_b = document.createElement("td");
    let tb_c = document.createElement("td");
    console.log(e[0]);
    tb_a.innnerText = e[0];
    tb_b.innnerText = e[1];
    tb_c.innnerText = e[2].join(", ");
    tr.appendChild(tb_a);
    tr.appendChild(tb_b);
    tr.appendChild(tb_c);
    es.push(tr);
  });
  sbody.innerHTML = "";
  es.forEach(e=>{
    sbody.appendChild(e);
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
