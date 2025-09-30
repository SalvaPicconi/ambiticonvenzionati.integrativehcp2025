// Versione semplificata dell'app per debug
console.log('🚀 Caricamento app semplificata...');

// Stato globale minimo
const appData = {
    ambiti: [],
    loading: false
};

// Caricamento dati
async function loadData() {
    console.log('📡 Caricamento dati...');
    
    try {
        appData.loading = true;
        updateLoadingState();
        
        const response = await fetch('/data.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        appData.ambiti = data.ambiti_territoriali || [];
        
        console.log(`✅ Caricati ${appData.ambiti.length} ambiti`);
        
        updateStats();
        updateTable();
        
    } catch (error) {
        console.error('❌ Errore caricamento:', error);
        showError(error.message);
    } finally {
        appData.loading = false;
        updateLoadingState();
    }
}

// Aggiorna statistiche
function updateStats() {
    const elements = {
        'total-ambiti': appData.ambiti.length,
        'total-comuni': new Set(appData.ambiti.flatMap(a => a.comuniCompetenza || [])).size,
        'total-enti': appData.ambiti.length,
        'filtered-count': appData.ambiti.length
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
            console.log(`📊 ${id}: ${value}`);
        } else {
            console.warn(`⚠️ Elemento ${id} non trovato`);
        }
    });
}

// Aggiorna tabella
function updateTable() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) {
        console.error('❌ table-body non trovato');
        return;
    }
    
    if (appData.ambiti.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">Nessun dato disponibile</td></tr>';
        return;
    }
    
    const rows = appData.ambiti.slice(0, 20).map(ambito => `
        <tr>
            <td>${ambito.regione || 'N/A'}</td>
            <td>${ambito.dettaglioEnte?.ente || 'N/A'}</td>
            <td>${ambito.dettaglioEnte?.comuneCapofila || 'N/A'}</td>
            <td>${ambito.nominativoAmbito || 'N/A'}</td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = rows;
    console.log('✅ Tabella aggiornata con', appData.ambiti.length, 'righe');
}

// Aggiorna stato loading
function updateLoadingState() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = appData.loading ? 'flex' : 'none';
    }
}

// Mostra errore
function showError(message) {
    const tableBody = document.getElementById('table-body');
    if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="4" style="color: red;">Errore: ${message}</td></tr>`;
    }
}

// Inizializzazione quando DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM pronto, inizializzo app...');
    loadData();
});

// Export per compatibilità
window.simpleApp = { loadData, updateStats, updateTable };