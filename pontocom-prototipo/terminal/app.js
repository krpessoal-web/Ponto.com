const API="https://auzrtnuquplhogtqasbb.supabase.co/functions/v1/terminal-punch";
const API_KEY="sb_publishable_7y0Zgojnh0xbPwbsSp1gkQ_6Kv3hJiZ";
const TOKEN_KEY="pontocom_terminal_token_v1";
const $=s=>document.querySelector(s);
let deviceToken=localStorage.getItem(TOKEN_KEY)||"",installPrompt=null,busy=false;
const entryNames={clock_in:"Entrada",break_start:"Saída para intervalo",break_end:"Retorno do intervalo",clock_out:"Saída final"};
async function api(payload){const response=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json","apikey":API_KEY},body:JSON.stringify(payload)});let data={};try{data=await response.json()}catch{}if(!response.ok&&response.status!==202)throw Object.assign(new Error(data.error||"Não foi possível concluir a solicitação."),{status:response.status,data});return data}
function message(el,text,type=""){el.textContent=text;el.className="form-message"+(type?" "+type:"")}
function setConnection(){const el=$("#connectionState"),online=navigator.onLine;el.textContent=online?"Conectado":"Sem internet";el.className="connection "+(online?"online":"offline")}
function updateTime(){const d=new Date();$("#currentTime")&&($("#currentTime").textContent=d.toLocaleTimeString("pt-BR"));$("#currentDate")&&($("#currentDate").textContent=d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"}))}
function showActivation(){ $("#activationScreen").hidden=false;$("#punchScreen").hidden=true }
async function showPunch(){try{const status=await api({action:"status",device_token:deviceToken});$("#companyName").textContent=status.company||"Empresa";$("#activationScreen").hidden=true;$("#punchScreen").hidden=false;$("#terminalStatus").textContent="Este aparelho está autorizado para registrar ponto.";updateTime()}catch(e){localStorage.removeItem(TOKEN_KEY);deviceToken="";showActivation();message($("#activationMessage"),e.message)}}
$("#activationCode").addEventListener("input",e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,8));
$("#activationForm").addEventListener("submit",async e=>{e.preventDefault();const code=$("#activationCode").value.trim();if(code.length!==8){message($("#activationMessage"),"O código deve ter oito dígitos.");return}const button=e.target.querySelector("button");button.disabled=true;button.textContent="Ativando...";message($("#activationMessage"),"");try{const data=await api({action:"activate",activation_code:code,device_name:navigator.userAgent.includes("iPad")?"Tablet de ponto":"Terminal de ponto"});deviceToken=data.token;localStorage.setItem(TOKEN_KEY,deviceToken);$("#activationCode").value="";await showPunch()}catch(err){message($("#activationMessage"),err.message)}finally{button.disabled=false;button.textContent="Ativar terminal"}});
function getPosition(){return new Promise(resolve=>{if(!navigator.geolocation){resolve({latitude:null,longitude:null,accuracy_m:null});return}navigator.geolocation.getCurrentPosition(pos=>resolve({latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy_m:pos.coords.accuracy}),()=>resolve({latitude:null,longitude:null,accuracy_m:null}),{enableHighAccuracy:true,timeout:15000,maximumAge:0})})}

async function loadHistory(){
 const code=$("#employeeCode").value.replace(/\D/g,""),pin=$("#employeePin").value.replace(/\D/g,"");
 if(code.length!==4||pin.length!==4){message($("#punchMessage"),"Informe sua matrícula e seu PIN para consultar o histórico.");return}
 if(!navigator.onLine){message($("#punchMessage"),"Conecte-se à internet para consultar o histórico.");return}
 const button=$("#historyButton");button.disabled=true;message($("#punchMessage"),"Consultando seu histórico...");
 try{
  const data=await api({action:"history",device_token:deviceToken,employee_code:code,pin});
  const list=$("#historyList");$("#historyCard").hidden=false;
  list.innerHTML=(data.entries||[]).length?data.entries.map(x=>'<div class="history-row"><span class="history-entry">'+(entryNames[x.entry_type]||x.entry_type)+'</span><span class="history-date">'+new Date(x.occurred_at).toLocaleString("pt-BR")+'</span><small>'+(x.receipt_code?"Comprovante "+x.receipt_code:"Registro manual")+'</small></div>').join(""):'<p class="history-empty">Nenhuma marcação encontrada.</p>';
  message($("#punchMessage"),"Histórico de "+data.employee+" carregado.","success");
 }catch(err){message($("#punchMessage"),err.message)}finally{button.disabled=false}
}
$("#historyButton").addEventListener("click",loadHistory);
async function submitPunch(type){if(busy)return;if(!navigator.onLine){message($("#punchMessage"),"Sem conexão com a internet. A marcação não foi enviada. Conecte-se e tente novamente.");return}const code=$("#employeeCode").value.replace(/\D/g,""),pin=$("#employeePin").value.replace(/\D/g,"");if(code.length!==4||pin.length!==4){message($("#punchMessage"),"Informe a matrícula e o PIN com quatro dígitos.");return}busy=true;document.querySelectorAll("[data-entry]").forEach(x=>x.disabled=true);message($("#punchMessage"),"Verificando localização e registrando...");$("#receiptCard").hidden=true;try{const position=await getPosition();const data=await api({action:"punch",device_token:deviceToken,employee_code:code,pin,entry_type:type,...position});if(data.review){message($("#punchMessage"),data.message,"review");$("#receiptCard").hidden=false;$("#receiptTitle").textContent="Tentativa enviada para análise";$("#receiptText").textContent=data.employee+" · "+entryNames[type];$("#receiptCode").textContent="O RH precisará verificar esta tentativa.";$("#employeePin").value="";return}message($("#punchMessage"),"Marcação registrada com sucesso!","success");$("#receiptCard").hidden=false;$("#receiptTitle").textContent="Marcação registrada";$("#receiptText").textContent=data.employee+" · "+entryNames[type]+" · "+new Date(data.occurred_at).toLocaleString("pt-BR");$("#receiptCode").textContent="Comprovante: "+data.receipt_code;$("#employeeCode").value="";$("#employeePin").value=""}catch(err){message($("#punchMessage"),err.message);if(err.status===401&&/terminal não autorizado/i.test(err.message)){localStorage.removeItem(TOKEN_KEY);deviceToken="";showActivation()}}finally{busy=false;document.querySelectorAll("[data-entry]").forEach(x=>x.disabled=false)}}
document.querySelectorAll("[data-entry]").forEach(button=>button.addEventListener("click",()=>submitPunch(button.dataset.entry)));
window.addEventListener("online",setConnection);window.addEventListener("offline",setConnection);setConnection();updateTime();setInterval(updateTime,1000);
if(deviceToken)showPunch();else showActivation();
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("#installButton").hidden=false});
$("#installButton").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("#installButton").hidden=true});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

/* Cadastro facial supervisionado: os frames permanecem somente em memória no navegador. */
const BIOMETRIC_API="https://auzrtnuquplhogtqasbb.supabase.co/functions/v1/terminal-biometric";
const FACE_MODEL_URL="https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model";
let faceStream=null,faceModelsReady=false,faceModelsPromise=null;
function stopFaceCamera(){
 if(faceStream){faceStream.getTracks().forEach(track=>track.stop());faceStream=null}
 const video=$("#faceVideo");if(video)video.srcObject=null;
}
function faceMessage(text,type=""){const el=$("#faceEnrollMessage");if(el){el.textContent=text;el.className="form-message"+(type?" "+type:"")}}
async function loadFaceModels(){
 if(faceModelsReady)return;
 if(faceModelsPromise)return faceModelsPromise;
 faceModelsPromise=(async()=>{
  if(!window.faceapi)throw new Error("Não foi possível carregar o módulo de reconhecimento facial. Verifique a internet e atualize a página.");
  await Promise.all([
   faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),
   faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),
   faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL)
  ]);
  faceModelsReady=true;
 })();
 try{await faceModelsPromise}finally{faceModelsPromise=null}
}
async function enrollFace(){
 const code=$("#employeeCode").value.replace(/\D/g,""),pin=$("#employeePin").value.replace(/\D/g,"");
 if(code.length!==4||pin.length!==4){faceMessage("Informe primeiro a matrícula e o PIN de quatro dígitos no formulário acima.");return}
 if(!deviceToken){faceMessage("Este aparelho ainda não está ativado.");return}
 if(!navigator.onLine){faceMessage("Conecte-se à internet para realizar o cadastro.");return}
 const button=$("#faceCaptureButton");button.disabled=true;button.textContent="Preparando câmera...";
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error("Este navegador não permite acesso à câmera. Abra o terminal pelo endereço HTTPS em um navegador atualizado.");
  await loadFaceModels();
  faceMessage("Solicitando acesso à câmera...");
  faceStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:640},height:{ideal:480}}});
  const video=$("#faceVideo");video.srcObject=faceStream;video.hidden=false;
  await new Promise((resolve,reject)=>{video.onloadedmetadata=()=>video.play().then(resolve).catch(reject);setTimeout(()=>reject(new Error("A câmera demorou para iniciar. Tente novamente.")),12000)});
  button.textContent="Capturando...";
  const descriptors=[];
  for(let i=0;i<3;i++){
   faceMessage("Posicione o rosto de frente, sem outras pessoas no enquadramento. Leitura "+(i+1)+" de 3.");
   await new Promise(resolve=>setTimeout(resolve,700));
   const detections=await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions({inputSize:320,scoreThreshold:0.6})).withFaceLandmarks().withFaceDescriptors();
   if(detections.length!==1)throw new Error(detections.length===0?"Não localizamos um rosto. Ajuste a iluminação e centralize o rosto.":"Foi detectado mais de um rosto. Deixe somente o funcionário no enquadramento.");
   descriptors.push(Array.from(detections[0].descriptor));
  }
  const average=Array.from({length:128},(_,i)=>descriptors.reduce((sum,d)=>sum+d[i],0)/descriptors.length);
  const norm=Math.sqrt(average.reduce((sum,v)=>sum+v*v,0))||1;
  const descriptor=average.map(v=>v/norm);
  faceMessage("Protegendo o modelo biométrico e enviando para aprovação...");
  const position=await getPosition();
  const response=await fetch(BIOMETRIC_API,{method:"POST",headers:{"Content-Type":"application/json","apikey":API_KEY},body:JSON.stringify({action:"enroll",device_token:deviceToken,employee_code:code,pin,descriptor,...position})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Não foi possível concluir o cadastro facial.");
  faceMessage(data.message||"Cadastro enviado para aprovação da KR.", "success");
  $("#employeePin").value="";
 }catch(error){faceMessage(error.message||"Não foi possível cadastrar o rosto.");}
 finally{stopFaceCamera();button.disabled=false;button.textContent="Iniciar câmera e cadastrar"}
}
$("#faceEnrollButton")?.addEventListener("click",()=>{
 const card=$("#faceEnrollCard");card.hidden=!card.hidden;
 if(!card.hidden)card.scrollIntoView({behavior:"smooth",block:"center"});
 else stopFaceCamera();
});
$("#faceCaptureButton")?.addEventListener("click",enrollFace);
$("#faceCancelButton")?.addEventListener("click",()=>{stopFaceCamera();$("#faceEnrollCard").hidden=true;faceMessage("Cadastro cancelado.")});
