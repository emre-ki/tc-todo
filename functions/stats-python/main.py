# Statistik-Funktion als Cloud Function (FaaS) in Python
# Bekommt eine Todo-Liste geschickt und rechnet aus, wie viel schon erledigt ist.
# Speichert nichts, rechnet nur -> passt perfekt zu "zustandslos".
import functions_framework


@functions_framework.http
def stats(request):
    todos = request.get_json(silent=True)

    if not isinstance(todos, list):
        return {"fehler": "Bitte eine Liste von Todos als JSON schicken"}, 400

    gesamt = len(todos)
    erledigt = sum(1 for todo in todos if todo.get("done"))
    prozent = round(erledigt / gesamt * 100) if gesamt > 0 else 0

    return {
        "gesamt": gesamt,
        "erledigt": erledigt,
        "offen": gesamt - erledigt,
        "prozent_erledigt": prozent,
    }
