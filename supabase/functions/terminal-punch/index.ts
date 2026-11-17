import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type, x-terminal-flow-version","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});
const hash=async(value:string)=>{const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");};
const verifyPin=async(pin:string,stored:string)=>{const parts=String(stored||"").split("$");if(parts.length!==4||parts[0]!=="pbkdf2"||parts[1]!=="120000")return false;const salt=Uint8Array.from(parts[2].match(/.{2}/g)||[],x=>parseInt(x,16));const expected=parts[3];if(salt.length!==16||expected.length!==64)return false;const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:120000,hash:"SHA-256"},key,256);const actual=[...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,"0")).join("");return actual===expected;};
const randomToken=()=>{const b=crypto.getRandomValues(new Uint8Array(32));return [...b].map(x=>x.toString(16).padStart(2,"0")).join("");};
const distance=(a:number,b:number,c:number,d:number)=>{const rad=(x:number)=>x*Math.PI/180,R=6371000,dl=rad(c-a),dn=rad(d-b),v=Math.sin(dl/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dn/2)**2;return 2*R*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));};
const types=["clock_in","break_start","break_end","clock_out"];
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return reply({error:"Método não permitido."},405);
 const url=Deno.env.get("SUPABASE_URL")!,key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const admin=createClient(url,key,{auth:{persistSession:false}});
 try{
  const b=await req.json(),action=String(b.action||"");
  if(action==="activate"){
   const code=String(b.activation_code||"").replace(/\D/g,"");
   if(!/^\d{8}$/.test(code))return reply({error:"Informe o código de ativação de oito dígitos."},400);
   const {data:device}=await admin.from("terminal_devices").select("id,company_id,device_name,activation_expires_at,status").eq("activation_code_hash",await hash(code)).eq("status","pending").maybeSingle();
   if(!device||!device.activation_expires_at||new Date(device.activation_expires_at).getTime()<Date.now())return reply({error:"Código inválido ou expirado. Solicite um novo código à empresa."},401);
   const token=randomToken();
   const {data:company}=await admin.from("companies").select("trade_name,legal_name,status").eq("id",device.company_id).maybeSingle();
   if(!company||company.status!=="active")return reply({error:"Empresa sem acesso ativo."},403);
   const {error}=await admin.from("terminal_devices").update({status:"active",device_token_hash:await hash(token),activation_code_hash:null,activation_expires_at:null,activated_at:new Date().toISOString(),last_seen_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",device.id);
   if(error)return reply({error:"Não foi possível ativar este aparelho."},500);
   await admin.from("audit_logs").insert({company_id:device.company_id,action:"terminal.device.activated",entity_table:"terminal_devices",entity_id:device.id,details:{operation:"terminal_activated"}});
   return reply({success:true,token,company:company.trade_name||company.legal_name,device_name:device.device_name});
  }
  const deviceToken=String(b.device_token||"");
  if(deviceToken.length<32)return reply({error:"Terminal não autorizado. Ative este aparelho novamente."},401);
  const {data:device}=await admin.from("terminal_devices").select("id,company_id,status,failed_pin_attempts,locked_until").eq("device_token_hash",await hash(deviceToken)).eq("status","active").maybeSingle();
  if(!device)return reply({error:"Terminal não autorizado. Ative este aparelho novamente."},401);
  await admin.from("terminal_devices").update({last_seen_at:new Date().toISOString()}).eq("id",device.id);
  const {data:company}=await admin.from("companies").select("trade_name,legal_name,status").eq("id",device.company_id).maybeSingle();
  if(!company||company.status!=="active")return reply({error:"A empresa está com acesso inativo."},403);
  if(action==="status")return reply({success:true,company:company.trade_name||company.legal_name});
  if(action!=="identify"&&action!=="verify_pin"&&action!=="punch"&&action!=="history"&&action!=="offline_sync")return reply({error:"Ação inválida."},400);
  if(device.locked_until&&new Date(device.locked_until).getTime()>Date.now())return reply({error:"Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."},423);
  const employeeCode=String(b.employee_code||"").replace(/\D/g,""),pin=String(b.pin||"");
  const entryType=String(b.entry_type||"");
  if(!/^\d{4}$/.test(employeeCode)||((action!=="identify")&&!/^\d{4}$/.test(pin))||((action==="punch"||action==="offline_sync")&&!types.includes(entryType)))return reply({error:"Confira a matrícula, o PIN e o tipo de marcação."},400);
  const latitude=b.latitude!==null&&b.latitude!==undefined&&Number.isFinite(Number(b.latitude))?Number(b.latitude):null;
  const longitude=b.longitude!==null&&b.longitude!==undefined&&Number.isFinite(Number(b.longitude))?Number(b.longitude):null;
  const accuracy=b.accuracy_m!==null&&b.accuracy_m!==undefined&&Number.isFinite(Number(b.accuracy_m))?Number(b.accuracy_m):null;
  const {data:employee}=await admin.from("employees").select("id,full_name,status").eq("company_id",device.company_id).eq("employee_code",employeeCode).maybeSingle();
  if(!employee||employee.status!=="active"){
   await admin.from("terminal_devices").update({failed_pin_attempts:(device.failed_pin_attempts||0)+1,locked_until:(device.failed_pin_attempts||0)+1>=5?new Date(Date.now()+15*60*1000).toISOString():null}).eq("id",device.id);
   await admin.from("punch_attempts").insert({company_id:device.company_id,device_id:device.id,entry_type:entryType,latitude,longitude,accuracy_m:accuracy,status:"rejected",reason:"invalid_employee"});
   return reply({error:"Matrícula ou PIN inválidos."},401);
  }
  if(action==="identify"){
   const {data:lastEntry}=await admin.from("time_entries").select("entry_type,occurred_at").eq("company_id",device.company_id).eq("employee_id",employee.id).order("occurred_at",{ascending:false}).limit(1).maybeSingle();
   return reply({success:true,employee:employee.full_name,last_entry_type:lastEntry?.entry_type||null});
  }
  const {data:credential}=await admin.from("employee_credentials").select("pin_hash").eq("employee_id",employee.id).maybeSingle();
  if(!credential||!(await verifyPin(pin,credential.pin_hash))){
   const fails=(device.failed_pin_attempts||0)+1;
   await admin.from("terminal_devices").update({failed_pin_attempts:fails,locked_until:fails>=5?new Date(Date.now()+15*60*1000).toISOString():null}).eq("id",device.id);
   await admin.from("punch_attempts").insert({company_id:device.company_id,employee_id:employee.id,device_id:device.id,entry_type:entryType,latitude,longitude,accuracy_m:accuracy,status:"rejected",reason:"invalid_pin"});
   return reply({error:"Matrícula ou PIN inválidos."},401);
  }
  await admin.from("terminal_devices").update({failed_pin_attempts:0,locked_until:null}).eq("id",device.id);
  if(action==="verify_pin")return reply({success:true,employee:employee.full_name});
  if(action==="offline_sync"){
   const clientAttemptId=String(b.client_attempt_id||"");
   const attemptedAt=new Date(String(b.occurred_at||""));
   if(!/^[0-9a-f-]{36}$/i.test(clientAttemptId)||!Number.isFinite(attemptedAt.getTime()))return reply({error:"Dados da marcação offline inválidos."},400);
   if(attemptedAt.getTime()<Date.now()-7*24*60*60*1000||attemptedAt.getTime()>Date.now()+5*60*1000)return reply({error:"O horário informado para a marcação offline está fora do período permitido (máximo de 7 dias)."},400);
   const {data:existingEntry}=await admin.from("time_entries").select("id,receipt_code,occurred_at,location_status").eq("offline_client_attempt_id",clientAttemptId).maybeSingle();
   const {data:existing}=await admin.from("punch_attempts").select("id,status,reason").eq("client_attempt_id",clientAttemptId).maybeSingle();
   if(existingEntry){
    if(!existing){
     await admin.from("punch_attempts").insert({company_id:device.company_id,employee_id:employee.id,device_id:device.id,entry_type:entryType,attempted_at:existingEntry.occurred_at,latitude,longitude,accuracy_m:accuracy,status:"accepted",reason:"offline_auto_synced",authentication_method:"pin",client_attempt_id:clientAttemptId});
    }
    return reply({success:true,review:false,duplicate:true,employee:employee.full_name,entry_type:entryType,occurred_at:existingEntry.occurred_at,receipt_code:existingEntry.receipt_code,location_status:existingEntry.location_status,message:"Marcação offline já sincronizada e registrada."});
   }
   if(existing){
    if(existing.status==="accepted")return reply({success:true,review:false,duplicate:true,message:"Marcação offline já sincronizada e registrada."});
    if(existing.status==="rejected")return reply({error:"Esta marcação offline já foi recusada: "+String(existing.reason||"registro inválido")},409);
    return reply({error:"Esta marcação já existe e precisa ser verificada pelo responsável."},409);
   }
   const locationStatus=null;
   const distanceM:number|null=null;
   const offlineReason="device_token_authorized";
   const {data:existingEntries,error:historyError}=await admin.from("time_entries").select("entry_type,occurred_at").eq("company_id",device.company_id).eq("employee_id",employee.id).order("occurred_at",{ascending:true});
   if(historyError)return reply({error:"Não foi possível validar a sequência da jornada offline."},500);
   const timeline=[...(existingEntries||[]).map((x:any)=>({entry_type:x.entry_type,occurred_at:new Date(x.occurred_at).getTime()})),{entry_type:entryType,occurred_at:attemptedAt.getTime()}].sort((a:any,b:any)=>a.occurred_at-b.occurred_at);
   const allowed=(previous:string|null,next:string)=>previous===null?next==="clock_in":previous==="clock_in"?["break_start","clock_out"].includes(next):previous==="break_start"?next==="break_end":previous==="break_end"?["break_start","clock_out"].includes(next):previous==="clock_out"?next==="clock_in":false;
   let previous:string|null=null,sequenceValid=true;
   for(const item of timeline){if(!allowed(previous,item.entry_type)){sequenceValid=false;break;}previous=item.entry_type;}
   if(!sequenceValid){
    const {error:attemptError}=await admin.from("punch_attempts").insert({company_id:device.company_id,employee_id:employee.id,device_id:device.id,entry_type:entryType,attempted_at:attemptedAt.toISOString(),latitude,longitude,accuracy_m:accuracy,distance_m:distanceM,status:"rejected",reason:"offline_invalid_sequence",authentication_method:"pin",client_attempt_id:clientAttemptId});
    if(attemptError)return reply({error:"Não foi possível registrar a tentativa offline."},500);
    return reply({error:"A marcação offline não respeita a sequência da jornada. Ela não foi lançada automaticamente."},409);
   }
   const receipt="P"+Date.now().toString(36).toUpperCase()+crypto.randomUUID().slice(0,4).toUpperCase();
   const note="Registrada offline e sincronizada automaticamente. Localização: "+offlineReason+". Horário informado pelo aparelho.";
   const {error:entryError}=await admin.from("time_entries").insert({company_id:device.company_id,employee_id:employee.id,entry_type:entryType,occurred_at:attemptedAt.toISOString(),source:"mobile",note,device_id:device.id,latitude,longitude,accuracy_m:accuracy,location_status:locationStatus,receipt_code:receipt,authentication_method:"pin",biometric_verified:false,offline_client_attempt_id:clientAttemptId});
   if(entryError)return reply({error:"Não foi possível salvar a marcação offline como lançamento oficial."},500);
   const {error:attemptError}=await admin.from("punch_attempts").insert({company_id:device.company_id,employee_id:employee.id,device_id:device.id,entry_type:entryType,attempted_at:attemptedAt.toISOString(),latitude,longitude,accuracy_m:accuracy,distance_m:distanceM,status:"accepted",reason:"offline_auto_synced",authentication_method:"pin",client_attempt_id:clientAttemptId});
   if(attemptError)return reply({error:"A marcação foi lançada, mas não foi possível concluir o registro de auditoria da sincronização. Contate o suporte."},500);
   await admin.from("audit_logs").insert({company_id:device.company_id,action:"punch.offline.auto_synced",entity_table:"time_entries",details:{operation:"offline_punch_auto_synced",employee_id:employee.id,device_id:device.id,entry_type:entryType,occurred_at:attemptedAt.toISOString(),location_status:locationStatus,location_reason:offlineReason,receipt_code:receipt,client_attempt_id:clientAttemptId}});
   return reply({success:true,review:false,employee:employee.full_name,entry_type:entryType,occurred_at:attemptedAt.toISOString(),receipt_code:receipt,location_status:locationStatus,message:"Marcação offline sincronizada e registrada automaticamente."});
  }
  if(action==="history"){
   const {data:entries,error}=await admin.from("time_entries").select("entry_type,occurred_at,receipt_code,location_status").eq("company_id",device.company_id).eq("employee_id",employee.id).order("occurred_at",{ascending:false}).limit(20);
   if(error)return reply({error:"Não foi possível consultar o histórico."},500);
   return reply({success:true,employee:employee.full_name,entries:entries||[]});
  }
  const now=new Date().toISOString();
  const distanceM:number|null=null;
  const {data:last}=await admin.from("time_entries").select("entry_type,occurred_at").eq("company_id",device.company_id).eq("employee_id",employee.id).order("occurred_at",{ascending:false}).limit(1).maybeSingle();
  const validNext=entryType==="clock_in"?(!last||last.entry_type==="clock_out"):entryType==="break_start"?(last?.entry_type==="clock_in"||last?.entry_type==="break_end"):entryType==="break_end"?last?.entry_type==="break_start":(last?.entry_type==="clock_in"||last?.entry_type==="break_end");
  const sequenceSkipped=!validNext;
  const photoBase64=String(b.photo_base64||"").replace(/^data:image\/jpeg;base64,/i,"");
  const photoRequired=req.headers.get("x-terminal-flow-version")==="photo-v1";
  let photoPath:string|null=null;
  if(photoBase64){
   if(photoBase64.length>160000||!/^[A-Za-z0-9+/]+={0,2}$/.test(photoBase64))return reply({error:"A foto ultrapassou o limite permitido. Tire outra foto."},400);
   const photoBytes=Uint8Array.from(atob(photoBase64),c=>c.charCodeAt(0));
   if(photoBytes.length>120000)return reply({error:"A foto ficou muito grande. Tire novamente com a câmera mais próxima."},413);
   photoPath=device.company_id+"/"+employee.id+"/"+now.slice(0,7)+"/"+crypto.randomUUID()+".jpg";
   const {error:photoError}=await admin.storage.from("punch-photos").upload(photoPath,photoBytes,{contentType:"image/jpeg",cacheControl:"3600",upsert:false});
   if(photoError)return reply({error:"Não foi possível enviar a foto para conferência. A marcação não foi registrada."},500);
  }else if(photoRequired)return reply({error:"A foto é obrigatória para concluir a marcação. Tire novamente."},400);
  const receipt="P"+Date.now().toString(36).toUpperCase()+crypto.randomUUID().slice(0,4).toUpperCase();
  const {error:insertError}=await admin.from("time_entries").insert({company_id:device.company_id,employee_id:employee.id,entry_type:entryType,occurred_at:now,source:"mobile",device_id:device.id,latitude,longitude,accuracy_m:accuracy,receipt_code:receipt,photo_path:photoPath});
  if(insertError){if(photoPath)await admin.storage.from("punch-photos").remove([photoPath]);return reply({error:"Não foi possível salvar a marcação. Tente novamente."},500);}
  await admin.from("punch_attempts").insert({company_id:device.company_id,employee_id:employee.id,device_id:device.id,entry_type:entryType,attempted_at:now,latitude,longitude,accuracy_m:accuracy,distance_m:distanceM,status:"accepted",reason:sequenceSkipped?"sequence_skipped":"sequence_ok"});
  return reply({success:true,employee:employee.full_name,entry_type:entryType,occurred_at:now,receipt_code:receipt,sequence_skipped:sequenceSkipped});
 }catch(error){console.error("terminal-punch error:",error instanceof Error?error.message:String(error));return reply({error:"Falha inesperada ao processar a marcação."},500);}
});