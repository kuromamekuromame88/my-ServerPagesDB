class IframeWindow {
  static topZ = 1000000;

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
      win.style.left = state.x + "px";
      win.style.top = state.y + "px";
      win.style.width = state.w + "px";
      win.style.height = state.h + "px";
    }

    applyRect();

    /* ===== Top Bar ===== */
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

    /* ===== SVG Button Factory ===== */
    function makeBtn(svg) {
      const b = document.createElement("button");
      b.innerHTML = svg;
      Object.assign(b.style, {
        width: "28px",
        height: "22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        padding: "0",
        cursor: "pointer"
      });

      // ★ ドラッグ判定を奪わせない
      ["pointerdown", "mousedown", "touchstart"].forEach(ev =>
        b.addEventListener(ev, e => e.stopPropagation())
      );

      return b;
    }

    const btnMin = makeBtn(`
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line x1="3" y1="8" x2="13" y2="8"
          stroke="black" stroke-width="1.5"/>
      </svg>
    `);

    const btnMax = makeBtn(`
      <svg width="16" height="16" viewBox="0 0 16 16">
        <rect x="3" y="3" width="10" height="10"
          fill="none" stroke="black" stroke-width="1.5"/>
      </svg>
    `);

    const btnClose = makeBtn(`
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line x1="4" y1="4" x2="12" y2="12"
          stroke="black" stroke-width="1.5"/>
        <line x1="12" y1="4" x2="4" y2="12"
          stroke="black" stroke-width="1.5"/>
      </svg>
    `);

    const btns = document.createElement("div");
    btns.append(btnMin, btnMax, btnClose);
    bar.append(title, btns);

    /* ===== iframe ===== */
    const iframe = document.createElement("iframe");
    iframe.style.flex = "1";
    iframe.style.border = "none";

    if (option.content?.type === "web") {
      iframe.src = option.content.con;
    } else {
      iframe.srcdoc = option.content?.con ?? "";
    }

    /* ===== Resize Handle ===== */
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

    /* ===== Drag ===== */
    bar.addEventListener("pointerdown", e => {
      if (state.maximized || state.minimized) return;

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

    /* ===== Resize ===== */
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

    /* ===== Minimize ===== */
    btnMin.onclick = () => {
      focus();
      if (!state.minimized) {
        state.prevSize = state.h;
        resize.style.display = "none";
        iframe.style.display = "none";
        state.h = BAR_HEIGHT;
      } else {
        iframe.style.display = "block";
        resize.style.display = state.maximized ? "none" : "block";
        state.h = state.prevSize;
      }
      state.minimized = !state.minimized;
      applyRect();
    };

    /* ===== Maximize ===== */
    btnMax.onclick = () => {
      focus();
      if (!state.maximized) {
        state.prev = { ...state };
        state.x = 0;
        state.y = 0;
        state.w = innerWidth;
        state.h = innerHeight;
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
