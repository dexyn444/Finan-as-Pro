let cards = JSON.parse(localStorage.getItem('myCards')) || [];
let fixedExpenses = JSON.parse(localStorage.getItem('myFixed')) || [];
let reserves = JSON.parse(localStorage.getItem('myReserves')) || [];
let myChart = null;

window.onload = () => {
    document.getElementById('salary').value = localStorage.getItem('mySalary') || '';
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    updateDashboard();
};

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
    updateThemeIcon(target);
    updateDashboard();
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function addFixedExpense() {
    const n = document.getElementById('fixedName'), v = document.getElementById('fixedValue');
    if(n.value && v.value) {
        fixedExpenses.push({id: Date.now(), name: n.value, value: parseFloat(v.value)});
        n.value = ''; v.value = ''; updateDashboard();
    }
}

function addCard() {
    const n = document.getElementById('cardName'), v = document.getElementById('cardSpend');
    if(n.value && v.value) {
        cards.push({id: Date.now(), name: n.value, spend: parseFloat(v.value)});
        n.value = ''; v.value = ''; updateDashboard();
    }
}

function addReserve() {
    const n = document.getElementById('reserveName'), v = document.getElementById('reserveValue');
    if(n.value && v.value) {
        reserves.push({id: Date.now(), name: n.value, value: parseFloat(v.value)});
        n.value = ''; v.value = ''; updateDashboard();
    }
}

function remove(id, category) {
    if(category === 'f') fixedExpenses = fixedExpenses.filter(x => x.id !== id);
    if(category === 'c') cards = cards.filter(x => x.id !== id);
    if(category === 'r') reserves = reserves.filter(x => x.id !== id);
    updateDashboard();
}

function updateDashboard() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const fmt = (v) => v.toLocaleString('pt-BR', {minimumFractionDigits: 2});

    const render = (list, elementId, type) => {
        const el = document.getElementById(elementId);
        el.innerHTML = '';
        let total = 0;
        list.forEach(item => {
            const val = item.value || item.spend;
            total += val;
            el.innerHTML += `
                <div class="card-item shadow-sm">
                    <div class="info"><strong>${item.name}</strong><small>R$ ${fmt(val)}</small></div>
                    <button class="btn-del" onclick="remove(${item.id}, '${type}')"><i class="fa-solid fa-trash-can"></i></button>
                </div>`;
        });
        return total;
    };

    const tFixed = render(fixedExpenses, 'fixedList', 'f');
    const tCards = render(cards, 'cardList', 'c');
    const tReserves = render(reserves, 'reserveList', 'r');

    const totalOut = tFixed + tCards + tReserves;
    const balance = salary - totalOut;

    document.getElementById('totalSpent').innerText = `R$ ${fmt(totalOut)}`;
    const balEl = document.getElementById('finalBalance');
    balEl.innerText = `R$ ${fmt(balance)}`;
    balEl.className = balance < 0 ? 'negative' : 'positive';

    localStorage.setItem('myCards', JSON.stringify(cards));
    localStorage.setItem('myFixed', JSON.stringify(fixedExpenses));
    localStorage.setItem('myReserves', JSON.stringify(reserves));
    localStorage.setItem('mySalary', salary);

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (myChart) myChart.destroy();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const labels = [...fixedExpenses.map(f => f.name), ...cards.map(c => c.name), ...reserves.map(r => r.name)];
    const data = [...fixedExpenses.map(f => f.value), ...cards.map(c => c.spend), ...reserves.map(r => r.value)];

    if (labels.length === 0) return;

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
                borderWidth: 0
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { 
                    position: window.innerWidth < 600 ? 'bottom' : 'right',
                    labels: { color: isDark ? '#fff' : '#333', usePointStyle: true }
                }
            }
        }
    });
}
