# 💰 FinanceX - Gestão Financeira Inteligente

![CI Workflow](https://github.com/BernardesSilva/Bootcamp-Gerenciador-Simples-Gastos-Pessoais/actions/workflows/ci.yml/badge.svg)

O **FinanceX** é uma aplicação web de controle financeiro pessoal projetada para ajudar o usuário a monitorar gastos, definir metas de investimento e visualizar a saúde do seu orçamento de forma simples e intuitiva.

---

## 🚀 Proposta da Solução
Muitas pessoas perdem o controle de suas finanças por falta de uma ferramenta prática que permita o registro imediato. O FinanceX resolve isso com uma interface focada em agilidade, permitindo que o usuário:
* Registre gastos por categorias no momento em que acontecem.
* Defina aportes de investimento que são descontados automaticamente do saldo disponível.
* Visualize através de gráficos para onde o dinheiro está indo.

## 🎯 Público-Alvo
Indivíduos que buscam uma ferramenta leve e direta, sem a complexidade de cadastros bancários, ideal para quem quer organizar o orçamento mensal de forma digital.

## ✨ Funcionalidades Principais
* **Gestão de Renda:** Definição de orçamento mensal total.
* **Aportes Acumulativos (v1.1.0):** Sistema para somar novos investimentos a uma meta mensal, registrando o progresso.
* **Categorização Automática:** Divisão de despesas entre Alimentação, Transporte, Lazer e Outros.
* **Gráficos Dinâmicos:** Visualização em tempo real da distribuição de gastos via Chart.js.
* **Persistência Local:** Utilização de `localStorage` para manter os dados salvos mesmo após fechar o navegador.

## 🛠️ Tecnologias Utilizadas
* **HTML5 & CSS3:** Interface moderna com Dark Mode.
* **JavaScript (ES6+):** Lógica de negócios e manipulação de DOM.
* **Chart.js:** Biblioteca para renderização dos gráficos.
* **Jest:** Framework para testes unitários automatizados.
* **ESLint:** Ferramenta de análise estática (Linting).
* **GitHub Actions:** Pipeline de Integração Contínua (CI).

## 📥 Instalação e Execução (Para Avaliação)

Para validar as ferramentas de qualidade e automação, é necessário ter o **Node.js** instalado.

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/BernardesSilva/Bootcamp-Gerenciador-Simples-Gastos-Pessoais.git](https://github.com/BernardesSilva/Bootcamp-Gerenciador-Simples-Gastos-Pessoais.git)

2. **Instale as dependências:**
    Bash
    npm install

3. **Para rodar os Testes Automatizados:**
    Bash
    npm test

4. **Para rodar a Análise de Código (Lint):**
    Bash
    npx eslint src/script.js

4. **Para ver a aplicação funcionando:**
    🧪 Qualidade e Integração Contínua (CI)
    O projeto utiliza GitHub Actions. O arquivo .github/workflows/ci.yml garante que, a cada commit, o código seja testado e verificado automaticamente pelo servidor do GitHub. O selo (badge) no topo deste documento indica o status atual da última versão enviada.

    📌 Informações Técnicas
    Versão Atual: 1.1.0 (Versionamento Semântico)

    Autor: Leandro Bernardes

    Repositório oficial: GitHub FinanceX

    Projeto desenvolvido como parte do aprendizado em desenvolvimento web e engenharia de software.



   