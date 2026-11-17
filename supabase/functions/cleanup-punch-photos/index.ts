import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type, x-job-token","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return reply({error:"Método não permitido."},405);
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 try{
  const {data:secret}=await admin.from("internal_job_secrets").select("secret").eq("name","cleanup-punch-photos").maybeSingle();
  if(!secret?.secret||req.headers.get("x-job-token")!==secret.secret)return reply({error:"Não autorizado."},401);
  const cutoff=new Date();cutoff.setUTCDate(1);cutoff.setUTCHours(0,0,0,0);
  let removed=0,updated=0;
  while(true){
   const {data:rows,error}=await admin.from("time_entries").select("id,photo_path").not("photo_path","is",null).lt("occurred_at",cutoff.toISOString()).limit(500);
   if(error)throw error;
   if(!rows?.length)break;
   const paths=rows.map(x=>x.photo_path).filter(Boolean);
   if(paths.length){const {error:removeError}=await admin.storage.from("punch-photos").remove(paths);if(removeError)throw removeError;removed+=paths.length;}
   const ids=rows.map(x=>x.id);
   const {error:updateError}=await admin.from("time_entries").update({photo_path:null}).in("id",ids);
   if(updateError)throw updateError;
   updated+=ids.length;
   if(rows.length<500)break;
  }
  return reply({success:true,removed,updated,cutoff:cutoff.toISOString()});
 }catch(error){console.error(error);return reply({error:error instanceof Error?error.message:"Falha ao excluir fotos antigas."},500);}
});