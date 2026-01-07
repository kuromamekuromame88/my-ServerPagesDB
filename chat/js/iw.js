class IframeWindow {
  constructor() {}

  win(name, option = {}) {
    const state = {
      title: name,
      pos: option.pos || [0, 0],
      size: option.size || [320, 220],
      content: option.content || { type: "html", con: "" },
      style: option.style || {},
      maximized: false,
      prevPos: null,
      prevSize: null
    };

    const body = document.body;

    /* ===== ウィンドウ本体 ===== */
    const newwin = document.createElement("div");
    Object.assign(newwin.style, {
      position: "fixed",
      left: state.pos[0] + "px",
      top: state.pos[1] + "px",
      width: state.size[0] + "px",
      height: state.size[1] + "px",
      zIndex: 1000000,
      background: "#fff",
      border: "1px solid #888",
      boxSizing: "border-box"
    });
    Object.assign(newwin.style, state.style);

    /* ===== タイトルバー ===== */
    const toptab = document.createElement("div");
    Object.assign(toptab.style, {
      height: "32px",
      backgroundColor: "#dedede",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 6px",
      userSelect: "none",
      cursor: "grab",
      boxSizing: "border-box",

      /* ★ 超重要 */
      touchAction: "none"
    });

    const wintitle = document.createElement("span");
    wintitle.innerText = state.title;
    wintitle.style.fontSize = "12px";

    const btnArea = document.createElement("div");

    const btnMax = document.createElement("button");
    btnMax.textContent = "⬜";

    const btnMin = document.createElement("button");
    btnMin.textContent = "–";

    const btnClose = document.createElement("button");
    btnClose.textContent = "×";

    btnArea.append(btnMin, btnMax, btnClose);
    toptab.append(wintitle, btnArea);

    /* ===== iframe ===== */
    const cont = document.createElement("iframe");
    cont.style.width = "100%";
    cont.style.height = "calc(100% - 32px)";
    cont.style.border = "none";
    cont.style.display = "block";

    if (state.content.type === "web") {
      cont.src = state.content.con;
    } else {
      cont.srcdoc = state.content.con;
    }

    newwin.append(toptab, cont);
    body.appendChild(newwin);

    /* ===== ボタン動作 ===== */
    btnClose.onclick = () => newwin.remove();

    let minimized = false;
    btnMin.onclick = () => {
      minimized = !minimized;
      cont.style.display = minimized ? "none" : "block";
      newwin.style.height = minimized ? "32px" : state.size[1] + "px";
    };

    btnMax.onclick = () => {
      if (!state.maximized) {
        state.prevPos = [...state.pos];
        state.prevSize = [...state.size];
        newwin.style.left = "0px";
        newwin.style.top = "0px";
        newwin.style.width = "100vw";
        newwin.style.height = "100vh";
        state.maximized = true;
      } else {
        newwin.style.left = state.prevPos[0] + "px";
        newwin.style.top = state.prevPos[1] + "px";
        newwin.style.width = state.prevSize[0] + "px";
        newwin.style.height = state.prevSize[1] + "px";
        state.maximized = false;
      }
    };

    /* ===== ドラッグ（完全修正版） ===== */
    let dragging = false;
    let dragPointerId = null;
    let startPointer = null;
    let startPos = null;

    const endDrag = () => {
      dragging = false;
      dragPointerId = null;
      toptab.style.cursor = "grab";
    };

    toptab.addEventListener("pointerdown", (e) => {
      if (state.maximized) return;

      dragging = true;
      dragPointerId = e.pointerId;
      startPointer = [e.clientX, e.clientY];
      startPos = [...state.pos];

      toptab.setPointerCapture(e.pointerId);
      toptab.style.cursor = "grabbing";
    });

    toptab.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      if (e.pointerId !== dragPointerId) return;

      const dx = e.clientX - startPointer[0];
      const dy = e.clientY - startPointer[1];

      state.pos = [startPos[0] + dx, startPos[1] + dy];
      newwin.style.left = state.pos[0] + "px";
      newwin.style.top = state.pos[1] + "px";
    });

    /* ★ 重要：すべてで解除 */
    toptab.addEventListener("pointerup", endDrag);
    toptab.addEventListener("pointercancel", endDrag);
    toptab.addEventListener("lostpointercapture", endDrag);

    /* ===== API ===== */
    return {
      el: newwin,
      iframe: cont,

      set pos([x, y]) {
        state.pos = [x, y];
        newwin.style.left = x + "px";
        newwin.style.top = y + "px";
      },

      set size([w, h]) {
        state.size = [w, h];
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
