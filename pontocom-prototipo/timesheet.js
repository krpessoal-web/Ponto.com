/* Ponto.com — módulo Cálculo de Folha de Ponto */
(function(){
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pad = n => String(n).padStart(2,"0");
  const today = new Date();
  const monthStart = new Date(today.getFullYear(),today.getMonth(),1);
  const monthEnd = new Date(today.getFullYear(),today.getMonth()+1,0);
  const iso = d => d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const parse = v => {if(!/^\d{2}:\d{2}$/.test(String(v||"")))return null;const [h,m]=v.split(":").map(Number);return h<24&&m<60?h*60+m:null};
  const fmt = n => {n=Math.round(Number(n)||0);const sign=n<0?"-":"";n=Math.abs(n);return sign+pad(Math.floor(n/60))+":"+pad(n%60)};
  const dates = (a,b) => {const out=[];let d=new Date(a+"T12:00:00");const end=new Date(b+"T12:00:00");while(d<=end&&out.length<400){out.push(iso(d));d.setDate(d.getDate()+1)}return out};
  const weekday = s => new Date(s+"T12:00:00").getDay();
  const daysNames=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const statusNames={work:"Dia útil",off:"Folga",vacation:"Férias",leave:"Afastamento",absence:"Falta",medical:"Atestado",holiday:"Feriado",comp:"Folga compensatória"};
  let records=[], analysts=[], current=null, days={}, config={}, schedule={}, companyId="", ownerId="", editing=false;
  let companyOptions=[], companyLabel="", companyMode="registered";
  const isAdmin=()=>authProfile?.role==="kr_admin";
  const activeCompany=()=>accessCompanies.find(c=>c.id===(state.companyId||$("#companySwitcher")?.value))||accessCompanies[0]||null;
  const toastMsg=m=>{if(typeof toast==="function")toast(m);else alert(m)};
  let scaleSettings=[{type:"personalizado",label:"Personalizado",enabled:true,monthly_minutes:13200,weekly_minutes:2640,weekend_enabled:false,weekend_days:[],weekend_minutes:0},{type:"5x2",label:"5x2",enabled:true,monthly_minutes:13200,weekly_minutes:2640,weekend_enabled:false,weekend_days:[],weekend_minutes:0},{type:"6x1",label:"6x1",enabled:true,monthly_minutes:13200,weekly_minutes:2640,weekend_enabled:true,weekend_days:[6],weekend_minutes:240},{type:"12x36",label:"12x36",enabled:true,monthly_minutes:13200,weekly_minutes:2640,shift_minutes:720}];
  const defaultConfig=()=>({type:"personalizado",monthly_minutes:13200,weekly_minutes:2640,weekend_enabled:false,weekend_days:[],weekend_minutes:0});
  const defaultRates=()=>({weekday:50,saturday:50,sunday:100,holiday:100});
  function duration(start,end){let a=parse(start),b=parse(end);if(a==null||b==null)return 0;if(b<a)b+=1440;return b-a}
  function overlaps(a,b,lo,hi){return Math.max(0,Math.min(b,hi)-Math.max(a,lo))}
  function plannedMinutes(date,wd){
    if(schedule.type==="12x36"){const base=schedule.cycleStart||date;const delta=Math.round((new Date(date+"T12:00:00")-new Date(base+"T12:00:00"))/86400000);return Math.abs(delta)%2===0?Number(schedule.shift_minutes||schedule.shiftMinutes||720):0;}
    if(schedule.days&&!schedule.weekly_minutes)return Number(schedule.days[wd]||0);
    const weekly=Number(schedule.weekly_minutes||2640),weekendDays=schedule.weekend_enabled?(schedule.weekend_days||[]):[];
    if((wd===0||wd===6)&&weekendDays.includes(wd))return Number(schedule.weekend_minutes||0);
    const count=schedule.type==="6x1"&&!weekendDays.length?6:5,weekendTotal=weekendDays.length*Number(schedule.weekend_minutes||0);
    return wd>=1&&wd<=5?Math.max(0,Math.round((weekly-weekendTotal)/count)):(schedule.type==="6x1"&&wd===6&&!weekendDays.length?Math.round(weekly/6):0);
  }
  function computeDay(date,entry){
    const st=entry.status||"work",wd=weekday(date),planned=["work","medical","absence"].includes(st)?plannedMinutes(date,wd):0;
    const marks=entry.marks||["","","",""];
    let worked=0;
    if(marks[0]&&marks[3]){
      if(marks[1]&&marks[2])worked=duration(marks[0],marks[1])+duration(marks[2],marks[3]);
      else worked=duration(marks[0],marks[3]);
    }
    let night=0;
    const pairs=marks[1]&&marks[2]?[[marks[0],marks[1]],[marks[2],marks[3]]]:[[marks[0],marks[3]]];
    for(const pair of pairs){
      const a=parse(pair[0]),b=parse(pair[1]);
      if(a==null||b==null)continue;
      const end=b<a?b+1440:b;
      night+=overlaps(a,end,1320,1440)+overlaps(a,end,1440,1740);
    }
    const nightExtra=Math.round(night/7);
    const counted=worked+nightExtra;
    const extra=Math.max(0,counted-planned);
    const late=st==="absence"?planned:(st==="medical"?0:Math.max(0,planned-counted));
    const rateKey=st==="holiday"?"holiday":wd===0?"sunday":wd===6?"saturday":"weekday";
    const rate=Number(config[rateKey]??50);
    const attested=st==="medical";
    return {planned,worked,counted,extra,late,night,nightExtra,rate,rateKey,extraValue:extra*rate/100,absence:st==="absence"?1:0,attested};
  }
  function summarize(){
    const s={planned:0,worked:0,extra:0,late:0,night:0,nightExtra:0,absences:0,medical:0,off:0,vacation:0,leave:0,holiday:0,comp:0,extra50:0,extra60:0,extra100:0};
    dates($("#tsStart")?.value||iso(monthStart),$("#tsEnd")?.value||iso(monthEnd)).forEach(d=>{
      const e=days[d]||{status:"work",marks:["","","",""]};const r=computeDay(d,e);s.planned+=r.planned;s.worked+=r.worked;s.extra+=r.extra;s.late+=r.late;s.night+=r.night;s.nightExtra+=r.nightExtra;s.absences+=r.absence;
      if(r.attested)s.medical++;
      if(e.status==="off")s.off++;if(e.status==="vacation")s.vacation++;if(e.status==="leave")s.leave++;if(e.status==="holiday")s.holiday++;if(e.status==="comp")s.comp++;
      if(r.rate===50)s.extra50+=r.extra;if(r.rate===60)s.extra60+=r.extra;if(r.rate>=100)s.extra100+=r.extra;
    });return s;
  }
  function card(label,value){return '<div class="ts-kpi"><small>'+label+'</small><strong>'+value+'</strong></div>'}
  function renderRows(){
    const a=$("#tsStart").value,b=$("#tsEnd").value;
    return dates(a,b).map(d=>{
      const e=days[d]||{status:"work",marks:["","","",""],note:""};const r=computeDay(d,e);
      const marks=e.marks||["","","",""];
      const status=Object.keys(statusNames).map(k=>'<option value="'+k+'" '+(e.status===k?"selected":"")+'>'+statusNames[k]+'</option>').join("");
      const marksHtml=marks.map((v,i)=>'<td><input class="ts-time" data-date="'+d+'" data-mark="'+i+'" type="time" value="'+esc(v)+'"></td>').join("");
      return '<tr data-date="'+d+'"><td>'+d.split("-").reverse().join("/")+'</td><td>'+daysNames[weekday(d)]+'</td><td><select class="ts-status" data-date="'+d+'">'+status+'</select></td>'+marksHtml+'<td class="ts-num">'+fmt(r.worked)+'</td><td class="ts-num">'+fmt(r.extra)+'</td><td class="ts-num">'+fmt(r.late)+'</td><td class="ts-num">'+fmt(r.night)+'</td><td><input class="ts-note" data-date="'+d+'" value="'+esc(e.note||"")+'" placeholder="Observação"></td></tr>';
    }).join("");
  }
  function refreshSummary(){
    const s=summarize(),el=$("#tsSummary");if(!el)return;
    el.innerHTML=card("Horas previstas",fmt(s.planned))+card("Horas trabalhadas",fmt(s.worked))+card("Horas extras",fmt(s.extra))+card("Atrasos",fmt(s.late))+card("Adicional noturno (horas reais)",fmt(s.night))+card("Redução noturna",fmt(s.nightExtra))+card("Faltas",String(s.absences))+card("Atestados",String(s.medical));
    const body=$("#tsRows");if(body)body.innerHTML=renderRows();
  }
  function renderList(){
    const list=$("#tsSaved");if(!list)return;
    list.innerHTML=records.length?'<div class="ts-saved-list">'+records.map(r=>'<button class="ts-saved-item" data-sheet="'+r.id+'"><strong>'+esc(r.employee_name)+'</strong><span>'+esc(r.company_label||accessCompanies.find(c=>c.id===r.company_id)?.trade_name||"Empresa")+'</span><small>'+r.period_start.split("-").reverse().join("/")+' a '+r.period_end.split("-").reverse().join("/")+'</small></button>').join("")+'</div>':'<p class="muted">Ainda não existem cálculos salvos para este acesso.</p>';
  }
  async function loadRecords(){
    let q=db.from("timesheet_sheets").select("*").order("period_start",{ascending:false});
    if(!isAdmin())q=q.eq("analyst_id",authUser.id);
    const {data,error}=await q;
    if(error){toastMsg("Não foi possível carregar os cálculos: "+error.message);return}
    records=data||[];renderList();
  }
  async function loadAnalysts(){
    if(!isAdmin())return;
    const {data,error}=await db.from("profiles").select("id,full_name").eq("role","analyst").eq("active",true).order("full_name");
    if(error){toastMsg("Não foi possível carregar os analistas: "+error.message);return}
    analysts=data||[];
    const sel=$("#tsOwner");if(sel)sel.innerHTML='<option value="">Selecione o analista</option>'+analysts.map(a=>'<option value="'+a.id+'">'+esc(a.full_name)+'</option>').join("");
  }
  function setActiveCompany(id){
    const co=accessCompanies.find(x=>x.id===id);if(!co)return;
    state.companyId=co.id;state.company=co.trade_name||co.legal_name;
    const sw=$("#companySwitcher");if(sw)sw.value=co.id;
    updateCompanyHeader();const label=document.querySelector(".active-company-bar strong");if(label)label.textContent=state.company;
  }
  function fresh(){
    current=null;editing=true;days={};schedule=defaultConfig();config=defaultRates();
    const co=activeCompany();companyId=co?.id||"";companyLabel=co?.trade_name||co?.legal_name||"";companyMode="registered";ownerId=isAdmin()?"":authUser.id;
    $("#tsEmployee").value="";$("#tsStart").value=iso(monthStart);$("#tsEnd").value=iso(monthEnd);
    $("#tsScale").value=scaleSettings.find(x=>x.enabled)?.type||"personalizado";{const def=scaleSettings.find(x=>x.type===$("#tsScale").value)||{};schedule={...defaultConfig(),...def};}renderScheduleFields();
    $("#tsRateWeekday").value=50;$("#tsRateSaturday").value=50;$("#tsRateSunday").value=100;$("#tsRateHoliday").value=100;
    $("#tsCompanyMode").value="registered";$("#tsCompany").value=companyId;$("#tsCompanyName").value="";$("#tsCompanyNameWrap").hidden=true;$("#tsCompanySelectWrap").hidden=false;if(companyId)setActiveCompany(companyId);if(isAdmin())$("#tsOwner").value="";
    refreshSummary();$("#tsEditor").hidden=false;$("#tsDelete").hidden=true;
  }
  function renderScheduleFields(){
    const type=$("#tsScale")?.value||"personalizado",wrap=$("#tsScaleFields");if(!wrap)return;
    const def=scaleSettings.find(x=>x.type===type)||{};
    const monthly=Number(schedule.monthly_minutes??def.monthly_minutes??13200),weekly=Number(schedule.weekly_minutes??def.weekly_minutes??2640);
    const weekendEnabled=!!(schedule.weekend_enabled??def.weekend_enabled),weekendDays=schedule.weekend_days??def.weekend_days??[],weekendMinutes=Number(schedule.weekend_minutes??def.weekend_minutes??0);
    if(type==="12x36"){
      wrap.innerHTML='<div class="ts-scale-grid"><label>Carga mensal (horas)<input id="tsMonthlyHours" type="number" min="0" value="'+Math.round(monthly/60)+'"></label><label>Carga semanal (horas)<input id="tsWeeklyHours" type="number" min="0" value="'+Math.round(weekly/60)+'"></label><label>Data do primeiro plantão<input id="tsCycleStart" type="date" value="'+esc(schedule.cycleStart||$("#tsStart")?.value||iso(monthStart))+'"></label><label>Duração do plantão<input id="tsShiftMinutes" type="time" value="'+fmt(schedule.shift_minutes||schedule.shiftMinutes||720)+'"></label></div><p class="ts-note-info">Alternância automática de 12 horas de trabalho e 36 horas de descanso.</p>';
      return;
    }
    wrap.innerHTML='<div class="ts-scale-grid"><label>Carga mensal (horas)<input id="tsMonthlyHours" type="number" min="0" value="'+Math.round(monthly/60)+'"></label><label>Carga semanal (horas)<input id="tsWeeklyHours" type="number" min="0" value="'+Math.round(weekly/60)+'"></label><label>Trabalha aos finais de semana?<select id="tsWeekendEnabled"><option value="no" '+(!weekendEnabled?'selected':'')+'>Não</option><option value="yes" '+(weekendEnabled?'selected':'')+'>Sim</option></select></label></div><div id="tsWeekendFields" class="ts-weekend-fields" '+(!weekendEnabled?'hidden':'')+'><label>Quais dias trabalha?<div class="ts-day-checks"><label><input type="checkbox" class="ts-weekend-day" value="6" '+(weekendDays.includes(6)?'checked':'')+'> Sábado</label><label><input type="checkbox" class="ts-weekend-day" value="0" '+(weekendDays.includes(0)?'checked':'')+'> Domingo</label></div></label><label>Carga horária de cada dia do fim de semana (horas)<input id="tsWeekendHours" type="number" min="0" step="0.5" value="'+(weekendMinutes/60)+'"></label></div><p class="ts-note-info">A carga semanal será distribuída automaticamente pelos dias úteis, descontando as horas de fim de semana informadas.</p>';
  }
  function readConfig(){
    const type=$("#tsScale")?.value||"personalizado",def=scaleSettings.find(x=>x.type===type)||{};
    const monthly=Number($("#tsMonthlyHours")?.value??(Number(schedule.monthly_minutes??def.monthly_minutes??13200)/60))*60;
    const weekly=Number($("#tsWeeklyHours")?.value??(Number(schedule.weekly_minutes??def.weekly_minutes??2640)/60))*60;
    if(type==="12x36")schedule={type,monthly_minutes:monthly,weekly_minutes:weekly,cycleStart:$("#tsCycleStart")?.value||$("#tsStart").value,shift_minutes:parse($("#tsShiftMinutes")?.value)||Number(def.shift_minutes)||720};
    else schedule={type,monthly_minutes:monthly,weekly_minutes:weekly,weekend_enabled:$("#tsWeekendEnabled")?$("#tsWeekendEnabled").value==="yes":!!schedule.weekend_enabled,weekend_days:Array.from(document.querySelectorAll(".ts-weekend-day:checked")).map(x=>Number(x.value)),weekend_minutes:Number($("#tsWeekendHours")?.value??(Number(schedule.weekend_minutes??def.weekend_minutes??0)/60))*60};
    config={weekday:Number($("#tsRateWeekday").value)||0,saturday:Number($("#tsRateSaturday").value)||0,sunday:Number($("#tsRateSunday").value)||0,holiday:Number($("#tsRateHoliday").value)||0};
    companyMode=$("#tsCompanyMode")?.value||"registered";companyId=companyMode==="registered"?$("#tsCompany").value:"";companyLabel=companyMode==="registered"?(accessCompanies.find(c=>c.id===companyId)?.trade_name||accessCompanies.find(c=>c.id===companyId)?.legal_name||""):(($("#tsCompanyName")?.value||"").trim());ownerId=isAdmin()?$("#tsOwner").value:authUser.id;
  }
  function fillEditor(row){
    current=row;editing=true;days=row.day_entries||{};companyMode=row.company_id?"registered":"adhoc";companyLabel=row.company_label||"";schedule=row.schedule_config||defaultConfig();if(!schedule.type)schedule.type="personalizado";config=row.overtime_config||defaultRates();
    if(schedule.days&&!schedule.weekly_minutes){schedule.weekly_minutes=2640;schedule.monthly_minutes=13200;schedule.weekend_enabled=true;schedule.weekend_days=[6];schedule.weekend_minutes=Number(schedule.days[6]||0);}
    $("#tsEmployee").value=row.employee_name;$("#tsStart").value=row.period_start;$("#tsEnd").value=row.period_end;$("#tsScale").value=schedule.type;renderScheduleFields();
    $("#tsMonthlyHours").value=Math.round(Number(schedule.monthly_minutes??13200)/60);$("#tsWeeklyHours").value=Math.round(Number(schedule.weekly_minutes??2640)/60);
    if(schedule.type==="12x36"){$("#tsCycleStart").value=schedule.cycleStart||row.period_start;$("#tsShiftMinutes").value=fmt(schedule.shift_minutes||schedule.shiftMinutes||720);}
    else{$("#tsWeekendEnabled").value=schedule.weekend_enabled?"yes":"no";$("#tsWeekendFields").hidden=!schedule.weekend_enabled;document.querySelectorAll(".ts-weekend-day").forEach(x=>x.checked=(schedule.weekend_days||[]).includes(Number(x.value)));$("#tsWeekendHours").value=Number(schedule.weekend_minutes||0)/60;}
    $("#tsRateWeekday").value=config.weekday;$("#tsRateSaturday").value=config.saturday;$("#tsRateSunday").value=config.sunday;$("#tsRateHoliday").value=config.holiday;
    $("#tsCompanyMode").value=companyMode;$("#tsCompany").value=row.company_id||"";$("#tsCompanyName").value=companyMode==="adhoc"?companyLabel:"";$("#tsCompanySelectWrap").hidden=companyMode==="adhoc";$("#tsCompanyNameWrap").hidden=companyMode!=="adhoc";if(row.company_id)setActiveCompany(row.company_id);if(isAdmin())$("#tsOwner").value=row.analyst_id;
    $("#tsDelete").hidden=false;$("#tsEditor").hidden=false;refreshSummary();$("#tsEditor").scrollIntoView({behavior:"smooth",block:"start"});
  }
  async function loadScaleSettings(){
    const {data,error}=await db.from("timesheet_scale_settings").select("scale_options").eq("id","global").maybeSingle();
    if(!error&&data?.scale_options?.length)scaleSettings=data.scale_options;
    const sel=$("#tsScale");
    if(sel){
      const selected=sel.value;
      sel.innerHTML=scaleSettings.filter(x=>x.enabled).map(x=>'<option value="'+esc(x.type)+'">'+esc(x.label)+'</option>').join("");
      if(scaleSettings.some(x=>x.type===selected&&x.enabled))sel.value=selected;
      else sel.value=scaleSettings.find(x=>x.enabled)?.type||"personalizado";
      if(!current&&$("#tsEditor")&&!$("#tsEditor").hidden){
        const def=scaleSettings.find(x=>x.type===sel.value)||{};
        schedule={...defaultConfig(),...def};
        renderScheduleFields();
        recalcFromInputs();
      }
    }
  }
  function renderScaleSettings(){
    const el=$("#tsSettingsContent");if(!el)return;
    el.innerHTML=scaleSettings.map((x,i)=>'<div class="ts-settings-card"><label><input type="checkbox" data-scale-enabled="'+i+'" '+(x.enabled?'checked':'')+'> Disponível no cálculo</label><label>Nome<input data-scale-label="'+i+'" value="'+esc(x.label)+'"></label><label>Carga mensal (horas)<input type="number" data-scale-monthly="'+i+'" value="'+Math.round(Number(x.monthly_minutes||13200)/60)+'"></label><label>Carga semanal (horas)<input type="number" data-scale-weekly="'+i+'" value="'+Math.round(Number(x.weekly_minutes||2640)/60)+'"></label><label>Horas por dia no fim de semana<input type="number" step="0.5" data-scale-weekend="'+i+'" value="'+Number(x.weekend_minutes||0)/60+'"></label></div>').join("")+'<button class="btn" id="tsAddScale">＋ Adicionar escala personalizada</button><p class="ts-note-info">As configurações padrão aparecem automaticamente no cálculo. Particularidades de cada folha podem ser ajustadas no próprio cálculo.</p>';
  }
  async function saveScaleSettings(){
    const next=scaleSettings.map((x,i)=>({...x,enabled:document.querySelector('[data-scale-enabled="'+i+'"]').checked,label:document.querySelector('[data-scale-label="'+i+'"]').value.trim()||x.label,monthly_minutes:Number(document.querySelector('[data-scale-monthly="'+i+'"]').value||0)*60,weekly_minutes:Number(document.querySelector('[data-scale-weekly="'+i+'"]').value||0)*60,weekend_minutes:Number(document.querySelector('[data-scale-weekend="'+i+'"]').value||0)*60}));
    if(!next.some(x=>x.enabled)){toastMsg("Mantenha pelo menos uma escala disponível.");return}
    const {error}=await db.from("timesheet_scale_settings").upsert({id:"global",scale_options:next,updated_by:authUser.id,updated_at:new Date().toISOString()});
    if(error){toastMsg("Não foi possível salvar: "+error.message);return}
    scaleSettings=next;toastMsg("Configurações de escala salvas.");renderScaleSettings();await loadScaleSettings();
  }
  function getExportData(){
    readConfig();
    const start=$("#tsStart").value,end=$("#tsEnd").value;
    const company=companyMode==="adhoc"?companyLabel:(accessCompanies.find(c=>c.id===companyId)?.trade_name||accessCompanies.find(c=>c.id===companyId)?.legal_name||"Empresa");
    const owner=analysts.find(a=>a.id===ownerId)?.full_name||authProfile?.full_name||"KR Contábil";
    const summary=summarize();
    const rows=dates(start,end).map(d=>{
      const e=days[d]||{status:"work",marks:["","","",""],note:""};
      const r=computeDay(d,e),m=e.marks||["","","",""];
      return {Data:d.split("-").reverse().join("/"),Dia:daysNames[weekday(d)],Situação:statusNames[e.status||"work"],Entrada:m[0]||"","Saída intervalo":m[1]||"",Retorno:m[2]||"",Saída:m[3]||"","Horas trabalhadas":fmt(r.worked),"Horas extras":fmt(r.extra),"Percentual HE":r.rate+"%","Atrasos":fmt(r.late),"Horas noturnas":fmt(r.night),"Redução noturna":fmt(r.nightExtra),Observações:e.note||""};
    });
    return {company,name:$("#tsEmployee").value.trim(),start,end,owner,summary,rows};
  }
  function exportExcel(){
    const d=getExportData();
    const meta=[["PONTO.COM — KR ASSESSORIA CONTÁBIL"],["Empresa",d.company],["Funcionário",d.name],["Período",d.start.split("-").reverse().join("/")+" a "+d.end.split("-").reverse().join("/")],["Responsável",d.owner],[],["RESUMO"],["Horas previstas",fmt(d.summary.planned)],["Horas trabalhadas",fmt(d.summary.worked)],["Horas extras",fmt(d.summary.extra)],["Atrasos",fmt(d.summary.late)],["Horas noturnas",fmt(d.summary.night)],["Redução noturna",fmt(d.summary.nightExtra)],["Faltas",d.summary.absences],["Atestados",d.summary.medical],[],["DETALHAMENTO DIÁRIO"]];
    const headers=Object.keys(d.rows[0]||{Data:"Data"});
    if(window.XLSX){
      const wb=XLSX.utils.book_new();
      const ws=XLSX.utils.aoa_to_sheet([...meta,headers,...d.rows.map(row=>headers.map(h=>row[h]))]);
      ws["!cols"]=headers.map(h=>({wch:Math.max(13,h.length+3)}));
      XLSX.utils.book_append_sheet(wb,ws,"Folha de ponto");
      const safe=(d.name||"funcionario").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi,"_");
      XLSX.writeFile(wb,"Folha_de_ponto_"+safe+".xlsx");
    }else{
      const csv="\uFEFF"+[...meta,headers,...d.rows.map(row=>headers.map(h=>row[h]))].map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(";")).join("\r\n");
      const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
      const a=document.createElement("a");a.href=url;a.download="Folha_de_ponto.csv";a.click();URL.revokeObjectURL(url);
      toastMsg("Arquivo compatível com Excel exportado em CSV.");
    }
  }
  function exportPdf(){
    const d=getExportData(),w=window.open("","_blank");
    if(!w){toastMsg("Permita a abertura de pop-ups para gerar o PDF.");return}
    const headers=Object.keys(d.rows[0]||{Data:"Data"});
    const th=headers.map(h=>"<th>"+esc(h)+"</th>").join("");
    const body=d.rows.map(row=>"<tr>"+headers.map(h=>"<td>"+esc(row[h])+"</td>").join("")+"</tr>").join("");
    const period=d.start.split("-").reverse().join("/")+" a "+d.end.split("-").reverse().join("/");
    let html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Folha de ponto</title><style>';
    html+='body{font:10px Arial,sans-serif;color:#24131a;margin:22px}h1{font-size:20px;color:#681b39;margin:0 0 5px}.brand{font-weight:bold;color:#681b39;font-size:12px;margin-bottom:16px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;margin:16px 0;padding:12px;background:#f7f1f3;border:1px solid #e6d8de}.summary{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 18px}.summary span{padding:7px;border:1px solid #e6d8de;border-radius:5px}table{width:100%;border-collapse:collapse;font-size:8px}th{background:#681b39;color:white}th,td{border:1px solid #d9cdd2;padding:5px;text-align:left}tr:nth-child(even){background:#faf7f8}.sign{display:flex;gap:50px;margin-top:55px}.sign div{flex:1;border-top:1px solid #555;text-align:center;padding-top:7px}@page{size:landscape;margin:12mm}@media print{body{margin:0}}';
    html+='</style></head><body><div class="brand">KR ASSESSORIA CONTÁBIL · PONTO.COM</div><h1>Folha de ponto</h1><div class="meta"><div><b>Empresa:</b> '+esc(d.company)+'</div><div><b>Funcionário:</b> '+esc(d.name)+'</div><div><b>Período:</b> '+esc(period)+'</div><div><b>Responsável:</b> '+esc(d.owner)+'</div></div><h3>Resumo do período</h3><div class="summary"><span>Previstas: '+fmt(d.summary.planned)+'</span><span>Trabalhadas: '+fmt(d.summary.worked)+'</span><span>Extras: '+fmt(d.summary.extra)+'</span><span>Atrasos: '+fmt(d.summary.late)+'</span><span>Noturnas: '+fmt(d.summary.night)+'</span><span>Faltas: '+d.summary.absences+'</span><span>Atestados: '+d.summary.medical+'</span></div><table><thead><tr>'+th+'</tr></thead><tbody>'+body+'</tbody></table><div class="sign"><div>Assinatura do funcionário</div><div>Responsável pela empresa</div></div><script>window.onload=()=>setTimeout(()=>window.print(),300)<'+'/script></body></html>';
    w.document.write(html);w.document.close();
  }

  function viewHtml(){
    const co=activeCompany();
    const companies=isAdmin()?accessCompanies:accessCompanies;
    const companySelect=companies.map(c=>'<option value="'+c.id+'">'+esc(c.trade_name||c.legal_name)+'</option>').join("");
    return '<div class="page-heading"><div><p class="eyebrow">DEPARTAMENTO PESSOAL</p><h1>Cálculo de Folha de Ponto</h1><p>Apure jornadas, horas extras, faltas, atestados e adicional noturno.</p></div><div class="ts-head-actions">'+(isAdmin()?'<button class="btn" id="tsOpenSettings">Configurações de escalas</button>':'')+'<button class="btn primary" id="tsNew">＋ Novo cálculo</button></div></div>'+
    '<section class="panel ts-intro"><strong>Área individual de trabalho</strong><p>'+ (isAdmin()?"A KR pode consultar os cálculos de todos os analistas.":"Seus cálculos ficam privados e somente a KR administradora pode consultá-los.")+'</p></section>'+
    '<section id="tsSettings" class="panel ts-settings-panel" hidden><div class="panel-heading"><div><h2>Configurações de escalas</h2><p>Defina quais escalas ficam disponíveis e as cargas padrão.</p></div><button class="btn" id="tsCloseSettings">Fechar</button></div><div id="tsSettingsContent"></div><div class="ts-actions"><button class="btn primary" id="tsSaveSettings">Salvar configurações</button></div></section><section class="panel"><div class="panel-heading"><div><h2>Cálculos salvos</h2><p>Selecione um cálculo para continuar a edição.</p></div><button class="btn" id="tsReload">Atualizar</button></div><div id="tsSaved" class="ts-saved"></div></section>'+
    '<section id="tsEditor" class="panel ts-editor" hidden><div class="panel-heading"><div><h2>Dados do cálculo</h2><p>Informe funcionário, empresa, período e regras da jornada.</p></div><button class="btn" id="tsClose">Fechar</button></div>'+
    '<div class="ts-form">'+(isAdmin()?'<label>Analista responsável<select id="tsOwner"><option value="">Selecione o analista</option></select></label>':'')+
    '<label>A empresa é cadastrada?<select id="tsCompanyMode"><option value="registered">Sim, está cadastrada</option><option value="adhoc">Não, é uma empresa avulsa</option></select></label><label id="tsCompanySelectWrap">Empresa cadastrada<select id="tsCompany">'+companySelect+'</select></label><label id="tsCompanyNameWrap" hidden>Nome da empresa avulsa<input id="tsCompanyName" maxlength="180" placeholder="Digite o nome da empresa"></label><label>Funcionário<input id="tsEmployee" maxlength="140" placeholder="Nome completo do funcionário"></label><label>Data inicial<input id="tsStart" type="date" value="'+iso(monthStart)+'"></label><label>Data final<input id="tsEnd" type="date" value="'+iso(monthEnd)+'"></label>'+
    '<label>Escala de trabalho<select id="tsScale"></select></label><div id="tsScaleFields" class="ts-scale-fields"></div></div>'+
    '<h3 class="ts-subtitle">Percentuais de horas extras</h3><div class="ts-form ts-rates"><label>Dias úteis (%)<input id="tsRateWeekday" type="number" min="0" max="300" value="50"></label><label>Sábado (%)<input id="tsRateSaturday" type="number" min="0" max="300" value="50"></label><label>Domingo (%)<input id="tsRateSunday" type="number" min="0" max="300" value="100"></label><label>Feriado (%)<input id="tsRateHoliday" type="number" min="0" max="300" value="100"></label></div>'+
    '<p class="ts-note-info">O adicional noturno é apurado automaticamente entre 22h e 5h, com hora reduzida de 52min30s. A apuração considera os horários informados.</p>'+
    '<div id="tsSummary" class="ts-kpis"></div><div class="ts-table-wrap"><table class="ts-table"><thead><tr><th>Data</th><th>Dia</th><th>Situação</th><th>Entrada</th><th>Saída intervalo</th><th>Retorno</th><th>Saída</th><th>Trabalhadas</th><th>Extras</th><th>Atrasos</th><th>Noturnas</th><th>Observação</th></tr></thead><tbody id="tsRows"></tbody></table></div>'+
    '<div class="ts-actions"><button class="btn" id="tsDelete" hidden>Excluir cálculo</button><button class="btn" id="tsExportPdf">Exportar PDF</button><button class="btn" id="tsExportExcel">Exportar Excel</button><button class="btn primary" id="tsSave">Salvar cálculo</button></div></section>';
  }
  function show(){
    $("#content").innerHTML='<div class="active-company-bar"><span class="active-company-dot"></span><span class="company-context-label">Empresa ativa: <strong>'+esc(state.company)+'</strong></span></div>'+viewHtml();
    renderList();loadRecords();loadScaleSettings();if(isAdmin())loadAnalysts();
  }
  const oldRender=render;
  render=function(){
    if(authUser&&state.view==="timesheets"){
      $("#loginScreen").hidden=true;$("#appShell").hidden=false;
      $("#accessNav").hidden=authProfile?.role!=="kr_admin";
      updateCompanyHeader();
      document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view==="timesheets"));
      $("#pageCrumb")&&($("#pageCrumb").textContent="Cálculo de Folha de Ponto");
      show();return;
    }
    oldRender();
  };
  function recalcFromInputs(){
    readConfig();refreshSummary();
  }
  document.addEventListener("click",async e=>{
    if(e.target.closest("#tsExportPdf")){exportPdf();return}
    if(e.target.closest("#tsExportExcel")){exportExcel();return}
    if(e.target.closest("#tsOpenSettings")){$("#tsSettings").hidden=false;$("#tsEditor").hidden=true;renderScaleSettings();return}
    if(e.target.closest("#tsCloseSettings")){$("#tsSettings").hidden=true;return}
    if(e.target.closest("#tsSaveSettings")){await saveScaleSettings();return} if(e.target.closest("#tsAddScale")){scaleSettings.push({type:"custom_"+Date.now(),label:"Escala personalizada",enabled:true,monthly_minutes:13200,weekly_minutes:2640,weekend_enabled:false,weekend_days:[],weekend_minutes:0});renderScaleSettings();return}
    if(e.target.closest("#tsNew")){$("#tsSettings").hidden=true;fresh();return}
    if(e.target.closest("#tsClose")){$("#tsEditor").hidden=true;return}
    if(e.target.closest("#tsReload")){loadRecords();return}
    const item=e.target.closest("[data-sheet]");if(item){const row=records.find(r=>r.id===item.dataset.sheet);if(row)fillEditor(row);return}
    if(e.target.closest("#tsSave")){
      readConfig();const name=$("#tsEmployee").value.trim(),start=$("#tsStart").value,end=$("#tsEnd").value;
      if((companyMode==="registered"&&!companyId)||(companyMode==="adhoc"&&!companyLabel)||!ownerId||!name||!start||!end||end<start){toastMsg("Preencha analista, empresa, funcionário e um período válido.");return}
      if(isAdmin()&&companyMode==="registered"){const {data:link,error:linkError}=await db.from("analyst_company_access").select("id").eq("analyst_id",ownerId).eq("company_id",companyId).maybeSingle();if(linkError||!link){toastMsg("Essa empresa ainda não está vinculada à cartela do analista selecionado. Ajuste as permissões antes de salvar.");return}}
      if(dates(start,end).length>=400){toastMsg("O período máximo é de 399 dias.");return}
      const payload={analyst_id:ownerId,company_id:companyId||null,company_label:companyMode==="adhoc"?companyLabel:null,employee_name:name,period_start:start,period_end:end,schedule_config:schedule,overtime_config:config,day_entries:days};
      const btn=$("#tsSave");btn.disabled=true;btn.textContent="Salvando...";
      const result=current?await db.from("timesheet_sheets").update(payload).eq("id",current.id).select().single():await db.from("timesheet_sheets").insert(payload).select().single();
      btn.disabled=false;btn.textContent="Salvar cálculo";
      if(result.error){toastMsg("Não foi possível salvar: "+result.error.message);return}
      current=result.data;toastMsg("Cálculo salvo com sucesso.");await loadRecords();return;
    }
    if(e.target.closest("#tsDelete")&&current){
      if(!confirm("Excluir este cálculo e todos os lançamentos deste período?"))return;
      const {error}=await db.from("timesheet_sheets").delete().eq("id",current.id);
      if(error){toastMsg("Não foi possível excluir: "+error.message);return}
      toastMsg("Cálculo excluído.");$("#tsEditor").hidden=true;current=null;await loadRecords();return;
    }
  });
  document.addEventListener("change",e=>{
    const t=e.target;
    if(t.matches(".ts-time")){const d=t.dataset.date,k=Number(t.dataset.mark);days[d]=days[d]||{status:"work",marks:["","","",""],note:""};days[d].marks=days[d].marks||["","","",""];days[d].marks[k]=t.value;refreshSummary();return}
    if(t.matches(".ts-status")){const d=t.dataset.date;days[d]=days[d]||{status:"work",marks:["","","",""],note:""};days[d].status=t.value;refreshSummary();return}
    if(t.matches(".ts-note")){const d=t.dataset.date;days[d]=days[d]||{status:"work",marks:["","","",""],note:""};days[d].note=t.value;return}
    if(t.id==="tsScale"){const def=scaleSettings.find(x=>x.type===t.value)||{};schedule={...defaultConfig(),...def};renderScheduleFields();recalcFromInputs();return;}
    if(t.id==="tsWeekendEnabled"){$("#tsWeekendFields").hidden=t.value!=="yes";recalcFromInputs();return;} if(t.matches(".ts-weekend-day")){recalcFromInputs();return;}if(t.id==="tsCompany"){setActiveCompany(t.value);readConfig();return;}if(t.id==="tsCompanyMode"){companyMode=t.value;$("#tsCompanySelectWrap").hidden=companyMode!=="registered";$("#tsCompanyNameWrap").hidden=companyMode!=="adhoc";readConfig();return;}if(t.id&&t.id.startsWith("ts")){recalcFromInputs()}
  });
  document.addEventListener("input",e=>{
    const t=e.target;if(t.matches(".ts-note")){const d=t.dataset.date;days[d]=days[d]||{status:"work",marks:["","","",""],note:""};days[d].note=t.value}
    else if(t.id&&t.id.startsWith("ts")&&t.id!=="tsRows")recalcFromInputs();
  });
  document.addEventListener("DOMContentLoaded",()=>{});
  const nav=document.createElement("button");nav.className="nav-item";nav.dataset.view="timesheets";nav.innerHTML='<span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M17.5 4.8 19 3.5"/></svg></span> Cálculo de ponto <b>›</b>';
  const accessNav=$("#accessNav");if(accessNav)accessNav.parentNode.insertBefore(nav,accessNav);
  else $("#nav")?.appendChild(nav);
})();