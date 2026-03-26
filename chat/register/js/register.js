
document.querySelector(".MakeAccount").addEventListener("click", MakeAccount);


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
    setTimeout(()=>{
      location.href=`https://tool-webs.onrender.com/chat?login=true&userID=${uid}&sid=${sid}`
    }, 1000);
  }catch(e){
    console.log(e);
  }
}