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
    win.setAttribute("id",`iw-${name}`);
    Object.assign(win.style, {
      position: "fixed",
      background: "#fff",
      zIndex: ++IframeWindow.topZ,
      boxShadow: "0 6px 20px rgba(0,0,0,.2)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition:
        "left .2s ease, top .2s ease, width .2s ease, height .25s cubic-bezier(.4,0,.2,1)"
    });

    function focus() {
      win.style.zIndex = ++IframeWindow.topZ;
    }

    function applyRect() {
      win.style.left = state.x + "px";
      win.style.top = state.y + "px";
      win.style.width = state.w + "px";
      win.style.height =
        state.minimized ? BAR_HEIGHT + "px" : state.h + "px";
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
    btnMin.innerHTML =
      `<svg width="16" height="16"><line x1="3" y1="8" x2="13" y2="8" stroke="black"/></svg>`;

    const btnMax = document.createElement("button");
    btnMax.innerHTML =
      `<svg width="16" height="16"><rect x="3" y="3" width="8" height="8" fill="none" stroke="black"/></svg>`;

    const btnClose = document.createElement("button");
    btnClose.innerHTML =
      `<svg width="16" height="16"><line x1="4" y1="4" x2="12" y2="12" stroke="black"/><line x1="12" y1="4" x2="4" y2="12" stroke="black"/></svg>`;

    [btnMin, btnMax, btnClose].forEach(b => {
      b.style.border = "none";
      b.style.background = "#dedede";
      b.addEventListener("pointerdown", e => e.stopPropagation());
    });

    //ホバー時の背景色変更
    [btnMin,btnMax].forEach(b =>{
      b.addEventListener("pointerenter", () => {
        b.style.background = "#cecece";
      });
      b.addEventListener("pointerleave", () => {
        b.style.background = "#dedede";
      });
    });

    //消去ボタンは赤で強調
    btnClose.addEventListener("pointerenter", () => {
      btnClose.style.background = "#de7c7c";
    });
    btnClose.addEventListener("pointerleave", () => {
      btnClose.style.background = "#dedede";
    });

    const btns = document.createElement("div");
    btns.append(btnMin, btnMax, btnClose);
    bar.append(title, btns);

    // ===== iframe =====
    const iframe = document.createElement("iframe");
    iframe.style.flex = "1";
    iframe.style.border = "none";

    function setContent(content) {
      if (!content) return;
      if (content.type === "web") {
        iframe.removeAttribute("srcdoc");
        iframe.src = content.con;
      } else {
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

      win.style.transition = "none";

      const sx = e.clientX;
      const sy = e.clientY;
      const ox = state.x;
      const oy = state.y;

      bar.setPointerCapture(e.pointerId);

      const move = ev => {
        state.x = Math.min(
          Math.max(0, ox + ev.clientX - sx),
          window.innerWidth - state.w
        );
        state.y = Math.min(
          Math.max(0, oy + ev.clientY - sy),
          window.innerHeight - BAR_HEIGHT
        );
        applyRect();
      };

      const up = ev => {
        bar.releasePointerCapture(ev.pointerId);
        win.style.transition =
          "left .2s ease, top .2s ease, width .2s ease, height .25s cubic-bezier(.4,0,.2,1)";
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };

      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });

    // ===== Resize =====
    resize.addEventListener("pointerdown", e => {
      if (state.maximized) return;

      win.style.transition = "none";

      const sx = e.clientX;
      const sy = e.clientY;
      const ow = state.w;
      const oh = state.h;

      resize.setPointerCapture(e.pointerId);

      const move = ev => {
        state.w = Math.max(200, ow + ev.clientX - sx);
        state.h = Math.max(120, oh + ev.clientY - sy);
        applyRect();
      };

      const up = ev => {
        resize.releasePointerCapture(ev.pointerId);
        win.style.transition =
          "left .2s ease, top .2s ease, width .2s ease, height .25s cubic-bezier(.4,0,.2,1)";
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
      };

      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
    });

    // ===== Controls =====
    function minimize() {
      if (state.minimized) return;
      state.prevSize = state.h;
      state.minimized = true;
      applyRect();

      setTimeout(() => {
        iframe.style.display = "none";
        resize.style.display = "none";
      }, 250);
    }

    function restore() {
      iframe.style.display = "block";
      resize.style.display = "block";

      if (state.minimized) {
        state.minimized = false;
        state.h = state.prevSize;
      }

      if (state.maximized) {
        Object.assign(state, state.prev);
        state.maximized = false;
      }

      applyRect();
    }

    function maximize() {
      if (state.maximized) return;
      state.prev = { ...state };
      state.x = 0;
      state.y = 0;
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      state.maximized = true;
      resize.style.display = "none";
      applyRect();
    }

    btnMin.onclick = minimize;
    btnMax.onclick = () => (state.maximized ? restore() : maximize());
    btnClose.onclick = () => win.remove();

    return {
      el: win,
      iframe,
      focus,
      close: () => win.remove(),
      setContent,
      setTitle: t => (title.textContent = t),
      minimize,
      maximize,
      restore,
      setSize(w, h) {
        if (state.maximized) restore();
        state.w = Math.max(200, w);
        state.h = Math.max(120, h);
        applyRect();
      },
      setPosition(x, y) {
        state.x = x;
        state.y = y;
        applyRect();
      }
    };
  }
}
