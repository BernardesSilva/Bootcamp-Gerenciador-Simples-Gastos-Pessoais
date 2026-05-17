// --- CONFIGURAÇÃO PARA TESTES (MOCK LOCALSTORAGE) ---
if (typeof localStorage === "undefined" || localStorage === null) {
    const { LocalStorage } = require('node-localstorage');
    global.localStorage = new LocalStorage('./scratch');
}

// ==========================================
// 1. ESTADO DA APLICAÇÃO (State - Tópico 19)
// ==========================================
let gastos = JSON.parse(localStorage.getItem('f_data')) || [];
let rendaUsuario = parseFloat(localStorage.getItem('f_renda')) || 0;
let historicoMeses = JSON.parse(localStorage.getItem('f_historico')) || [];
let investimento = JSON.parse(localStorage.getItem('f_invest')) || { meta: 0, acumulado: 0 };
let meuGrafico;
let acaoPendente = null;

// ==========================================
// 2. LÓGICA DE NEGÓCIOS (Funções Puras - Tópico 17)
// ==========================================

/**
 * Calcula o saldo disponível subtraindo as despesas da renda total.
 * Mantida exatamente igual para não quebrar o arquivo de teste (finance.test.js)
 */
function calcularSaldo(renda, despesas) {
    const r = parseFloat(renda);
    const d = parseFloat(despesas);
    if (isNaN(r) || isNaN(d)) return 0;
    return r - d;
}

/**
 * Calcula o total de despesas de um array de gastos.
 */
function calcularTotalGastos(listaGastos) {
    return listaGastos.reduce((acc, g) => acc + g.valor, 0);
}

/**
 * Agrupa e soma os valores dos gastos por suas respectivas categorias.
 */
function calcularGastosPorCategoria(listaGastos) {
    const totais = { 'Alimentação': 0, 'Transporte': 0, 'Lazer': 0, 'Outros': 0 };
    listaGastos.forEach(g => {
        if (totais[g.categoria] !== undefined) {
            totais[g.categoria] += g.valor;
        }
    });
    return totais;
}

/**
 * Mapeia as cores de destaque de cada categoria (Componentização - Tópico 18)
 */
function getColor(cat) { 
    return { 'Alimentação': '#3498db', 'Transporte': '#f1c40f', 'Lazer': '#9b59b6', 'Outros': '#95a5a6' }[cat]; 
}

// ==========================================
// 3. PERSISTÊNCIA (Local Storage - Tópico 19)
// ==========================================
function salvar() {
    localStorage.setItem('f_data', JSON.stringify(gastos));
    localStorage.setItem('f_renda', rendaUsuario);
    localStorage.setItem('f_historico', JSON.stringify(historicoMeses));
    localStorage.setItem('f_invest', JSON.stringify(investimento));
}

// ==========================================
// 4. COMPONENTIZAÇÃO DE INTERFACE (UI - Tópico 18 e 20)
// ==========================================

/**
 * Cria a estrutura de elemento (HTML) para uma linha na tabela de gastos.
 */
function criarLinhaGastoHTML(gasto) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${gasto.desc}</td>
        <td><span class="badge" style="background: ${getColor(gasto.categoria)}">${gasto.categoria}</span></td>
        <td>${gasto.data.split('-').reverse().join('/')}</td>
        <td class="text-danger">R$ ${gasto.valor.toFixed(2)}</td>
        <td><button class="btn-del" onclick="removerGasto(${gasto.id})">❌</button></td>
    `;
    return tr;
}

/**
 * Cria o elemento HTML de um card para o histórico de meses fechados.
 */
function criarCardHistoricoHTML(mes, idx) {
    const div = document.createElement('div');
    div.className = 'card card-mes animate-in';
    div.onclick = () => abrirDetalhesMes(idx);
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>📌 ${mes.nome}</strong>
            <span class="text-muted" style="font-size:0.75rem">${mes.fechadoEm}</span>
        </div>
        <p style="margin:5px 0 0 0; font-size:0.85rem">Renda: <span class="text-success">R$ ${mes.renda.toFixed(2)}</span></p>
        <p style="margin:2px 0 0 0; font-size:0.85rem">Gastos: <span class="text-danger">R$ ${mes.totalGastos.toFixed(2)}</span></p>
        <p style="margin:2px 0 0 0; font-size:0.85rem">Saldo: <strong>R$ ${(mes.renda - mes.totalGastos).toFixed(2)}</strong></p>
    `;
    return div;
}

// ==========================================
// 5. GERENCIAMENTO E MANIPULAÇÃO DO DOM (Tela)
// ==========================================

function atualizarTela() {
    const totalGastoNum = calcularTotalGastos(gastos);
    const saldoFinal = calcularSaldo(rendaUsuario, totalGastoNum);

    // Elementos de texto de resumo
    document.getElementById('total-gasto').innerText = `R$ ${totalGastoNum.toFixed(2)}`;
    document.getElementById('saldo-total').innerText = `R$ ${saldoFinal.toFixed(2)}`;
    document.getElementById('invest-acumulado').innerText = `R$ ${investimento.acumulado.toFixed(2)}`;

    // Feedback visual do saldo (Melhoria de UX - Tópico 20)
    const cardSaldo = document.getElementById('saldo-total').parentElement;
    if (saldoFinal < 0) {
        cardSaldo.style.borderColor = 'var(--danger)';
    } else {
        cardSaldo.style.borderColor = 'var(--card-border)';
    }

    // Gerenciamento de Categorias individuais nos Cards superiores
    const catsTotais = calcularGastosPorCategoria(gastos);
    document.getElementById('c-val-alim').innerText = `R$ ${catsTotais['Alimentação'].toFixed(2)}`;
    document.getElementById('c-val-trans').innerText = `R$ ${catsTotais['Transporte'].toFixed(2)}`;
    document.getElementById('c-val-lazer').innerText = `R$ ${catsTotais['Lazer'].toFixed(2)}`;
    document.getElementById('c-val-outros').innerText = `R$ ${catsTotais['Outros'].toFixed(2)}`;

    // Atualização da Barra de Progresso de Metas
    const progressFill = document.getElementById('progress-fill');
    if (investimento.meta > 0) {
        const pct = Math.min((investimento.acumulado / investimento.meta) * 100, 100);
        progressFill.style.width = `${pct}%`;
        document.getElementById('meta-pct').innerText = `${pct.toFixed(1)}%`;
    } else {
        progressFill.style.width = '0%';
        document.getElementById('meta-pct').innerText = '0%';
    }

    // Renderização da tabela de gastos ativos (Tópico 18)
    const tabela = document.getElementById('corpo-tabela');
    tabela.innerHTML = '';
    gastos.forEach(g => {
        tabela.appendChild(criarLinhaGastoHTML(g));
    });

    // Renderização do histórico de meses anteriores (Tópico 18)
    const listaHist = document.getElementById('lista-historico');
    listaHist.innerHTML = '';
    historicoMeses.forEach((mes, idx) => {
        listaHist.appendChild(criarCardHistoricoHTML(mes, idx));
    });

    // Atualização reativa do Gráfico do Chart.js
    if (meuGrafico) {
        meuGrafico.data.datasets[0].data = [
            catsTotais['Alimentação'], 
            catsTotais['Transporte'], 
            catsTotais['Lazer'], 
            catsTotais['Outros']
        ];
        meuGrafico.update();
    }
}

function inicializarGrafico() {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    meuGrafico = new Chart(ctx, { 
        type: 'doughnut', 
        data: { 
            labels: ['Alimentação', 'Transporte', 'Lazer', 'Outros'], 
            datasets: [{ 
                data: [0, 0, 0, 0], 
                backgroundColor: ['#3498db', '#f1c40f', '#9b59b6', '#95a5a6'], 
                borderWidth: 0 
            }] 
        }, 
        options: { plugins: { legend: { display: false } }, cutout: '75%' } 
    });
}

// ==========================================
// 6. INTERAÇÕES E MODAIS (UX/UI - Tópico 20)
// ==========================================

function abrirDetalhesMes(idx) {
    const mes = historicoMeses[idx];
    document.getElementById('modal-titulo').innerText = `Detalhes: ${mes.nome}`;
    const corpo = document.getElementById('corpo-modal');
    corpo.innerHTML = '';
    
    mes.itens.forEach(i => {
        corpo.innerHTML += `<tr><td>${i.desc}</td><td><span class="badge" style="background:${getColor(i.categoria)}">${i.categoria}</span></td><td>${i.data.split('-').reverse().join('/')}</td><td>R$ ${i.valor.toFixed(2)}</td></tr>`;
    });
    
    if (mes.investido > 0) {
        corpo.innerHTML += `<tr style="background: rgba(52, 152, 219, 0.1); font-weight: bold;"><td>Total Investido</td><td>📈 Investimento</td><td>-</td><td>R$ ${mes.investido.toFixed(2)}</td></tr>`;
    }
    document.getElementById('modal-historico').style.display = "block";
}

function fecharModal(id) { 
    document.getElementById(id).style.display = "none"; 
}

function confirmarAcao(tipo) {
    acaoPendente = tipo;
    const msg = document.getElementById('confirm-mensagem');
    if (tipo === 'ATUAL') msg.innerText = "Deseja realmente limpar todos os lançamentos do mês atual? Esta ação não pode ser desfeita.";
    if (tipo === 'FECHAR_MES') msg.innerText = "Deseja fechar o mês atual e arquivá-lo no histórico?";
    document.getElementById('modal-confirmacao').style.display = "block";
}

// Configuração dos botões do modal de confirmação
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const btnSim = document.getElementById('btn-confirmar-sim');
        if (btnSim) {
            btnSim.onclick = () => {
                fecharModal('modal-confirmacao');
                if (acaoPendente === 'ATUAL') limparAtual();
                if (acaoPendente === 'FECHAR_MES') fecharMes();
                acaoPendente = null;
            };
        }
    });
}

// ==========================================
// 7. AÇÕES DO USUÁRIO (Event Handlers - Feedbacks UX Tópico 20)
// ==========================================

function adicionarGasto() {
    const desc = document.getElementById('desc');
    const valor = document.getElementById('valor');
    const cat = document.getElementById('categoria');
    const data = document.getElementById('data');

    let erro = false;
    
    // Validação visual de erro nos inputs (UX)
    if (!desc.value.trim()) { 
        desc.nextElementSibling.style.display = 'block'; 
        desc.style.borderColor = 'var(--danger)';
        erro = true; 
    } else { 
        desc.nextElementSibling.style.display = 'none'; 
        desc.style.borderColor = 'var(--card-border)';
    }
    
    if (!valor.value || parseFloat(valor.value) <= 0) { 
        valor.nextElementSibling.style.display = 'block'; 
        valor.style.borderColor = 'var(--danger)';
        erro = true; 
    } else { 
        valor.nextElementSibling.style.display = 'none'; 
        valor.style.borderColor = 'var(--card-border)';
    }

    if (erro) return;

    gastos.push({
        id: Date.now(),
        desc: desc.value.trim(),
        valor: parseFloat(valor.value),
        categoria: cat.value,
        data: data.value || new Date().toISOString().split('T')[0]
    });

    desc.value = ''; 
    valor.value = '';
    
    salvar(); 
    atualizarTela();

    // Feedback visual temporário de sucesso no botão registrar (UX)
    const btnRegistrar = document.getElementById('btn-registrar');
    if (btnRegistrar) {
        const textoOriginal = btnRegistrar.innerText;
        btnRegistrar.innerText = "✅ Registrado!";
        btnRegistrar.style.backgroundColor = "#27ae60";
        setTimeout(() => {
            btnRegistrar.innerText = textoOriginal;
            btnRegistrar.style.backgroundColor = "var(--primary)";
        }, 1500);
    }
}

function adicionarInvestimento() {
    const input = document.getElementById('invest-valor');
    const v = parseFloat(input.value);
    if (!isNaN(v) && v > 0) {
        investimento.acumulado += v;
        input.value = '';
        input.style.borderColor = 'var(--card-border)';
        salvar(); 
        atualizarTela();
        
        // Alerta de confirmação de sucesso (UX)
        alert('📈 Investimento adicionado com sucesso!');
    } else {
        input.style.borderColor = 'var(--danger)';
        alert('Por favor, insira um valor de investimento válido.');
    }
}

function atualizarMeta() {
    const input = document.getElementById('invest-meta');
    const m = parseFloat(input.value);
    if (!isNaN(m) && m >= 0) {
        investimento.meta = m;
        input.style.borderColor = 'var(--card-border)';
        salvar(); 
        atualizarTela();
        alert('🎯 Meta de investimento atualizada!');
    } else {
        input.style.borderColor = 'var(--danger)';
        alert('Insira um valor de meta válido.');
    }
}

function atualizarRenda() {
    const input = document.getElementById('renda-input');
    const r = parseFloat(input.value);
    if (!isNaN(r) && r >= 0) {
        rendaUsuario = r;
        input.style.borderColor = 'var(--card-border)';
        salvar(); 
        atualizarTela();
        alert('💰 Renda atualizada com sucesso!');
    } else {
        input.style.borderColor = 'var(--danger)';
        alert('Insira um valor de renda válido.');
    }
}

function removerGasto(id) { 
    gastos = gastos.filter(g => g.id !== id); 
    salvar(); 
    atualizarTela(); 
}

function limparAtual() { 
    gastos = []; 
    salvar(); 
    atualizarTela(); 
    alert('🗑️ Todos os lançamentos do mês atual foram limpos.');
}

function prepararFechamento() { 
    if (gastos.length > 0 || investimento.acumulado > 0) {
        confirmarAcao('FECHAR_MES'); 
    } else {
        alert('Não há lançamentos ou investimentos para fechar o mês.');
    }
}

function fecharMes() {
    const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const d = new Date();
    const nomeMesRef = `${nomesMeses[d.getMonth()]} de ${d.getFullYear()}`;
    
    historicoMeses.push({
        nome: nomeMesRef,
        fechadoEm: d.toLocaleDateString('pt-BR'),
        renda: rendaUsuario,
        totalGastos: calcularTotalGastos(gastos),
        investido: investimento.acumulado,
        itens: [...gastos]
    });

    gastos = [];
    investimento.acumulado = 0;
    salvar();
    atualizarTela();
    alert('🔒 Mês fechado e enviado para o histórico com sucesso!');
}

// ==========================================
// 8. INICIALIZAÇÃO DO SISTEMA
// ==========================================
if (typeof window !== 'undefined') {
    window.onload = () => {
        if (document.getElementById('data')) document.getElementById('data').valueAsDate = new Date();
        if (document.getElementById('renda-input')) document.getElementById('renda-input').value = rendaUsuario;
        if (document.getElementById('invest-meta')) document.getElementById('invest-meta').value = investimento.meta;
        inicializarGrafico();
        atualizarTela();
    };
}

// Exportações idênticas mantidas para o Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calcularSaldo };
}