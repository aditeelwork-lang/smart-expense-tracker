# SpendWise — Full-Stack Expense Tracker

**Track smarter. Spend wiser.**

SpendWise is a full-stack expense tracking web application that helps users record income and expenses, monitor their financial activity, and understand spending patterns through an interactive dashboard.

The project combines a responsive frontend, a Python Flask REST API, and a PostgreSQL database to demonstrate full-stack development, database integration, and CRUD operations.

## ✨ Features

* **Interactive Dashboard** — View total income, total expenses, and current balance.
* **Transaction Management** — Add, view, edit, and delete income and expense records.
* **Search Transactions** — Quickly find transactions using the search feature.
* **Filter Transactions** — Filter records by transaction type and category.
* **Spending Analytics** — Visualize spending by category and monthly trends using charts.
* **Responsive Design** — Use the application on desktop and smaller screens.
* **Dark and Light Themes** — Switch between themes for a personalized experience.
* **Persistent Storage** — Store transaction records in PostgreSQL so they remain available after refreshing the page.
* **Input Validation** — Validate transaction details and reject invalid amounts or transaction types.

## 🛠️ Tech Stack

| Technology   | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| HTML5        | Web page structure                                   |
| CSS3         | Styling, responsive layout, and themes               |
| JavaScript   | Application logic, API requests, search, and filters |
| Chart.js     | Interactive financial charts                         |
| Python       | Backend development                                  |
| Flask        | REST API and request handling                        |
| PostgreSQL   | Relational database                                  |
| Psycopg      | Python–PostgreSQL connectivity                       |
| Git & GitHub | Version control and project hosting                  |

## 🖥️ Application Overview

### Dashboard

View income, expenses, balance, and financial summaries in one place.

### Transaction Management

Create transactions with a title, amount, type, category, date, and optional description. Edit or delete records when needed.

### Search and Filters

Find transactions by text and narrow the displayed list by income or expense type and category.

### Financial Charts

Explore category-wise spending and monthly financial trends through visualizations.

## 🏗️ Architecture

The application follows a simple full-stack architecture:

```text
User
  |
  v
HTML + CSS + JavaScript
  |
  | HTTP requests (JSON)
  v
Python Flask REST API
  |
  | Psycopg
  v
PostgreSQL Database
```

The frontend sends HTTP requests to the Flask backend. The backend validates incoming data, performs database operations, and returns JSON responses to the frontend.

## 🚀 Getting Started

### Prerequisites

Install the following:

* Python 3
* PostgreSQL
* Git
* Visual Studio Code (recommended)
* A browser with JavaScript enabled

### 1. Clone the repository

```bash
git clone https://github.com/aditeelwork-lang/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Create the PostgreSQL database

Open PostgreSQL or pgAdmin and create a database named:

```sql
CREATE DATABASE smart_expense_tracker;
```

Connect to that database and create the transactions table:

```sql
CREATE TABLE transactions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL
        CHECK (amount > 0),
    type VARCHAR(10) NOT NULL
        CHECK (type IN ('income', 'expense')),
    category VARCHAR(50) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT
);
```

### 3. Set up the backend

Open a terminal in the project directory:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell blocks virtual environment activation, follow your system's Python environment setup guidance or use the environment's Python executable directly.

### 4. Configure environment variables

Create a `.env` file inside the `backend` folder:

```env
DB_NAME=smart_expense_tracker
DB_USER=postgres
DB_PASSWORD=your_local_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

Replace the example password with your local PostgreSQL password. **Never commit your `.env` file or real database credentials to GitHub.**

### 5. Start the backend

From the `backend` directory, run:

```powershell
python app.py
```

The local API should be available at:

`http://127.0.0.1:5000`

### 6. Start the frontend

Open the project root in VS Code and launch `index.html` using the Live Server extension.

The frontend will typically open at:

`http://127.0.0.1:5500/index.html`

Keep the backend running while using the application.

## 🔌 API Endpoints

Base URL: `http://127.0.0.1:5000`

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| GET    | `/api/transactions`      | Retrieve transactions |
| POST   | `/api/transactions`      | Create a transaction  |
| PUT    | `/api/transactions/<id>` | Update a transaction  |
| DELETE | `/api/transactions/<id>` | Delete a transaction  |

The API uses JSON for request and response data. The frontend communicates with these endpoints to perform transaction CRUD operations.

## 🔒 Security and Data Handling

* Database credentials are configured through environment variables.
* `.env` and the local virtual environment are excluded from version control.
* Transaction inputs are validated by the backend.
* Database constraints help protect against invalid amounts and transaction types.

**Note:** This is a portfolio project intended for local development and demonstration. Production deployment would require additional security measures, including appropriate secret management, authentication and authorization, and production server configuration.

## 📚 What I Learned

Building SpendWise helped me practice:

* Connecting a JavaScript frontend to a Flask REST API.
* Designing and using a PostgreSQL relational database.
* Implementing create, read, update, and delete operations.
* Sending and handling HTTP requests and JSON responses.
* Validating user input and handling API errors.
* Creating interactive charts from transaction data.
* Implementing search, filtering, responsive layouts, and theme switching.
* Organizing a project and managing changes using Git and GitHub.

## 🔮 Future Improvements

* User registration, login, and private transaction histories.
* Monthly budgets and spending limits.
* CSV export and downloadable reports.
* Advanced date-range filters and financial summaries.
* Deployment with a production-ready backend and managed database.

## 👩‍💻 Author

**Aditee Singh**

B.Tech Computer Science and Engineering student interested in software development, problem-solving, and building practical applications.

* GitHub: [aditeelwork-lang](https://github.com/aditeelwork-lang)
* Project Repository: [SpendWise](https://github.com/aditeelwork-lang/smart-expense-tracker)

---

*SpendWise — Track smarter. Spend wiser.*
