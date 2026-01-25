
let editor;

let Editmode = false;

const TrueViewBtn = document.getElementById("TrueViewBtn");
const UIEditBtn = document.getElementById("UIEditBtn");

const prev = document.getElementById("previewFrame"); 
const Edit = document.getElementById("EditFrame");

function preview() {
  prev.srcdoc = editor.getValue();
  Edit.srcdoc = editor.getValue();

  Edit.onload = () => {
    const doc = Edit.contentDocument;

    // 既存イベントの二重登録防止
    doc.body.onmouseover = null;
    doc.body.onmouseout = null;
    doc.body.onclick = null;

    // マウスオーバー（要素強調）
    doc.body.addEventListener("mouseover", (e) => {
      const target = e.target;
      if (target === doc.body || target === doc.documentElement) return;

      target.style.outline = "3px solid #ff9800";
      e.stopPropagation();
    });

    // マウスアウト（強調解除）
    doc.body.addEventListener("mouseout", (e) => {
      const target = e.target;
      target.style.outline = "";
      e.stopPropagation();
    });

    // クリック（要素選択）
    doc.body.addEventListener("click", (e) => {
      const target = e.target;
      console.log("選択要素:", target);
      e.preventDefault();
      e.stopPropagation();
    });
  };
}


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
  UIEditBtn.onclick = hidePage;
});
