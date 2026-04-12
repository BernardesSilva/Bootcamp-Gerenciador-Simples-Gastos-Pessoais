// Simulação da lógica de cálculo do FinanceX para o Jest
const calcularSaldo = (renda, despesas) => renda - despesas;

test('Deve subtrair corretamente as despesas da renda total', () => {
    const renda = 1405;
    const gasto = 12;
    const resultadoEsperado = 1393;

    expect(calcularSaldo(renda, gasto)).toBe(resultadoEsperado);
});