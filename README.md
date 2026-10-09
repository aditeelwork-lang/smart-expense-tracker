# SpendWise — Full-Stack Expense Tracker

**Track smarter. Spend wiser.**

SpendWise is a personal finance management web application that helps users record income and expenses, organize transactions by category, and monitor their financial balance through a dashboard.

## Features

* **Dashboard:** View total income, expenses, and current balance.
* **Transaction Management:** Add, view, update, and delete transactions.
* **Categories:** Organize transactions into categories such as Food and Salary.
* **Transaction Dates:** Record the date associated with each transaction.
* **Charts:** Visualize financial information using Chart.js.
* **Input Validation:** Validate transaction details on the backend.
* **Theme Toggle:** Switch between dark and light themes.

## Tech Stack

| Layer           | Technology            |
| --------------- | --------------------- |
| Frontend        | HTML, CSS, JavaScript |
| Charts          | Chart.js              |
| Backend         | Python, Flask         |
| Database        | PostgreSQL            |
| Database Driver | Psycopg               |
| Configuration   | python-dotenv         |

## Project Structure

```text
smart-expense-tracker/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env              # Create locally; never commit secrets
├── index.html
├── style.css
├── script.js
├── .gitignore
└── README.md
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/aditeelwork-lang/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Set up PostgreSQL

Create a PostgreSQL database named `smart_expense_tracker` and create the `transactions` table using the schema documented in the project.

### 3. Configure environment variables

Create `backend/.env` with your local database settings:

```text
DB_NAME=smart_expense_tracker
DB_USER=your_postgres_username
DB_PASSWORD=your_local_password
DB_HOST=localhost
DB_PORT=5432
```

Replace the example values with your own local database credentials. Never commit this file.

### 4. Install backend dependencies

```bash
cd backend
python -m venv venv
```

Activate the environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

### 5. Start the backend

From the `backend` directory, run:

```bash
python app.py
```

The local API runs at `http://127.0.0.1:5000`.

### 6. Start the frontend

Open the project root in VS Code and launch `index.html` with the Live Server extension.

## API Endpoints

| Method | Endpoint                 | Purpose               |
| ------ | ------------------------ | --------------------- |
| GET    | `/api/transactions`      | Retrieve transactions |
| POST   | `/api/transactions`      | Add a transaction     |
| PUT    | `/api/transactions/<id>` | Update a transaction  |
| DELETE | `/api/transactions/<id>` | Delete a transaction  |

## Learning Outcomes

* Building REST APIs with Flask.
* Connecting Python applications to PostgreSQL.
* Implementing CRUD operations.
* Validating user input.
* Integrating JavaScript frontend code with backend APIs.
* Presenting financial information with charts.

## Future Improvements

* Search and filter transactions.
* Monthly budgets and spending summaries.
* Export reports to CSV.
* Responsive UI improvements.
* Deployment with a hosted API and database.

---

**Project:** SpendWise — Full-Stack Expense Tracker
**Developer:** Aditee Singh
