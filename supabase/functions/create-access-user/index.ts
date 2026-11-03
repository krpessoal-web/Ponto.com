import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
 if(req.method!=="POST") return reply({error:"Método não permitido."},405);
 const url=Deno.env.get("SUPABASE_URL")!,key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer /,"");
 if(!token) return reply({error:"Sessão não informada."},401);
 const admin=createClient(url,key,{auth:{persistSession:false}});
 const {data:{user},error:authError}=await admin.auth.getUser(token);
 if(authError||!user) return reply({error:"Sessão inválida."},401);
 const {data:caller}=await admin.from("profiles").select("role,active").eq("id",user.id).maybeSingle();
 if(caller?.role!=="kr_admin"||!caller.active) return reply({error:"Somente a KR pode cadastrar usuários."},403);
 try{
  const b=await req.json();const email=String(b.email||"").trim().toLowerCase();
  const full_name=String(b.full_name||"").trim();const role=b.role;
  if(!email||!full_name||!b.password||String(b.password).length<8) return reply({error:"Informe nome, e-mail e senha inicial com pelo menos 8 caracteres."},400);
  if(!["analyst","company_admin"].includes(role)) return reply({error:"Perfil inválido."},400);
  if(role==="company_admin"&&!b.company_id) return reply({error:"Selecione a empresa."},400);
  if(role==="analyst"&&b.company_id) return reply({error:"Analista não deve ter empresa fixa."},400);
  const {data:created,error:createError}=await admin.auth.admin.createUser({email,password:b.password,email_confirm:false});
  if(createError||!created.user) return reply({error:createError?.message||"Falha ao criar usuário."},400);
  const {error:profileError}=await admin.from("profiles").insert({id:created.user.id,email,full_name,cpf:b.cpf||null,phone:b.phone||null,role,company_id:b.company_id||null,active:true});
  if(profileError){await admin.auth.admin.deleteUser(created.user.id);return reply({error:profileError.message},400);}
  return reply({user_id:created.user.id,email,role});
 }catch(_e){return reply({error:"Não foi possível concluir o cadastro."},500);}
});