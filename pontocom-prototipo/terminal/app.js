const API="https://auzrtnuquplhogtqasbb.supabase.co/functions/v1/terminal-punch";
const API_KEY="sb_publishable_7y0Zgojnh0xbPwbsSp1gkQ_6Kv3hJiZ";
const TOKEN_KEY="pontocom_terminal_token_v1";
const $=s=>document.querySelector(s);
let deviceToken=localStorage.getItem(TOKEN_KEY)||"",installPrompt=null,busy=false;
const entryNames={clock_in:"Entrada",break_start:"Saída para intervalo",break_end:"Retorno do intervalo",clock_out:"Saída final"};
async function api(payload){const response=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json","apikey":API_KEY},body:JSON.stringify(payload)});let data={};try{data=await response.json()}catch{}if(!response.ok&&response.status!==202)throw Object.assign(new Error(data.error||"Não foi possível concluir a solicitação."),{status:response.status,data});return data}
function message(el,text,type=""){el.textContent=text;el.className="form-message"+(type?" "+type:"")}
function setConnection(){const el=$("#connectionState"),online=navigator.onLine;el.textContent=online?"Conectado":"Sem internet";el.className="connection "+(online?"online":"offline");if(online)syncOfflineQueue();}
function updateTime(){const d=new Date();$("#currentTime")&&($("#currentTime").textContent=d.toLocaleTimeString("pt-BR"));$("#currentDate")&&($("#currentDate").textContent=d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"}))}
function showActivation(){ $("#activationScreen").hidden=false;$("#punchScreen").hidden=true }
async function showPunch(){try{const status=await api({action:"status",device_token:deviceToken});$("#companyName").textContent=status.company||"Empresa";$("#activationScreen").hidden=true;$("#punchScreen").hidden=false;$("#terminalStatus").textContent="Este aparelho está autorizado para registrar ponto.";updateTime()}catch(e){localStorage.removeItem(TOKEN_KEY);deviceToken="";showActivation();message($("#activationMessage"),e.message)}}
$("#activationCode").addEventListener("input",e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,8));
$("#activationForm").addEventListener("submit",async e=>{e.preventDefault();const code=$("#activationCode").value.trim();if(code.length!==8){message($("#activationMessage"),"O código deve ter oito dígitos.");return}const button=e.target.querySelector("button");button.disabled=true;button.textContent="Ativando...";message($("#activationMessage"),"");try{const data=await api({action:"activate",activation_code:code,device_name:navigator.userAgent.includes("iPad")?"Tablet de ponto":"Terminal de ponto"});deviceToken=data.token;localStorage.setItem(TOKEN_KEY,deviceToken);$("#activationCode").value="";await showPunch()}catch(err){message($("#activationMessage"),err.message)}finally{button.disabled=false;button.textContent="Ativar terminal"}});
const OFFLINE_QUEUE_KEY="pontocom_offline_queue_v1",OFFLINE_DB="pontocom_offline_crypto_v1";
function openOfflineDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(OFFLINE_DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("keys"))req.result.createObjectStore("keys")};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function offlineKey(){const db=await openOfflineDb();const existing=await new Promise((resolve,reject)=>{const tx=db.transaction("keys","readonly"),req=tx.objectStore("keys").get("pin-key");req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});if(existing){db.close();return existing}const key=await crypto.subtle.generateKey({name:"AES-GCM",length:256},false,["encrypt","decrypt"]);await new Promise((resolve,reject)=>{const tx=db.transaction("keys","readwrite");tx.objectStore("keys").put(key,"pin-key");tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();return key}
function readOfflineQueue(){try{return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY)||"[]")}catch{return []}}
async function saveOfflinePunch(code,pin,type,position){const key=await offlineKey(),iv=crypto.getRandomValues(new Uint8Array(12)),encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(JSON.stringify({pin})));const queue=readOfflineQueue();queue.push({id:crypto.randomUUID(),employee_code:code,entry_type:type,occurred_at:new Date().toISOString(),latitude:position.latitude,longitude:position.longitude,accuracy_m:position.accuracy_m,iv:Array.from(iv),cipher:Array.from(new Uint8Array(encrypted))});localStorage.setItem(OFFLINE_QUEUE_KEY,JSON.stringify(queue))}
async function syncOfflineQueue(){if(!navigator.onLine||!deviceToken||busy)return;let queue=readOfflineQueue();if(!queue.length)return;const key=await offlineKey();let changed=false;for(const item of queue){try{const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:new Uint8Array(item.iv)},key,new Uint8Array(item.cipher)),secret=JSON.parse(new TextDecoder().decode(plain));const data=await api({action:"offline_sync",device_token:deviceToken,client_attempt_id:item.id,employee_code:item.employee_code,pin:secret.pin,entry_type:item.entry_type,occurred_at:item.occurred_at,latitude:item.latitude,longitude:item.longitude,accuracy_m:item.accuracy_m});if(data.success){queue=queue.filter(x=>x.id!==item.id);changed=true;const note=$("#punchMessage");if(note)message(note,"Marcação offline sincronizada e registrada automaticamente.","success")}else break}catch(error){if(error.status&&error.status>=400&&error.status<500){const note=$("#punchMessage");if(note)message(note,"Uma marcação offline não foi sincronizada: "+error.message+" Confira matrícula e PIN.","review")}break}}if(changed)localStorage.setItem(OFFLINE_QUEUE_KEY,JSON.stringify(queue));const note=$("#locationNote");if(note&&queue.length)note.textContent=queue.length+" marcação(ões) aguardando sincronização."}
function parseMapsCoordinates(value){const text=String(value||"").trim(),patterns=[/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,/[?&](?:q|query|center)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/];for(const re of patterns){const m=text.match(re);if(m){const lat=Number(m[1]),lng=Number(m[2]);if(lat>=-90&&lat<=90&&lng>=-180&&lng<=180)return{latitude:lat,longitude:lng}}}return null}
function getPosition(){return new Promise(resolve=>{if(!navigator.geolocation){resolve({latitude:null,longitude:null,accuracy_m:null});return}let watch=null,best=null,finished=false;const finish=()=>{if(finished)return;finished=true;if(watch!==null)navigator.geolocation.clearWatch(watch);clearTimeout(timer);resolve(best?{latitude:best.latitude,longitude:best.longitude,accuracy_m:best.accuracy}:{latitude:null,longitude:null,accuracy_m:null})};const timer=setTimeout(finish,30000);watch=navigator.geolocation.watchPosition(pos=>{const p={latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy};if(!best||p.accuracy<best.accuracy)best=p;const note=$("#locationNote");if(note)note.textContent="Localização obtida · precisão atual de "+Math.round(p.accuracy)+" m. Aguardando GPS mais preciso...";if(p.accuracy<=75)finish()},()=>finish(),{enableHighAccuracy:true,timeout:30000,maximumAge:0})})}

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
async function submitPunch(type){if(busy)return;const code=$("#employeeCode").value.replace(/\D/g,""),pin=$("#employeePin").value.replace(/\D/g,"");if(code.length!==4||pin.length!==4){message($("#punchMessage"),"Informe a matrícula e o PIN com quatro dígitos.");return}busy=true;document.querySelectorAll("[data-entry]").forEach(x=>x.disabled=true);message($("#punchMessage"),navigator.onLine?"Registrando com o terminal autorizado...":"Sem internet: guardando a marcação neste aparelho...");$("#receiptCard").hidden=true;try{let position={latitude:null,longitude:null,accuracy_m:null};if(!navigator.onLine){await saveOfflinePunch(code,pin,type,position);message($("#punchMessage"),"Marcação guardada neste aparelho. Quando a internet voltar, ela será registrada automaticamente, sem aprovação manual, desde que os dados e a sequência da jornada sejam válidos.","review");$("#receiptCard").hidden=false;$("#receiptTitle").textContent="Marcação salva offline";$("#receiptText").textContent=entryNames[type]+" · "+new Date().toLocaleString("pt-BR");$("#receiptCode").textContent="Aguardando sincronização automática.";$("#employeePin").value="";return}const data=await api({action:"punch",device_token:deviceToken,employee_code:code,pin,entry_type:type});if(data.review){message($("#punchMessage"),data.message,"review");$("#receiptCard").hidden=false;$("#receiptTitle").textContent="Tentativa enviada para análise";$("#receiptText").textContent=data.employee+" · "+entryNames[type];$("#receiptCode").textContent="O responsável precisará verificar esta tentativa.";$("#employeePin").value="";return}message($("#punchMessage"),"Marcação registrada com sucesso!","success");$("#receiptCard").hidden=false;$("#receiptTitle").textContent="Marcação registrada";$("#receiptText").textContent=data.employee+" · "+entryNames[type]+" · "+new Date(data.occurred_at).toLocaleString("pt-BR");$("#receiptCode").textContent="Comprovante: "+data.receipt_code;$("#employeeCode").value="";$("#employeePin").value=""}catch(err){message($("#punchMessage"),err.message);if(err.status===401&&/terminal não autorizado/i.test(err.message)){localStorage.removeItem(TOKEN_KEY);deviceToken="";showActivation()}}finally{busy=false;document.querySelectorAll("[data-entry]").forEach(x=>x.disabled=false)}}

document.querySelectorAll("[data-entry]").forEach(button=>button.addEventListener("click",()=>submitPunch(button.dataset.entry)));

$("#adminLocationToggle")?.addEventListener("click",()=>{$("#adminLocationForm").hidden=!$("#adminLocationForm").hidden});
$("#adminCaptureLocation")?.addEventListener("click",async()=>{const msg=$("#adminLocationMessage");message(msg,"Obtendo GPS deste aparelho...");const p=await getPosition();if(p.latitude==null){message(msg,"Não foi possível obter GPS. Ative a localização do aparelho.");return}$("#adminLatitude").value=p.latitude;$("#adminLongitude").value=p.longitude;message(msg,"Coordenadas capturadas. Precisão aproximada: "+Math.round(p.accuracy_m||0)+" m. Confira antes de salvar.")});
$("#mapsReference")?.addEventListener("change",e=>{const p=parseMapsCoordinates(e.target.value);if(p){$("#adminLatitude").value=p.latitude;$("#adminLongitude").value=p.longitude;message($("#adminLocationMessage"),"Coordenadas extraídas do link do Google Maps. Confira o marcador antes de salvar.")}});
$("#adminLocationForm")?.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target),ref=parseMapsCoordinates(f.get("maps_reference")),latitude=Number(f.get("latitude")||ref?.latitude),longitude=Number(f.get("longitude")||ref?.longitude),radius=Number(f.get("radius")||50),msg=$("#adminLocationMessage"),button=$("#adminSaveLocation");if(!Number.isFinite(latitude)||!Number.isFinite(longitude)){message(msg,"Cole um link do Google Maps que contenha coordenadas ou capture o GPS do aparelho.");return}button.disabled=true;button.textContent="Validando...";message(msg,"Validando a senha do administrador e salvando a localização...");try{const response=await fetch("https://auzrtnuquplhogtqasbb.supabase.co/functions/v1/terminal-admin-location",{method:"POST",headers:{"Content-Type":"application/json","apikey":API_KEY},body:JSON.stringify({device_token:deviceToken,admin_email:f.get("admin_email"),admin_password:f.get("admin_password"),latitude,longitude,allowed_radius_m:radius})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||"Não foi possível salvar a localização.");localStorage.setItem("pontocom_company_location_"+deviceToken.slice(-8),JSON.stringify({latitude,longitude,allowed_radius_m:radius}));$("#adminLocationForm").elements.admin_password.value="";message(msg,data.message+" Confira o ponto no mapa: https://www.google.com/maps?q="+latitude+","+longitude,"success")}catch(error){message(msg,error.message)}finally{button.disabled=false;button.textContent="Validar administrador e salvar"}});

async function facePunch(type){
 if(busy)return;if(!deviceToken){faceMessage("Este aparelho ainda não está ativado.");return}
 if(!navigator.onLine){faceMessage("O reconhecimento facial exige internet. Use o PIN para registrar offline.");return}
 busy=true;document.querySelectorAll("[data-face-entry]").forEach(x=>x.disabled=true);$("#receiptCard").hidden=true;
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error("Este aparelho não permite acesso à câmera.");
  await loadFaceModels();faceMessage("Abrindo a câmera...");faceStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:640},height:{ideal:480}}});
  const video=$("#faceVideo");video.srcObject=faceStream;video.hidden=false;
  await new Promise((resolve,reject)=>{video.onloadedmetadata=()=>video.play().then(resolve).catch(reject);setTimeout(()=>reject(new Error("A câmera demorou para iniciar.")),12000)});
  const challenge=await requestLivenessChallenge();await runActiveLiveness(video,challenge.challenge_actions);
  const descriptors=[];for(let i=0;i<3;i++){faceMessage("Conferindo identidade · leitura "+(i+1)+" de 3.");await new Promise(r=>setTimeout(r,500));const found=await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions({inputSize:320,scoreThreshold:0.6})).withFaceLandmarks().withFaceDescriptors();if(found.length!==1)throw new Error(found.length===0?"Rosto não localizado. Centralize o rosto.":"Deixe somente uma pessoa no enquadramento.");descriptors.push(Array.from(found[0].descriptor))}
  const avg=Array.from({length:128},(_,i)=>descriptors.reduce((sum,d)=>sum+d[i],0)/descriptors.length),norm=Math.sqrt(avg.reduce((sum,v)=>sum+v*v,0))||1,descriptor=avg.map(v=>v/norm);
  faceMessage("Validando identidade e presença...");
  const response=await fetch(BIOMETRIC_API,{method:"POST",headers:{"Content-Type":"application/json","apikey":API_KEY},body:JSON.stringify({action:"punch",device_token:deviceToken,entry_type:type,descriptor,challenge_id:challenge.challenge_id,challenge_actions:challenge.challenge_actions})});
  const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||"Não foi possível registrar o ponto pelo rosto.");
  faceMessage("Ponto registrado pelo reconhecimento facial.","success");$("#receiptCard").hidden=false;$("#receiptTitle").textContent="Marcação facial registrada";$("#receiptText").textContent=data.employee+" · "+entryNames[type]+" · "+new Date(data.occurred_at).toLocaleString("pt-BR");$("#receiptCode").textContent="Comprovante: "+data.receipt_code;$("#employeeCode").value="";$("#employeePin").value="";
 }catch(error){faceMessage(error.message||"Falha no reconhecimento facial.")}finally{stopFaceCamera();busy=false;document.querySelectorAll("[data-face-entry]").forEach(x=>x.disabled=false)}
}
document.querySelectorAll("[data-face-entry]").forEach(button=>button.addEventListener("click",()=>facePunch(button.dataset.faceEntry)));

window.addEventListener("online",setConnection);window.addEventListener("offline",setConnection);setConnection();updateTime();setInterval(updateTime,1000);
if(deviceToken){showPunch();syncOfflineQueue()}else showActivation();
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
async function requestLivenessChallenge(){const response=await fetch(BIOMETRIC_API,{method:"POST",headers:{"Content-Type":"application/json","apikey":API_KEY},body:JSON.stringify({action:"liveness_start",device_token:deviceToken})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||"Não foi possível iniciar a prova de vida.");return data;}
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
function eyeAspectRatio(points){const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);return (dist(points[1],points[5])+dist(points[2],points[4]))/(2*Math.max(1,dist(points[0],points[3])))}
async function runActiveLiveness(video,sequence){
 const prompts={blink:"Piscar duas vezes",turn:"Vire o rosto para um dos lados e volte"};
 let step=0,blinkCount=0,eyesClosed=false,turned=false;
 const deadline=Date.now()+22000;
 while(Date.now()<deadline&&step<sequence.length){
  const detections=await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions({inputSize:320,scoreThreshold:0.6})).withFaceLandmarks();
  if(detections.length!==1)throw new Error(detections.length===0?"Não localizamos seu rosto. Mantenha o rosto visível durante a prova de vida.":"Foi detectado mais de um rosto. Deixe somente uma pessoa no enquadramento.");
  const marks=detections[0].landmarks,left=marks.getLeftEye(),right=marks.getRightEye(),nose=marks.getNose();
  if(sequence[step]==="blink"){
   const ear=(eyeAspectRatio(left)+eyeAspectRatio(right))/2;
   if(ear<0.17)eyesClosed=true;
   if(eyesClosed&&ear>0.235){blinkCount++;eyesClosed=false}
   if(blinkCount>=2)step++;
  }else{
   const meanX=pts=>pts.reduce((s,p)=>s+p.x,0)/pts.length;
   const eyeCenter=(meanX(left)+meanX(right))/2,noseCenter=meanX(nose.slice(3));
   const eyeDistance=Math.max(1,Math.abs(meanX(left)-meanX(right)));
   if(Math.abs((noseCenter-eyeCenter)/eyeDistance)>0.13)turned=true;
   if(turned&&Math.abs((noseCenter-eyeCenter)/eyeDistance)<0.075)step++;
  }
  faceMessage(step<sequence.length?"Prova de vida: "+prompts[sequence[step]]+". Siga o movimento solicitado.":"Prova de vida concluída. Capturando o rosto...");
  if(step>=sequence.length)break;
  await new Promise(resolve=>setTimeout(resolve,180));
 }
 if(step<sequence.length)throw new Error("Não foi possível concluir a prova de vida. Tente novamente com boa iluminação e movimentos naturais.");
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
  const challenge=await requestLivenessChallenge();
  button.textContent="Prova de vida...";
  await runActiveLiveness(video,challenge.challenge_actions);
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
  const response=await fetch(BIOMETRIC_API,{method:"POST",headers:{"Content-Type":"application/json","apikey":API_KEY},body:JSON.stringify({action:"enroll",device_token:deviceToken,employee_code:code,pin,descriptor,challenge_id:challenge.challenge_id,challenge_actions:challenge.challenge_actions,...position})});
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


async function testFaceIdentification(){
 if(!deviceToken){faceMessage("Este aparelho ainda não está ativado.");return}
 if(!navigator.onLine){faceMessage("Conecte-se à internet para testar o reconhecimento.");return}
 const button=$("#faceTestButton");button.disabled=true;
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error("Este navegador não permite acesso à câmera. Abra o terminal pelo endereço HTTPS.");
  await loadFaceModels();
  faceMessage("Solicitando acesso à câmera para o teste...");
  faceStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:640},height:{ideal:480}}});
  const video=$("#faceVideo");video.srcObject=faceStream;video.hidden=false;
  await new Promise((resolve,reject)=>{video.onloadedmetadata=()=>video.play().then(resolve).catch(reject);setTimeout(()=>reject(new Error("A câmera demorou para iniciar. Tente novamente.")),12000)});
  faceMessage("Preparando a prova de vida...");
  const challenge=await requestLivenessChallenge();
  await runActiveLiveness(video,challenge.challenge_actions);
  const descriptors=[];
  for(let i=0;i<3;i++){
   faceMessage("Prova de vida concluída. Leitura facial "+(i+1)+" de 3.");
   await new Promise(resolve=>setTimeout(resolve,650));
   const detections=await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions({inputSize:320,scoreThreshold:0.6})).withFaceLandmarks().withFaceDescriptors();
   if(detections.length!==1)throw new Error(detections.length===0?"Não localizamos um rosto. Ajuste a iluminação e centralize o rosto.":"Deixe somente uma pessoa no enquadramento.");
   descriptors.push(Array.from(detections[0].descriptor));
  }
  const average=Array.from({length:128},(_,i)=>descriptors.reduce((sum,d)=>sum+d[i],0)/descriptors.length);
  const norm=Math.sqrt(average.reduce((sum,v)=>sum+v*v,0))||1;
  const descriptor=average.map(v=>v/norm);
  faceMessage("Comparando com os cadastros aprovados...");
  const response=await fetch(BIOMETRIC_API,{method:"POST",headers:{"Content-Type":"application/json","apikey":API_KEY},body:JSON.stringify({action:"identify_test",device_token:deviceToken,descriptor,challenge_id:challenge.challenge_id,challenge_actions:challenge.challenge_actions})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Não foi possível concluir o teste.");
  if(data.matched)faceMessage(data.message+" Funcionário identificado: "+data.employee,"success");
  else faceMessage(data.message||"Nenhum cadastro facial compatível foi encontrado.");
 }catch(error){faceMessage(error.message||"Falha no teste de reconhecimento.");}
 finally{stopFaceCamera();button.disabled=false}
}
$("#faceTestButton")?.addEventListener("click",testFaceIdentification);
