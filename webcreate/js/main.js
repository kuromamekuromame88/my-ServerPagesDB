
let editor;

let Editmode = false;

const TrueViewBtn = document.getElementById("TrueViewBtn");
const UIEditBtn = document.getElementById("UIEditBtn");

const prev = document.getElementById("previewFrame"); 
const Edit = document.getElementById("EditFrame");

function drug(e){
    let isDragging = false;
    let startX, startY;

    e.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - e.target.offsetLeft;
        startY = e.clientY - e.target.offsetTop;
        e.target.style.cursor = 'grabbing';
    });

    e.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.target.style.left = (e.clientX - startX) + 'px';
            e.target.style.top = (e.clientY - startY) + 'px';
        }
    });

    e.addEventListener('mouseup', (e) => {
        isDragging = false;
        e.target.style.cursor = 'grab';
        e.mousedown = null;
        e.mousemove = null;
    });  
};

function preview() {
  prev.srcdoc = editor.getValue();
  Edit.srcdoc = editor.getValue();

  Edit.onload = () => {
    const doc = Edit.contentDocument;

    // 既存イベントの消去
    doc.body.onmouseover = null;
    doc.body.onmouseout = null;
    doc.body.onclick = null;

    // 要素選択ライン表示
    doc.body.addEventListener("mouseover", (e) => {
      const target = e.target;
      if (target === doc.body || target === doc.documentElement) return;

      target.style.outline = "3px solid #ff9800";
      e.stopPropagation();
    });
    doc.body.addEventListener("mouseout", (e) => {
      const target = e.target;
      target.style.outline = "";
      e.stopPropagation();
    });

    // 要素選択時のクリックイベント
    doc.body.addEventListener("click", (e) => {
      const target = e.target;
      console.log("選択要素:", target);
      drug(target);
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
