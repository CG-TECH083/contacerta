import './styles.css';
import { database } from './database.js';

// Gerenciador do número do orçamento via localStorage
function getNextQuoteNumber() {
    let current = localStorage.getItem('contacerta_quote_number');
    if (!current) {
        current = 1001; // Número inicial
    } else {
        current = parseInt(current, 10);
    }
    return current;
}

function incrementQuoteNumber() {
    let current = getNextQuoteNumber();
    localStorage.setItem('contacerta_quote_number', current + 1);
}

let currentQuoteNumber = getNextQuoteNumber();

const app = document.getElementById('root');

app.innerHTML = `
<div class="container">
    <div class="card">
        <div class="header-title">
            <h1>🛠️ Orçamento</h1>
            <span class="quote-number-tag" id="quoteNumberBadge">#${currentQuoteNumber}</span>
        </div>
        
        <div class="form-group">
            <label class="section-title" for="clientName">Nome do Cliente</label>
            <input type="text" id="clientName" placeholder="Ex: Maria Souza">
        </div>

        <div class="workspace-grid">
            <div>
                <label class="section-title">Categorias</label>
                <div class="category-vertical-menu" id="categoryMenu"></div>
            </div>

            <div>
                <label class="section-title" id="categoryTitle">Serviços: 🛠️ DIAGNÓSTICO E MANUTENÇÃO</label>
                <div class="services-list" id="servicesList"></div>
            </div>
        </div>
    </div>

    <div class="card summary-card">
        <div>
            <h2>📋 Resumo do Orçamento</h2>
            <div class="summary-details" id="summaryDetails">
                <p class="empty-msg">Nenhum serviço selecionado.</p>
            </div>
        </div>

        <div>
            <div class="total-box">
                <div class="total-title">Valor Total Calculado</div>
                <div class="total-amount" id="totalAmount">R$ 0,00</div>
            </div>

            <button class="btn-copy" id="btnCopy">📋 Copiar para WhatsApp</button>
        </div>
    </div>
</div>
`;

let activeCategoryIndex = 0;
let selectedServices = {};

function initCategories() {
    const menuContainer = document.getElementById('categoryMenu');
    menuContainer.innerHTML = '';

    database.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${index === activeCategoryIndex ? 'active' : ''}`;
        btn.innerHTML = cat.category;
        btn.onclick = () => {
            activeCategoryIndex = index;
            initCategories();
            renderServices();
        };
        menuContainer.appendChild(btn);
    });
}

function renderServices() {
    const listContainer = document.getElementById('servicesList');
    const categoryTitle = document.getElementById('categoryTitle');
    
    listContainer.innerHTML = '';
    const currentCategory = database[activeCategoryIndex];
    categoryTitle.innerText = `SERVIÇOS: ${currentCategory.category.toUpperCase()}`;

    currentCategory.items.forEach((item) => {
        const isChecked = !!selectedServices[item.id];

        const div = document.createElement('div');
        div.className = 'service-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;
        checkbox.onclick = (e) => e.stopPropagation();
        checkbox.onchange = (e) => toggleService(item, e.target.checked);

        div.onclick = (e) => {
            if (e.target !== checkbox) {
                toggleService(item, !checkbox.checked);
            }
        };

        const infoDiv = document.createElement('div');
        infoDiv.className = 'service-info';
        
        const spanName = document.createElement('span');
        spanName.innerText = item.name;

        infoDiv.appendChild(checkbox);
        infoDiv.appendChild(spanName);

        const priceDiv = document.createElement('div');
        priceDiv.className = 'service-price';
        priceDiv.innerText = item.label || `R$ ${item.price}`;

        div.appendChild(infoDiv);
        div.appendChild(priceDiv);
        listContainer.appendChild(div);
    });
}

function toggleService(item, isSelected) {
    if (isSelected) {
        selectedServices[item.id] = { name: item.name, price: item.price };
    } else {
        delete selectedServices[item.id];
    }
    renderServices();
    calculateTotal();
}

function calculateTotal() {
    let total = 0;
    const summaryDetails = document.getElementById('summaryDetails');
    summaryDetails.innerHTML = '';

    const keys = Object.keys(selectedServices);

    if (keys.length === 0) {
        summaryDetails.innerHTML = '<p class="empty-msg">Nenhum serviço selecionado.</p>';
    } else {
        keys.forEach(id => {
            const item = selectedServices[id];
            total += item.price;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'summary-item';

            const nameSpan = document.createElement('span');
            nameSpan.innerText = item.name;

            const priceContainer = document.createElement('div');
            priceContainer.style.display = 'flex';
            priceContainer.style.alignItems = 'center';
            priceContainer.style.gap = '4px';

            const currencySpan = document.createElement('span');
            currencySpan.innerText = 'R$';

            const priceInput = document.createElement('input');
            priceInput.type = 'number';
            priceInput.className = 'price-input-custom';
            priceInput.value = item.price;
            priceInput.onchange = (e) => {
                selectedServices[id].price = parseFloat(e.target.value) || 0;
                calculateTotal();
            };

            priceContainer.appendChild(currencySpan);
            priceContainer.appendChild(priceInput);

            itemDiv.appendChild(nameSpan);
            itemDiv.appendChild(priceContainer);

            summaryDetails.appendChild(itemDiv);
        });
    }

    document.getElementById('totalAmount').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

document.getElementById('btnCopy').onclick = () => {
    const client = document.getElementById('clientName').value || 'Cliente';
    let total = 0;
    
    const keys = Object.keys(selectedServices);

    if (keys.length === 0) {
        alert('Selecione pelo menos um serviço antes de copiar!');
        return;
    }

    let text = `*ORÇAMENTO #${currentQuoteNumber}*\n`;
    text += `👤 *Cliente:* ${client}\n\n`;
    text += `*Serviços Selecionados:*\n`;

    keys.forEach(id => {
        const item = selectedServices[id];
        total += item.price;
        text += `• ${item.name}: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
    });

    text += `\n💵 *Total Final:* R$ ${total.toFixed(2).replace('.', ',')}`;

    navigator.clipboard.writeText(text).then(() => {
        alert(`Orçamento #${currentQuoteNumber} copiado com sucesso!`);
        
        // Incrementar o número do orçamento para a próxima vez
        incrementQuoteNumber();
        currentQuoteNumber = getNextQuoteNumber();
        document.getElementById('quoteNumberBadge').innerText = `#${currentQuoteNumber}`;
    });
};

initCategories();
renderServices();
