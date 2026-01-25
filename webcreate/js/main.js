
let editor;

let Editmode = false;

const TrueViewBtn = document.getElementById("TrueViewBtn");
const UIEditBtn = document.getElementById("UIEditBtn");

const prev = document.getElementById("previewFrame"); 
const Edit = document.getElementById("EditFrame");

function preview() {
  console.log("preview!");
  prev.srcdoc = editor.getValue();

  Edit.srcdoc = editor.getValue();
  let EditPage = Edit.contentDocument.querySelectorAll("*");
  EditPage.forEach((e) => {
    e.addEventListener("mouseover", () => {
      e.style.border = "5px solid #000";
      //e.stopPropagation();
    });
    e.addEventListener("mouseout", () => {
      e.style.border = "none";
      //e.stopPropagation();
    });
    e.addEventListener("click", () => {
      console.log(e);
      e.stopPropagation();
    });
  });
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
