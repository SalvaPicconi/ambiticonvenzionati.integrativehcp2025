# 🔍 Guida alla Verifica Dati

Questo documento spiega come verificare se tutti i dati del file JSON sono correttamente reperibili nel sito creato.

## 📋 Metodi di Verifica Disponibili

### 1. Pagina di Verifica Web
**File:** `verify.html`
**Accesso:** http://localhost:8000/verify.html

La pagina di verifica offre un'interfaccia grafica per eseguire diversi tipi di test:

- **Verifica Completa**: Controlla tutti gli aspetti dei dati
- **Controllo Rapido**: Verifica base della corrispondenza numerica
- **Test Specifici**: Verifica singoli record o componenti
- **Istruzioni Console**: Comandi per test avanzati

### 2. Script di Verifica JavaScript
**File:** `verify-data.js`

Classe `DataVerifier` che può essere utilizzata sia dalla pagina web che dalla console del browser.

### 3. Console del Browser
Comandi disponibili dalla console (F12):

```javascript
// Verifica completa automatica
await verifyData();

// Test di un record specifico
await testRecord('PIEMONTE', 'TO');

// Test di tutti i record
await testAllRecords();

// Uso avanzato della classe
const verifier = new DataVerifier();
const results = await verifier.verify();
```

## 🚀 Come Iniziare

### Opzione 1: Script Automatico
```bash
./start-verification.sh
```
Questo script:
- Avvia il server HTTP
- Apre automaticamente la pagina di verifica
- Fornisce istruzioni per l'uso

### Opzione 2: Manuale
1. Avvia il server:
   ```bash
   python3 -m http.server 8000
   ```
2. Apri il browser a: http://localhost:8000/verify.html
3. Esegui i test desiderati

## 📊 Tipi di Verifica

### Verifica di Base
- **Conteggio Record**: JSON vs Tabella
- **Presenza Dati**: Tutti i campi principali
- **Struttura**: Correttezza della gerarchia

### Verifica Dettagliata
- **Corrispondenza Campi**: Ogni singolo dato
- **Filtri**: Tutte le opzioni disponibili
- **Statistiche**: Calcoli e aggregazioni
- **Dettagli Enti**: Informazioni complete

### Verifica Funzionale
- **Espansione Righe**: Dettagli aggiuntivi
- **Ordinamento**: Funzionalità tabella
- **Ricerca**: Filtri e ricerca testo
- **Responsive**: Visualizzazione mobile

## 🔍 Cosa Viene Verificato

### Dal File JSON (`data.json`)
```json
{
  "metadata": { /* info generali */ },
  "ambiti_territoriali": [
    {
      "regione": "PIEMONTE",
      "provincia": "TO",
      "numeroComuni": 38,
      "entiUnici": 2,
      "ambitiUnici": 2,
      "entiDistinti": [...],
      "comuniDistinti": [...],
      "dettagliEnti": [
        {
          "ente": "COMUNE DI TORINO",
          "indirizzo": "Piazza Palazzo di Città 1",
          "comuneAmbito": "TORINO",
          "comuneCompetenza": "TORINO",
          "cap": "10122",
          "codice": "L219"
        }
      ]
    }
  ]
}
```

### Nel Sito Web
- **Tabella principale**: Righe con dati di base
- **Righe espanse**: Dettagli enti e comuni
- **Filtri dropdown**: Regioni, province, comuni
- **Statistiche**: Card riassuntive
- **Ricerca testo**: Campo enti

## ✅ Criteri di Successo

### Test Superato
- Tutti i record JSON presenti in tabella
- Statistiche corrette (totali e calcoli)
- Filtri completi e funzionanti
- Dettagli enti accessibili
- Nessun errore nella console

### Problemi Comuni
- **Record mancanti**: Controllare il caricamento dati
- **Statistiche errate**: Verificare le funzioni di calcolo
- **Filtri incompleti**: Controllare l'aggiornamento opzioni
- **Dettagli mancanti**: Verificare l'espansione righe

## 🛠️ Risoluzione Problemi

### Server non si avvia
```bash
# Verifica se la porta è occupata
lsof -i :8000

# Termina processi esistenti
pkill -f "python3 -m http.server"

# Riavvia
python3 -m http.server 8000
```

### Dati non caricati
1. Verifica che `data.json` sia presente
2. Controlla la console per errori di rete
3. Verifica la sintassi JSON
4. Controlla i permessi del file

### Test falliscono
1. Assicurati di essere sulla pagina principale (`index.html`)
2. Aspetta che i dati siano completamente caricati
3. Verifica che la tabella sia visibile
4. Controlla la console per errori JavaScript

## 📈 Report di Verifica

Il sistema genera report dettagliati che includono:

- **Riepilogo generale**: Status di tutti i componenti
- **Errori specifici**: Dettagli dei problemi trovati
- **Record mancanti**: Lista completa
- **Statistiche comparative**: JSON vs DOM
- **Suggerimenti**: Come risolvere i problemi

## 🎯 Utilizzo Avanzato

### Test Automatizzati
```javascript
// Test completo con logging dettagliato
const verifier = new DataVerifier();
const results = await verifier.verify();

// Accesso ai risultati
console.log('Errori:', results.errors);
console.log('Record mancanti:', results.missing);
console.log('Statistiche:', results.summary);
```

### Test Specifici
```javascript
// Verifica un singolo record
const found = await verifier.testSpecificRecord('LOMBARDIA', 'MI');

// Verifica solo le statistiche
await verifier.initialize();
verifier.verifyStatistics();
```

### Integrazione in CI/CD
Lo script può essere utilizzato in pipeline automatizzate per verificare l'integrità dei dati durante il deployment.

## 📞 Supporto

Per problemi o domande sulla verifica dati:
- Controlla la console del browser per errori dettagliati
- Verifica che tutti i file siano presenti
- Assicurati che il server sia in esecuzione
- Consulta questo README per troubleshooting

---

**Nota**: La verifica è progettata per essere eseguita in ambiente di sviluppo locale. Per verifiche su siti in produzione, adatta gli URL di conseguenza.