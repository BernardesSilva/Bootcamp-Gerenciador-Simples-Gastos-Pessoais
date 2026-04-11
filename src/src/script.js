// src/script.js

let gastos = [];

function adicionarGasto() {
    const descInput = document.getElementById('desc');
    const valorInput = document.getElementById('valor');

    // Validação simples (Critério do Barema: Comportamento indevido)
    if (descInput.value === '' || valorInput.value <= 0) {
        alert("Por favor, preencha os campos corretamente!");
        return;
    }

    const novoGasto = {
        id: Date.now(),
        descricao: descInput.value,
        valor: parseFloat(valorInput.value)
    };

    gastos.push(novoGasto);
    atualizarInterface();
    
    // Limpar inputs
    descInput.value = '';
    valorInput.value = '';
}

function removerGasto(id) {
    gastos = gastos.filter(gasto => gasto.id !== id);
    atualizarInterface();
}

function atualizarInterface() {
    const lista = document.getElementById('lista-gastos');
    const totalSpan = document.getElementById('total-valor');
    
    lista.innerHTML = '';
    let total = 0;

    gastos.forEach(gasto => {
        total += gasto.valor;
        const li = document.createElement('li');
        li.innerHTML = `
            ${gasto.descricao} - R$ ${gasto.valor.toFixed(2)}
            <button class="btn-remove" onclick="removerGasto(${gasto.id})">X</button>
        `;
        lista.appendChild(li);
    });

    totalSpan.innerText = total.toFixed(2).replace('.', ',');
}