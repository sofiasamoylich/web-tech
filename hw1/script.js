// 2. Налаштування (Початковий стан з 3-ма товарами або завантаження з сайту)
const DEFAULT_PRODUCTS = [
    { id: 1, name: "Помідори", quantity: 2, isBought: true },
    { id: 2, name: "Печиво", quantity: 2, isBought: false },
    { id: 3, name: "Сир", quantity: 1, isBought: false }
];

let products = JSON.parse(localStorage.getItem('buyListState')) || DEFAULT_PRODUCTS;

const addForm = document.getElementById('add-form');
const itemInput = document.getElementById('item-input');
const productsContainer = document.getElementById('products-container');
const remainingContainer = document.getElementById('remaining-container');
const boughtContainer = document.getElementById('bought-container');

function saveToStorage() {
    localStorage.setItem('buyListState', JSON.stringify(products));
}


// 7. Оновлення статистики та рендеринг всього інтерфейсу
function render() {
    productsContainer.innerHTML = '';
    remainingContainer.innerHTML = '';
    boughtContainer.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('div');
        row.className = 'product-row';
        let nameElementHtml = `<span class="product-name ${product.isBought ? 'line-through-text' : ''}" onclick="editName(${product.id})">${product.name}</span>`;
        let controlsHtml = '';
        if (!product.isBought) {
            const isMinusDisabled = product.quantity <= 1 ? 'disabled' : '';
            controlsHtml = `
                <div class="controls">
                    <button class="btn-round btn-minus ${isMinusDisabled}" ${isMinusDisabled} onclick="changeQuantity(${product.id}, -1)" data-tooltip="Зменшити кількість" aria-label="Зменшити">−</button>
                    <span class="quantity-badge bg-gray">${product.quantity}</span>
                    <button class="btn-round btn-plus" onclick="changeQuantity(${product.id}, 1)" data-tooltip="Збільшити кількість" aria-label="Збільшити">+</button>
                    <button class="btn btn-status" onclick="toggleStatus(${product.id})" data-tooltip="Позначити як куплене">Не куплено</button>
                    <button class="btn-round btn-delete" onclick="deleteItem(${product.id})" data-tooltip="Видалити товар" aria-label="Видалити">×</button>
                </div>
            `;
        } else {
            controlsHtml = `
                <div class="controls">
                    <span class="quantity-badge">${product.quantity}</span>
                    <button class="btn btn-status" onclick="toggleStatus(${product.id})" data-tooltip="Скасувати купівлю">Куплено</button>
                </div>
            `;
        }

        row.innerHTML = nameElementHtml + controlsHtml;
        productsContainer.appendChild(row);
        const tag = document.createElement('span');
        tag.className = 'product-tag';
        tag.innerHTML = `${product.name} <span class="tag-count">${product.quantity}</span>`;

        if (product.isBought) {
            boughtContainer.appendChild(tag);
        } else {
            remainingContainer.appendChild(tag);
        }
    });

    saveToStorage();
    itemInput.focus();
}

// 1. Додавання нового товару (Форма та Enter)
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = itemInput.value.trim();
    if (!name) return;
    const newProduct = {
        id: Date.now(), 
        name: name,
        quantity: 1,    
        isBought: false
    };
    products.push(newProduct);
    itemInput.value = ''; 
    render();
});

 
// 6. Редагування кількості (+ / -)
function changeQuantity(id, change) {
    products = products.map(p => {
        if (p.id === id && !p.isBought) {
            const newQty = p.quantity + change;
            return { ...p, quantity: newQty < 1 ? 1 : newQty };
        }
        return p;
    });
    render();
}

// 3 & 4. Зміна статусу "Куплено / Не куплено" та Видалення
function toggleStatus(id) {
    products = products.map(p => p.id === id ? { ...p, isBought: !p.isBought } : p);
    render();
}

function deleteItem(id) {
    products = products.filter(p => p.id !== id);
    render();
}

// 5. Редагування назви товару (Клік -> Інпут -> Блур)
function editName(id) {
    const product = products.find(p => p.id === id);
    if (!product || product.isBought) return; 
    const rows = productsContainer.querySelectorAll('.product-row');
    const index = products.findIndex(p => p.id === id);
    const targetRow = rows[index];
    const nameSpan = targetRow.querySelector('.product-name');
    const currentName = product.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-field-inline';
    input.value = currentName;
    targetRow.replaceChild(input, nameSpan);
    input.focus();

    function saveNewName() {
        const newName = input.value.trim();
        if (newName && newName !== currentName) {
            product.name = newName;
        }
        render(); 
    }
    input.addEventListener('blur', saveNewName);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.removeEventListener('blur', saveNewName); 
            saveNewName();
        }
    });
}

render();