const expenseForm = document.getElementById('expense_form');
const expenseList = document.getElementById('expense_list');
const categoryFilter = document.getElementById('categoryFilter');
const sortOrder = document.getElementById('sortOrder');
const expenseChart = document.getElementById('expenseChart');

// Handle form submission
expenseForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (description && category && !isNaN(amount)) {
        const currentDate = new Date();
        const day = currentDate.getDate();
        const month = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${description}</td>
            <td>${category}</td>
            <td>${amount}</td>
            <td>${day}</td>
            <td>${month}</td>
            <td>${year}</td>
            <td><button class="remove-btn">Remove</button></td>
        `;

        expenseList.appendChild(newRow);

        // Save to localStorage
        saveExpense(description, category, amount, day, month, year);

        // Clear form fields
        document.getElementById('description').value = '';
        document.getElementById('category').value = '';
        document.getElementById('amount').value = '';
        
        // Update filters and chart
        updateFilters();
    } else {
        alert('Please fill out all fields correctly.');
    }
});

// Function to save expense to localStorage
function saveExpense(description, category, amount, day, month, year) {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const timestamp = new Date().getTime(); // Unique timestamp for each entry
    expenses.push({ description, category, amount, day, month, year, timestamp });
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Load existing expenses from localStorage
document.addEventListener('DOMContentLoaded', function() {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    populateCategoryFilter(expenses);
    updateFilters(); // Initial load with filters and sorting
});

// Function to render chart
function renderChart(expenses) {
    const ctx = expenseChart.getContext('2d');
    const categories = [...new Set(expenses.map(exp => exp.category))];
    const amounts = categories.map(cat => {
        return expenses
            .filter(exp => exp.category === cat)
            .reduce((total, exp) => total + exp.amount, 0);
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Expenses by Category',
                data: amounts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to update analysis section
function updateAnalysis(expenses) {
    const totalExpenses = expenses.reduce((total, exp) => total + exp.amount, 0);
    const averageExpense = totalExpenses / expenses.length || 0;
    const highestExpense = Math.max(...expenses.map(exp => exp.amount), 0);

    document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);
    document.getElementById('averageExpense').textContent = averageExpense.toFixed(2);
    document.getElementById('highestExpense').textContent = highestExpense.toFixed(2);
}

// Function to update filters and sort expenses
function updateFilters() {
    const categoryFilterValue = categoryFilter.value;
    const sortOrderValue = sortOrder.value;

    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    if (categoryFilterValue) {
        expenses = expenses.filter(exp => exp.category === categoryFilterValue);
    }

    expenses.sort((a, b) => sortOrderValue === 'asc' ? a.amount - b.amount : b.amount - a.amount);

    // Clear existing rows
    expenseList.innerHTML = '';

    expenses.forEach(expense => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
            <td>${expense.day}</td>
            <td>${expense.month}</td>
            <td>${expense.year}</td>
            <td><button class="remove-btn">Remove</button></td>
        `;
        expenseList.appendChild(newRow);
    });

    renderChart(expenses);
    updateAnalysis(expenses);
}

// Function to populate category filter options
function populateCategoryFilter(expenses) {
    const categories = [...new Set(expenses.map(exp => exp.category))];
    categoryFilter.innerHTML = '<option value="">All</option>'; // Reset to "All"
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

// Event listener for removing expense
expenseList.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-btn')) {
        const row = event.target.closest('tr');
        const description = row.cells[0].textContent;
        const category = row.cells[1].textContent;
        const amount = parseFloat(row.cells[2].textContent);

        // Remove from UI
        row.remove();

        // Remove from localStorage
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses = expenses.filter(expense => !(expense.description === description && 
                                                expense.category === category &&
                                                expense.amount === amount));
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // Update filters and chart
        updateFilters();
    }
});

// Event listeners for filters and sorting
categoryFilter.addEventListener('change', updateFilters);
sortOrder.addEventListener('change', updateFilters);
