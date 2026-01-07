class IframeWindow {
  constructor() {}

  win(name, option = {}) {
    const top = {
      title: name,
      pos: option.pos || [0, 0],
      size: option.size || [320, 220],
      content: option.content || { type: "html", con: "" },
      style: option.style || {}
    };

    const body = document.body;

    // ウィンドウ本体
    const newwin = document.createElement("div");
    newwin.classList.add(`win-${name}`);
    newwin.style.position = "fixed";
    newwin.style.left = top.pos[0] + "px";
    newwin.style.top = top.pos[1] + "px";
    newwin.style.width = top.size[0] + "px";
    newwin.style.height = top.size[1] + "px";
    newwin.style.zIndex = 1000000;
    newwin.style.background = "#fff";
    newwin.style.border = "1px solid #888";
    newwin.style.boxSizing = "border-box";

    Object.assign(newwin.style, top.style);

    /* ===== タイトルバー ===== */
    const toptab = document.createElement("div");
    toptab.style.height = "28px";
    toptab.style.backgroundColor = "#dedede";
    toptab.style.display = "flex";
    toptab.style.alignItems = "center";
    toptab.style.justifyContent = "space-between";
    toptab.style.padding = "0 6px";
    toptab.style.boxSizing = "border-box";
    toptab.style.userSelect = "none";

    // タイトル
    const wintitle = document.createElement("span");
    wintitle.innerText = top.title;
    wintitle.style.fontSize = "12px";

    // 操作ボタン
    const btnArea = document.createElement("div");

    const btnMin = document.createElement("button");
    btnMin.textContent = "–";

    const btnClose = document.createElement("button");
    btnClose.textContent = "×";

    btnArea.append(btnMin, btnClose);
    toptab.append(wintitle, btnArea);

    /* ===== iframe ===== */
    const cont = document.createElement("iframe");
    cont.style.width = "100%";
    cont.style.height = "calc(100% - 28px)";
    cont.style.border = "none";
    cont.style.display = "block";

    if (top.content.type === "web") {
      cont.src = top.content.con;
    } else {
      cont.srcdoc = top.content.con;
    }

    newwin.append(toptab, cont);
    body.appendChild(newwin);

    /* ===== ボタン動作 ===== */
    btnClose.onclick = () => newwin.remove();

    let minimized = false;
    btnMin.onclick = () => {
      minimized = !minimized;
      cont.style.display = minimized ? "none" : "block";
      newwin.style.height = minimized ? "28px" : top.size[1] + "px";
    };

    /* ===== 操作用API ===== */
    return {
      el: newwin,
      iframe: cont,

      set pos([x, y]) {
        newwin.style.left = x + "px";
        newwin.style.top = y + "px";
      },

      set size([w, h]) {
        newwin.style.width = w + "px";
        newwin.style.height = h + "px";
      },

      set title(t) {
        wintitle.innerText = t;
      },

      close() {
        newwin.remove();
      }
    };
  }
}
