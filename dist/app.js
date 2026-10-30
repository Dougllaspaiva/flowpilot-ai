/* FlowPilot AI — portfolio demonstration. All example records are synthetic.
   This is a genuine local multinomial Naive Bayes classifier, not an LLM. */
(() => {
  'use strict';
  const KEY = 'flowpilot-ai-demo-v1';
  const CATEGORIES = {
    'Tecnologia': { team: 'Tecnologia', description: 'A solicitação apresenta características de suporte técnico, acesso, software ou integração.' },
    'Financeiro': { team: 'Financeiro', description: 'O conteúdo se relaciona a pagamentos, notas, valores, orçamento ou reembolsos.' },
    'Pessoas & Cultura': { team: 'Pessoas & Cultura', description: 'O texto sugere uma demanda de colaboradores, benefícios, férias ou processos de RH.' },
    'Operações': { team: 'Operações', description: 'A demanda envolve logística, estoque, entrega, pedidos ou operação de serviços.' },
    'Comercial': { team: 'Comercial', description: 'A solicitação é relacionada a clientes, propostas, contratos comerciais ou negociação.' }
  };
  const TRAINING = {
    'Tecnologia': [
      'não consigo acessar o sistema usuário sem permissão login bloqueado',
      'erro de autenticação na plataforma redefinir senha acesso conta',
      'integração de api falha no endpoint serviço indisponível',
      'aplicação apresenta bug depois da atualização do software',
      'servidor sem conexão rede instável problema infraestrutura',
      'painel não carrega dados devido a erro técnico no banco',
      'preciso instalar programa e configurar acesso ao sistema',
      'serviço web caiu e a equipe não consegue entrar no portal'
    ],
    'Financeiro': [
      'solicitação de reembolso de despesa com comprovante',
      'pagamento de fornecedor atrasado e nota fiscal vencida',
      'preciso consultar orçamento e valores disponíveis do projeto',
      'fatura contém valor errado e precisa de correção',
      'prestação de contas e análise de despesas do mês',
      'aprovação de pagamento e envio de recibo financeiro',
      'reembolso de viagem e comprovante de hospedagem',
      'divergência no faturamento e lançamento contábil'
    ],
    'Pessoas & Cultura': [
      'colaborador precisa solicitar férias e alteração de período',
      'dúvida sobre benefícios vale refeição e plano de saúde',
      'admissão de novo funcionário e onboarding de equipe',
      'preciso atualizar cadastro pessoal no rh',
      'solicitação de holerite e documento de trabalho',
      'informações sobre treinamento de colaboradores',
      'mudança de jornada e controle de ponto de funcionário',
      'agendar avaliação de desempenho e feedback do time'
    ],
    'Operações': [
      'atraso na entrega de um pedido no centro de distribuição',
      'rota logística com problema e entregador aguardando',
      'estoque insuficiente para atender a demanda de pedidos',
      'operação de separação e expedição de mercadorias',
      'precisamos verificar prazo de entrega e transporte',
      'reposição de produtos no armazém com urgência',
      'falha no recebimento de cargas e acompanhamento da distribuição',
      'tempo de atendimento operacional está muito alto'
    ],
    'Comercial': [
      'enviar proposta comercial para um cliente interessado',
      'negociação de contrato e ajuste de condições comerciais',
      'equipe de vendas precisa atualizar dados do cliente',
      'solicitação de desconto para fechar uma nova venda',
      'renovação de contrato comercial com parceiro',
      'preciso de apresentação comercial para possível cliente',
      'acompanhamento de oportunidade e pipeline de vendas',
      'solicitação de cotação e proposta de parceria comercial'
    ]
  };
  const STOPWORDS = new Set('a ao aos as o os um uma uns umas de da das do dos e em no na nos nas por para que com sem meu minha meus minhas seu sua seus suas eu ele ela eles elas voce vocês isto isso esse essa este esta ter temos tem seria ser sou preciso precisamos gostaria queria quero favor fazer feito foi vamos mais muito muita todos toda todas algum alguns algumas como sobre nosso nossa quando onde depois entre ainda atraves aqui ali qual quais'.split(' '));
  const PRESETS = {
    acesso: { title: 'Falha de acesso ao painel operacional', origin: 'Equipe de suporte', urgency: 'alta', description: 'A equipe não consegue entrar no painel desde a atualização. O login retorna erro de autenticação e o acesso ao sistema está bloqueado.' },
    reembolso: { title: 'Solicitação de reembolso de despesa', origin: 'Administrativo', urgency: 'normal', description: 'Preciso solicitar o reembolso de uma despesa de viagem. O comprovante está disponível e gostaria de acompanhar o prazo do pagamento.' },
    logistica: { title: 'Pedido com atraso na entrega', origin: 'Operação interna', urgency: 'alta', description: 'Um pedido está parado no centro de distribuição. A entrega ultrapassou o prazo previsto e precisamos acompanhar a rota logística.' }
  };
  const SEED = [
    { id:'FP-1001', title:'Acesso bloqueado ao portal', description:'Usuário não consegue realizar login no portal após a atualização do sistema.', origin:'Equipe de suporte', urgency:'alta', priority:'Alta', suggested:'Tecnologia', destination:'Tecnologia', confidence:0.93, reason:'Termos ligados a autenticação, acesso e sistema.', status:'aprovada', created:'2026-10-30T10:15:00', reviewed:'2026-10-30T10:22:00', synthetic:true },
    { id:'FP-1002', title:'Reembolso de despesas', description:'Necessário validar comprovantes e solicitar reembolso de viagem.', origin:'Administrativo', urgency:'normal', priority:'Normal', suggested:'Financeiro', destination:'Financeiro', confidence:0.91, reason:'Termos relacionados a despesas e reembolso.', status:'pendente', created:'2026-10-30T10:30:00', synthetic:true },
    { id:'FP-1003', title:'Atraso no pedido em distribuição', description:'Pedido com atraso de entrega e falha na rota logística.', origin:'Operação interna', urgency:'alta', priority:'Alta', suggested:'Operações', destination:'Operações', confidence:0.95, reason:'Padrões de pedido, entrega e logística.', status:'aprovada', created:'2026-10-30T11:14:00', reviewed:'2026-10-30T11:18:00', synthetic:true },
    { id:'FP-1004', title:'Alterar período de férias', description:'Colaborador solicita orientação sobre alteração de férias.', origin:'Administrativo', urgency:'normal', priority:'Normal', suggested:'Pessoas & Cultura', destination:'Pessoas & Cultura', confidence:0.89, reason:'Padrões de colaboradores e férias.', status:'pendente', created:'2026-10-30T12:00:00', synthetic:true },
    { id:'FP-1005', title:'Revisão de proposta para cliente', description:'Atualização comercial de uma proposta de contrato para cliente.', origin:'Área de negócios', urgency:'normal', priority:'Normal', suggested:'Comercial', destination:'Comercial', confidence:0.86, reason:'Padrões de propostas e clientes.', status:'rejeitada', created:'2026-10-30T12:20:00', reviewed:'2026-10-30T12:29:00', synthetic:true },
    { id:'FP-1006', title:'Erro na integração da API', description:'Uma integração entre sistemas apresenta erro no endpoint e precisa de avaliação.', origin:'Equipe de suporte', urgency:'alta', priority:'Alta', suggested:'Tecnologia', destination:'Tecnologia', confidence:0.92, reason:'Padrões técnicos de API e integrações.', status:'pendente', created:'2026-10-30T13:05:00', synthetic:true }
  ];
  const els = Object.fromEntries([
    'request-form','req-title','req-origin','req-urgency','req-description','desc-length','analysis-empty','analysis-result','analysis-status','result-team','result-confidence','result-priority','result-state','result-reason','override-team','approve-btn','reject-btn','json-toggle','json-output','metric-total','metric-pending','metric-approved','metric-categories','sidebar-count','tab-count-all','queue-body','queue-summary','queue-search','export-btn','reset-demo','category-chart','review-rate','legend-approved','legend-pending','legend-rejected','detail-dialog','dialog-title','dialog-content','dialog-close','dialog-dismiss','toast'
  ].map(id => [id,document.getElementById(id)]));
  const tokenize = text => (text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(word=>word.length>2&&!STOPWORDS.has(word));
  const html = str => String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels = Object.keys(CATEGORIES);
  const MODEL = (() => {
    const counts={},totals={},vocab=new Set();
    for(const label of labels){counts[label]={};totals[label]=0;for(const phrase of TRAINING[label]){for(const word of tokenize(phrase)){vocab.add(word);counts[label][word]=(counts[label][word]||0)+1;totals[label]++;}}}
    return {counts,totals,vocabSize:vocab.size};
  })();
  function classify(text){
    const tokens=tokenize(text);const score={};
    for(const label of labels){let log=Math.log(1/labels.length);for(const word of tokens){log+=Math.log(((MODEL.counts[label][word]||0)+1)/(MODEL.totals[label]+MODEL.vocabSize));}score[label]=log;}
    // Temperature reduces extreme scores from a tiny synthetic training set.
    // Values are relative classification scores, not calibrated probabilities.
    const temperature=Math.max(2.4,Math.sqrt(Math.max(1,tokens.length))*1.55);
    const max=Math.max(...Object.values(score));const exp=Object.fromEntries(labels.map(l=>[l,Math.exp((score[l]-max)/temperature)]));const sum=Object.values(exp).reduce((a,b)=>a+b,0);
    const ranked=labels.map(label=>({label,probability:exp[label]/sum})).sort((a,b)=>b.probability-a.probability);
    const category=ranked[0].label;const known=tokens.filter(w=>(MODEL.counts[category][w]||0)>0);const distinctive=[...new Set(known)].slice(0,4);
    const reason=distinctive.length?`O modelo reconheceu termos associados à área de ${category}: ${distinctive.join(', ')}. ${CATEGORIES[category].description}`:`A classificação é uma hipótese inicial baseada no conjunto de treinamento. ${CATEGORIES[category].description} Revise com atenção.`;
    return {category,confidence:ranked[0].probability,reason,alternatives:ranked.slice(1,3).map(r=>({category:r.label,score:Math.round(r.probability*100)}))};
  }
  function priorityFor(text,selected){
    if(selected==='critica')return 'Crítica';if(selected==='alta')return 'Alta';
    const normalized=tokenize(text);if(normalized.some(w=>['urgente','bloqueado','parado','indisponivel','critico','incidente'].includes(w)))return 'Alta';
    return 'Normal';
  }
  function persisted(){try{const parsed=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(parsed)&&parsed.every(r=>r&&typeof r.id==='string'&&typeof r.title==='string'&&labels.includes(r.suggested)))return parsed;}catch(_){}return null;}
  let records=persisted()||structuredClone(SEED);
  let currentId=null;let activeFilter='todas';let searchTerm='';let toastTimer;
  function save(){try{localStorage.setItem(KEY,JSON.stringify(records));}catch(_){toast('Não foi possível salvar os dados neste navegador.');}}
  function toast(message){els.toast.textContent=message;els.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>els.toast.classList.remove('show'),3200);}
  function now(){return new Date().toISOString();}
  function nextId(){return 'FP-'+(Math.max(1000,...records.map(r=>Number(r.id.replace(/\D/g,''))||1000))+1);}
  function current(){return records.find(r=>r.id===currentId);}
  function renderMetrics(){
    const total=records.length,pending=records.filter(r=>r.status==='pendente').length,approved=records.filter(r=>r.status==='aprovada').length,rejected=records.filter(r=>r.status==='rejeitada').length,reviewed=approved+rejected;
    els['metric-total'].textContent=total;els['metric-pending'].textContent=pending;els['metric-approved'].textContent=approved;els['metric-categories'].textContent=labels.length;els['sidebar-count'].textContent=total;els['tab-count-all'].textContent=total;
    els['review-rate'].textContent=`${total?Math.round(100*reviewed/total):0}%`;els['legend-approved'].textContent=approved;els['legend-pending'].textContent=pending;els['legend-rejected'].textContent=rejected;
    const ring=document.querySelector('.governance-ring');ring.style.setProperty('--approved-angle',`${total?100*approved/total:0}%`);ring.style.setProperty('--reviewed-angle',`${total?100*reviewed/total:0}%`);
  }
  function renderChart(){
    const values=labels.map(label=>({label,count:records.filter(r=>r.suggested===label).length}));const max=Math.max(1,...values.map(v=>v.count));
    els['category-chart'].innerHTML=values.map(v=>`<div class="bar-row"><span class="bar-label">${html(v.label)}</span><span class="bar-track"><span class="bar-fill" style="width:${v.count?Math.max(5,100*v.count/max):0}%"></span></span><span class="bar-value">${v.count}</span></div>`).join('');
  }
  function badge(priority){const cls=priority==='Crítica'?'critica':priority==='Alta'?'alta':'normal';return `<span class="priority-badge ${cls}">${html(priority)}</span>`;}
  function stateLabel(state){return ({pendente:'Aguardando',aprovada:'Aprovada',rejeitada:'Rejeitada'})[state]||'—';}
  function renderQueue(){
    const items=records.filter(r=>(activeFilter==='todas'||r.status===activeFilter)&&`${r.id} ${r.title} ${r.description} ${r.suggested}`.toLowerCase().includes(searchTerm)).slice().reverse();
    els['queue-body'].innerHTML=items.length?items.map(r=>`<tr><td class="id-cell">${html(r.id)}</td><td class="title-cell" title="${html(r.title)}">${html(r.title)}</td><td class="category-cell">${html(r.suggested)}</td><td>${badge(r.priority)}</td><td><span class="state-badge ${html(r.status)}">${html(stateLabel(r.status))}</span></td><td><button type="button" class="row-btn" data-detail="${html(r.id)}">Detalhes ↗</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty-table">Nenhuma solicitação encontrada para este filtro.</td></tr>';
    els['queue-summary'].textContent=`Mostrando ${items.length} de ${records.length} registros demonstrativos`;
    els['queue-body'].querySelectorAll('[data-detail]').forEach(btn=>btn.addEventListener('click',()=>openDetails(btn.dataset.detail)));
  }
  function renderAll(){renderMetrics();renderChart();renderQueue();}
  function renderAnalysis(){
    const item=current();if(!item){els['analysis-empty'].hidden=false;els['analysis-result'].hidden=true;els['analysis-status'].textContent='AGUARDANDO';els['analysis-status'].classList.remove('ready');return;}
    els['analysis-empty'].hidden=true;els['analysis-result'].hidden=false;els['analysis-status'].textContent=item.status==='pendente'?'PARA REVISÃO':item.status==='aprovada'?'APROVADA':'REJEITADA';els['analysis-status'].classList.add('ready');
    els['result-team'].textContent=item.suggested;els['result-confidence'].textContent=`${Math.round(item.confidence*100)}%`;els['result-priority'].textContent=`Prioridade ${item.priority}`;els['result-priority'].className=`result-pill ${item.priority==='Crítica'?'critical':item.priority==='Alta'?'high':''}`;
    els['result-state'].textContent=item.status==='pendente'?'Revisão humana necessária':item.status==='aprovada'?'Destino aprovado (simulação)':'Sugestão rejeitada';els['result-reason'].textContent=item.reason;
    els['override-team'].innerHTML=labels.map(l=>`<option value="${html(l)}" ${l===item.destination?'selected':''}>${html(l)}</option>`).join('');els['override-team'].disabled=item.status!=='pendente';els['approve-btn'].disabled=item.status!=='pendente';els['reject-btn'].disabled=item.status!=='pendente';
    els['json-output'].textContent=JSON.stringify({id:item.id,environment:'synthetic-demo',model:'local-multinomial-naive-bayes',modelPrediction:{destination:item.suggested,confidence:Math.round(item.confidence*1000)/1000,alternatives:item.alternatives||[]},deterministicRules:{priority:item.priority},humanDecision:{status:item.status,destination:item.destination,reviewedAt:item.reviewed||null}},null,2);
  }
  function analyze(event){
    event.preventDefault();const title=els['req-title'].value.trim(),description=els['req-description'].value.trim();if(title.length<6||description.length<15){toast('Informe um título e uma descrição com pelo menos 15 caracteres.');if(title.length<6)els['req-title'].focus();else els['req-description'].focus();return;}
    const inference=classify(`${title} ${description}`);const item={id:nextId(),title,description,origin:els['req-origin'].value,urgency:els['req-urgency'].value,priority:priorityFor(`${title} ${description}`,els['req-urgency'].value),suggested:inference.category,destination:inference.category,confidence:inference.confidence,reason:inference.reason,alternatives:inference.alternatives,status:'pendente',created:now(),synthetic:false};
    records.push(item);currentId=item.id;save();renderAll();renderAnalysis();toast('Análise concluída. Revise a sugestão de destino antes de aprovar.');
  }
  function decide(action){const item=current();if(!item||item.status!=='pendente')return;item.destination=els['override-team'].value;item.status=action;item.reviewed=now();save();renderAll();renderAnalysis();toast(action==='aprovada'?`Destino ${item.destination} aprovado no ambiente de demonstração. Nenhum envio externo foi feito.`:`Solicitação ${item.id} rejeitada e registrada.`);}
  function openDetails(id){
    const r=records.find(x=>x.id===id);if(!r)return;els['dialog-title'].textContent=r.title;const prettyDate=str=>str?new Date(str).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—';
    els['dialog-content'].innerHTML=`<div class="detail-grid"><div class="detail-block"><span>IDENTIFICADOR</span><p>${html(r.id)}</p></div><div class="detail-block"><span>CRIADA EM</span><p>${html(prettyDate(r.created))}</p></div><div class="detail-block span"><span>DESCRIÇÃO</span><p>${html(r.description)}</p></div><div class="detail-block"><span>ORIGEM</span><p>${html(r.origin)}</p></div><div class="detail-block"><span>PRIORIDADE</span><p>${html(r.priority)}</p></div><div class="detail-block"><span>DESTINO SUGERIDO PELO MODELO</span><p>${html(r.suggested)}</p></div><div class="detail-block"><span>DESTINO DEFINIDO PELO OPERADOR</span><p>${html(r.status==='pendente'?'Ainda não definido':r.destination)}</p></div><div class="detail-block"><span>STATUS</span><p>${html(stateLabel(r.status))}</p></div><div class="detail-block"><span>ÍNDICE RELATIVO DO MODELO</span><p>${Math.round(r.confidence*100)}% (não calibrado)</p></div><div class="detail-block span"><span>JUSTIFICATIVA DO CLASSIFICADOR</span><p>${html(r.reason)}</p></div><div class="detail-block"><span>REVISÃO</span><p>${html(prettyDate(r.reviewed))}</p></div><div class="detail-block"><span>FONTE DOS DADOS</span><p>${r.synthetic?'Amostra fictícia de demonstração':'Entrada local do visitante'}</p></div></div>`;
    if(typeof els['detail-dialog'].showModal==='function')els['detail-dialog'].showModal();else els['detail-dialog'].setAttribute('open','');
  }
  function exportCSV(){const columns=['id','title','description','origin','priority','suggested','destination','confidence','status','created','reviewed','synthetic'];const quote=value=>'"'+String(value??'').replace(/"/g,'""')+'"';const data=[columns.join(','),...records.map(r=>columns.map(c=>quote(r[c])).join(','))].join('\r\n');const blob=new Blob(['\uFEFF'+data],{type:'text/csv;charset=utf-8;'});const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download='flowpilot-ai-demo-sintetico.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),500);toast('CSV demonstrativo exportado.');}
  function resetDemo(){if(!window.confirm('Restaurar os seis registros fictícios iniciais? Suas alterações locais desta demonstração serão substituídas.'))return;records=structuredClone(SEED);currentId=null;save();els['request-form'].reset();els['desc-length'].textContent='0 / 900';renderAll();renderAnalysis();toast('Dados de demonstração restaurados.');}
  function init(){
    els['request-form'].addEventListener('submit',analyze);
    els['req-description'].addEventListener('input',()=>els['desc-length'].textContent=`${els['req-description'].value.length} / 900`);
    document.querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>{const p=PRESETS[btn.dataset.preset];els['req-title'].value=p.title;els['req-description'].value=p.description;els['req-origin'].value=p.origin;els['req-urgency'].value=p.urgency;els['desc-length'].textContent=`${p.description.length} / 900`;toast('Cenário fictício carregado. Clique em analisar.');}));
    els['approve-btn'].addEventListener('click',()=>decide('aprovada'));els['reject-btn'].addEventListener('click',()=>decide('rejeitada'));
    els['json-toggle'].addEventListener('click',()=>{const open=!els['json-output'].hidden;els['json-output'].hidden=open;els['json-toggle'].setAttribute('aria-expanded',String(!open));els['json-toggle'].querySelector('span').textContent=open?'⌄':'⌃';});
    document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===btn));renderQueue();}));
    els['queue-search'].addEventListener('input',e=>{searchTerm=e.target.value.trim().toLowerCase();renderQueue();});
    els['export-btn'].addEventListener('click',exportCSV);els['reset-demo'].addEventListener('click',resetDemo);
    const close=()=>els['detail-dialog'].close();els['dialog-close'].addEventListener('click',close);els['dialog-dismiss'].addEventListener('click',close);
    els['detail-dialog'].addEventListener('click',e=>{if(e.target===els['detail-dialog'])close();});
    document.querySelectorAll('.nav-link').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active'));link.classList.add('active');}));
    renderAll();renderAnalysis();
  }
  init();
})();
