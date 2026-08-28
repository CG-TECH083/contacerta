import './styles.css';

// Seleciona o contêiner principal da página
const app = document.getElementById('root');

// Estrutura inicial do HTML dentro da div #root
app.innerHTML = `
  <div class="container">
    <header>
      <h1>Conta Certa</h1>
      <p>Gerador de Orçamentos de Serviços Autônomos</p>
    </header>

    <main class="content">
      <section class="card form-section">
        <h2>Adicionar Item / Serviço</h2>
        <form id="orcamento-form">
          <div class="input-group">
            <label for="descricao">Descrição do Serviço</label>
            <input type="text" id="descricao" placeholder="Ex: Manutenção de Computador" required />
          </div>

          <div class="input-row">
            <div class="input-group">
              <label for="quantidade">Qtd / Horas</label>
              <input type="number" id="quantidade" min="1" value="1" required />
            </div>

            <div class="input-group">
              <label for="valor">Valor Unitário (R$)</label>
              <input type="number" id="valor" step="0.01" placeholder="150,00" required />
            </div>
          </div>

          <button type="submit" class="btn-primary">Adicionar ao Orçamento</button>
        </form>
      </section>

      <section class="card summary-section">
        <h2>Resumo do Orçamento</h2>
        <table id="tabela-itens">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qtd</th>
              <th>Unit.</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="lista-orcamento">
            <!-- Os itens adicionados entrarão aqui -->
          </tbody>
        </table>

        <div class="total-box">
          <h3>Total Geral: <span id="valor-total">R$ 0,00</span></h3>
        </div>
      </section>
    </main>
  </div>
`;

// Lógica da aplicação
let itens = [];

const form = document.getElementById('orcamento-form');
const listaOrcamento = document.getElementById('lista-orcamento');
const valorTotalElement = document.getElementById('valor-total');

// Adicionar novo item
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const descricao = document.getElementById('descricao').value;
  const quantidade = parseFloat(document.getElementById('quantidade').value);
  const valor = parseFloat(document.getElementById('valor').value);

  const totalItem = quantidade * valor;

  itens.push({ id: Date.now(), descricao, quantidade, valor, totalItem });

  form.reset();
  atualizarInterface();
});

// Remover item
window.removerItem = function (id) {
  itens = itens.filter(item => item.id !== id);
  atualizarInterface();
};

// Renderizar lista e calcular total
function atualizarInterface() {
  listaOrcamento.innerHTML = '';
  let totalGeral = 0;

  if (itens.length === 0) {
    listaOrcamento.innerHTML = `<tr><td colspan="5" class="empty">Nenhum serviço adicionado.</td></tr>`;
  } else {
    itens.forEach(item => {
      totalGeral += item.totalItem;
      listaOrcamento.innerHTML += `
        <tr>
          <td>${item.descricao}</td>
          <td>${item.quantidade}</td>
          <td>R$ ${item.valor.toFixed(2)}</td>
          <td>R$ ${item.totalItem.toFixed(2)}</td>
          <td><button class="btn-del" onclick="removerItem(${item.id})">❌</button></td>
        </tr>
      `;
    });
  }

  valorTotalElement.textContent = `R$ ${totalGeral.toFixed(2)}`;
}

// Inicializa a tabela vazia
atualizarInterface();
