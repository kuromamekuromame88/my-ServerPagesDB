
document.querySelector(".MakeAccount").addEventListener("click", ()=>{
  location.href = "https://tool-webs.onrender.com/chat/register";
});

document.querySelector(".Login").addEventListener("click", login);

function showlog(e, isError){
  document.querySelector(".LoginMessage").innerText=e;
  document.querySelector(".LoginMessage").style.color=isError?"red":"black"; 
}

async function login(){
  const un=document.getElementById("user").value;
  const pw=document.getElementById("pass").value;
  const payload={
    user: un,
    pass: pw,
  };
  try{
    const r=await fetch("/api/webchat/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result=await r.json();
    showlog(result.state?"認証に成功しました！リダイレクトします...":"認証に失敗しました！", !result.state);
    if(!result.state) return;
    const sid = result?.sid;
    setTimeout(()=>{
      location.href=`https://tool-webs.onrender.com/chat?login=true&userID=${un}&sid=${sid}`
    }, 1000);
  }catch(e){
    console.log(e);
  }
}