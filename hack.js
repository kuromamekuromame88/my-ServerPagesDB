
//EILS自動タイピング

function fireAsciiString(text){if(typeof text!=="string"||text.length===0){throw new Error("1文字以上の文字列を指定してください");}for(const char of text){const codePoint=char.charCodeAt(0);if(codePoint < 0x20 || codePoint > 0x7E){throw new Error(`ASCII外の文字が含まれています: "${char}"`);}const isUpper=char>="A"&&char<="Z";const keyCode=codePoint;const eventInit={key:char,code:"",keyCode:keyCode,which:keyCode,shiftKey:isUpper,bubbles:true,cancelable:true};document.dispatchEvent(new KeyboardEvent("keydown", eventInit));document.dispatchEvent(new KeyboardEvent("keypress", eventInit));document.dispatchEvent(new KeyboardEvent("keyup", eventInit));}}function type(){var dom=document.getElementsByClassName("type-next");if(dom[dom.length-1])fireAsciiString(dom[dom.length-1].innerText);}setInterval(type,1);




//キーイベント発生関数
/**
 * ASCII（アルファベット・数字・記号）のみからなる文字列を
 * document に対してキー入力として発生させる
 * @param {string} text - 1文字以上のASCII文字列
 */
function fireAsciiString(text) {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("1文字以上の文字列を指定してください");
  }

  for (const char of text) {
    const codePoint = char.charCodeAt(0);

    // ASCII 可視文字チェック（スペース〜~）
    if (codePoint < 0x20 || codePoint > 0x7E) {
      throw new Error(`ASCII外の文字が含まれています: "${char}"`);
    }

    const isUpper = char >= "A" && char <= "Z";
    const keyCode = codePoint;

    const eventInit = {
      key: char,
      code: "",                 // ASCIIでは必須ではないため省略
      keyCode: keyCode,
      which: keyCode,
      shiftKey: isUpper,        // 大文字はShift扱い
      bubbles: true,
      cancelable: true
    };

    document.dispatchEvent(new KeyboardEvent("keydown", eventInit));
    document.dispatchEvent(new KeyboardEvent("keypress", eventInit));
    document.dispatchEvent(new KeyboardEvent("keyup", eventInit));
  }
}


//マイタイピングチートコード
setInterval(()=>{
  var d=document.getElementsByClassName("mtjNowInput");
  if(d[d.length-1]&&d[d.length-1].innerText) fireAsciiString(d[d.length-1].innerText);
},1);