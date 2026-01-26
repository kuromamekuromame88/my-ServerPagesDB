let editor;
let Editmode = false;

const TrueViewBtn = document.getElementById("TrueViewBtn");
const UIEditBtn   = document.getElementById("UIEditBtn");

const prev = document.getElementById("previewFrame"); 
const Edit = document.getElementById("EditFrame");

/* =========================
   editor用ID保証
========================= */
function ensureEditorId(el) {
  if (!el.dataset.editorId) {
    el.dataset.editorId = crypto.randomUUID();
  }
  return el.dataset.editorId;
}

/* =========================
   styleタグ取得 or 生成
========================= */
function getEditorStyleTag(doc) {
  let style = doc.getElementById("editor-style");
  if (!style) {
    style = doc.createElement("style");
    style.id = "editor-style";
    doc.head.appendChild(style);
  }
  return style;
}

/* =========================
   要素CSS更新
========================= */
function updateElementStyle(el, cssText) {
  const doc = el.ownerDocument;
  const styleTag = getEditorStyleTag(doc);
  const id = ensureEditorId(el);

  const selector = `[data-editor-id="${id}"]`;
  const rules = styleTag.textContent.split("}");

  const filtered = rules.filter(r => !r.includes(selector));
  filtered.push(`${selector} { ${cssText} }`);

  styleTag.textContent = filtered.join("}\n").trim() + "}";
}

/* =========================
   Edit iframe → HTML生成
========================= */
function getEditedHTML() {
  const doc = Edit.contentDocument;
  if (!doc) return editor.getValue();
  return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
}

/* =========================
   Preview & Editor 同期
========================= */
function syncAllFromEdit() {
  const html = getEditedHTML();

  // preview iframe 更新
  prev.srcdoc = html;

  // CodeMirror 同期
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

  target.style.touchAction = "none";
  target.style.cursor = "grab";

  target.addEventListener("pointerdown", (e) => {
    isDragging = true;
    target.setPointerCapture(e.pointerId);

    const rect = target.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    e.preventDefault();
    e.stopPropagation();
  });

  target.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const left = e.clientX - startX;
    const top  = e.clientY - startY;

    // style属性は使わずCSSへ
    updateElementStyle(
      target,
      `position: absolute; left: ${left}px; top: ${top}px;`
    );
  });

  function endDrag(e) {
    if (!isDragging) return;

    isDragging = false;
    target.releasePointerCapture(e.pointerId);
    target.style.cursor = "grab";

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

    doc.body.addEventListener("mouseover", (e) => {
      const target = e.target;
      if (target === doc.body || target === doc.documentElement) return;
      target.style.outline = "3px solid #ff9800";
      e.stopPropagation();
    });

    doc.body.addEventListener("mouseout", (e) => {
      e.target.style.outline = "";
      e.stopPropagation();
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
