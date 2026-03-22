
document.querySelector(".MakeAccount").addEventListener("click", ()=>{
  location.href = "https://tool-webs.onrender.com/chat/register";
});

document.querySelector(".Login").addEventListener("click", login);

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
    if(result.ok) return;
  }catch(e){
    console.log(e);
  }
}