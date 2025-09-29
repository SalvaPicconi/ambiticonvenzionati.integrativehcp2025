// Logica principale per Ambiti Territoriali Dashboard

// Stato globale dell'applicazione
window.appState = {
    data: [],
    filteredData: [],
    sortConfig: { key: null, direction: 'asc' },
    filters: { regione: '', provincia: '', ente: '' },
    expandedRows: new Set(),
    isLoading: false
};

// === INIZIALIZZAZIONE ===

function initializeApp() {
    console.log('🚀 Inizializzazione applicazione...');
    
    // Inizializza event listeners
    initializeEventListeners();
    
    // Carica dati iniziali
    loadInitialData();
    
    // Inizializza tema
    initializeTheme();
    
    console.log('✅ Applicazione inizializzata');
}

function initializeEventListeners() {
    console.log('🔧 Inizializzazione event listeners...');
    
    // Filtri con controllo esistenza
    const regioneFilter = document.getElementById('regione-filter');
    const provinciaFilter = document.getElementById('provincia-filter');
    const enteFilter = document.getElementById('ente-filter');
    const comuneFilter = document.getElementById('comune-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    console.log('🔍 Elementi trovati:', {
        regioneFilter: !!regioneFilter,
        provinciaFilter: !!provinciaFilter,
        enteFilter: !!enteFilter,
        comuneFilter: !!comuneFilter,
        clearFiltersBtn: !!clearFiltersBtn
    });
    
    if (regioneFilter) {
        regioneFilter.addEventListener('change', handleFilterChange);
    } else {
        console.warn('⚠️ regione-filter non trovato');
    }
    
    if (provinciaFilter) {
        provinciaFilter.addEventListener('change', handleFilterChange);
    }
    
    if (enteFilter) {
        enteFilter.addEventListener('input', Utils.debounce(handleFilterChange, 300));
    }
    if (comuneFilter) {
        comuneFilter.addEventListener('change', handleFilterChange);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Ordinamento tabella
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', handleSort);
    });
    
    // Controlli tabella
    const expandAllBtn = document.getElementById('expand-all');
    const collapseAllBtn = document.getElementById('collapse-all');
    
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => expandCollapseAll(true));
    }
    
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => expandCollapseAll(false));
    }
    
    // Pulsanti azioni rapide
    const analyticsBtn = document.getElementById('analytics-btn');
    const chartsBtn = document.getElementById('charts-btn');
    const testBtn = document.getElementById('test-btn');
    
    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', toggleAnalytics);
    }
    
    if (chartsBtn) {
        chartsBtn.addEventListener('click', toggleCharts);
    }
    
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            showNotification('Test suite non ancora implementata', 'info');
        });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // File input
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

function initializeTheme() {
    // Imposta tema iniziale
    const savedTheme = Utils.storage.get('theme', CONFIG.ui.theme);
    applyTheme(savedTheme);
}

// === CARICAMENTO DATI ===

async function loadInitialData() {
    const dataSource = ConfigUtils.get('data.jsonFile', 'data.json');
    
    try {
        setLoading(true);
        
    // Evita cache (specie su Safari/iOS) aggiungendo cache-busting e disabilitando cache
    const cacheBust = `${dataSource}${dataSource.includes('?') ? '&' : '?'}v=${(CONFIG?.app?.version || '1.0.0')}-${Date.now()}`;
    const response = await fetch(cacheBust, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        
        // Gestisce la nuova struttura con ambiti_territoriali
        let data = jsonData.ambiti_territoriali || jsonData.data || jsonData;
        
        if (!Array.isArray(data)) {
            data = [data];
        }
        
        console.log(`📊 Caricati ${data.length} ambiti territoriali dalla nuova struttura`);
        setAppData(data);
        showNotification(`Caricati ${data.length} ambiti territoriali`, 'success');
        
    } catch (error) {
        console.warn('Impossibile caricare dati da file:', error);
        
        // Fallback a dati di esempio
        const exampleData = generateExampleData();
        setAppData(exampleData);
        showNotification('Caricati dati di esempio', 'warning');
    } finally {
        setLoading(false);
    }
}

function loadExampleData() {
    const exampleData = generateExampleData();
    setAppData(exampleData);
    showNotification(`Caricati ${exampleData.length} record di esempio`, 'success');
}

function setAppData(data) {
    // Aggiorna stato
    appState.data = data;
    appState.filteredData = [...data];
    
    // Aggiorna UI
    updateFilterOptions();
    renderTable();
    updateSummaryStats();
    
    // Nascondi loading
    setLoading(false);
}

function generateExampleData() {
    return [
        {
            regione: "PIEMONTE",
            provincia: "TO",
            numeroComuni: 38,
            entiUnici: 2,
            ambitiUnici: 2,
            entiDistinti: ["COMUNE DI TORINO", "CONSORZIO INTERCOMUNALE"],
            comuniDistinti: ["TORINO", "MONCALIERI", "COLLEGNO", "RIVOLI"],
            dettagliEnti: [
                {
                    ente: "COMUNE DI TORINO",
                    indirizzo: "Piazza Palazzo di Città 1",
                    comuneAmbito: "TORINO",
                    cap: "10122",
                    codice: "L219"
                }
            ]
        },
        {
            regione: "LOMBARDIA",
            provincia: "MI",
            numeroComuni: 134,
            entiUnici: 8,
            ambitiUnici: 12,
            entiDistinti: ["COMUNE DI MILANO", "CITTÀ METROPOLITANA"],
            comuniDistinti: ["MILANO", "MONZA", "BERGAMO", "BRESCIA"],
            dettagliEnti: [
                {
                    ente: "COMUNE DI MILANO",
                    indirizzo: "Piazza della Scala 2",
                    comuneAmbito: "MILANO",
                    cap: "20121",
                    codice: "F205"
                }
            ]
        },
        {
            regione: "LAZIO",
            provincia: "RM",
            numeroComuni: 121,
            entiUnici: 5,
            ambitiUnici: 8,
            entiDistinti: ["ROMA CAPITALE", "CITTÀ METROPOLITANA DI ROMA"],
            comuniDistinti: ["ROMA", "FIUMICINO", "TIVOLI", "FRASCATI"],
            dettagliEnti: [
                {
                    ente: "ROMA CAPITALE",
                    indirizzo: "Piazza del Campidoglio 1",
                    comuneAmbito: "ROMA",
                    cap: "00186",
                    codice: "H501"
                }
            ]
        },
        {
            regione: "VENETO",
            provincia: "VE",
            numeroComuni: 44,
            entiUnici: 3,
            ambitiUnici: 4,
            entiDistinti: ["COMUNE DI VENEZIA", "UNIONE VENEZIANA"],
            comuniDistinti: ["VENEZIA", "MESTRE", "CHIOGGIA", "MIRA"],
            dettagliEnti: [
                {
                    ente: "COMUNE DI VENEZIA",
                    indirizzo: "Ca' Farsetti",
                    comuneAmbito: "VENEZIA",
                    cap: "30124",
                    codice: "L736"
                }
            ]
        },
        {
            regione: "EMILIA-ROMAGNA",
            provincia: "BO",
            numeroComuni: 60,
            entiUnici: 4,
            ambitiUnici: 6,
            entiDistinti: ["COMUNE DI BOLOGNA", "CITTÀ METROPOLITANA BOLOGNA"],
            comuniDistinti: ["BOLOGNA", "IMOLA", "CASALECCHIO", "FAENZA"],
            dettagliEnti: [
                {
                    ente: "COMUNE DI BOLOGNA",
                    indirizzo: "Piazza Maggiore 6",
                    comuneAmbito: "BOLOGNA",
                    cap: "40124",
                    codice: "A944"
                }
            ]
        }
    ];
}

// === GESTIONE FILTRI ===

function handleFilterChange() {
    const regioneFilter = document.getElementById('regione-filter');
    const provinciaFilter = document.getElementById('provincia-filter');
    const enteFilter = document.getElementById('ente-filter');
    const comuneFilter = document.getElementById('comune-filter');
    
    const filters = {
        regione: regioneFilter?.value || '',
        provincia: provinciaFilter?.value || '',
        ente: enteFilter?.value || '',
        comune: comuneFilter?.value || ''
    };
    
    appState.filters = filters;
    applyFilters();
}

function applyFilters() {
    console.log('🔍 ApplyFilters chiamato:', appState.filters);
    let filtered = [...appState.data];
    
    // Applica filtri
    if (appState.filters.regione) {
        filtered = filtered.filter(item => 
            item.regione && item.regione.toLowerCase().includes(appState.filters.regione.toLowerCase())
        );
    }
    
    if (appState.filters.provincia) {
        filtered = filtered.filter(item => {
            const provincia1 = item.provincia || '';
            const provincia2 = item.dettaglioEnte?.provincia || '';
            return provincia1.toLowerCase().includes(appState.filters.provincia.toLowerCase()) ||
                   provincia2.toLowerCase().includes(appState.filters.provincia.toLowerCase());
        });
    }
    
    if (appState.filters.ente) {
        filtered = filtered.filter(item => {
            // Cerca nel nominativo ambito (ente gestore)
            const nomeEnte = item.dettaglioEnte?.ente || '';
            // Cerca anche nel comune capofila
            const capofila = item.dettaglioEnte?.comuneCapofila || '';
            const searchStr = (nomeEnte + ' ' + capofila).toLowerCase();
            return searchStr.includes(appState.filters.ente.toLowerCase());
        });
    }
    
    if (appState.filters.comune) {
        filtered = filtered.filter(item => {
            // Cerca nei comuni di competenza
            const comuniCompetenza = (item.comuniCompetenza || []).map(c => (c || '').toLowerCase());
            // Cerca anche nel comune capofila
            const capofila = (item.dettaglioEnte?.comuneCapofila || '').toLowerCase();
            const allComuni = [...comuniCompetenza, capofila];
            return allComuni.some(c => c.includes(appState.filters.comune.toLowerCase()));
        });
    }
    
    appState.filteredData = filtered;
    console.log('📊 Risultati filtro:', filtered.length, 'di', appState.data.length);
    
    // Aggiorna UI
    renderTable();
    updateSummaryStats();
}

function clearFilters() {
    const regioneFilter = document.getElementById('regione-filter');
    const provinciaFilter = document.getElementById('provincia-filter');
    const enteFilter = document.getElementById('ente-filter');
    const comuneFilter = document.getElementById('comune-filter');
    
    if (regioneFilter) regioneFilter.value = '';
    if (provinciaFilter) provinciaFilter.value = '';
    if (enteFilter) enteFilter.value = '';
    if (comuneFilter) comuneFilter.value = '';
    
    appState.filters = { regione: '', provincia: '', ente: '', comune: '' };
    appState.filteredData = [...appState.data];
    
    renderTable();
    updateSummaryStats();
    
    showNotification('Filtri rimossi', 'info');
}

function updateFilterOptions() {
    const regioneFilter = document.getElementById('regione-filter');
    const provinciaFilter = document.getElementById('provincia-filter');
    const comuneFilter = document.getElementById('comune-filter');

    // Ottieni valori unici dalla nuova struttura
    const regioni = [...new Set(appState.data.map(item => item.regione).filter(Boolean))].sort();

    // Le province possono essere sia a livello root che in dettaglioEnte
    const provinceSet = new Set();
    appState.data.forEach(item => {
        if (item.provincia) provinceSet.add(String(item.provincia).trim());
        if (item.dettaglioEnte?.provincia) provinceSet.add(String(item.dettaglioEnte.provincia).trim());
    });
    const province = [...provinceSet].filter(Boolean).sort();

    // Raccogli tutti i comuni (competenza + capofila)
    const comuniSet = new Set();
    appState.data.forEach(item => {
        // Comuni di competenza
        if (Array.isArray(item.comuniCompetenza)) {
            item.comuniCompetenza.forEach(comune => {
                if (comune && String(comune).trim()) {
                    comuniSet.add(String(comune).trim());
                }
            });
        }
        // Comune capofila
        const capofila = item.dettaglioEnte?.comuneCapofila;
        if (capofila && String(capofila).trim()) {
            comuniSet.add(String(capofila).trim());
        }
    });
    const comuni = [...comuniSet].sort();

    // Log diagnostico leggero
    try { console.debug('[Filters] regioni:', regioni.length, 'province:', province.length, 'comuni:', comuni.length); } catch {}

    // Aggiorna opzioni regioni (se presente)
    if (regioneFilter) {
        const currentRegione = regioneFilter.value;
        regioneFilter.innerHTML = '<option value="">Tutte le regioni</option>';
        regioni.forEach(regione => {
            const option = document.createElement('option');
            option.value = regione;
            option.textContent = regione;
            if (regione === currentRegione) option.selected = true;
            regioneFilter.appendChild(option);
        });
    }

    // Aggiorna opzioni province (se presente)
    if (provinciaFilter) {
        const currentProvincia = provinciaFilter.value;
        provinciaFilter.innerHTML = '<option value="">Tutte le province</option>';
        province.forEach(provincia => {
            const option = document.createElement('option');
            option.value = provincia;
            option.textContent = provincia;
            if (provincia === currentProvincia) option.selected = true;
            provinciaFilter.appendChild(option);
        });
    }

    // Aggiorna opzioni comuni (se presente)
    if (comuneFilter) {
        const currentComune = comuneFilter.value;
        comuneFilter.innerHTML = '<option value="">Tutti i comuni</option>';
        comuni.forEach(comune => {
            const option = document.createElement('option');
            option.value = comune;
            option.textContent = comune;
            if (comune === currentComune) option.selected = true;
            comuneFilter.appendChild(option);
        });
    }
}

// === ORDINAMENTO ===

function handleSort(event) {
    const th = event.currentTarget;
    const column = th.dataset.column;
    
    if (!column) return;
    
    // Determina direzione
    let direction = 'asc';
    if (appState.sortConfig.key === column && appState.sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    
    appState.sortConfig = { key: column, direction };
    
    // Applica ordinamento con logica personalizzata per campi annidati
    appState.filteredData = Utils.sortBy(appState.filteredData, (item) => {
        switch (column) {
            case 'regione':
                return item.regione || '';
            case 'ente':
                return item.dettaglioEnte?.ente || '';
            case 'comuneCapofila':
                return item.dettaglioEnte?.comuneCapofila || '';
            case 'nominativoAmbito':
                return item.nominativoAmbito || '';
            default:
                return item[column] || '';
        }
    }, direction);
    
    // Aggiorna UI
    updateSortUI();
    renderTable();
}

function updateSortUI() {
    // Reset tutte le icone
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Imposta icona corrente
    if (appState.sortConfig.key) {
        const th = document.querySelector(`th[data-column="${appState.sortConfig.key}"]`);
        if (th) {
            th.classList.add(`sort-${appState.sortConfig.direction}`);
        }
    }
}

// === RENDERING TABELLA ===

function renderTable() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;
    
    // Mostra loading se necessario
    if (appState.isLoading) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="loading-spinner" style="margin: 20px auto;"></div>
                    <p>Caricamento in corso...</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Controlla se ci sono dati
    if (appState.filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 40px;">
                    <div style="color: var(--color-text-secondary); line-height: 1.6;">
                        ${appState.data.length === 0 ? 
                            '<p style="margin-bottom: 10px;"><strong>📋 Esplora gli Ambiti Territoriali</strong></p><p>Utilizza i filtri sopra per cercare per regione, provincia, comune o ente gestore.<br>Clicca sulle righe per vedere i dettagli completi!</p>' : 
                            '<p>Nessun risultato con i filtri applicati</p><p>Prova a modificare i criteri di ricerca</p>'
                        }
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Genera righe
    const rows = appState.filteredData.map((item, index) => {
        const isExpanded = appState.expandedRows.has(index);
        const nomeEnte = item.dettaglioEnte?.ente || 'N/A';
        const comuneCapofila = item.dettaglioEnte?.comuneCapofila || 'N/A';
        const nominativoAmbito = item.nominativoAmbito || 'N/A';
        
        return `
            <tr class="data-row" data-index="${index}">
                <td>${Utils.sanitize(item.regione || '')}</td>
                <td title="${Utils.sanitize(nomeEnte)}">${Utils.truncate(nomeEnte, 35)}</td>
                <td title="${Utils.sanitize(comuneCapofila)}">${Utils.truncate(comuneCapofila, 30)}</td>
                <td title="${Utils.sanitize(nominativoAmbito)}">${Utils.truncate(nominativoAmbito, 40)}</td>
                <td>
                    <button class="expand-btn ${isExpanded ? 'expanded' : ''}" 
                            onclick="toggleRowExpansion(${index})"
                            aria-label="Espandi dettagli">
                        ▼
                    </button>
                </td>
            </tr>
            ${isExpanded ? renderDetailsRow(item, index) : ''}
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
}

function renderDetailsRow(item, index) {
    const dettaglioEnte = item.dettaglioEnte || {};
    const comuniCompetenza = item.comuniCompetenza || [];
    const dettagliComuni = item.dettagliComuni || [];
    
    return `
        <tr class="details-row" data-index="${index}">
            <td colspan="5">
                <div class="details-content">
                    <div class="details-grid">
                        <div class="detail-section">
                            <h4>📋 Ente Gestore</h4>
                            <div class="entity-details">
                                <strong>${Utils.sanitize(dettaglioEnte.ente || 'N/A')}</strong><br>
                                ${dettaglioEnte.indirizzo ? `📍 ${Utils.sanitize(dettaglioEnte.indirizzo)}<br>` : ''}
                                ${dettaglioEnte.comuneCapofila ? `🏛️ Comune Capofila: ${Utils.sanitize(dettaglioEnte.comuneCapofila)}<br>` : ''}
                                ${dettaglioEnte.provincia ? `📍 Provincia: ${Utils.sanitize(dettaglioEnte.provincia)}` : ''}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>🏘️ Comuni di Competenza (${comuniCompetenza.length})</h4>
                            <ul class="detail-list">
                                ${comuniCompetenza.slice(0, 15).map(comune => 
                                    `<li>${Utils.sanitize(comune)}</li>`
                                ).join('')}
                                ${comuniCompetenza.length > 15 ? 
                                    `<li><em>... e altri ${comuniCompetenza.length - 15} comuni</em></li>` : 
                                    ''
                                }
                            </ul>
                        </div>
                        
                        ${dettagliComuni.length > 0 ? `
                            <div class="detail-section" style="grid-column: 1 / -1;">
                                <h4>📊 Dettagli Comuni</h4>
                                <div style="max-height: 200px; overflow-y: auto;">
                                    ${dettagliComuni.slice(0, 10).map(comune => `
                                        <div class="entity-details" style="margin-bottom: 8px; padding: 8px; background: var(--color-bg-secondary); border-radius: 4px;">
                                            <strong>${Utils.sanitize(comune.comune || '')}</strong>
                                            ${comune.cap ? ` • � ${Utils.sanitize(comune.cap)}` : ''}
                                            ${comune.codice ? ` • � ${Utils.sanitize(comune.codice)}` : ''}
                                        </div>
                                    `).join('')}
                                    ${dettagliComuni.length > 10 ? `<p><em>... e altri ${dettagliComuni.length - 10} comuni con dettagli</em></p>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </td>
        </tr>
    `;
}

// === ESPANSIONE RIGHE ===

function toggleRowExpansion(index) {
    if (appState.expandedRows.has(index)) {
        appState.expandedRows.delete(index);
    } else {
        appState.expandedRows.add(index);
    }
    
    renderTable();
}

function expandCollapseAll(expand) {
    if (expand) {
        appState.filteredData.forEach((_, index) => {
            appState.expandedRows.add(index);
        });
    } else {
        appState.expandedRows.clear();
    }
    
    renderTable();
    
    showNotification(`Tutte le righe ${expand ? 'espanse' : 'compresse'}`, 'info');
}

// === STATISTICHE ===

function updateSummaryStats() {
    const totalAmbiti = document.getElementById('total-ambiti');
    const totalComuni = document.getElementById('total-comuni');
    const totalEnti = document.getElementById('total-enti');
    const filteredCount = document.getElementById('filtered-count');
    
    if (!totalAmbiti || !totalComuni || !totalEnti || !filteredCount) return;
    
    const data = appState.filteredData;
    
    // Calcola statistiche CORRETTE
    const ambitiCount = data.length; // Numero di ambiti territoriali (228)
    
    // Conta comuni unici di competenza 
    const comuniUnici = new Set();
    data.forEach(item => {
        if (item.comuniCompetenza) {
            item.comuniCompetenza.forEach(comune => comuniUnici.add(comune));
        }
    });
    
    // Conta nominativi ambito unici (per evitare duplicati negli enti)
    const nominativiUnici = new Set();
    data.forEach(item => {
        if (item.dettaglioEnte && item.dettaglioEnte.ente) {
            nominativiUnici.add(item.dettaglioEnte.ente);
        }
    });
    
    // Aggiorna UI
    totalAmbiti.textContent = Utils.formatNumber(ambitiCount);
    totalComuni.textContent = Utils.formatNumber(comuniUnici.size);
    totalEnti.textContent = Utils.formatNumber(nominativiUnici.size);
    filteredCount.textContent = Utils.formatNumber(ambitiCount);
}

// === EXPORT FUNZIONI ===

function exportToCSV(detailed = false) {
    try {
        let data = appState.filteredData;
        let filename = `ambiti_territoriali_${detailed ? 'dettagliato' : 'aggregato'}`;
        
        if (detailed) {
            // Export dettagliato con tutti i dati
            data = data.flatMap(item => {
                const base = {
                    regione: item.regione,
                    provincia: item.provincia,
                    numeroComuni: item.numeroComuni,
                    entiUnici: item.entiUnici,
                    ambitiUnici: item.ambitiUnici
                };
                
                if (item.dettagliEnti && item.dettagliEnti.length > 0) {
                    return item.dettagliEnti.map(ente => ({
                        ...base,
                        ente: ente.ente,
                        indirizzo: ente.indirizzo,
                        cap: ente.cap,
                        codice: ente.codice
                    }));
                }
                
                return [base];
            });
        }
        
        if (ConfigUtils.get('export.includeTimestamp', true)) {
            filename += `_${Utils.getDateForFilename()}`;
        }
        
        const csv = Utils.arrayToCSV(data);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
        
        showNotification(`Export CSV ${detailed ? 'dettagliato' : 'aggregato'} completato`, 'success');
        
        return csv;
    } catch (error) {
        console.error('Errore export CSV:', error);
        showNotification('Errore durante l\'export CSV', 'error');
    }
}

function exportToJSON() {
    try {
        const data = {
            metadata: {
                title: 'Ambiti Territoriali',
                exportDate: Utils.getCurrentTimestamp(),
                recordCount: appState.filteredData.length,
                filters: appState.filters,
                version: ConfigUtils.get('app.version', '1.0.0')
            },
            ambiti_territoriali: appState.filteredData
        };
        
        let filename = 'ambiti_territoriali';
        if (ConfigUtils.get('export.includeTimestamp', true)) {
            filename += `_${Utils.getDateForFilename()}`;
        }
        
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, `${filename}.json`, 'application/json');
        
        showNotification('Export JSON completato', 'success');
        
        return json;
    } catch (error) {
        console.error('Errore export JSON:', error);
        showNotification('Errore durante l\'export JSON', 'error');
    }
}

function exportToExcel() {
    showNotification('Export Excel non ancora implementato', 'warning');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// === VISUALIZZAZIONI ===

function toggleCharts() {
    const chartsSection = document.getElementById('charts-section');
    const chartsContainer = document.getElementById('charts-container');
    
    if (!chartsSection || !chartsContainer) return;
    
    const isVisible = chartsSection.style.display !== 'none';
    
    if (isVisible) {
        chartsSection.style.display = 'none';
        return;
    }
    
    chartsSection.style.display = 'block';
    
    // Genera grafici reali basati sui dati
    generateCharts(chartsContainer);
}

function generateCharts(container) {
    if (!window.appState.filteredData || window.appState.filteredData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--color-text-secondary);">
                <h3>📊 Nessun dato disponibile</h3>
                <p>Carica i dati per visualizzare i grafici</p>
            </div>
        `;
        return;
    }

    const data = window.appState.filteredData;
    
    // Analisi dati per grafici
    const regioniStats = {};
    const provinceStats = {};
    const entiStats = {};
    
    data.forEach(item => {
        // Conteggio per regione
        if (item.regione) {
            regioniStats[item.regione] = (regioniStats[item.regione] || 0) + 1;
        }
        
        // Conteggio per provincia
        if (item.provincia) {
            provinceStats[item.provincia] = (provinceStats[item.provincia] || 0) + 1;
        }
        
        // Conteggio per enti gestori (compatibile con struttura dati corrente)
        if (Array.isArray(item.dettagliEnti)) {
            item.dettagliEnti.forEach(d => {
                if (d && d.ente) {
                    entiStats[d.ente] = (entiStats[d.ente] || 0) + 1;
                }
            });
        } else if (Array.isArray(item.entiDistinti)) {
            item.entiDistinti.forEach(nome => {
                if (nome) {
                    entiStats[nome] = (entiStats[nome] || 0) + 1;
                }
            });
        }
    });
    
    const maxReg = Math.max(0, ...Object.values(regioniStats));
    const maxProv = Math.max(0, ...Object.values(provinceStats));
    const maxEnti = Math.max(0, ...Object.values(entiStats));
    
    container.innerHTML = `
        <div class="charts-grid">
            <div class="chart-card">
                <h3>📍 Distribuzione per Regione</h3>
                <div class="chart-content">
                    ${Object.entries(regioniStats)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([regione, count]) => `
                            <div class="chart-bar">
                                <span class="chart-label">${regione}</span>
                                <div class="chart-bar-container">
                                    <div class="chart-bar-fill" style="width: ${maxReg ? (count / maxReg) * 100 : 0}%"></div>
                                    <span class="chart-value">${count}</span>
                                </div>
                            </div>
                        `).join('')}
                </div>
            </div>
            
            <div class="chart-card">
                <h3>🏛️ Top Province per Numero Ambiti</h3>
                <div class="chart-content">
                    ${Object.entries(provinceStats)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([provincia, count]) => `
                            <div class="chart-bar">
                                <span class="chart-label">${provincia}</span>
                                <div class="chart-bar-container">
                                    <div class="chart-bar-fill" style="width: ${maxProv ? (count / maxProv) * 100 : 0}%"></div>
                                    <span class="chart-value">${count}</span>
                                </div>
                            </div>
                        `).join('')}
                </div>
            </div>
            
            <div class="chart-card">
                <h3>🏢 Principali Enti Gestori</h3>
                <div class="chart-content">
                    ${Object.entries(entiStats)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([ente, count]) => `
                            <div class="chart-bar">
                                <span class="chart-label">${ente.length > 30 ? ente.substring(0, 30) + '...' : ente}</span>
                                <div class="chart-bar-container">
                                    <div class="chart-bar-fill" style="width: ${maxEnti ? (count / maxEnti) * 100 : 0}%"></div>
                                    <span class="chart-value">${count}</span>
                                </div>
                            </div>
                        `).join('')}
                </div>
            </div>
            
            <div class="chart-card">
                <h3>📊 Statistiche Generali</h3>
                <div class="stats-summary">
                    <div class="stat-item">
                        <span class="stat-number">${Object.keys(regioniStats).length}</span>
                        <span class="stat-text">Regioni Coinvolte</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${Object.keys(provinceStats).length}</span>
                        <span class="stat-text">Province</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${Object.keys(entiStats).length}</span>
                        <span class="stat-text">Enti Gestori Unici</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${data.length}</span>
                        <span class="stat-text">Ambiti Totali</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function toggleAnalytics() {
    const analyticsSection = document.getElementById('analytics-section');
    const analyticsContainer = document.getElementById('analytics-container');
    
    if (!analyticsSection || !analyticsContainer) return;
    
    const isVisible = analyticsSection.style.display !== 'none';
    
    if (isVisible) {
        analyticsSection.style.display = 'none';
        return;
    }
    
    analyticsSection.style.display = 'block';
    
    try {
        const data = appState.filteredData;
        const totalComuni = data.reduce((sum, item) => sum + (item.numeroComuni || 0), 0);
        const totalEnti = data.reduce((sum, item) => sum + (item.entiUnici || 0), 0);
        const avgComuni = data.length > 0 ? totalComuni / data.length : 0;
        const avgEnti = data.length > 0 ? totalEnti / data.length : 0;
        
        analyticsContainer.innerHTML = `
            <div style="padding: 20px;">
                <h3>Statistiche Avanzate</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                    <div class="stat-card">
                        <strong>Media Comuni per Ambito</strong><br>
                        ${Utils.formatNumber(avgComuni, 1)}
                    </div>
                    <div class="stat-card">
                        <strong>Media Enti per Ambito</strong><br>
                        ${Utils.formatNumber(avgEnti, 1)}
                    </div>
                    <div class="stat-card">
                        <strong>Regioni Coinvolte</strong><br>
                        ${Utils.unique(data, 'regione').length}
                    </div>
                    <div class="stat-card">
                        <strong>Province Coinvolte</strong><br>
                        ${Utils.unique(data, 'provincia').length}
                    </div>
                </div>
            </div>
        `;
        
        showNotification('Analitiche generate', 'success');
    } catch (error) {
        console.error('Errore generazione analitiche:', error);
        analyticsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--color-error);">
                <h3>Errore generazione analitiche</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// === TEMA ===

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    Utils.storage.set('theme', newTheme);
    
    showNotification(`Tema cambiato: ${newTheme}`, 'info');
}

function applyTheme(theme) {
    if (theme === 'auto') {
        // Usa preferenze sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    
    // Aggiorna icona tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// === UPLOAD FILE ===

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let data;
            
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                data = JSON.parse(e.target.result);
                if (data.ambiti_territoriali) data = data.ambiti_territoriali;
                if (!Array.isArray(data)) data = [data];
            } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                // Parsing CSV semplice
                const lines = e.target.result.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                data = lines.slice(1).filter(line => line.trim()).map(line => {
                    const values = line.split(',');
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index] ? values[index].trim() : '';
                    });
                    return obj;
                });
            } else {
                throw new Error('Formato file non supportato');
            }
            
            setAppData(data);
            showNotification(`File caricato: ${data.length} record`, 'success');
            
        } catch (error) {
            console.error('Errore caricamento file:', error);
            showNotification('Errore durante il caricamento del file', 'error');
        }
    };
    
    reader.readAsText(file);
}

// === NOTIFICHE ===

function showNotification(message, type = 'info') {
    // Sistema notifiche semplice
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#2563eb'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 300px;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// === GESTIONE STATO ===

function setLoading(loading) {
    appState.isLoading = loading;
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        if (loading) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
}

// === INIZIALIZZAZIONE AUTOMATICA ===

// Inizializza quando DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export funzioni globali
window.initializeApp = initializeApp;
window.toggleRowExpansion = toggleRowExpansion;
window.expandCollapseAll = expandCollapseAll;
window.loadExampleData = loadExampleData;
window.exportToCSV = exportToCSV;
window.exportToJSON = exportToJSON;
window.exportToExcel = exportToExcel;
window.toggleCharts = toggleCharts;
window.toggleAnalytics = toggleAnalytics;

// Inizializzazione automatica quando DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM pronto, inizializzo app principale...');
    try {
        initializeApp();
        console.log('✅ App inizializzata con successo');
    } catch (error) {
        console.error('❌ Errore nell\'inizializzazione:', error);
    }
});