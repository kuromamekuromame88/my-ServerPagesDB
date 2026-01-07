class IframeWindow {
  constructor() {}

  win(name, option = {}) {
    const state = {
      x: option.pos?.[0] ?? 0,
      y: option.pos?.[1] ?? 0,
      w: option.size?.w ?? 320,
      h: option.size?.h ?? 220,
      maximized: false,
      prev: null
    };

    const body = document.body;

    const win = document.createElement("div");
    Object.assign(win.style, {
      position: "fixed",
      background: "#fff",
      zIndex: 1000000,
      boxShadow: "0 6px 20px rgba(0,0,0,.2)",
      display: "flex",
      flexDirection: "column"
    });

    function applyRect() {
      win.style.left   = state.x + "px";
      win.style.top    = state.y + "px";
      win.style.width  = state.w + "px";
      win.style.height = state.h + "px";
    }

    applyRect(); // ★ 生成時に必ず反映

    // ===== Top Bar =====
    const bar = document.createElement("div");
    Object.assign(bar.style, {
      height: "32px",
      background: "#dedede",
      cursor: "move",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 6px",
      userSelect: "none",
      touchAction: "none"
    });

    const title = document.createElement("span");
    title.textContent = name;

    const btnMax = document.createElement("button");
    btnMax.textContent = "□";

    const btnClose = document.createElement("button");
    btnClose.textContent = "×";

    const btns = document.createElement("div");
    btns.append(btnMax, btnClose);
    bar.append(title, btns);

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

    // ===== Drag =====
    bar.addEventListener("pointerdown", e => {
      if (state.maximized) return;

      const sx = e.clientX;
      const sy = e.clientY;
      const ox = state.x;
      const oy = state.y;

      iframe.style.pointerEvents = "none";
      bar.setPointerCapture(e.pointerId);

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
      if (state.maximized) return;

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

    // ===== Maximize =====
    btnMax.onclick = () => {
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

    return {
      el: win,
      iframe,
      close: () => win.remove()
    };
  }
}
