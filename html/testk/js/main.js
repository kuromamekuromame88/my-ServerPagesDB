function setinput(type){
  let html ="";
  let subjects = ["技術家庭科","音楽","美術","保健体育","英語","数学","社会","理科","国語"];
  let buttonids = ["gizyutukateika","onngaku","bizyutu","hokenntaiiku","eigo","suugaku","shakai","rika","kokugo"];
  while(type >= 1){
    html += `<br>${subjects[type-1]}<input type="number" id="${buttonids[type-1]}">`;
    type--;
  }
  document.getElementById("subjects").innerHTML = html;
}

setinput(9);

