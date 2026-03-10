from sqlalchemy import text
from app.core.database import SessionLocal

def run():
    db = SessionLocal()
    try:
        # Pega as cartas Ahri
        res = db.execute(text("DELETE FROM collections"))
        db.commit()
        print(f"Deletadas {res.rowcount} linhas de collections. Coleção Inteira Limpa!")
    except Exception as e:
        print(f"Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
