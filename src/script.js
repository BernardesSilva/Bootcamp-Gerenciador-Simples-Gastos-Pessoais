let gastos = JSON.parse(localStorage.getItem('f_data')) || [];
let rendaUsuario = parseFloat(localStorage.getItem('f_renda')) || 0;
let historicoMeses = JSON.parse(localStorage.getItem('f_historico')) || [];
let investimento = JSON.parse(localStorage.getItem('f_invest')) || { meta: 0, acumulado: 0 };
let meuGrafico;

window.onload = () => {
    document.getElementById('data').valueAsDate = new Date();
    document.getElementById('renda-input').value = rendaUsuario;
    document.getElementById('invest-meta').value = investimento.meta;
    inicializarGrafico();
    atualizarTela();
};

function confirmarAcao(tipo, id = null) {
    const modal = document.getElementById('modal-confirmacao');
    const titulo = document.getElementById('confirm-titulo');
    const msg = document.getElementById('confirm-mensagem');
    const btnSim = document.getElementById('btn-confirmar-sim');
    modal.style.display = "block";

    if (tipo === 'FECHAR_MES') {
        titulo.innerText = "Encerrar Mês?";
        msg.innerText = "Gastos e investimentos serão salvos no histórico.";
        btnSim.onclick = () => { fecharMesEfetivo(); fecharModal('modal-confirmacao'); };
    } else if (tipo === 'EXCLUIR_HISTORICO') {
        titulo.innerText = "Excluir Histórico?";
        msg.innerText = "Isso apagará este mês permanentemente.";
        btnSim.onclick = () => { excluirMesEfetivo(id); fecharModal('modal-confirmacao'); };
    } else if (tipo === 'ATUAL') {
        titulo.innerText = "Limpar Tudo?";
        msg.innerText = "Isso apagará os gastos da lista atual.";
        btnSim.onclick = () => { gastos = []; salvar(); atualizarTela(); fecharModal('modal-confirmacao'); };
    }
}

function fecharModal(id) { document.getElementById(id).style.display = "none"; }

function adicionarGasto() {
    const desc = document.getElementById('desc');
    const valor = document.getElementById('valor');
    const data = document.getElementById('data');
    const categoria = document.getElementById('categoria').value;

    document.querySelectorAll('.field').forEach(f => f.classList.remove('error'));
    if (!desc.value || !valor.value || !data.value) {
        if(!desc.value) desc.parentElement.classList.add('error');
        if(!valor.value) valor.parentElement.classList.add('error');
        if(!data.value) data.parentElement.classList.add('error');
        return;
    }

    gastos.push({ id: Date.now(), desc: desc.value, valor: parseFloat(valor.value), categoria, data: data.value });
    salvar(); atualizarTela();
    desc.value = ""; valor.value = "";
}

function definirRenda() {
    const v = parseFloat(document.getElementById('renda-input').value);
    if (!isNaN(v)) { rendaUsuario = v; localStorage.setItem('f_renda', v); atualizarTela(); }
}

function adicionarAporte() {
    const metaInput = document.getElementById('invest-meta');
    const aporteInput = document.getElementById('invest-aporte');
    
    const novaMeta = parseFloat(metaInput.value) || 0;
    const valorAporte = parseFloat(aporteInput.value) || 0;

    if (valorAporte > 0 || novaMeta !== investimento.meta) {
        investimento.meta = novaMeta;
        investimento.acumulado += valorAporte;
        
        localStorage.setItem('f_invest', JSON.stringify(investimento));
        aporteInput.value = ""; 
        atualizarTela();
    }
}

function fecharMesEfetivo() {
    const nomeMes = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    historicoMeses.push({ 
        id: Date.now(), 
        mes: nomeMes, 
        total: gastos.reduce((a, b) => a + b.valor, 0), 
        investido: investimento.acumulado,
        itens: [...gastos] 
    });
    gastos = [];
    investimento.acumulado = 0; 
    salvar();
    localStorage.setItem('f_invest', JSON.stringify(investimento));
    atualizarTela();
}

function excluirMesEfetivo(id) {
    historicoMeses = historicoMeses.filter(m => m.id !== id);
    salvar(); atualizarTela();
}

function salvar() {
    localStorage.setItem('f_data', JSON.stringify(gastos));
    localStorage.setItem('f_historico', JSON.stringify(historicoMeses));
}

function atualizarTela() {
    const corpo = document.getElementById('corpo-tabela');
    const displayTotal = document.getElementById('total-valor');
    const displayMeta = document.getElementById('display-meta');
    const saldoMeta = document.getElementById('saldo-meta');
    const barra = document.getElementById('progress-bar');
    const listaHist = document.getElementById('lista-meses-fechados');
    const cardsCat = document.getElementById('cards-categorias');

    const invBar = document.getElementById('invest-bar');
    const dispInvMeta = document.getElementById('display-invest-meta');
    const dispInvVal = document.getElementById('display-invest-valor');
    
    dispInvMeta.innerText = `Meta: R$ ${investimento.meta.toFixed(2)}`;
    dispInvVal.innerText = `Total: R$ ${investimento.acumulado.toFixed(2)}`;
    let percInv = investimento.meta > 0 ? Math.min((investimento.acumulado / investimento.meta) * 100, 100) : 0;
    invBar.style.width = percInv + "%";

    corpo.innerHTML = "";
    let somaGastos = 0;
    const totais = { 'Alimentação': 0, 'Transporte': 0, 'Lazer': 0, 'Outros': 0 };

    gastos.forEach(g => {
        somaGastos += g.valor;
        totais[g.categoria] += g.valor;
        corpo.innerHTML += `<tr><td>${g.desc}</td><td>${g.categoria}</td><td>${g.data.split('-').reverse().join('/')}</td><td>R$ ${g.valor.toFixed(2)}</td><td><button onclick="removerGasto(${g.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer">🗑️</button></td></tr>`;
    });

    cardsCat.innerHTML = "";
    for (let c in totais) {
        cardsCat.innerHTML += `<div class="cat-card" style="border-top-color:${getColor(c)}"><span>${c}</span><strong>R$ ${totais[c].toFixed(2)}</strong></div>`;
    }

    listaHist.innerHTML = "";
    [...historicoMeses].reverse().forEach(m => {
        listaHist.innerHTML += `<li class="mes-item"><div onclick="verDetalhes(${m.id})" style="flex-grow:1; display:flex; justify-content:space-between; cursor:pointer"><span>${m.mes}</span><strong>R$ ${(m.total + (m.investido || 0)).toFixed(2)}</strong></div><button class="btn-delete-history" onclick="confirmarAcao('EXCLUIR_HISTORICO', ${m.id})" style="margin-left:15px">🗑️</button></li>`;
    });

    const totalComprometido = somaGastos + investimento.acumulado;
    const saldoFinal = rendaUsuario - totalComprometido;

    displayTotal.innerText = `R$ ${saldoFinal.toFixed(2)}`;
    displayMeta.innerText = `Renda: R$ ${rendaUsuario.toFixed(2)}`;
    saldoMeta.innerText = rendaUsuario === 0 ? "Defina sua renda!" : (saldoFinal >= 0 ? `Sobram R$ ${saldoFinal.toFixed(2)}` : "Orçamento estourado!");

    let percGasto = rendaUsuario > 0 ? Math.min((totalComprometido / rendaUsuario) * 100, 100) : 0;
    barra.style.width = percGasto + "%";
    barra.style.backgroundColor = percGasto > 90 ? "#e74c3c" : "#2ecc71";
    
    atualizarGrafico(totais);
}

function verDetalhes(id) {
    const mes = historicoMeses.find(m => m.id === id);
    document.getElementById('modal-titulo').innerText = `Detalhes: ${mes.mes}`;
    const corpo = document.getElementById('corpo-modal');
    corpo.innerHTML = "";
    mes.itens.forEach(i => {
        corpo.innerHTML += `<tr><td>${i.desc}</td><td>${i.categoria}</td><td>${i.data.split('-').reverse().join('/')}</td><td>R$ ${i.valor.toFixed(2)}</td></tr>`;
    });
    if (mes.investido > 0) {
        corpo.innerHTML += `<tr style="background: rgba(52, 152, 219, 0.1); font-weight: bold;"><td>Total Investido</td><td>📈 Investimento</td><td>-</td><td>R$ ${mes.investido.toFixed(2)}</td></tr>`;
    }
    document.getElementById('modal-historico').style.display = "block";
}

function prepararFechamento() { if (gastos.length > 0 || investimento.acumulado > 0) confirmarAcao('FECHAR_MES'); }
function removerGasto(id) { gastos = gastos.filter(g => g.id !== id); salvar(); atualizarTela(); }
function getColor(cat) { return { 'Alimentação': '#3498db', 'Transporte': '#f1c40f', 'Lazer': '#9b59b6', 'Outros': '#95a5a6' }[cat]; }

function inicializarGrafico() {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    meuGrafico = new Chart(ctx, { type: 'doughnut', data: { labels: ['Alimentação', 'Transporte', 'Lazer', 'Outros'], datasets: [{ data: [0,0,0,0], backgroundColor: ['#3498db', '#f1c40f', '#9b59b6', '#95a5a6'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '80%' } });
}

function atualizarGrafico(dados) { if (meuGrafico) { meuGrafico.data.datasets[0].data = Object.values(dados); meuGrafico.update(); } }