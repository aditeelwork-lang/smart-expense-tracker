
import os
from decimal import Decimal, InvalidOperation

import psycopg
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import date

load_dotenv()

app = Flask(__name__)
CORS(app)


# Connect Python to PostgreSQL
def get_db_connection():
    return psycopg.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT", "5432")
    )


# Validate transaction data
def validate_transaction(data):
    if not isinstance(data, dict):
        return None, "Send a JSON object"

    title = data.get("title")
    amount = data.get("amount")
    transaction_type = data.get("type")
    category = data.get("category")
    description = data.get("description", "")
    transaction_date = data.get("transaction_date", date.today().isoformat())

    if not isinstance(title, str) or not title.strip() or len(title.strip()) > 100:
        return None, "Title must be 1-100 characters"

    if not isinstance(category, str) or not category.strip() or len(category.strip()) > 50:
        return None, "Category must be 1-50 characters"

    if transaction_type not in ("income", "expense"):
        return None, "Type must be income or expense"

    if isinstance(amount, bool) or amount is None:
        return None, "Amount must be a positive number"

    try:
        amount = Decimal(str(amount))
        if not amount.is_finite() or amount <= 0 or amount >= Decimal("100000000"):
            return None, "Amount must be a positive valid number"
    except (InvalidOperation, ValueError, TypeError):
        return None, "Amount must be a positive valid number"

    if not isinstance(description, str):
        return None, "Description must be text"

    try:
        transaction_date = date.fromisoformat(transaction_date)
    except (ValueError, TypeError):
        return None, "Date must be in YYYY-MM-DD format"

    return {
        "title": title.strip(),
        "amount": amount,
        "type": transaction_type,
        "category": category.strip(),
        "description": description,
        "transaction_date": transaction_date
    }, None


# Convert a database row to JSON-friendly data
def transaction_to_dict(row):
    return {
        "id": row[0],
        "title": row[1],
        "amount": float(row[2]),
        "type": row[3],
        "category": row[4],
        "transaction_date": row[5].isoformat(),
        "description": row[6]
    }


# Home route
@app.route("/")
def home():
    return jsonify({
        "message": "Smart Expense Tracker 2.0 API is running!",
        "status": "success"
    })


# READ: Get all transactions
@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, title, amount, type, category,
                           transaction_date, description
                    FROM transactions
                    ORDER BY id;
                """)
                rows = cur.fetchall()

        return jsonify([transaction_to_dict(row) for row in rows])

    except Exception:
        app.logger.exception("Could not fetch transactions")
        return jsonify({"error": "Could not fetch transactions"}), 500


# CREATE: Add a transaction
@app.route("/api/transactions", methods=["POST"])
def add_transaction():
    data = request.get_json(silent=True)
    transaction, error = validate_transaction(data)

    if error:
        return jsonify({"error": error}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                   INSERT INTO transactions
    (title, amount, type, category, transaction_date, description)
VALUES (%s, %s, %s, %s, %s, %s)
RETURNING id, title, amount, type, category,
          transaction_date, description;
                """, (
                     transaction["title"],
    transaction["amount"],
    transaction["type"],
    transaction["category"],
    transaction["transaction_date"],
    transaction["description"]
                ))
                row = cur.fetchone()

        return jsonify(transaction_to_dict(row)), 201

    except Exception:
        app.logger.exception("Could not add transaction")
        return jsonify({"error": "Could not add transaction"}), 500


# UPDATE: Replace an existing transaction
@app.route("/api/transactions/<int:transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    data = request.get_json(silent=True)
    transaction, error = validate_transaction(data)

    if error:
        return jsonify({"error": error}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE transactions
SET title = %s,
    amount = %s,
    type = %s,
    category = %s,
    transaction_date = %s,
    description = %s
WHERE id = %s
RETURNING id, title, amount, type, category,
          transaction_date, description;
                """, (
                 
    transaction["title"],
    transaction["amount"],
    transaction["type"],
    transaction["category"],
    transaction["transaction_date"],
    transaction["description"],
    transaction_id

                ))
                row = cur.fetchone()

                if row is None:
                    return jsonify({"error": "Transaction not found"}), 404

        return jsonify(transaction_to_dict(row)), 200

    except Exception:
        app.logger.exception("Could not update transaction")
        return jsonify({"error": "Could not update transaction"}), 500


# DELETE: Remove a transaction by ID
@app.route("/api/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM transactions
                    WHERE id = %s
                    RETURNING id, title;
                    """,
                    (transaction_id,)
                )
                row = cur.fetchone()

                if row is None:
                    return jsonify({
                        "error": "Transaction not found"
                    }), 404

        return jsonify({
            "message": "Transaction deleted successfully",
            "id": row[0],
            "title": row[1]
        }), 200

    except Exception:
        app.logger.exception("Could not delete transaction")
        return jsonify({
            "error": "Could not delete transaction"
        }), 500
if __name__ == "__main__":
    app.run(debug=True)