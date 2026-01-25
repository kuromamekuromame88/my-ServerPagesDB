
let editor;

let Editmode = false;

const TrueViewBtn = document.getElementById("TrueViewBtn");
const UIEditBtn = document.getElementById("UIEditBtn");

function preview() {
  document.getElementById("previewFrame").srcdoc = editor.getValue();
  document.getElementById("EditFrame").srcdoc = editor.getValue();
}

function showPage() {
  previewFrame.style.opacity = 1;
  previewFrame.style.pointerEvents = "auto";
  EditFrame.style.opacity = 0;
  EditFrame.style.pointerEvents = "none";
  Editmode = false;
  TrueViewBtn.style.borderBottom = "5px solid #fff";
  UIEditBtn.style.borderBottom = "none";
}

function hidePage() {
  previewFrame.style.opacity = 0;
  previewFrame.style.pointerEvents = "none";
  EditFrame.style.opacity = 1;
  EditFrame.style.pointerEvents = "auto";
  Editmode = true;
  TrueViewBtn.style.borderBottom = "5px solid #fff";
  UIEditBtn.style.borderBottom = "none";
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
