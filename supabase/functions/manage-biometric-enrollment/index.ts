import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 return new Response(JSON.stringify({error:"O reconhecimento facial foi desativado no Ponto.com. Utilize matrícula, senha e foto temporária."}),{status:410,headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});
});