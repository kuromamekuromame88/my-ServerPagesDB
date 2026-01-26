let editor;
let Editmode = false;

const TrueViewBtn = document.getElementById("TrueViewBtn");
const UIEditBtn   = document.getElementById("UIEditBtn");

const prev = document.getElementById("previewFrame"); 
const Edit = document.getElementById("EditFrame");

/* =========================
   editor用 style 管理
========================= */
function getEditorStyleTag(doc) {
  let style = doc.getElementById("__editor-style");
  if (!style) {
    style = doc.createElement("style");
    style.id = "__editor-style";
    doc.head.appendChild(style);
  }
  return style;
}

function ensureEditorId(el) {
  if (!el.dataset.editorId) {
    el.dataset.editorId = crypto.randomUUID();
  }
  return el.dataset.editorId;
}

function updateElementStyle(el, cssText) {
  const doc = el.ownerDocument;
  const styleTag = getEditorStyleTag(doc);
  const id = ensureEditorId(el);
  const selector = `[data-editor-id="${id}"]`;

  const rules = styleTag.textContent
    .split("}")
    .map(r => r.trim())
    .filter(r => r && !r.startsWith(selector));

  rules.push(`${selector}{${cssText}}`);
  styleTag.textContent = rules.join("");
}

/* =========================
   Edit iframe → HTML生成
========================= */
function getEditedHTML() {
  const doc = Edit.contentDocument;
  if (!doc) return editor.getValue();
  return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
}

/* =========================
   Preview & Editor 同期
========================= */
function syncAllFromEdit() {
  const html = getEditedHTML();

  prev.srcdoc = html;

  if (editor.getValue() !== html) {
    editor.setValue(html);
  }
}

/* =========================
   Pointer Events Drag
========================= */
function drug(target){
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  ensureEditorId(target);

  target.addEventListener("pointerdown", (e) => {
    isDragging = true;
    target.setPointerCapture(e.pointerId);

    const rect = target.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    target.classList.add("__editor-dragging");

    e.preventDefault();
    e.stopPropagation();
  });

  target.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    updateElementStyle(
      target,
      `position:absolute;left:${e.clientX - startX}px;top:${e.clientY - startY}px;`
    );
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;

    target.releasePointerCapture(e.pointerId);
    target.classList.remove("__editor-dragging");

    // 🔽 ドラッグ終了時のみ同期
    syncAllFromEdit();
  }

  target.addEventListener("pointerup", endDrag);
  target.addEventListener("pointercancel", endDrag);
}

/* =========================
   Preview生成
========================= */
function preview() {
  const html = editor.getValue();

  prev.srcdoc = html;
  Edit.srcdoc = html;

  Edit.onload = () => {
    const doc = Edit.contentDocument;

    // editor用UI CSS注入
    const uiStyle = doc.createElement("style");
    uiStyle.textContent = `
      .__editor-hover { outline: 3px solid #ff9800; }
      .__editor-dragging { cursor: grabbing; }
      [data-editor-id] { touch-action: none; }
    `;
    doc.head.appendChild(uiStyle);

    doc.body.addEventListener("mouseover", (e) => {
      const t = e.target;
      if (t === doc.body || t === doc.documentElement) return;
      t.classList.add("__editor-hover");
    });

    doc.body.addEventListener("mouseout", (e) => {
      e.target.classList.remove("__editor-hover");
    });

    doc.body.addEventListener("click", (e) => {
      const target = e.target;
      console.log("選択要素:", target);
      drug(target);

      e.preventDefault();
      e.stopPropagation();
    });
  };
}

/* =========================
   モード切替（表示のみ）
========================= */
function showPage() {
  previewFrame.style.opacity = 1;
  previewFrame.style.pointerEvents = "auto";
  EditFrame.style.opacity = 0;
  EditFrame.style.pointerEvents = "none";

  Editmode = false;
  TrueViewBtn.style.border = "5px solid #ffcc00";
  UIEditBtn.style.border = "none";
}

function hidePage() {
  previewFrame.style.opacity = 0;
  previewFrame.style.pointerEvents = "none";
  EditFrame.style.opacity = 1;
  EditFrame.style.pointerEvents = "auto";

  Editmode = true;
  UIEditBtn.style.border = "5px solid #ffcc00";
  TrueViewBtn.style.border = "none";
}

/* =========================
   初期化
========================= */
window.addEventListener("load", () => {
  editor = CodeMirror.fromTextArea(mirror, {
    mode: "htmlmixed",
    lineNumbers: true,
    tabSize: 2,
    indentUnit: 2,
    autoCloseTags: true,
    matchBrackets: true,
    autoCloseBrackets: true
  });

  editor.on("change", preview);
  preview();
  showPage();

  TrueViewBtn.onclick = showPage;
  UIEditBtn.onclick   = hidePage;
});
