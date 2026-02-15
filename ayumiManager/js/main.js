
async function openSchedule(day){
  if(!day) return;
  const d = day.replace(/a/g, "-");
  const s = await fetch(`https://tool-webs.onrender.com/ayumi?day=${d}`);
  const res = s.json();
  if(res.day != d) return;
  const subjects = res.schedule;
  console.log(subjects);
}
