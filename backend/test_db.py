
import getpass
import psycopg

password = getpass.getpass("Enter your PostgreSQL password: ")

try:
    with psycopg.connect(
        dbname="smart_expense_tracker",
        user="postgres",
        password=password,
        host="localhost",
        port=5432
    ) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            print("Database connected successfully!")
            print(cur.fetchone()[0])

except Exception as e:
    print("Connection failed:", e)
    