import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});
const types=["clock_in","break_start","break_end","clock_out"];
const label=(t:string)=>({clock_in:"Entrada",break_start:"Saída para intervalo",break_end:"Retorno do intervalo",clock_out:"Saída final"} as Record<string,string>)[t]||t;
const receipt=()=>"P"+Date.now().toString(36).toUpperCase()+crypto.randomUUID().slice(0,4).toUpperCase();
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return reply({error:"Método não permitido."},405);
 const url=Deno.env.get("SUPABASE_URL")!,key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer /,"");
 if(!token)return reply({error:"Sessão não informada."},401);
 const admin=createClient(url,key,{auth:{persistSession:false}});
 const {data:{user},error:authError}=await admin.auth.getUser(token);
 if(authError||!user)return reply({error:"Sessão inválida."},401);
 const {data:caller}=await admin.from("profiles").select("role,company_id,active").eq("id",user.id).maybeSingle();
 if(!caller?.active||!["kr_admin","analyst","company_admin"].includes(caller.role))return reply({error:"Acesso não autorizado."},403);
 try{
  const b=await req.json(),action=String(b.action||""),companyId=String(b.company_id||"");
  if(!companyId)return reply({error:"Empresa não informada."},400);
  let allowed=caller.role==="kr_admin"||(caller.role==="company_admin"&&caller.company_id===companyId);
  if(caller.role==="analyst"){const {data:a}=await admin.from("analyst_company_access").select("id").eq("analyst_id",user.id).eq("company_id",companyId).maybeSingle();allowed=!!a;}
  if(!allowed)return reply({error:"Você não tem acesso a esta empresa."},403);
  const {data:company}=await admin.from("companies").select("id,status").eq("id",companyId).maybeSingle();
  if(!company||company.status!=="active")return reply({error:"Empresa inativa ou não encontrada."},403);
  const employeeFor=async(id:string)=>{const {data,error}=await admin.from("employees").select("id,company_id,full_name,employee_code,status").eq("id",id).eq("company_id",companyId).maybeSingle();if(error||!data||data.status!=="active")return null;return data;};
  const sequenceValid=async(employeeId:string,occurredAt:string,entryType:string)=>{
   const {data,error}=await admin.from("time_entries").select("entry_type,occurred_at").eq("company_id",companyId).eq("employee_id",employeeId).order("occurred_at",{ascending:true});
   if(error)throw error;
   const all=[...(data||[]).filter(x=>types.includes(x.entry_type)),{entry_type:entryType,occurred_at:occurredAt}].sort((a,b)=>new Date(a.occurred_at).getTime()-new Date(b.occurred_at).getTime());
   for(let i=0;i<all.length;i++){
    const prev=all[i-1]?.entry_type,next=all[i].entry_type;
    const valid=!prev?next==="clock_in":prev==="clock_in"?["break_start","clock_out"].includes(next):prev==="break_start"?next==="break_end":prev==="break_end"?["break_start","clock_out"].includes(next):prev==="clock_out"?next==="clock_in":false;
    if(!valid)return false;
   }
   return true;
  };
  const insertOfficial=async(employeeId:string,entryType:string,occurredAt:string,note:string)=>{
   const employee=await employeeFor(employeeId);if(!employee)throw new Error("Funcionário ativo não encontrado nesta empresa.");
   if(!types.includes(entryType))throw new Error("Tipo de marcação inválido.");
   if(!(await sequenceValid(employeeId,occurredAt,entryType)))throw new Error("A marcação não respeita a sequência da jornada. Confira os registros anteriores e posteriores.");
   const {data,error}=await admin.from("time_entries").insert({company_id:companyId,employee_id:employeeId,entry_type:entryType,occurred_at:occurredAt,source:"admin",note,created_by:user.id,location_status:"manual",receipt_code:receipt(),authentication_method:"pin",biometric_verified:false}).select("id,entry_type,occurred_at,receipt_code").single();
   if(error)throw error;
   return {entry:data,employee};
  };
  if(action==="list"){
   const [{data:entries,error:entriesError},{data:requests,error:requestsError}]=await Promise.all([
    admin.from("time_entries").select("id,employee_id,entry_type,occurred_at,source,note,receipt_code,location_status,created_by,authentication_method,biometric_verified,photo_path").eq("company_id",companyId).order("occurred_at",{ascending:false}).limit(500),
    admin.from("punch_adjustment_requests").select("id,employee_id,entry_type,occurred_at,reason,status,created_at,created_by,resolved_at,resolution_note,time_entry_id").eq("company_id",companyId).order("created_at",{ascending:false}).limit(200)
   ]);
   if(entriesError||requestsError)return reply({error:"Não foi possível carregar os lançamentos."},500);
   const ids=[...new Set([...(entries||[]).map(x=>x.employee_id),...(requests||[]).map(x=>x.employee_id)].filter(Boolean))];
   const {data:emps}=ids.length?await admin.from("employees").select("id,full_name,employee_code").in("id",ids):{data:[]};
   const map=new Map((emps||[]).map(x=>[x.id,x]));
   const visibleEntries=[...(entries||[])];
   for(const reqRow of (requests||[]).filter(x=>x.status==="approved"&&(!x.time_entry_id||!(entries||[]).some(e=>e.id===x.time_entry_id)))){
    visibleEntries.push({id:"approved-"+reqRow.id,employee_id:reqRow.employee_id,entry_type:reqRow.entry_type,occurred_at:reqRow.occurred_at,source:"approved_adjustment",note:"Marcação aprovada. "+reqRow.reason+(reqRow.resolution_note?" | Análise: "+reqRow.resolution_note:""),receipt_code:null,location_status:"manual",created_by:reqRow.resolved_by||reqRow.created_by,authentication_method:"pin",biometric_verified:false});
   }
   const signedEntries=await Promise.all(visibleEntries.map(async x=>{let photo_url=null;if(x.photo_path){const {data:signed}=await admin.storage.from("punch-photos").createSignedUrl(x.photo_path,3600);photo_url=signed?.signedUrl||null;}return {...x,photo_url,employee_name:map.get(x.employee_id)?.full_name||"Funcionário",employee_code:map.get(x.employee_id)?.employee_code||""};}));
   return reply({success:true,entries:signedEntries.sort((a,b)=>new Date(b.occurred_at).getTime()-new Date(a.occurred_at).getTime()),requests:(requests||[]).map(x=>({...x,employee_name:map.get(x.employee_id)?.full_name||"Funcionário",employee_code:map.get(x.employee_id)?.employee_code||""}))});
  }
  if(action==="create_request"){
   const employeeId=String(b.employee_id||""),entryType=String(b.entry_type||""),occurredAt=new Date(String(b.occurred_at||"")).toISOString(),reason=String(b.reason||"").trim();
   if(!employeeId||!types.includes(entryType)||!reason||reason.length<8)return reply({error:"Informe funcionário, tipo, data/hora e justificativa (mínimo de 8 caracteres)."},400);
   if(!await employeeFor(employeeId))return reply({error:"Funcionário ativo não encontrado nesta empresa."},404);
   const {data,error}=await admin.from("punch_adjustment_requests").insert({company_id:companyId,employee_id:employeeId,entry_type:entryType,occurred_at:occurredAt,reason,status:"pending",created_by:user.id}).select("id").single();
   if(error)return reply({error:"Não foi possível criar a pendência."},500);
   await admin.from("audit_logs").insert({company_id:companyId,actor_id:user.id,action:"punch.adjustment_requested",entity_table:"punch_adjustment_requests",entity_id:data.id,details:{operation:"missing_punch_reported",entry_type:entryType,occurred_at:occurredAt,reason}});
   return reply({success:true,id:data.id});
  }
  if(action==="resolve_request"){
   const requestId=String(b.request_id||""),decision=String(b.decision||""),note=String(b.note||"").trim();
   if(!/^[0-9a-f-]{36}$/i.test(requestId)||!["approve","reject"].includes(decision)||note.length<4)return reply({error:"Informe uma decisão e uma observação para a análise."},400);
   const {data:reqRow,error:reqError}=await admin.from("punch_adjustment_requests").select("*").eq("id",requestId).eq("company_id",companyId).eq("status","pending").maybeSingle();
   if(reqError||!reqRow)return reply({error:"Pendência não encontrada ou já tratada."},404);
   let timeEntryId=null;
   if(decision==="approve"){
    const result=await insertOfficial(reqRow.employee_id,reqRow.entry_type,reqRow.occurred_at,"Marcação esquecida. "+reqRow.reason+" | Aprovação: "+note);
    timeEntryId=result.entry.id;
   }
   const {error:updateError}=await admin.from("punch_adjustment_requests").update({status:decision==="approve"?"approved":"rejected",resolved_by:user.id,resolved_at:new Date().toISOString(),resolution_note:note,time_entry_id:timeEntryId}).eq("id",requestId).eq("status","pending");
   if(updateError)return reply({error:"Não foi possível concluir a análise."},500);
   await admin.from("audit_logs").insert({company_id:companyId,actor_id:user.id,action:decision==="approve"?"punch.adjustment_approved":"punch.adjustment_rejected",entity_table:"punch_adjustment_requests",entity_id:requestId,details:{operation:"missing_punch_review",decision,note,time_entry_id:timeEntryId}});
   return reply({success:true,time_entry_id:timeEntryId,occurred_at:reqRow.occurred_at});
  }
  if(action==="manual_create"){
   const employeeId=String(b.employee_id||""),entryType=String(b.entry_type||""),occurredAt=new Date(String(b.occurred_at||"")).toISOString(),note=String(b.note||"").trim();
   if(!employeeId||!types.includes(entryType)||!note||note.length<8)return reply({error:"Informe funcionário, tipo, data/hora e justificativa (mínimo de 8 caracteres)."},400);
   const result=await insertOfficial(employeeId,entryType,occurredAt,"Lançamento manual pelo administrador. "+note);
   await admin.from("audit_logs").insert({company_id:companyId,actor_id:user.id,action:"punch.manual_created",entity_table:"time_entries",entity_id:result.entry.id,details:{operation:"admin_manual_punch",employee_id:employeeId,entry_type:entryType,occurred_at:occurredAt,note}});
   return reply({success:true,entry:result.entry,employee:result.employee.full_name});
  }
  return reply({error:"Ação inválida."},400);
 }catch(error){console.error(error);return reply({error:error instanceof Error?error.message:"Falha ao processar o lançamento."},400);}
});