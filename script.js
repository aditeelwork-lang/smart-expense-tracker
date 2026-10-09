// ==========================================
// SMART EXPENSE TRACKER
// ==========================================


// Store transactions in an array.
// If there is saved data in the browser,
// load it. Otherwise use an empty array.

const API_URL = "http://127.0.0.1:5000/api/transactions";

let transactions = [];


// Chart variables

let categoryChart = null;
let monthlyChart = null;


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const balanceEl =
    document.getElementById("balance");

const incomeEl =
    document.getElementById("income");

const expensesEl =
    document.getElementById("expenses");

const form =
    document.getElementById("transaction-form");

const list =
    document.getElementById("transaction-list");

const emptyState =
    document.getElementById("empty-state");

const filterCategory =
    document.getElementById("filter-category");

const themeToggle =
    document.getElementById("theme-toggle");

const dateInput =
    document.getElementById("date");


// ==========================================
// SET TODAY'S DATE
// ==========================================

dateInput.value =
    new Date().toISOString().split("T")[0];


// ==========================================
// SAVE DATA
// ==========================================

function saveData() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatCurrency(amount) {

    return `₹${amount.toFixed(2)}`;
}


// ==========================================
// DELETE TRANSACTION
// ==========================================


async function deleteTransaction(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete transaction");
        }

        transactions = transactions.filter(
            transaction => transaction.id !== id
        );

        updateUI();

    } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Could not delete transaction. Please try again.");
    }
}


// ==========================================
// PREVENT HTML INJECTION
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ==========================================
// DISPLAY TRANSACTIONS
// ==========================================

function renderTransactions() {

    const selectedCategory =
        filterCategory.value;


    // Filter transactions

    const filtered =
        selectedCategory === "all"
            ? transactions
            : transactions.filter(
                transaction =>
                    transaction.category ===
                    selectedCategory
            );


    // Clear current list

    list.innerHTML = "";


    // No transactions

    if (filtered.length === 0) {

        emptyState.style.display = "block";

        return;
    }


    emptyState.style.display = "none";


    // Newest transactions first

    const sorted =
        [...filtered].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    // Create transaction elements

    sorted.forEach(transaction => {

        const li =
            document.createElement("li");


        li.classList.add(
            transaction.type
        );


        const sign =
            transaction.type === "income"
                ? "+"
                : "-";


        const amountClass =
            transaction.type === "income"
                ? "text-success"
                : "text-danger";


        li.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(
                        transaction.description
                    )}
                </strong>

                <small>
                    ${escapeHTML(
                        transaction.category
                    )}
                    ·
                    ${escapeHTML(
                        transaction.date
                    )}
                </small>

            </div>


            <div>

                <span
                    class="amount ${amountClass}"
                >
                    ${sign}${formatCurrency(
                        transaction.amount
                    )}
                </span>


                <button
                    class="delete-btn"
                    type="button"
                >
                    Delete
                </button>

            </div>
        `;


        // Delete button

        li.querySelector(
            ".delete-btn"
        ).addEventListener(
            "click",
            () => {
                deleteTransaction(
                    transaction.id
                );
            }
        );


        list.appendChild(li);

    });
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    // Calculate income

    const income =
        transactions

            .filter(
                transaction =>
                    transaction.type ===
                    "income"
            )

            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    // Calculate expenses

    const expenses =
        transactions

            .filter(
                transaction =>
                    transaction.type ===
                    "expense"
            )

            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    // Calculate balance

    const balance =
        income - expenses;


    // Display values

    balanceEl.textContent =
        formatCurrency(balance);

    incomeEl.textContent =
        formatCurrency(income);

    expensesEl.textContent =
        formatCurrency(expenses);


    // Balance color

    balanceEl.classList.remove(
        "text-success",
        "text-danger"
    );


    if (balance > 0) {

        balanceEl.classList.add(
            "text-success"
        );
    }


    if (balance < 0) {

        balanceEl.classList.add(
            "text-danger"
        );
    }
}


// ==========================================
// CREATE CHARTS
// ==========================================

function initCharts() {

    const categoryCanvas =
        document.getElementById(
            "category-chart"
        );


    const monthlyCanvas =
        document.getElementById(
            "monthly-chart"
        );


    // Category chart

    categoryChart =
        new Chart(
            categoryCanvas,
            {
                type: "doughnut",

                data: {

                    labels: [],

                    datasets: [
                        {
                            data: [],

                            backgroundColor: [
                                "#4f46e5",
                                "#10b981",
                                "#ef4444",
                                "#f59e0b",
                                "#06b6d4",
                                "#8b5cf6"
                            ]
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false
                }
            }
        );


    // Monthly chart

    monthlyChart =
        new Chart(
            monthlyCanvas,
            {
                type: "bar",

                data: {

                    labels: [],

                    datasets: [
                        {
                            label: "Expenses",

                            data: [],

                            backgroundColor:
                                "#ef4444"
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


// ==========================================
// UPDATE CHARTS
// ==========================================

function updateCharts() {

    if (
        !categoryChart ||
        !monthlyChart
    ) {
        return;
    }


    // Only expenses

    const expenses =
        transactions.filter(
            transaction =>
                transaction.type ===
                "expense"
        );


    // ======================================
    // CATEGORY BREAKDOWN
    // ======================================

    const categoryTotals = {};


    expenses.forEach(transaction => {

        categoryTotals[
            transaction.category
        ] =
            (
                categoryTotals[
                    transaction.category
                ] || 0
            ) +
            transaction.amount;

    });


    categoryChart.data.labels =
        Object.keys(categoryTotals);


    categoryChart.data.datasets[0].data =
        Object.values(categoryTotals);


    categoryChart.update();


    // ======================================
    // MONTHLY EXPENSES
    // ======================================

    const monthlyTotals = {};


    expenses.forEach(transaction => {

        const month =
            transaction.date.slice(0, 7);


        monthlyTotals[month] =
            (
                monthlyTotals[month] || 0
            ) +
            transaction.amount;

    });


    const months =
        Object.keys(monthlyTotals)
            .sort();


    monthlyChart.data.labels =
        months;


    monthlyChart.data.datasets[0].data =
        months.map(
            month =>
                monthlyTotals[month]
        );


    monthlyChart.update();
}


// ==========================================
// UPDATE EVERYTHING
// ==========================================


async function loadTransactions() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load transactions");
        }

        const data = await response.json();

        transactions = data.map(item => ({
            id: item.id,
            description: item.title,
            amount: Number(item.amount),
            type: item.type,
            category: item.category,
            date: item.transaction_date,
            notes: item.description
        }));

        updateUI();

    } catch (error) {
        console.error("Error loading transactions:", error);
        alert("Could not load transactions. Check whether the backend is running.");
    }
}
function updateUI() {

    updateDashboard();

    renderTransactions();

    updateCharts();
}


// ==========================================

form.addEventListener("submit", async event => {
    event.preventDefault();

    const description = document.getElementById("description").value.trim();
    const amount = Number.parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: description,
                amount: amount,
                type: type,
                category: category,
                transaction_date: date,
                description: ""
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Could not save transaction");
        }

        // Reload the saved data from the backend
        await loadTransactions();

        form.reset();
        dateInput.value = new Date().toISOString().split("T")[0];
        document.getElementById("description").focus();

    } catch (error) {
        console.error("Add transaction error:", error);
        alert("Could not save transaction: " + error.message);
    }
});


// ==========================================
// CATEGORY FILTER
// ==========================================

filterCategory.addEventListener(
    "change",
    renderTransactions
);


// ==========================================
// DARK MODE
// ==========================================

themeToggle.addEventListener(
    "click",
    () => {

        const isDark =
            document.body.getAttribute(
                "data-theme"
            ) === "dark";


        const newTheme =
            isDark
                ? "light"
                : "dark";


        document.body.setAttribute(
            "data-theme",
            newTheme
        );


        themeToggle.textContent =
            newTheme === "dark"
                ? "☀️"
                : "🌙";


        localStorage.setItem(
            "theme",
            newTheme
        );
    }
);


// ==========================================
// LOAD SAVED THEME
// ==========================================

const savedTheme =
    localStorage.getItem("theme") ||
    "light";


document.body.setAttribute(
    "data-theme",
    savedTheme
);


themeToggle.textContent =
    savedTheme === "dark"
        ? "☀️"
        : "🌙";


// ==========================================
// START APPLICATION
// ==========================================
initCharts();
loadTransactions();
