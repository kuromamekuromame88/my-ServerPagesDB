
document.querySelector(".MakeAccount").addEventListener("click", MakeAccount);

function showlog(e, isError){
  document.querySelector(".LoginMessage").innerText=e;
  document.querySelector(".LoginMessage").style.color=isError?"red":"green"; 
}

async function MakeAccount(){
  const un=document.getElementById("userN").value;
  const pw=document.getElementById("pass").value;
  const payload={
    userN: un,
    pass: pw,
  };
  try{
    const r=await fetch("/api/webchat/regist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result=await r.json();
    showlog(result.state?"登録に成功しました！リダイレクトします...":"登録に失敗しました！", !result.state);
    if(!result.state) return;
    const sid = result?.sid;
    const uid = result?.uid; 
    alert("ログインに必要なIDが生成されました。");
    alert(`あなたのユーザーIDは、${uid}です。メモしたりしてください。`);
    setTimeout(()=>{
      location.href=`https://tool-webs.onrender.com/chat?login=true&userID=${uid}&sid=${sid}`
    }, 1000);
  }catch(e){
    showlog(e);
    console.log(e);
  }
}