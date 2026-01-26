let editor;
let Editmode = false;

const TrueViewBtn = document.getElementById("TrueViewBtn");
const UIEditBtn   = document.getElementById("UIEditBtn");

const prev = document.getElementById("previewFrame"); 
const Edit = document.getElementById("EditFrame");

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

    target.style.position = "absolute";
    target.style.cursor = "grabbing";

    e.preventDefault();
    e.stopPropagation();
  });

  target.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    target.style.left = (e.clientX - startX) + "px";
    target.style.top  = (e.clientY - startY) + "px";
  });

  target.addEventListener("pointerup", (e) => {
    isDragging = false;
    target.releasePointerCapture(e.pointerId);
    target.style.cursor = "grab";
  });

  target.addEventListener("pointercancel", () => {
    isDragging = false;
    target.style.cursor = "grab";
  });
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
   CodeMirror同期
========================= */
function syncEditor(html) {
  if (editor.getValue() !== html) {
    editor.setValue(html);
  }
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

    // 要素ホバー表示
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

    // 要素選択
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
   モード切替
========================= */
function showPage() {
  // 🔽 Edit内容をHTMLに反映
  const html = getEditedHTML();

  prev.srcdoc = html;
  syncEditor(html);

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
