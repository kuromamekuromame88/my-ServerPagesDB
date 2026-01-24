
let editor;

function preview() {
  document.getElementById("previewFrame").srcdoc = editor.getValue();
}
/*
window.addEventListener("load", () => {
  editor = CodeMirror.fromTextArea(
    document.getElementById("mirror"),
    {
      mode: "htmlmixed",
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2,
      autoCloseTags: true,
      matchBrackets: true,
      autoCloseBrackets: true

    }
  );

  editor.on("change", preview);

  preview();
});
*/

editor = CodeMirror.fromTextArea(
    document.getElementById("mirror"),
    {
      mode: "htmlmixed",
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2,
      autoCloseTags: true,
      matchBrackets: true,
      autoCloseBrackets: true

    }
  );

  editor.on("change", preview);

  preview();


