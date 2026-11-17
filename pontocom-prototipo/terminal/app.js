const API="https://auzrtnuquplhogtqasbb.supabase.co/functions/v1/terminal-punch";
const API_KEY="sb_publishable_7y0Zgojnh0xbPwbsSp1gkQ_6Kv3hJiZ";
const TOKEN_KEY="pontocom_terminal_token_v1";
const $=s=>document.querySelector(s);
const entryNames={clock_in:"Entrada",break_start:"Saída para intervalo",break_end:"Retorno do intervalo",clock_out:"Saída final"};
let deviceToken=localStorage.getItem(TOKEN_KEY)||"",installPrompt=null,busy=false,employeeCode="",employeeName="",employeePin="",selectedEntry="",cameraStream=null;
async function api(payload){
 const response=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json","apikey":API_KEY,"x-terminal-flow-version":"photo-v1"},body:JSON.stringify(payload)});
 let data={};try{data=await response.json()}catch{}
 if(!response.ok&&response.status!==202)throw Object.assign(new Error(data.error||"Não foi possível concluir a solicitação."),{status:response.status,data});
 return data;
}
function message(el,text,type=""){if(!el)return;el.textContent=text;el.className="form-message"+(type?" "+type:"");}
function setConnection(){
 const el=$("#connectionState"),online=navigator.onLine;
 el.textContent=online?"Conectado":"Sem internet";el.className="connection "+(online?"online":"offline");
}
function updateTime(){
 const d=new Date();
 if($("#currentTime"))$("#currentTime").textContent=d.toLocaleTimeString("pt-BR");
 if($("#currentDate"))$("#currentDate").textContent=d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"});
}
function showStep(name){
 ["stepCode","stepPin","stepEntry","stepCamera"].forEach(id=>$("#"+id).hidden=id!=="step"+name);
 $("#receiptCard").hidden=true;
}
function showActivation(){$("#activationScreen").hidden=false;$("#punchScreen").hidden=true;}
async function showPunch(){
 try{
  const status=await api({action:"status",device_token:deviceToken});
  $("#companyName").textContent=status.company||"Empresa";
  $("#activationScreen").hidden=true;$("#punchScreen").hidden=false;
  $("#terminalStatus").textContent="Este aparelho está autorizado para registrar ponto.";
  updateTime();showStep("Code");
 }catch(e){
  if(e.status===401||e.status===403){localStorage.removeItem(TOKEN_KEY);deviceToken="";showActivation();message($("#activationMessage"),e.message||"A autorização deste aparelho expirou. Solicite um novo código à KR.");}
  else{showActivation();message($("#activationMessage"),"Não foi possível confirmar a conexão com o servidor. Atualize a página e tente novamente; não é necessário gerar outro código.");}
 }
}
$("#activationCode").addEventListener("input",e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,8));
$("#activationForm").addEventListener("submit",async e=>{
 e.preventDefault();const code=$("#activationCode").value.trim();
 if(code.length!==8){message($("#activationMessage"),"O código deve ter oito dígitos.");return;}
 const button=e.target.querySelector("button");button.disabled=true;button.textContent="Ativando...";message($("#activationMessage"),"");
 try{
  const data=await api({action:"activate",activation_code:code,device_name:navigator.userAgent.includes("iPad")?"Tablet de ponto":"Terminal de ponto"});
  deviceToken=data.token;localStorage.setItem(TOKEN_KEY,deviceToken);$("#activationCode").value="";await showPunch();
 }catch(err){message($("#activationMessage"),err.message);}
 finally{button.disabled=false;button.textContent="Ativar terminal";}
});
$("#employeeCode").addEventListener("input",e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,4));
$("#employeeCodeForm").addEventListener("submit",async e=>{
 e.preventDefault();if(busy)return;
 const code=$("#employeeCode").value.trim();if(!/^\d{4}$/.test(code)){message($("#codeMessage"),"Informe uma matrícula com quatro dígitos.");return;}
 if(!navigator.onLine){message($("#codeMessage"),"Conecte-se à internet para identificar seu cadastro.");return;}
 busy=true;const button=e.target.querySelector("button");button.disabled=true;button.textContent="Localizando...";
 try{
  const data=await api({action:"identify",device_token:deviceToken,employee_code:code});
  employeeCode=code;employeeName=data.employee;$("#employeeGreeting").textContent="Olá, "+employeeName+"!";
  $("#entryGreeting").textContent="Olá, "+employeeName+"!";$("#employeePin").value="";
  message($("#codeMessage"),"");showStep("Pin");$("#employeePin").focus();
 }catch(err){message($("#codeMessage"),err.message);}
 finally{busy=false;button.disabled=false;button.textContent="Continuar";}
});
$("#employeePin").addEventListener("input",e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,4));
$("#employeePinForm").addEventListener("submit",async e=>{
 e.preventDefault();if(busy)return;
 const pin=$("#employeePin").value.trim();if(!/^\d{4}$/.test(pin)){message($("#pinMessage"),"Informe sua senha de quatro dígitos.");return;}
 if(!navigator.onLine){message($("#pinMessage"),"Conecte-se à internet para validar sua senha.");return;}
 busy=true;const button=e.target.querySelector("button[type=submit]");button.disabled=true;button.textContent="Validando...";
 try{
  await api({action:"verify_pin",device_token:deviceToken,employee_code:employeeCode,pin});
  employeePin=pin;message($("#pinMessage"),"");showStep("Entry");
 }catch(err){message($("#pinMessage"),err.message);}
 finally{busy=false;button.disabled=false;button.textContent="Confirmar senha";}
});
$("#backToCode").addEventListener("click",()=>{employeeCode="";employeeName="";employeePin="";$("#employeeCode").value="";message($("#codeMessage"),"");showStep("Code");});
$("#backToPin").addEventListener("click",()=>showStep("Pin"));
async function openCamera(type){
 if(busy)return;
 if(!navigator.onLine){message($("#entryMessage"),"Conecte-se à internet antes de iniciar a marcação.");return;}
 selectedEntry=type;$("#cameraTitle").textContent=entryNames[type];message($("#cameraMessage"),"Solicitando acesso à câmera...");
 showStep("Camera");
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error("Este aparelho ou navegador não permite acesso à câmera. Abra o terminal em um navegador atualizado.");
  cameraStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:320},height:{ideal:240}}});
  const video=$("#punchCamera");video.srcObject=cameraStream;await video.play();
  message($("#cameraMessage"),"Câmera pronta. Centralize o rosto e tire a foto.");
 }catch(err){message($("#cameraMessage"),err.message);$("#capturePhotoButton").disabled=true;}
}
function stopCamera(){
 if(cameraStream){cameraStream.getTracks().forEach(track=>track.stop());cameraStream=null;}
 const video=$("#punchCamera");if(video)video.srcObject=null;
 $("#capturePhotoButton").disabled=false;
}
function compressedPhoto(){
 const video=$("#punchCamera"),canvas=$("#photoCanvas");
 if(!video.videoWidth||!video.videoHeight)throw new Error("A câmera ainda não está pronta. Aguarde um instante.");
 const options=[[320,240,.52],[280,210,.46],[240,180,.40]];
 for(const [maxW,maxH,quality] of options){
  const scale=Math.min(1,maxW/video.videoWidth,maxH/video.videoHeight);
  canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
  const ctx=canvas.getContext("2d",{alpha:false});ctx.drawImage(video,0,0,canvas.width,canvas.height);
  const dataUrl=canvas.toDataURL("image/jpeg",quality),base64=dataUrl.split(",")[1]||"";
  if(base64.length<=120000)return base64;
 }
 throw new Error("Não foi possível reduzir a foto ao tamanho permitido. Tente novamente com melhor iluminação.");
}
$("#capturePhotoButton").addEventListener("click",async()=>{
 if(busy)return;if(!navigator.onLine){message($("#cameraMessage"),"Sem internet. A foto não foi enviada e a marcação ainda não foi registrada.");return;}
 busy=true;const button=$("#capturePhotoButton");button.disabled=true;button.textContent="Enviando foto...";
 try{
  const photoBase64=compressedPhoto();
  const data=await api({action:"punch",device_token:deviceToken,employee_code:employeeCode,pin:employeePin,entry_type:selectedEntry,photo_base64:photoBase64});
  stopCamera();$("#receiptCard").hidden=false;$("#receiptTitle").textContent="Marcação registrada!";
  $("#receiptText").textContent=data.employee+" · "+entryNames[selectedEntry]+" · "+new Date(data.occurred_at).toLocaleString("pt-BR");
  $("#receiptCode").textContent="Comprovante: "+data.receipt_code;
  employeeCode="";employeeName="";employeePin="";selectedEntry="";$("#employeeCode").value="";$("#employeePin").value="";
  showStep("Code");$("#receiptCard").hidden=false;
 }catch(err){message($("#cameraMessage"),err.message||"Não foi possível registrar a marcação.");}
 finally{busy=false;button.disabled=false;button.textContent="Tirar foto e registrar ponto";}
});
document.querySelectorAll("[data-entry]").forEach(button=>button.addEventListener("click",()=>openCamera(button.dataset.entry)));
$("#cancelCameraButton").addEventListener("click",()=>{stopCamera();selectedEntry="";showStep("Entry");});
window.addEventListener("online",setConnection);window.addEventListener("offline",setConnection);
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("#installButton").hidden=false;});
$("#installButton").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("#installButton").hidden=true;});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
setConnection();updateTime();setInterval(updateTime,1000);
if(deviceToken)showPunch();else showActivation();