let cards = JSON.parse(localStorage.getItem('myCards')) || [];
let fixedExpenses = JSON.parse(localStorage.getItem('myFixed')) || [];
let myChart = null;

window.onload = () => {
    const savedSalary = localStorage.getItem('mySalary');
    if (savedSalary) {
        document.getElementById('salary').value = savedSalary;
    }
    updateDashboard();
};

function saveData() {
    localStorage.setItem('myCards', JSON.stringify(cards));
    localStorage.setItem('myFixed', JSON.stringify(fixedExpenses));
    localStorage.setItem('mySalary', document.getElementById('salary').value);
}

function addFixedExpense() {
    const name = document.getElementById('fixedName').value;
    const value = parseFloat(document.getElementById('fixedValue').value);

    if (name && !isNaN(value)) {
        fixedExpenses.push({ id: Date.now(), name, value });
        document.getElementById('fixedName').value = '';
        document.getElementById('fixedValue').value = '';
        updateDashboard();
    }
}

function addCard() {
    const name = document.getElementById('cardName').value;
    const limit = parseFloat(document.getElementById('cardLimit').value);
    const spend = parseFloat(document.getElementById('cardSpend').value);

    if (name && !isNaN(limit)) {
        cards.push({ id: Date.now(), name, limit, spend: spend || 0 });
        document.getElementById('cardName').value = '';
        document.getElementById('cardLimit').value = '';
        document.getElementById('cardSpend').value = '';
        updateDashboard();
    }
}

function removeCard(id) {
    cards = cards.filter(c => c.id !== id);
    updateDashboard();
}

function removeFixed(id) {
    fixedExpenses = fixedExpenses.filter(e => e.id !== id);
    updateDashboard();
}

function updateDashboard() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const cardListDiv = document.getElementById('cardList');
    const fixedListDiv = document.getElementById('fixedList');
    
    let totalSpentCards = 0;
    let totalFixed = 0;

    fixedListDiv.innerHTML = fixedExpenses.length ? '<small>GASTOS FIXOS</small>' : '';
    fixedExpenses.forEach(item => {
        totalFixed += item.value;
        fixedListDiv.innerHTML += `
            <div class="card-item fixed-item shadow-sm">
                <div class="card-info">
                    <h4><i class="fa-solid fa-file-invoice-dollar"></i> ${item.name}</h4>
                    <small>R$ ${item.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</small>
                </div>
                <button class="btn-delete" onclick="removeFixed(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });

    cardListDiv.innerHTML = cards.length ? '<small style="margin-top:20px; display:block;">CARTÕES DE CRÉDITO</small>' : '';
    cards.forEach(card => {
        totalSpentCards += card.spend;
        cardListDiv.innerHTML += `
            <div class="card-item shadow-sm" style="border-left: 5px solid #4f46e5">
                <div class="card-info">
                    <h4><i class="fa-solid fa-credit-card"></i> ${card.name}</h4>
                    <small>Fatura: R$ ${card.spend.toLocaleString('pt-BR', {minimumFractionDigits: 2})} / Limite: R$ ${card.limit.toLocaleString('pt-BR')}</small>
                </div>
                <button class="btn-delete" onclick="removeCard(${card.id})"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    });

    const totalGeral = totalSpentCards + totalFixed;
    const balance = salary - totalGeral;

    document.getElementById('totalSpent').innerText = `R$ ${totalGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    const balanceEl = document.getElementById('finalBalance');
    balanceEl.innerText = `R$ ${balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    balanceEl.className = balance < 0 ? 'negative' : 'positive';

    saveData();
    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (myChart) myChart.destroy();
    
    // Criamos as listas para o gráfico com nomes individuais
    const labels = [...cards.map(c => c.name), ...fixedExpenses.map(f => f.name)];
    const dataValues = [...cards.map(c => c.spend), ...fixedExpenses.map(f => f.value)];

    if (labels.length === 0) return;

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                    '#06b6d4', '#ec4899', '#64748b', '#78350f'
                ],
                hoverOffset: 20,
                borderWidth: 0
            }]
        },
        options: {
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } }
            }
        }
    });
}

function renderChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (myChart) myChart.destroy();
    
    const labels = [...cards.map(c => c.name), ...fixedExpenses.map(f => f.name)];
    const dataValues = [...cards.map(c => c.spend), ...fixedExpenses.map(f => f.value)];

    if (labels.length === 0) return;

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
                hoverOffset: 20,
                borderWidth: 0
            }]
        },
        options: {
            maintainAspectRatio: false, // Permite que o gráfico use o tamanho do container CSS
            cutout: '70%',
            plugins: {
                legend: { 
                    position: window.innerWidth < 600 ? 'bottom' : 'right', // Legenda na lateral em telas grandes
                    labels: { usePointStyle: true, padding: 15 } 
                }
            }
        }
    });
}