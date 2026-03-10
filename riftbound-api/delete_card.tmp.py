from sqlalchemy import text
from app.core.database import SessionLocal

def run():
    db = SessionLocal()
    try:
        # Pega o ID do user
        res = db.execute(text("SELECT id, email FROM auth.users WHERE email ILIKE '%ph.sama@gmail%'"))
        row = res.fetchone()
        if not row:
            print("Usuário não encontrado")
            return
            
        user_id = row[0]
        print(f"UID: {user_id}")
        
        # Pega as cartas Ahri
        res = db.execute(text("SELECT id FROM cards WHERE name ILIKE '%Ahri%Alluring%'"))
        card_ids = [row[0] for row in res.fetchall()]
        print(f"Ahri Cards: {card_ids}")
        
        if card_ids:
            # Pega coleções para mostrar antes
            query_print = text("SELECT card_id FROM collections WHERE user_id = :uid AND card_id = ANY(:cid)")
            cols = db.execute(query_print, {"uid": user_id, "cid": card_ids}).fetchall()
            print(f"Possui na Collection: {cols}")
            
            # Deleta as possesões
            query = text("DELETE FROM collections WHERE user_id = :uid AND card_id = ANY(:cid)")
            res = db.execute(query, {"uid": user_id, "cid": card_ids})
            db.commit()
            print(f"Deletadas {res.rowcount} linhas de collections")
            
    except Exception as e:
        print(f"Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
