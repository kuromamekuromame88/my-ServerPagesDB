
function showlog(e, isError){
  document.querySelector(".LoginMessage").innerText=e;
  document.querySelector(".LoginMessage").style.color=isError?"red":"green"; 
}

function check(){
  //ログイン状態の保存
  if(!localStorage.getItem("KEEPLOGIN")) localStorage.setItem("KEEPLOGIN", false);
  if(document.getElementById("keeplogin").checked){
    localStorage.setItem("KEEPLOGIN", true);
  }else{
    localStorage.setItem("KEEPLOGIN", false);
  }
}

let check= false;

async function login(){
  const un=document.getElementById("user").value;
  const pw=document.getElementById("pass").value;
  if(!un|| !pw){
    showlog("ユーザーID、パスワードを入力してください。",true);
    return;
  }
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

    check();

    const nick = result?.nick;
    console.log(nick);
    if(check) return;
    const sid = result?.sid;
    setTimeout(()=>{
      location.href=`https://tool-webs.onrender.com/chat?login=true&userID=${un}&nick=${nick}&sid=${sid}`;
    }, 1000);
    localStorage.setItem("logout", true);
  }catch(e){
    console.log(e);
  }
}


document.querySelector(".Login").addEventListener("click", login);



document.addEventListener("keydown", e=>{
 if(e.key=="Enter") login();
});


if(localStorage.getItem("KEEPLOGIN")=="true"){
  document.getElementById("keeplogin").checked = true;
  showlog("自動ログインします...");
  check();
  setTimeout(()=>{
    location.href=`https://tool-webs.onrender.com/chat?login=true&keeplogin=true&userID=${localStorage.getItem("userID")}`;
  }, 500);
}