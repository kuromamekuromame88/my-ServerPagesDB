class IframeWindow {
  static topZ = 1000000;

  constructor() {}

  win(name, option = {}) {
    const BAR_HEIGHT = 32;

    const state = {
      x: option.pos?.[0] ?? 0,
      y: option.pos?.[1] ?? 0,
      w: option.size?.[0] ?? 320,
      h: option.size?.[1] ?? 220,
      maximized: false,
      minimized: false,
      prev: null,
      prevSize: null
    };

    const body = document.body;

    const win = document.createElement("div");
    Object.assign(win.style, {
      position: "fixed",
      background: "#fff",
      zIndex: ++IframeWindow.topZ,
      boxShadow: "0 6px 20px rgba(0,0,0,.2)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    });

    function focus() {
      win.style.zIndex = ++IframeWindow.topZ;
    }

    function applyRect() {
      win.style.left   = state.x + "px";
      win.style.top    = state.y + "px";
      win.style.width  = state.w + "px";
      win.style.height = state.h + "px";
    }

    applyRect();

    // ===== Top Bar =====
    const bar = document.createElement("div");
    Object.assign(bar.style, {
      height: BAR_HEIGHT + "px",
      background: "#dedede",
      cursor: "move",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 6px",
      userSelect: "none",
      touchAction: "none",
      flexShrink: "0"
    });

    const title = document.createElement("span");
    title.textContent = name;



    const btnMin = document.createElement("button");
    btnMin.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line x1="3" y1="8" x2="13" y2="8" stroke="black" stroke-width="1.5"/>
      </svg>
    `;
    btnMin.style.background = "#dedede";
    btnMin.style.border = "none";
    btnMin.style.outline = "none";

    btnMin.addEventListener("pointerenter", () => {
      btnMin.style.background = "#bebebe";
    })

    btnMin.addEventListener("pointerleave", () => {
      btnMin.style.background = "#dedede";
    });



    const btnMax = document.createElement("button");
    btnMax.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16">
        <rect x="3" y="3" width="8" height="8"
          fill="none" stroke="black" stroke-width="1.5"/>
      </svg>
    `;
    btnMax.style.background = "#dedede";
    btnMax.style.border = "none";
    btnMax.style.outline = "none";

    btnMax.addEventListener("pointerenter", () => {
      btnMax.style.background = "#bebebe";
    })

    btnMax.addEventListener("pointerleave", () => {
      btnMax.style.background = "#dedede";
    });



    const btnClose = document.createElement("button");
    btnClose.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line x1="4" y1="4" x2="12" y2="12"
          stroke="black" stroke-width="1.5"/>
        <line x1="12" y1="4" x2="4" y2="12"
          stroke="black" stroke-width="1.5"/>
      </svg>
    `;
    btnClose.style.background = "#de7c7c";
    btnClose.style.border = "none";
    btnClose.style.outline = "none";

    btnClose.addEventListener("pointerenter", () => {
      btnClose.style.background = "#de7c7c";
    })

    btnClose.addEventListener("pointerleave", () => {
      btnClose.style.background = "#dedede";
    });




    const btns = document.createElement("div");
    btns.append(btnMin, btnMax, btnClose);
    bar.append(title, btns);

    // ★ ボタンのイベントは上に伝えない
    [btnMin, btnMax, btnClose].forEach(btn => {
      btn.addEventListener("pointerdown", e => e.stopPropagation());
    });

    // ===== iframe =====
    const iframe = document.createElement("iframe");
    iframe.style.flex = "1";
    iframe.style.border = "none";

    if (option.content?.type === "web") {
      iframe.src = option.content.con;
    } else {
      iframe.srcdoc = option.content?.con ?? "";
    }

    // ===== Resize Handle =====
    const resize = document.createElement("div");
    Object.assign(resize.style, {
      position: "absolute",
      right: "0",
      bottom: "0",
      width: "16px",
      height: "16px",
      cursor: "nwse-resize",
      touchAction: "none"
    });

    win.append(bar, iframe, resize);
    body.appendChild(win);

    // ===== Focus =====
    win.addEventListener("pointerdown", focus);
    bar.addEventListener("pointerdown", focus);
    iframe.addEventListener("pointerdown", focus);

    // ===== Drag =====
    bar.addEventListener("pointerdown", e => {
      if (e.target !== bar) return;
      if (state.maximized || state.minimized) return;

      const sx = e.clientX;
      const sy = e.clientY;
      const ox = state.x;
      const oy = state.y;

      iframe.style.pointerEvents = "none";
      bar.setPointerCapture(e.pointerId);

      if(sy<=0) return;

      const move = ev => {
        state.x = ox + (ev.clientX - sx);
        state.y = oy + (ev.clientY - sy);
        applyRect();
      };

      const up = ev => {
        iframe.style.pointerEvents = "auto";
        bar.releasePointerCapture(ev.pointerId);
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };

      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });

    // ===== Resize =====
    resize.addEventListener("pointerdown", e => {
      if (state.maximized || state.minimized) return;

      const sx = e.clientX;
      const sy = e.clientY;
      const ow = state.w;
      const oh = state.h;

      iframe.style.pointerEvents = "none";
      resize.setPointerCapture(e.pointerId);

      const move = ev => {
        state.w = Math.max(200, ow + (ev.clientX - sx));
        state.h = Math.max(120, oh + (ev.clientY - sy));
        applyRect();
      };

      const up = ev => {
        iframe.style.pointerEvents = "auto";
        resize.releasePointerCapture(ev.pointerId);
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };

      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });

    // ===== Min / Max / Close =====
    btnMin.onclick = () => {
      focus();
      if (!state.minimized) {
        state.prevSize = state.h;
        resize.style.display = "none";
        iframe.style.display = "none";
        win.style.height = BAR_HEIGHT + "px";
      } else {
        iframe.style.display = "block";
        resize.style.display = state.maximized ? "none" : "block";
        win.style.height = state.prevSize + "px";
      }
      state.minimized = !state.minimized;
    };

    btnMax.onclick = () => {
      focus();
      if (state.minimized) btnMin.onclick();

      if (!state.maximized) {
        state.prev = { ...state };
        state.x = 0;
        state.y = 0;
        state.w = window.innerWidth;
        state.h = window.innerHeight;
        resize.style.display = "none";
      } else {
        Object.assign(state, state.prev);
        resize.style.display = "block";
      }
      state.maximized = !state.maximized;
      applyRect();
    };

    btnClose.onclick = () => win.remove();

    return { el: win, iframe, focus, close: () => win.remove() };
  }
}
