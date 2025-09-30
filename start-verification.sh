#!/bin/bash

# Script per avviare il server e aprire la pagina di verifica
# Utilizzo: ./start-verification.sh

echo "🚀 Avvio server per verifica dati..."

# Percorso del progetto
PROJECT_DIR="/Users/salvatorepicconi/Library/Mobile Documents/com~apple~CloudDocs/Progetti/HCP AMBITI ETERRITORIALI INTEGRATIVE"

# Vai alla directory del progetto
cd "$PROJECT_DIR"

# Controlla se la porta 8000 è già occupata
if lsof -i :8000 >/dev/null 2>&1; then
    echo "⚠️  La porta 8000 è già in uso. Terminando il processo esistente..."
    pkill -f "python3 -m http.server 8000" || true
    sleep 2
fi

echo "📡 Avvio server HTTP sulla porta 8000..."

# Avvia il server in background
python3 -m http.server 8000 > /dev/null 2>&1 &
SERVER_PID=$!

echo "✅ Server avviato (PID: $SERVER_PID)"
echo "🌐 URL Dashboard: http://localhost:8000"
echo "🔍 URL Verifica: http://localhost:8000/verify.html"

# Aspetta un momento per far avviare il server
sleep 2

# Apri il browser alla pagina di verifica
echo "🔗 Apertura browser..."
if command -v open >/dev/null; then
    # macOS
    open "http://localhost:8000/verify.html"
elif command -v xdg-open >/dev/null; then
    # Linux
    xdg-open "http://localhost:8000/verify.html"
elif command -v start >/dev/null; then
    # Windows
    start "http://localhost:8000/verify.html"
else
    echo "⚠️  Impossibile aprire automaticamente il browser."
    echo "   Apri manualmente: http://localhost:8000/verify.html"
fi

echo ""
echo "📖 ISTRUZIONI PER LA VERIFICA:"
echo "   1. Il browser dovrebbe aprirsi automaticamente alla pagina di verifica"
echo "   2. Usa 'Verifica Completa' per un test completo automatico"
echo "   3. Usa i test specifici per verificare singoli componenti"
echo "   4. Apri la console del browser (F12) per dettagli avanzati"
echo "   5. Dalla console puoi usare: await verifyData()"
echo ""
echo "🛑 Per fermare il server: killall python3 oppure Ctrl+C"

# Mantieni lo script in esecuzione per monitorare il server
echo "📊 Server in esecuzione... (Ctrl+C per terminare)"
wait $SERVER_PID