
let editor;

window.addEventListener("load", () => {
  editor = CodeMirror.fromTextArea(
    document.getElementById("codeEditor"),
    {
      mode: "htmlmixed",
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2,
      autoCloseTags: true,
      matchBrackets: true
    }
  );
});

function preview() {
  document.querySelector(".maincontent iframe").srcdoc = editor.getValue();
}