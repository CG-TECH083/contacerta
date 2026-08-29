import './styles.css';
import { database } from './database.js';

const app = document.getElementById('root');

app.innerHTML = `
<div class="container">
    <div class="card">
        <h1>🛠️ Gerador de Orçamento</h1>
        
        <div class="form-group">
            <label class="section-title" for="clientName">NOME DO CLIENTE</label>
            <input type="text" id="clientName" placeholder="Ex: Maria Souza">
        </div>

        <div class="form-group">
            <label class="section-title" for="clientPhone">WHATSAPP DO CLIENTE (OPCIONAL - EX: 83999999999)</label>
            <input type="text" id="clientPhone" placeholder="Deixe em branco para escolher o contato ao enviar">
        </div>

        <div class="workspace-grid">
            <div>
                <label class="section-title">CATEGORIAS</label>
                <div class="category-vertical-menu" id="categoryMenu"></div>
            </div>

            <div>
                <label class="section-title" id="categoryTitle">SERVIÇOS: 🛠️ DIAGNÓSTICO</label>
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
                <div class="total-title">VALOR TOTAL CALCULADO</div>
                <div class="total-amount" id="totalAmount">R$ 0,00</div>
            </div>

            <div class="action-buttons">
                <button class="btn-whatsapp" id="btnSendWhatsapp">💬 Enviar pelo WhatsApp</button>
                <button class="btn-copy-gray" id="btnJustCopy">📋 Apenas Copiar Texto</button>
            </div>
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

function generateMessageText() {
    const client = document.getElementById('clientName').value || 'Cliente';
    let total = 0;
    
    let text = `*ORÇAMENTO DE SERVIÇOS DE INFORMÁTICA*\n`;
    text += `👤 *Cliente:* ${client}\n\n`;
    text += `*Serviços Selecionados:*\n`;

    const keys = Object.keys(selectedServices);

    keys.forEach(id => {
        const item = selectedServices[id];
        total += item.price;
        text += `• ${item.name}: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
    });

    text += `\n💵 *Total Final:* R$ ${total.toFixed(2).replace('.', ',')}`;
    return { text, total };
}

// Botão Enviar pelo WhatsApp
document.getElementById('btnSendWhatsapp').onclick = () => {
    const keys = Object.keys(selectedServices);
    if (keys.length === 0) {
        alert('Selecione pelo menos um serviço antes de enviar!');
        return;
    }

    const { text } = generateMessageText();
    const phoneInput = document.getElementById('clientPhone').value.replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);

    let url = '';
    if (phoneInput) {
        url = `https://api.whatsapp.com/send?phone=55${phoneInput}&text=${encodedText}`;
    } else {
        url = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    window.open(url, '_blank');
};

// Botão Apenas Copiar Texto
document.getElementById('btnJustCopy').onclick = () => {
    const keys = Object.keys(selectedServices);
    if (keys.length === 0) {
        alert('Selecione pelo menos um serviço antes de copiar!');
        return;
    }

    const { text } = generateMessageText();
    navigator.clipboard.writeText(text).then(() => {
        alert('Orçamento copiado para a área de transferência!');
    });
};

initCategories();
renderServices();
