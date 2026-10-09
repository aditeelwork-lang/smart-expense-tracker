
const API_URL = "http://127.0.0.1:5000/api/transactions";

let transactions = [];
let categoryChart = null;
let monthlyChart = null;
let editingId = null;

const $ = (id) => document.getElementById(id);

const form = $("transaction-form");
const searchInput = $("search-transactions");
const typeFilter = $("filter-type");
const categoryFilter = $("filter-category");
const transactionList = $("transaction-list");
const formMessage = $("form-message");
const listMessage = $("list-message");
const submitButton = $("submit-btn");

const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);

function todayISO() {
    const now = new Date();
    const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 10);
}

function showMessage(element, message, kind = "") {
    element.textContent = message;
    element.className = `message ${kind}`;
}

function clearFormMessage() {
    showMessage(formMessage, "");
}

function formatDate(dateString) {
    if (!dateString) return "No date";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function normalizeTransaction(item) {
    return {
        id: Number(item.id),
        title: item.title ?? "",
        amount: Number(item.amount),
        type: item.type,
        category: item.category ?? "Other",
        date: item.transaction_date ?? todayISO(),
        description: item.description ?? ""
    };
}

async function apiRequest(url, options = {}) {
    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers: {
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers
            }
        });
    } catch {
        throw new Error(
            "Cannot connect to the backend. Check that Flask is running."
        );
    }

    const text = await response.text();
    let result = {};

    try {
        result = text ? JSON.parse(text) : {};
    } catch {
        result = {};
    }

    if (!response.ok) {
        throw new Error(result.error || `Request failed (${response.status})`);
    }

    return result;
}

async function loadTransactions() {
    showMessage(listMessage, "Loading transactions...");

    try {
        const data = await apiRequest(API_URL);
        transactions = Array.isArray(data)
            ? data.map(normalizeTransaction)
            : [];

        showMessage(listMessage, "");
        updateUI();
    } catch (error) {
        showMessage(listMessage, error.message, "error");
        transactions = [];
        updateUI();
    }
}

function getFilteredTransactions() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    return transactions.filter((transaction) => {
        const searchableText = [
            transaction.title,
            transaction.category,
            transaction.description,
            transaction.date
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);
        const matchesType =
            selectedType === "all" || transaction.type === selectedType;
        const matchesCategory =
            selectedCategory === "all" ||
            transaction.category === selectedCategory;

        return matchesSearch && matchesType && matchesCategory;
    });
}

function updateDashboard() {
    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((total, t) => total + t.amount, 0);

    const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((total, t) => total + t.amount, 0);

    $("balance").textContent = money(income - expenses);
    $("income").textContent = money(income);
    $("expenses").textContent = money(expenses);
}

function categoryIcon(category) {
    const icons = {
        Food: "🍜",
        Travel: "🚗",
        Education: "📚",
        Shopping: "🛍️",
        Bills: "🧾",
        Salary: "💼",
        Other: "💳"
    };

    return icons[category] || "💳";
}

function renderTransactions() {
    const filtered = getFilteredTransactions();

    transactionList.replaceChildren();
    $("transaction-count").textContent =
        `${filtered.length} ${filtered.length === 1 ? "record" : "records"}`;

    $("empty-state").classList.toggle("hidden", filtered.length > 0);

    filtered
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .forEach((transaction) => {
            const item = document.createElement("li");
            item.className = "transaction-item";

            const main = document.createElement("div");
            main.className = "transaction-main";

            const icon = document.createElement("span");
            icon.className = "transaction-icon";
            icon.textContent = categoryIcon(transaction.category);
            icon.setAttribute("aria-hidden", "true");

            const info = document.createElement("div");
            info.className = "transaction-info";

            const title = document.createElement("p");
            title.className = "transaction-title";
            title.textContent = transaction.title;

            const meta = document.createElement("p");
            meta.className = "transaction-meta";
            meta.textContent =
                `${transaction.category} · ${formatDate(transaction.date)}` +
                (transaction.description ? ` · ${transaction.description}` : "");

            info.append(title, meta);
            main.append(icon, info);

            const right = document.createElement("div");
            right.className = "transaction-right";

            const amount = document.createElement("span");
            amount.className =
                `transaction-amount ${
                    transaction.type === "income" ? "income-text" : "expense-text"
                }`;
            amount.textContent =
                `${transaction.type === "income" ? "+" : "−"}${money(transaction.amount)}`;

            const actions = document.createElement("div");
            actions.className = "transaction-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "small-btn";
            editButton.textContent = "Edit";
            editButton.setAttribute(
                "aria-label",
                `Edit ${transaction.title}`
            );
            editButton.addEventListener("click", () => startEdit(transaction.id));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "small-btn delete-btn";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute(
                "aria-label",
                `Delete ${transaction.title}`
            );
            deleteButton.addEventListener("click", () =>
                deleteTransaction(transaction.id)
            );

            actions.append(editButton, deleteButton);
            right.append(amount, actions);
            item.append(main, right);
            transactionList.append(item);
        });
}

function renderCharts() {
    if (typeof Chart === "undefined") return;

    const isLight = document.body.classList.contains("light-theme");
    const textColor = isLight ? "#737992" : "#aab0c8";
    const gridColor = isLight ? "#e5e7f0" : "#30354b";

    Chart.defaults.color = textColor;
    Chart.defaults.font.family = 'Inter, "Segoe UI", Arial, sans-serif';

    const expenses = transactions.filter((t) => t.type === "expense");

    const categoryTotals = {};
    expenses.forEach((t) => {
        categoryTotals[t.category] =
            (categoryTotals[t.category] || 0) + t.amount;
    });

    const categoryLabels = Object.keys(categoryTotals);
    const categoryValues = Object.values(categoryTotals);

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart($("category-chart"), {
        type: "doughnut",
        data: {
            labels: categoryLabels.length ? categoryLabels : ["No expenses"],
            datasets: [{
                data: categoryValues.length ? categoryValues : [1],
                backgroundColor: categoryValues.length
                    ? ["#9b8cff", "#55d6a0", "#ffb86b", "#ff7e91",
                       "#64b5f6", "#e0aaff", "#f4d35e"]
                    : [gridColor],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { padding: 18, usePointStyle: true }
                },
                tooltip: {
                    callbacks: {
                        label: (context) =>
                            `${context.label}: ${money(
                                categoryValues.length ? context.raw : 0
                            )}`
                    }
                }
            }
        }
    });

    const monthlyTotals = {};

    expenses.forEach((t) => {
        const month = t.date.slice(0, 7);
        monthlyTotals[month] = (monthlyTotals[month] || 0) + t.amount;
    });

    const months = Object.keys(monthlyTotals).sort();

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart($("monthly-chart"), {
        type: "bar",
        data: {
            labels: months.length
                ? months.map((month) => {
                    const [year, number] = month.split("-");
                    return new Date(Number(year), Number(number) - 1, 1)
                        .toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric"
                        });
                })
                : ["No data"],
            datasets: [{
                label: "Expenses",
                data: months.length
                    ? months.map((month) => monthlyTotals[month])
                    : [0],
                backgroundColor: "#9b8cff",
                borderRadius: 7,
                maxBarThickness: 45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: {
                        callback: (value) =>
                            "₹" + Number(value).toLocaleString("en-IN")
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => money(context.raw)
                    }
                }
            }
        }
    });
}

function updateUI() {
    updateDashboard();
    renderTransactions();
    renderCharts();
}

function resetForm() {
    form.reset();
    $("date").value = todayISO();
    editingId = null;
    $("form-heading").textContent = "Add transaction";
    submitButton.innerHTML = "<span>＋</span> Add transaction";
    $("cancel-edit").classList.add("hidden");
    clearFormMessage();
}

function startEdit(id) {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    editingId = id;
    $("description").value = transaction.title;
    $("amount").value = transaction.amount;
    $("type").value = transaction.type;
    $("category").value = transaction.category;
    $("date").value = transaction.date;
    $("notes").value = transaction.description;

    $("form-heading").textContent = "Edit transaction";
    submitButton.textContent = "Save changes";
    $("cancel-edit").classList.remove("hidden");
    clearFormMessage();

    form.scrollIntoView({ behavior: "smooth", block: "start" });
    $("description").focus();
}

async function deleteTransaction(id) {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    const confirmed = window.confirm(
        `Delete "${transaction.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
        await apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
        if (editingId === id) resetForm();
        await loadTransactions();
        showMessage(listMessage, "Transaction deleted.", "success");
    } catch (error) {
        showMessage(listMessage, error.message, "error");
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFormMessage();

    const title = $("description").value.trim();
    const amount = Number($("amount").value);
    const type = $("type").value;
    const category = $("category").value;
    const date = $("date").value;
    const description = $("notes").value.trim();

    if (!title) {
        showMessage(formMessage, "Please enter a title.", "error");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount >= 100000000) {
        showMessage(formMessage, "Enter a valid positive amount.", "error");
        return;
    }

    if (!date) {
        showMessage(formMessage, "Please select a transaction date.", "error");
        return;
    }

    const payload = {
        title,
        amount,
        type,
        category,
        transaction_date: date,
        description
    };

    const isEditing = editingId !== null;
    const url = isEditing ? `${API_URL}/${editingId}` : API_URL;
    const method = isEditing ? "PUT" : "POST";

    submitButton.disabled = true;

    try {
        await apiRequest(url, {
            method,
            body: JSON.stringify(payload)
        });

        resetForm();
        await loadTransactions();
        showMessage(
            formMessage,
            isEditing ? "Transaction updated successfully." :
                        "Transaction added successfully.",
            "success"
        );
    } catch (error) {
        showMessage(formMessage, error.message, "error");
    } finally {
        submitButton.disabled = false;
    }
});

$("cancel-edit").addEventListener("click", resetForm);

searchInput.addEventListener("input", renderTransactions);
typeFilter.addEventListener("change", renderTransactions);
categoryFilter.addEventListener("change", renderTransactions);

$("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    const isLight = document.body.classList.contains("light-theme");
    $("theme-toggle").textContent = isLight ? "🌙" : "☀️";
    $("theme-toggle").setAttribute(
        "aria-label",
        isLight ? "Switch to dark theme" : "Switch to light theme"
    );

    try {
        localStorage.setItem("spendwise-theme", isLight ? "light" : "dark");
    } catch {
        // Theme still works if browser storage is unavailable.
    }

    renderCharts();
});

function initializeTheme() {
    try {
        const savedTheme = localStorage.getItem("spendwise-theme");
        if (savedTheme === "light") {
            document.body.classList.add("light-theme");
        }
    } catch {
        // Use the default dark theme.
    }

    $("theme-toggle").textContent =
        document.body.classList.contains("light-theme") ? "🌙" : "☀️";
}

function initializeApp() {
    $("today-label").textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    $("date").value = todayISO();
    initializeTheme();
    loadTransactions();
}

initializeApp();