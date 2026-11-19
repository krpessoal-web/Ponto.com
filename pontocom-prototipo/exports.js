/* Kronius — documentos exportados (PDF/Excel) com a identidade visual do sistema */
(function(){
const KR_TILE="data:image/png;base64,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",KR_WORD="data:image/png;base64,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";
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const CSS=`
  @page{size:A4 portrait;margin:14mm 12mm 16mm}
  *{box-sizing:border-box}
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{margin:0;color:#303238;font:11px/1.45 Inter,-apple-system,"Segoe UI",Arial,sans-serif;background:#ffffff}
  .doc-head{position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:22px 26px 20px;border-radius:14px;color:#ffffff;background:radial-gradient(ellipse at 92% 8%,rgba(214,79,97,.38),transparent 46%),linear-gradient(135deg,#250307 0%,#46060f 55%,#600915 100%)}
  .doc-head:after{content:"";position:absolute;right:-70px;bottom:-95px;width:300px;height:190px;border:1px solid rgba(229,172,180,.35);border-radius:50%;transform:rotate(-24deg)}
  .doc-brand{position:relative;z-index:1}
  .doc-lockup{display:flex;align-items:center;gap:9px}.doc-tile{width:30px;height:30px}.doc-word{height:19px}
  .doc-wordmark{font-size:22px;font-weight:800;letter-spacing:-.8px;line-height:1}
  .doc-wordmark span{color:#e5acb4}
  .doc-tagline{margin-top:5px;color:#eaced2;font-size:8px;letter-spacing:1.7px;text-transform:uppercase}
  .doc-title{position:relative;z-index:1;text-align:right;max-width:62%}
  .doc-kicker{margin:0 0 4px;color:#e5acb4;font-size:8px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
  .doc-title h1{margin:0;font-size:21px;font-weight:800;letter-spacing:-.6px;line-height:1.15}
  .doc-title p{margin:5px 0 0;color:#efdddf;font-size:10px}
  .doc-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:14px 0 0}
  .doc-meta div{padding:9px 12px;border:1px solid #e4e4e4;border-radius:10px;background:#f8f8f8}
  .doc-meta small{display:block;color:#7c7f8b;font-size:7.5px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase}
  .doc-meta strong{display:block;margin-top:3px;color:#303238;font-size:11px}
  .doc-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:12px 0 4px}
  .doc-kpi{padding:11px 13px;border-radius:11px;border:1px solid #e4e4e4;border-left:3px solid #881423;background:linear-gradient(145deg,#ffffff,#f6f6f6)}
  .doc-kpi small{display:block;color:#7c7f8b;font-size:7.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase}
  .doc-kpi strong{display:block;margin-top:4px;color:#303238;font-size:17px;font-weight:800;letter-spacing:-.5px}
  .doc-kpi.pos{border-left-color:#2f7d57}.doc-kpi.pos strong{color:#1f6a46}
  .doc-kpi.neg{border-left-color:#b62438}.doc-kpi.neg strong{color:#b62438}
  .doc-section{margin-top:18px;break-inside:auto}
  .doc-section h2{display:flex;align-items:center;gap:8px;margin:0 0 3px;color:#303238;font-size:13px;font-weight:800;letter-spacing:-.2px;break-after:avoid}
  .doc-section h2:before{content:"";width:4px;height:15px;border-radius:3px;background:linear-gradient(180deg,#d64f61,#881423)}
  .doc-section .note{margin:0 0 7px 12px;color:#7c7f8b;font-size:9px;break-after:avoid}
  table{width:100%;border-collapse:separate;border-spacing:0;margin-top:6px;font-size:9.5px}
  thead{display:table-header-group}
  th{padding:8px 9px;background:#f2f2f2;color:#6f0d1a;font-size:7.5px;font-weight:800;letter-spacing:1px;text-align:left;text-transform:uppercase;border-top:1px solid #efe1e3;border-bottom:1px solid #efe1e3}
  th:first-child{border-left:1px solid #efe1e3;border-radius:8px 0 0 0}th:last-child{border-right:1px solid #efe1e3;border-radius:0 8px 0 0}
  td{padding:7px 9px;border-bottom:1px solid #ebebeb;color:#303238;vertical-align:top}
  tbody tr{break-inside:avoid}
  tbody tr:nth-child(even) td{background:#fafafa}
  td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
  td.strong{font-weight:800;color:#303238}
  td.pos{color:#1f6a46;font-weight:800}td.neg{color:#b62438;font-weight:800}
  td.muted{color:#8a8d97}
  .empty{padding:18px;border:1px dashed #dadada;border-radius:10px;color:#7c7f8b;text-align:center}
  .signatures{display:grid;grid-template-columns:1fr 1fr;gap:46px;margin-top:54px;break-inside:avoid}
  .signatures div{padding-top:7px;border-top:1px solid #5e6069;color:#5e6069;font-size:9px;text-align:center}
  .doc-foot{display:flex;justify-content:space-between;gap:12px;margin-top:26px;padding-top:8px;border-top:1px solid #e4e4e4;color:#8a8d97;font-size:9px}
  .doc-foot b{color:#881423}
  @media screen{body{max-width:980px;margin:26px auto;padding:0 22px}}
  @media print{.doc-foot{display:none}}
  `;

  function fmtDate(iso){return iso?new Date(iso+"T12:00:00").toLocaleDateString("pt-BR"):""}

  function tableHtml(headers,rows,opts={}){
    const num=new Set(opts.numeric||[]),strong=new Set(opts.strong||[]),muted=new Set(opts.muted||[]);
    const th=headers.map((h,i)=>'<th'+(num.has(i)?' class="num"':'')+'>'+esc(h)+'</th>').join("");
    const body=rows.map(r=>'<tr>'+r.map((c,i)=>{
      let cls=[];if(num.has(i))cls.push("num");if(strong.has(i))cls.push("strong");if(muted.has(i))cls.push("muted");
      const text=String(c??"");
      if(opts.tone&&opts.tone.includes(i)){if(/^[−-]/.test(text)&&text!=="—")cls.push("neg");else if(/^\+/.test(text)||(text&&text!=="00:00"&&text!=="—"&&opts.tonePositiveIfPlain))cls.push("pos");}
      return '<td'+(cls.length?' class="'+cls.join(" ")+'"':'')+'>'+esc(c)+'</td>';
    }).join("")+'</tr>').join("");
    return '<table><thead><tr>'+th+'</tr></thead><tbody>'+(rows.length?body:'<tr><td colspan="'+headers.length+'" class="muted" style="text-align:center;padding:16px">Sem registros para exibir.</td></tr>')+'</tbody></table>';
  }

  // Lê uma <table> do DOM e devolve cabeçalhos e linhas em texto
  function readTable(table){
    const headers=[...table.querySelectorAll("thead th")].map(th=>th.innerText.trim());
    const rows=[...table.querySelectorAll("tbody tr")].map(tr=>[...tr.children].map(td=>td.innerText.replace(/\s+/g," ").trim()));
    return {headers,rows};
  }

  function buildHtml(o){
    const meta=(o.meta||[]).filter(x=>x&&x[1]!==undefined&&x[1]!=="");
    const kpis=(o.kpis||[]);
    const sections=(o.sections||[]);
    const now=new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
    const boxes='@page{@bottom-left{content:"Kronius · KR Contábil · Documento gerado pelo sistema";font:600 7.5px Inter,Arial,sans-serif;color:#8a8d97}@bottom-center{content:"Página " counter(page) " de " counter(pages);font:700 7.5px Inter,Arial,sans-serif;color:#881423}@bottom-right{content:"Emitido em '+now+'";font:600 7.5px Inter,Arial,sans-serif;color:#8a8d97}}';
    const page=boxes+(o.landscape?"@page{size:A4 landscape;margin:12mm 12mm 15mm}":"");
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>'+esc(o.title)+' · Kronius</title><style>'+CSS+page+'</style></head><body>'+
      '<header class="doc-head"><div class="doc-brand"><div class="doc-lockup"><img class="doc-tile" src="'+KR_TILE+'" alt=""><img class="doc-word" src="'+KR_WORD+'" alt="Kronius"></div><div class="doc-tagline">Gestão de Pessoas, de um jeito mais inteligente</div></div><div class="doc-title"><p class="doc-kicker">'+esc(o.kicker||"Gestão de jornada")+'</p><h1>'+esc(o.title)+'</h1>'+(o.subtitle?'<p>'+esc(o.subtitle)+'</p>':'')+'</div></header>'+
      (meta.length?'<div class="doc-meta">'+meta.map(([k,v])=>'<div><small>'+esc(k)+'</small><strong>'+esc(v)+'</strong></div>').join("")+'</div>':'')+
      (kpis.length?'<div class="doc-kpis">'+kpis.map(k=>'<div class="doc-kpi '+(k[2]||"")+'"><small>'+esc(k[0])+'</small><strong>'+esc(k[1])+'</strong></div>').join("")+'</div>':'')+
      sections.map(s=>'<section class="doc-section">'+(s.title?'<h2>'+esc(s.title)+'</h2>':'')+(s.note?'<p class="note">'+esc(s.note)+'</p>':'')+(s.html||'')+'</section>').join("")+
      (o.signatures?'<div class="signatures"><div>'+esc(o.signatures[0]||"Assinatura do funcionário")+'</div><div>'+esc(o.signatures[1]||"Responsável pela empresa")+'</div></div>':'')+
      '<footer class="doc-foot"><span><b>Kronius</b> · KR Contábil · Documento gerado pelo sistema</span><span>Emitido em '+esc(now)+'</span></footer>'+
      '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},350)})<'+'/script></body></html>';
  }

  function openPdf(o){
    const w=window.open("","_blank");
    if(!w){return false;}
    w.document.write(buildHtml(o));w.document.close();return true;
  }

  // Excel com título, metadados e larguras de coluna
  function saveExcel(o){
    if(!window.XLSX)return false;
    const wb=XLSX.utils.book_new();
    const used=new Set();
    (o.sheets||[]).forEach((sh,i)=>{
      const head=[["KRONIUS · "+(o.title||"Relatório")]];
      (o.meta||[]).filter(x=>x&&x[1]!==undefined&&x[1]!=="").forEach(([k,v])=>head.push([k,v]));
      head.push([]);
      const aoa=[...head,sh.headers,...sh.rows];
      const ws=XLSX.utils.aoa_to_sheet(aoa);
      const widths=sh.headers.map((h,c)=>({wch:Math.min(46,Math.max(String(h).length+4,...sh.rows.map(r=>String(r[c]??"").length+2),12))}));
      ws["!cols"]=widths;
      ws["!merges"]=[{s:{r:0,c:0},e:{r:0,c:Math.max(1,sh.headers.length-1)}}];
      ws["!autofilter"]={ref:XLSX.utils.encode_range({s:{r:head.length,c:0},e:{r:head.length+sh.rows.length,c:Math.max(0,sh.headers.length-1)}})};
      let name=String(sh.name||("Planilha "+(i+1))).replace(/[\\\/?*\[\]:]/g," ").slice(0,28)||"Planilha";
      let base=name,n=2;while(used.has(name.toLowerCase())){name=base.slice(0,25)+" "+n++;}
      used.add(name.toLowerCase());
      XLSX.utils.book_append_sheet(wb,ws,name);
    });
    XLSX.writeFile(wb,o.filename||"Kronius-relatorio.xlsx");
    return true;
  }

  window.PontoDocs={esc,tableHtml,readTable,openPdf,saveExcel,fmtDate};
})();
