# Dashboard Ambiti Territoriali

Una dashboard interattiva per l'analisi degli ambiti territoriali italiani e degli enti gestori.

## 🚀 Demo Live

Il sito è disponibile all'indirizzo: [https://[username].github.io/ambiti-territoriali-dashboard](https://[username].github.io/ambiti-territoriali-dashboard)

## 📋 Caratteristiche

- **Dashboard Interattiva**: Visualizzazione completa dei dati degli ambiti territoriali
- **Filtri Avanzati**: Filtraggio per regione, provincia ed ente gestore
- **Tabelle Pivot**: Tabelle dinamiche con ordinamento e espansione
- **Export Dati**: Esportazione in formati CSV, Excel e JSON
- **Tema Chiaro/Scuro**: Supporto per entrambi i temi
- **Design Responsive**: Ottimizzato per desktop, tablet e mobile
- **Grafici e Analitiche**: Visualizzazioni avanzate dei dati

## 🛠️ Tecnologie Utilizzate

- **HTML5**: Struttura semantica e accessibile
- **CSS3**: Design moderno con CSS Grid, Flexbox e Custom Properties
- **JavaScript ES6+**: Logica applicativa moderna e modulare
- **JSON**: Storage e gestione dati strutturati

## 📁 Struttura del Progetto

```
├── index.html          # Pagina principale
├── styles.css          # Stili e tema
├── config.js           # Configurazione applicazione
├── utils.js            # Utilità e helper functions
├── app.js              # Logica principale
├── data.json           # Dati di esempio
└── README.md           # Documentazione
```

## 🚦 Come Utilizzare

1. **Caricamento Dati**: 
   - Cliccare su "Carica File" per importare dati CSV/JSON/Excel
   - Oppure utilizzare "Dati Esempio" per vedere la dashboard in azione

2. **Filtri**:
   - Selezionare regione e provincia dai dropdown
   - Utilizzare la barra di ricerca per trovare enti specifici

3. **Visualizzazione**:
   - La tabella pivot mostra i dati aggregati
   - Cliccare sui pulsanti per espandere/comprimere le righe
   - Utilizzare le intestazioni per ordinare i dati

4. **Export**:
   - Scegliere il formato desiderato (CSV, Excel, JSON)
   - Il file verrà scaricato automaticamente

## ⚙️ Configurazione

Il file `config.js` contiene tutte le impostazioni personalizzabili:

- Configurazione UI e temi
- Impostazioni export
- Validazione dati
- Modalità sviluppo

## 📊 Formato Dati

I dati devono seguire questa struttura:

```json
{
  "metadata": {
    "title": "Titolo Dataset",
    "version": "1.0.0",
    "recordCount": 15
  },
  "ambiti_territoriali": [
    {
      "regione": "REGIONE",
      "provincia": "PR",
      "numeroComuni": 50,
      "entiUnici": 3,
      "ambitiUnici": 2,
      "entiDistinti": ["Ente 1", "Ente 2"],
      "comuniDistinti": ["Comune 1", "Comune 2"]
    }
  ]
}
```

## 🎨 Personalizzazione Tema

Il sistema di temi utilizza CSS Custom Properties. Per personalizzare:

1. Modificare le variabili in `:root` per il tema chiaro
2. Modificare le variabili in `[data-theme="dark"]` per il tema scuro
3. Aggiungere nuove variabili per estendere il sistema

## 🧪 Testing

La dashboard include una suite di test integrata:

- Validazione dati in tempo reale
- Verifica compatibilità browser
- Test responsiveness automatici

## 🤝 Contributi

Contributi, issue e feature request sono benvenuti!

## 📝 Licenza

Questo progetto è rilasciato sotto licenza MIT.

## 👨‍💻 Autore

Dashboard sviluppata per l'analisi degli ambiti territoriali italiani.

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: Settembre 2025