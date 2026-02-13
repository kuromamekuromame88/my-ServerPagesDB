class Calender {
  calender(pdiv, h, w){

    function TabFill(c){
      //上部のタブ描画
    }
    function MainFill(c){
      //カレンダーセル描画
      
    }
    function create(pdiv, h, w){
      //本体の要素作成
      const c = document.createElement("div");
      c.classList.add("CalenderBody");
      c.style.background = "#dedede";
      c.style.height = typeof h === Number ? h :h+"px";
      c.style.width = typeof w === Number ? w : w+"px";

      const tab = c.createElement("div");
      tab.classList.add("CalenderTab");
      tab.style.position = "fixed";
      tab.style.background = "#cecece";
      tab.style.height = "10%";
      tab.style.width = "100%";

      const main = c.createElement("div");
      main.classList.add("CalenderMain");
      tab.style.position = "fixed";
      tab.style.background = "#cecece";
      tab.style.marginTop = "10%";
      tab.style.height = "70%";
      tab.style.width = "80%";

      c.appendChild(tab);
      c.appendChild(main);
      TabFill(c);
      MainFill(c);
    }
    create(pdiv, h, w);
    return {
      
    }
  }
}