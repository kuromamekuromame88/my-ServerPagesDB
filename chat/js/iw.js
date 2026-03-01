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
    win.setAttribute("id", `iw-${name}`);

    function focus() {
      win.style.zIndex = ++IframeWindow.topZ;
    }

    function applyRect() {
      win.style.left  = state.x + "px";
      win.style.top   = state.y + "px";
      win.style.width = state.w + "px";
      win.style.height = (state.minimized ? BAR_HEIGHT : state.h) + "px";
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
    title.style.padding = "30px";

    const buttonStyle = {
      margin: "2px",
      padding: "0px",
      height: "16px",
      width: "16px",
      border: "none",
      background: "#dedede",
    };

    const btnMin = document.createElement("button");
    btnMin.innerHTML = `<svg width="16" height="16"><line x1="3" y1="8" x2="13" y2="8" stroke="black"/></svg>`;
    const btnMax = document.createElement("button");
    btnMax.innerHTML = `<svg width="16" height="16"><rect x="4" y="4" width="8" height="8" fill="none" stroke="black"/></svg>`;
    const btnClose = document.createElement("button");
    btnClose.innerHTML = `<svg width="16" height="16"><line x1="4" y1="4" x2="12" y2="12" stroke="black"/><line x1="12" y1="4" x2="4" y2="12" stroke="black"/></svg>`;

    [btnMin, btnMax, btnClose].forEach(b => {
      Object.assign(b.style, buttonStyle);
      b.addEventListener("pointerdown", e => e.stopPropagation());
    });

    [btnMin,btnMax].forEach(b =>{
      b.addEventListener("pointerenter", () => {
        b.style.background = "#cecece";
      });
      b.addEventListener("pointerleave", () => {
        b.style.background = "#dedede";
      });
    });

    btnClose.addEventListener("pointerenter", () => {
      btnClose.style.background = "#de7c7c";
    });
    btnClose.addEventListener("pointerleave", () => {
      btnClose.style.background = "#dedede";
    });

    const btns = document.createElement("div");
    btns.append(btnMin, btnMax, btnClose);
    bar.append(title, btns);
    bar.style.gap = "2px";

    // ===== iframe =====
    const iframe = document.createElement("iframe");
    iframe.style.flex = "1";
    iframe.style.border = "none";

    function setContent(content) {
      if (!content) return;
      if (content.type === "web") {
        // ★ srcdoc を完全に消す
        iframe.removeAttribute("srcdoc");
        iframe.src = content.con;
      } else {
        // ★ src を完全に消す
        iframe.removeAttribute("src");
        iframe.srcdoc = content.con ?? "";
      }
    }
    setContent(option.content);

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
        const maxX = window.innerWidth - state.w;
        const maxY = window.innerHeight - BAR_HEIGHT;
        state.x = Math.min(Math.max(0, ox + ev.clientX - sx), maxX);
        state.y = Math.min(Math.max(0, oy + ev.clientY - sy), maxY);
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
        state.w = Math.max(200, ow + ev.clientX - sx);
        state.h = Math.max(120, oh + ev.clientY - sy);
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

    // ===== Controls =====
    function minimize() {
      if (state.minimized) restore();
      state.minimized = true;
      iframe.style.display = "none";
      resize.style.display = "none";
      applyRect();
    }

    function restore() {
      if (state.minimized) {
        state.minimized = false;
        iframe.style.display = "block";
        resize.style.display = state.maximized ? "none" : "block";
      }
      if (state.maximized) {
        Object.assign(state, state.prev);
        state.maximized = false;
        resize.style.display = "block";
      }
      applyRect();
    }

    function maximize() {
      if(state.maximized) return;
      if(state.minimized) restore();
      state.prev = {
        x: state.x,
        y: state.y,
        w: state.w,
        h: state.h
      };
      state.x = 0;
      state.y = 0;
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      state.maximized = true;
      resize.style.display = "none";
      applyRect();
    }

    //API関数群
    function clamp(v, min, max) {
      return Math.min(Math.max(v, min), max);
    }

    function setSize(w, h) {
      if (state.maximized) restore();
      state.w = Math.max(200, w);
      state.h = Math.max(120, h);
      // 画面外にはみ出さないように
      state.x = clamp(state.x, 0, window.innerWidth - state.w);
      state.y = clamp(state.y, 0, window.innerHeight - BAR_HEIGHT);
      applyRect();
    }

    function setPosition(x, y) {
      state.x = clamp(x, 0, window.innerWidth - state.w);
      state.y = clamp(y, 0, window.innerHeight - BAR_HEIGHT);
      applyRect();
    }

    btnMin.onclick = () => state.minimized ? restore() : minimize();
    btnMax.onclick = () => state.maximized ? restore() : maximize();
    btnClose.onclick = () => win.remove();

    // ===== 公開API =====
    return {
      el: win,
      iframe,
      focus,
      close: () => win.remove(),
      setContent,
      setTitle: t => title.textContent = t,
      minimize,
      maximize,
      restore,
      setSize,
      setPosition
    };
  }
}
