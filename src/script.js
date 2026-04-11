let gastos = JSON.parse(localStorage.getItem('f_data')) || [];
let rendaUsuario = parseFloat(localStorage.getItem('f_renda')) || 0;
let meuGrafico;

window.onload = () => {
    document.getElementById('data').valueAsDate = new Date();
    document.getElementById('renda-input').value = rendaUsuario;
    inicializarGrafico();
    atualizarTela();
};

function definirRenda() {
    const valor = parseFloat(document.getElementById('renda-input').value);
    if (isNaN(valor) || valor < 0) {
        alert("Defina um valor de renda válido!");
        return;
    }
    rendaUsuario = valor;
    localStorage.setItem('f_renda', rendaUsuario);
    atualizarTela();
}

function adicionarGasto() {
    const descEl = document.getElementById('desc');
    const valorEl = document.getElementById('valor');
    const dataEl = document.getElementById('data');
    const categoria = document.getElementById('categoria').value;

    // Resetar erros anteriores
    document.querySelectorAll('.field').forEach(f => f.classList.remove('error'));

    let temErro = false;

    // Regra 1: Descrição obrigatória
    if (descEl.value.trim() === "") {
        descEl.parentElement.classList.add('error');
        temErro = true;
    }

    // Regra 2: Valor mínimo de 0.10
    const valorNum = parseFloat(valorEl.value);
    if (isNaN(valorNum) || valorNum < 0.1) {
        valorEl.parentElement.classList.add('error');
        temErro = true;
    }

    // Regra 3: Data obrigatória
    if (!dataEl.value) {
        dataEl.parentElement.classList.add('error');
        temErro = true;
    }

    if (temErro) return;

    // Se tudo ok, adiciona
    gastos.push({ 
        id: Date.now(), 
        desc: descEl.value, 
        valor: valorNum, 
        categoria, 
        data: dataEl.value 
    });

    gastos.sort((a, b) => new Date(b.data) - new Date(a.data));
    localStorage.setItem('f_data', JSON.stringify(gastos));
    
    atualizarTela();
    
    // Limpar campos
    descEl.value = "";
    valorEl.value = "";
}

function removerGasto(id) {
    if (confirm("Deseja excluir este gasto?")) {
        gastos = gastos.filter(g => g.id !== id);
        localStorage.setItem('f_data', JSON.stringify(gastos));
        atualizarTela();
    }
}

function atualizarTela() {
    const lista = document.getElementById('lista-gastos');
    const totalDisplay = document.getElementById('total-valor');
    const barra = document.getElementById('progress-bar');
    const saldoMetaDisplay = document.getElementById('saldo-meta');
    const displayMeta = document.getElementById('display-meta');
    
    lista.innerHTML = "";
    let soma = 0;

    gastos.forEach(g => {
        soma += g.valor;
        const dataFormatada = g.data.split('-').reverse().join('/');
        lista.innerHTML += `
            <li>
                <div><strong>${g.desc}</strong><br><small style="color:#a0a8b8">${g.categoria} • ${dataFormatada}</small></div>
                <span>R$ ${g.valor.toFixed(2).replace('.', ',')} 
                    <button onclick="removerGasto(${g.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer; margin-left:10px">🗑️</button>
                </span>
            </li>
        `;
    });

    totalDisplay.innerText = `R$ ${soma.toFixed(2).replace('.', ',')}`;
    displayMeta.innerText = `Orçamento: R$ ${rendaUsuario.toFixed(2).replace('.', ',')}`;
    
    let perc = rendaUsuario > 0 ? Math.min((soma / rendaUsuario) * 100, 100) : 0;
    barra.style.width = perc + "%";
    
    const corVerde = "#2ecc71";
    const corVermelha = "#e74c3c";

    if (perc > 80) {
        barra.style.backgroundColor = corVermelha;
        totalDisplay.style.color = corVermelha;
    } else {
        barra.style.backgroundColor = corVerde;
        totalDisplay.style.color = corVerde;
    }

    const saldo = rendaUsuario - soma;
    saldoMetaDisplay.innerText = rendaUsuario === 0 
        ? "Defina sua renda!" 
        : (saldo >= 0 ? `R$ ${saldo.toFixed(2).replace('.', ',')} restantes` : "Orçamento estourado!");

    atualizarGrafico();
}

function inicializarGrafico() {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    Chart.defaults.color = '#a0a8b8';
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            cutout: '80%'
        }
    });
}

function atualizarGrafico() {
    const totais = { 'Alimentação': 0, 'Transporte': 0, 'Lazer': 0, 'Outros': 0 };
    gastos.forEach(g => { if(totais[g.categoria] !== undefined) totais[g.categoria] += g.valor; });
    meuGrafico.data.datasets[0].data = Object.values(totais);
    meuGrafico.update();
}