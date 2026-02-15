function dc(k, kk, y){
  console.log(k);
  console.log(kk);
  console.log(y);
}

let a;
let b;

async function openSchedule(day){
  if(!day) return;
  const sp = day.split("-");
  const d = `${sp[0]}${sp[1]>9?sp[1]:"0"+sp[1]}${sp[2]>9?sp[2]:"0"+sp[2]}`;
  const s = await fetch(`https://tool-webs.onrender.com/ayumi?day=${d}`);
  const res = await s.json();
  if(res.day != d || !res) return;
  //b = res;
  const subjects = res.schedule;
  a = subjects;
  console.log("s",subjects);
  subjects.forEach(e=>{
    var k = Object.keys(e)[0];
    var kk = Object.keys(e.k)[0];
    dc(k, kk, e[k][kk]);
    alert("k",k);
    alert("kk",kk);
    alert("e",e[k][kk]);
  });
  return subjects;
}
