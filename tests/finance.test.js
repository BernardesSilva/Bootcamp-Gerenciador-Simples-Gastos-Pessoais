const { calcularSaldo } = require('../src/script');

test('Cenário Feliz: Deve subtrair corretamente as despesas da renda total', () => {
    expect(calcularSaldo(1000, 200)).toBe(800);
});

test('Entrada Inválida: Deve retornar 0 se os valores não forem números', () => {
    expect(calcularSaldo("mil", 200)).toBe(0);
});

test('Caso Limite: Deve retornar 0 se a despesa for igual à renda', () => {
    expect(calcularSaldo(500, 500)).toBe(0);
});