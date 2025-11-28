// DOM Elements Selection
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const amount = document.getElementById('amount');

// Chart Global Variable
let myChart = null;

// Get transactions from local storage
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// --- FUNCTION 1: Add Transaction ---
function addTransaction(e) {
    e.preventDefault();

    if (amount.value.trim() === '' || amount.value == 0) {
        alert('Please enter a valid amount');
        return;
    }

    // Check if Expense or Income
    const isExpense = typeSelect.value === 'expense';
    
    // Expenses should be negative numbers, Income positive
    const finalAmount = isExpense ? -Math.abs(amount.value) : Math.abs(amount.value);

    const transaction = {
        id: generateID(),
        text: categorySelect.value, // Text mein ab category ka naam jayega
        amount: finalAmount,
        type: typeSelect.value
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();
    updateChart(); // Update Graph immediately

    amount.value = ''; // Clear input
}

// Generate Random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// --- FUNCTION 2: Add Transaction to HTML List ---
function addTransactionDOM(transaction) {
    // Determine sign
    const sign = transaction.amount < 0 ? '-' : '+';
    
    // Create List Item
    const item = document.createElement('li');

    // Add class (plus for income, minus for expense)
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    item.innerHTML = `
        ${transaction.text} 
        <span>${sign}₹${Math.abs(transaction.amount)}</span> 
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;

    // Add to the top of the list
    list.prepend(item);
}

// --- FUNCTION 3: Update Balance, Income & Expense ---
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);

    balance.innerText = `₹${total}`;
    money_plus.innerText = `+₹${income}`;
    money_minus.innerText = `-₹${expense}`;
}

// --- FUNCTION 4: Remove Transaction ---
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init(); // Reload UI
}

// Update Local Storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// --- FUNCTION 5: Draw/Update Chart (UPDATED) ---
function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');

    // 1. Calculate expenses per category
    const categories = {};
    let hasExpenses = false;

    transactions.forEach(t => {
        if (t.amount < 0) { // Only visualize expenses
            hasExpenses = true;
            if (categories[t.text]) {
                categories[t.text] += Math.abs(t.amount);
            } else {
                categories[t.text] = Math.abs(t.amount);
            }
        }
    });

    // If no expenses, don't break logic, just clear graph
    if (!hasExpenses) {
        if (myChart) myChart.destroy();
        return;
    }

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    // 2. Destroy old chart to avoid overlap
    if (myChart) {
        myChart.destroy();
    }

    // 3. Create New Chart
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: data,
                backgroundColor: [
                    '#ff6384', // Red
                    '#36a2eb', // Blue
                    '#ffce56', // Yellow
                    '#4bc0c0', // Teal
                    '#9966ff', // Purple
                    '#ff9f40', // Orange
                    '#c9cbcf'  // Grey
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            cutout: '65%' // Makes it look like a ring
        }
    });
}

// --- FUNCTION 6: Initialize App ---
function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    updateChart();
}

init();

form.addEventListener('submit', addTransaction);