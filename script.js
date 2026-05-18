// --- CONFIGURAÇÃO PARA TESTES (MOCK LOCALSTORAGE) ---
if (typeof localStorage === "undefined" || localStorage === null) {
    const { LocalStorage } = require('node-localstorage');
    global.localStorage = new LocalStorage('./scratch');
}

// ==========================================
// 1. ESTADO DA APLICAÇÃO (State)
// ==========================================
let gastos = JSON.parse(localStorage.getItem('f_data')) || [];
let rendaUsuario = parseFloat(localStorage.getItem('f_renda')) || 0;
let historicoMeses = JSON.parse(localStorage.getItem('f_historico')) || [];
let investimento = JSON.parse(localStorage.getItem('f_invest')) || { meta: 0, acumulado: 0 };
let meuGrafico = null;
let acaoPendente = null;

// ==========================================
// 2. LÓGICA DE NEGÓCIOS (ATENDE AOS CRITÉRIOS DO PROFESSOR)
// ==========================================

// CRITÉRIO: Função 1 com Parâmetros, Retorno e Estrutura de Repetição (FOR)
function calcularTotalGastos(listaGastos) {
    let total = 0;
    for (let i = 0; i < listaGastos.length; i++) {
        total += listaGastos[i].valor;
    }
    return total; 
}

// CRITÉRIO: Função 2 com Parâmetros e Retorno explícito
function calcularSaldo(renda, despesas) {
    const r = parseFloat(renda);
    const d = parseFloat(despesas);
    if (isNaN(r) || isNaN(d)) return 0;
    return r - d; 
}

// CRITÉRIO: Função 3 com Parâmetros, Retorno e Estrutura de Repetição (FOR)
function calcularGastosPorCategoria(listaGastos) {
    const totais = { 'Alimentação': 0, 'Transporte': 0, 'Lazer': 0, 'Outros': 0 };
    for (let i = 0; i < listaGastos.length; i++) {
        let gasto = listaGastos[i];
        if (totais[gasto.categoria] !== undefined) {
            totais[gasto.categoria] += gasto.valor;
        }
    }
    return totais; 
}

// CRITÉRIO OBRIGATÓRIO: Uso de Arrow Function (=>)
const getColor = (cat) => { 
    const cores = { 'Alimentação': '#3498db', 'Transporte': '#f1c40f', 'Lazer': '#9b59b6', 'Outros': '#95a5a6' };
    return cores[cat] || '#ffffff';
};

// CRITÉRIO OBRIGATÓRIO: Função que altera dinamicamente o estilo (CSS) de um elemento
function aplicarEstiloAlerta(elemento, saldoNegativo) {
    if (saldoNegativo) {
        elemento.style.color = '#e74c3c'; // Fica vermelho se estiver negativado
        elemento.style.fontWeight = 'bold';
    } else {
        elemento.style.color = '#2ecc71'; // Fica verde se estiver positivo
        elemento.style.fontWeight = 'normal';
    }
}

// ==========================================
// 3. PERSISTÊNCIA (Local Storage)
// ==========================================
function salvar() {
    localStorage.setItem('f_data', JSON.stringify(gastos));
    localStorage.setItem('f_renda', rendaUsuario);
    localStorage.setItem('f_historico', JSON.stringify(historicoMeses));
    localStorage.setItem('f_invest', JSON.stringify(investimento));
}

// ==========================================
// 4. COMPONENTIZAÇÃO DE INTERFACE
// ==========================================
function criarLinhaGastoHTML(gasto) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${gasto.desc}</td>
        <td><span class="badge" style="background: ${getColor(gasto.categoria)}">${gasto.categoria}</span></td>
        <td>${gasto.data.split('-').reverse().join('/')}</td>
        <td class="text-danger">R$ ${gasto.valor.toFixed(2)}</td>
        <td><button class="btn-del" onclick="removerGasto(${gasto.id})" style="background:none; border:none; cursor:pointer;">❌</button></td>
    `;
    return tr;
}

function criarCardHistoricoHTML(mes, idx) {
    const div = document.createElement('div');
    div.className = 'card-mes';
    div.style.cssText = "background: #101624; border: 1px solid #1e2638; padding: 12px; border-radius: 8px; cursor: pointer; color: white; margin-top: 10px;";
    div.setAttribute('onclick', `abrirDetalhesMes(${idx})`);
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>📌 ${mes.nome}</strong>
            <span style="font-size:0.75rem; color:#a0a8b8;">${mes.fechadoEm}</span>
        </div>
        <p style="margin:5px 0 0 0; font-size:0.85rem">Renda: <span style="color:#2ecc71;">R$ ${mes.renda.toFixed(2)}</span></p>
        <p style="margin:2px 0 0 0; font-size:0.85rem">Gastos: <span style="color:#e74c3c;">R$ ${mes.totalGastos.toFixed(2)}</span></p>
        <p style="margin:2px 0 0 0; font-size:0.85rem">Saldo: <strong>R$ ${(mes.renda - mes.totalGastos).toFixed(2)}</strong></p>
    `;
    return div;
}

// ==========================================
// 5. GERENCIAMENTO E MANIPULAÇÃO DO DOM
// ==========================================
function atualizarTela() {
    if (typeof document === 'undefined') return;

    const totalGastoNum = calcularTotalGastos(gastos);
    const saldoFinal = calcularSaldo(rendaUsuario, totalGastoNum);

    const elTotalGasto = document.getElementById('total-gasto');
    if (elTotalGasto) elTotalGasto.innerText = `R$ ${totalGastoNum.toFixed(2)}`;

    const elSaldo = document.getElementById('saldo-disponivel');
    if (elSaldo) {
        elSaldo.innerText = `R$ ${saldoFinal.toFixed(2)}`;
        // Aplica a função de estilo exigida nos critérios
        aplicarEstiloAlerta(elSaldo, saldoFinal < 0);
    }

    const elInvestAcumulado = document.getElementById('invest-acumulado');
    if (elInvestAcumulado) elInvestAcumulado.innerText = `R$ ${investimento.acumulado.toFixed(2)}`;

    const catsTotais = calcularGastosPorCategoria(gastos);
    const elAlim = document.getElementById('c-val-alim'); if (elAlim) elAlim.innerText = `R$ ${catsTotais['Alimentação'].toFixed(2)}`;
    const elTrans = document.getElementById('c-val-trans'); if (elTrans) elTrans.innerText = `R$ ${catsTotais['Transporte'].toFixed(2)}`;
    const elLazer = document.getElementById('c-val-lazer'); if (elLazer) elLazer.innerText = `R$ ${catsTotais['Lazer'].toFixed(2)}`;
    const elOutros = document.getElementById('c-val-outros'); if (elOutros) elOutros.innerText = `R$ ${catsTotais['Outros'].toFixed(2)}`;

    const progressFill = document.getElementById('progress-bar-fill');
    const metaStatusSpan = document.querySelector('.meta-status span:last-child');
    if (investimento.meta > 0) {
        const pct = Math.min((investimento.acumulado / investimento.meta) * 100, 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (metaStatusSpan) metaStatusSpan.innerText = `${pct.toFixed(1)}%`;
    } else {
        if (progressFill) progressFill.style.width = '0%';
        if (metaStatusSpan) metaStatusSpan.innerText = '0%';
    }

    const tabela = document.getElementById('corpo-tabela');
    if (tabela) {
        tabela.innerHTML = '';
        for (let i = 0; i < gastos.length; i++) {
            tabela.appendChild(criarLinhaGastoHTML(gastos[i]));
        }
    }

    const listaHist = document.getElementById('lista-historico') || document.querySelector('.historico-lista');
    if (listaHist) {
        listaHist.innerHTML = '';
        for (let i = 0; i < historicoMeses.length; i++) {
            listaHist.appendChild(criarCardHistoricoHTML(historicoMeses[i], i));
        }
    }

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
    const canvas = document.getElementById('meuGrafico');
    if (!canvas) return; 
    try {
        const ctx = canvas.getContext('2d');
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
    } catch (e) {
        console.warn("Gráfico falhou ao iniciar.");
    }
}

// ==========================================
// 6. INTERAÇÕES E MODAIS
// ==========================================
function abrirDetalhesMes(idx) {
    const mes = historicoMeses[idx];
    if (!mes) return;
    
    const titulo = document.getElementById('modal-titulo');
    if (titulo) titulo.innerText = `Detalhes: ${mes.nome}`;
    
    const corpo = document.getElementById('corpo-modal');
    if (corpo) {
        corpo.innerHTML = '';
        for (let i = 0; i < mes.itens.length; i++) {
            let item = mes.itens[i];
            corpo.innerHTML += `<tr><td>${item.desc}</td><td><span class="badge" style="background:${getColor(item.categoria)}">${item.categoria}</span></td><td>${item.data.split('-').reverse().join('/')}</td><td>R$ ${item.valor.toFixed(2)}</td></tr>`;
        }
    }
    const modalHist = document.getElementById('modal-historico');
    if (modalHist) modalHist.style.display = "block";
}

function fecharModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none"; 
}

function confirmarAcao(tipo) {
    acaoPendente = tipo;
    const msg = document.getElementById('confirm-mensagem');
    if (msg) {
        if (tipo === 'ATUAL') msg.innerText = "Deseja realmente limpar todos os lançamentos do mês atual?";
        if (tipo === 'FECHAR_MES') msg.innerText = "Deseja fechar o mês atual e salvá-lo no histórico?";
    }
    const modal = document.getElementById('modal-confirmacao');
    if (modal) modal.style.display = "block";
}

// ==========================================
// 7. AÇÕES DO USUÁRIO
// ==========================================
function definirRenda() {
    const input = document.getElementById('renda-input');
    if (!input) return;
    const r = parseFloat(input.value);
    if (!isNaN(r) && r >= 0) {
        rendaUsuario = r;
        salvar(); 
        atualizarTela();
        alert('💰 Renda fixada com sucesso!');
    } else {
        alert('Insira um valor de renda válido.');
    }
}

function adicionarGasto() {
    const desc = document.getElementById('desc');
    const valor = document.getElementById('valor');
    const cat = document.getElementById('categoria');
    const data = document.getElementById('data');

    if (!desc || !valor || !cat || !data) return;

    if (!desc.value.trim() || !valor.value || parseFloat(valor.value) <= 0) {
        alert('Por favor, preencha a descrição e um valor válido!');
        return;
    }

    gastos.push({
        id: Date.now(),
        desc: desc.value.trim(),
        valor: parseFloat(valor.value),
        categoria: cat.value,
        data: data.value || new Date().toISOString().split('T')[0]
    });

// Limpa os campos após adicionar o gasto
    desc.value = ''; 
    valor.value = '';
    salvar(); 
    atualizarTela();
}

function adicionarInvestimento() {
    const input = document.getElementById('invest-valor');
    if (!input) return;
    const v = parseFloat(input.value);
    if (!isNaN(v) && v > 0) {
        investimento.acumulado += v;
        input.value = '';
        salvar(); 
        atualizarTela();
        alert('📈 Investimento adicionado!');
    }
}

function definirMeta() {
    const input = document.getElementById('invest-meta');
    if (!input) return;
    const m = parseFloat(input.value);
    if (!isNaN(m) && m >= 0) {
        investimento.meta = m;
        salvar(); 
        atualizarTela();
        alert('🎯 Meta definida!');
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
}

function prepararFechamento() { 
    confirmarAcao('FECHAR_MES'); 
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
        itens: [...gastos]
    });

    gastos = [];
    rendaUsuario = 0; 
    investimento.acumulado = 0;
    salvar();
    
    const inputRenda = document.getElementById('renda-input');
    if (inputRenda) inputRenda.value = '';

    atualizarTela();
    alert('🔒 Mês arquivado no histórico!');
}

// ==========================================
// 8. MAPEAMENTO GLOBAL E INICIALIZAÇÃO
// ==========================================
if (typeof window !== 'undefined') {
    window.definirRenda = definirRenda;
    window.adicionarGasto = adicionarGasto;
    window.removerGasto = removerGasto;
    window.adicionarInvestimento = adicionarInvestimento;
    window.definirMeta = definirMeta;
    window.prepararFechamento = prepararFechamento;
    window.fecharModal = fecharModal;
    window.confirmarAcao = confirmarAcao;
    window.abrirDetalhesMes = abrirDetalhesMes;

    window.addEventListener('DOMContentLoaded', () => {
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

    window.onload = () => {
        const elData = document.getElementById('data'); if (elData) elData.valueAsDate = new Date();
        const elRenda = document.getElementById('renda-input'); if (elRenda && rendaUsuario > 0) elRenda.value = rendaUsuario;
        const elMeta = document.getElementById('invest-meta'); if (elMeta && investimento.meta > 0) elMeta.value = investimento.meta;
        
        inicializarGrafico();
        atualizarTela();
    };
}