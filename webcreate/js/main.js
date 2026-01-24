
body.onload = () => { const editor = CodeMirror.fromTextArea(
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
};