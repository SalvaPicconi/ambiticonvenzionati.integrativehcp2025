// Script di verifica per controllare se tutti i dati del JSON sono reperibili nel sito

class DataVerifier {
    constructor() {
        this.jsonData = null;
        this.domData = null;
        this.verificationResults = {
            summary: {},
            detailed: [],
            missing: [],
            errors: []
        };
    }

    async initialize() {
        try {
            // Carica i dati dal file JSON
            await this.loadJsonData();
            
            // Estrae i dati dal DOM
            this.extractDomData();
            
            console.log('✅ Inizializzazione completata');
            return true;
        } catch (error) {
            console.error('❌ Errore durante l\'inizializzazione:', error);
            return false;
        }
    }

    async loadJsonData() {
        try {
            const response = await fetch(`./data.json?v=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.jsonData = data.ambiti_territoriali || data.data || data;
            
            console.log('📄 Dati JSON caricati:', this.jsonData.length, 'record');
        } catch (error) {
            throw new Error(`Impossibile caricare data.json: ${error.message}`);
        }
    }

    extractDomData() {
        this.domData = {
            tableRows: this.extractTableData(),
            filterOptions: this.extractFilterOptions(),
            summaryStats: this.extractSummaryStats()
        };
        
        console.log('🔍 Dati DOM estratti');
    }

    extractTableData() {
        const rows = [];
        const tableRows = document.querySelectorAll('#data-table tbody tr:not(.detail-row)');
        
        tableRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 6) {
                rows.push({
                    regione: cells[0]?.textContent?.trim(),
                    provincia: cells[1]?.textContent?.trim(),
                    numeroComuni: parseInt(cells[2]?.textContent?.trim()) || 0,
                    entiUnici: parseInt(cells[3]?.textContent?.trim()) || 0,
                    ambitiUnici: parseInt(cells[4]?.textContent?.trim()) || 0,
                    azioni: cells[5]?.innerHTML || ''
                });
            }
        });
        
        return rows;
    }

    extractFilterOptions() {
        const regioneSelect = document.getElementById('regione-filter');
        const provinciaSelect = document.getElementById('provincia-filter');
        
        return {
            regioni: Array.from(regioneSelect?.options || [])
                .map(opt => opt.value)
                .filter(val => val !== ''),
            province: Array.from(provinciaSelect?.options || [])
                .map(opt => opt.value)
                .filter(val => val !== '')
        };
    }

    extractSummaryStats() {
        return {
            totalRecords: document.querySelector('.stat-card:nth-child(1) .stat-value')?.textContent?.trim(),
            totalComuni: document.querySelector('.stat-card:nth-child(2) .stat-value')?.textContent?.trim(),
            totalEnti: document.querySelector('.stat-card:nth-child(3) .stat-value')?.textContent?.trim(),
            totalAmbiti: document.querySelector('.stat-card:nth-child(4) .stat-value')?.textContent?.trim()
        };
    }

    // Verifica principale
    async verify() {
        if (!await this.initialize()) {
            return this.verificationResults;
        }

        console.log('🔍 Iniziando verifica dati...');

        // Verifica di base
        this.verifyBasicData();
        
        // Verifica dettagliata
        this.verifyDetailedData();
        
        // Verifica filtri
        this.verifyFilters();
        
        // Verifica statistiche
        this.verifyStatistics();
        
        // Genera report
        this.generateReport();
        
        return this.verificationResults;
    }

    verifyBasicData() {
        const jsonCount = this.jsonData.length;
        const domCount = this.domData.tableRows.length;
        
        this.verificationResults.summary.totalRecordsJson = jsonCount;
        this.verificationResults.summary.totalRecordsDom = domCount;
        this.verificationResults.summary.basicDataMatch = jsonCount === domCount;
        
        if (jsonCount !== domCount) {
            this.verificationResults.errors.push({
                type: 'COUNT_MISMATCH',
                message: `Numero record non corrisponde: JSON=${jsonCount}, DOM=${domCount}`
            });
        }
    }

    verifyDetailedData() {
        const missingRecords = [];
        const incorrectRecords = [];
        
        this.jsonData.forEach((jsonRecord, index) => {
            const domRecord = this.domData.tableRows[index];
            
            if (!domRecord) {
                missingRecords.push({
                    index,
                    regione: jsonRecord.regione,
                    provincia: jsonRecord.provincia
                });
                return;
            }
            
            // Verifica corrispondenza campi
            const fieldChecks = {
                regione: jsonRecord.regione === domRecord.regione,
                provincia: jsonRecord.provincia === domRecord.provincia,
                numeroComuni: jsonRecord.numeroComuni === domRecord.numeroComuni,
                entiUnici: jsonRecord.entiUnici === domRecord.entiUnici,
                ambitiUnici: jsonRecord.ambitiUnici === domRecord.ambitiUnici
            };
            
            const incorrectFields = Object.entries(fieldChecks)
                .filter(([field, isCorrect]) => !isCorrect)
                .map(([field]) => field);
            
            if (incorrectFields.length > 0) {
                incorrectRecords.push({
                    index,
                    regione: jsonRecord.regione,
                    incorrectFields,
                    jsonData: {
                        regione: jsonRecord.regione,
                        provincia: jsonRecord.provincia,
                        numeroComuni: jsonRecord.numeroComuni,
                        entiUnici: jsonRecord.entiUnici,
                        ambitiUnici: jsonRecord.ambitiUnici
                    },
                    domData: {
                        regione: domRecord.regione,
                        provincia: domRecord.provincia,
                        numeroComuni: domRecord.numeroComuni,
                        entiUnici: domRecord.entiUnici,
                        ambitiUnici: domRecord.ambitiUnici
                    }
                });
            }
        });
        
        this.verificationResults.missing = missingRecords;
        this.verificationResults.detailed = incorrectRecords;
    }

    verifyFilters() {
        const jsonRegioni = [...new Set(this.jsonData.map(item => item.regione))].sort();
        const jsonProvince = [...new Set(this.jsonData.map(item => item.provincia))].sort();
        
        const domRegioni = this.domData.filterOptions.regioni.sort();
        const domProvince = this.domData.filterOptions.province.sort();
        
        const regioniMatch = JSON.stringify(jsonRegioni) === JSON.stringify(domRegioni);
        const provinceMatch = JSON.stringify(jsonProvince) === JSON.stringify(domProvince);
        
        this.verificationResults.summary.filtersMatch = regioniMatch && provinceMatch;
        
        if (!regioniMatch) {
            this.verificationResults.errors.push({
                type: 'FILTER_MISMATCH',
                message: 'Filtro regioni non corrisponde',
                details: {
                    json: jsonRegioni,
                    dom: domRegioni,
                    missing: jsonRegioni.filter(r => !domRegioni.includes(r)),
                    extra: domRegioni.filter(r => !jsonRegioni.includes(r))
                }
            });
        }
        
        if (!provinceMatch) {
            this.verificationResults.errors.push({
                type: 'FILTER_MISMATCH',
                message: 'Filtro province non corrisponde',
                details: {
                    json: jsonProvince,
                    dom: domProvince,
                    missing: jsonProvince.filter(p => !domProvince.includes(p)),
                    extra: domProvince.filter(p => !jsonProvince.includes(p))
                }
            });
        }
    }

    verifyStatistics() {
        const jsonStats = {
            totalRecords: this.jsonData.length,
            totalComuni: this.jsonData.reduce((sum, item) => sum + (item.numeroComuni || 0), 0),
            totalEnti: this.jsonData.reduce((sum, item) => sum + (item.entiUnici || 0), 0),
            totalAmbiti: this.jsonData.reduce((sum, item) => sum + (item.ambitiUnici || 0), 0)
        };
        
        const domStats = {
            totalRecords: parseInt(this.domData.summaryStats.totalRecords) || 0,
            totalComuni: parseInt(this.domData.summaryStats.totalComuni) || 0,
            totalEnti: parseInt(this.domData.summaryStats.totalEnti) || 0,
            totalAmbiti: parseInt(this.domData.summaryStats.totalAmbiti) || 0
        };
        
        const statsMatch = Object.keys(jsonStats).every(key => 
            jsonStats[key] === domStats[key]
        );
        
        this.verificationResults.summary.statisticsMatch = statsMatch;
        this.verificationResults.summary.jsonStats = jsonStats;
        this.verificationResults.summary.domStats = domStats;
        
        if (!statsMatch) {
            this.verificationResults.errors.push({
                type: 'STATS_MISMATCH',
                message: 'Statistiche non corrispondono',
                details: { jsonStats, domStats }
            });
        }
    }

    generateReport() {
        const { summary, detailed, missing, errors } = this.verificationResults;
        
        console.log('\n📊 REPORT VERIFICA DATI');
        console.log('========================');
        
        // Riepilogo generale
        console.log('\n📋 RIEPILOGO:');
        console.log(`• Record JSON: ${summary.totalRecordsJson}`);
        console.log(`• Record DOM: ${summary.totalRecordsDom}`);
        console.log(`• Dati di base: ${summary.basicDataMatch ? '✅' : '❌'}`);
        console.log(`• Filtri: ${summary.filtersMatch ? '✅' : '❌'}`);
        console.log(`• Statistiche: ${summary.statisticsMatch ? '✅' : '❌'}`);
        
        // Errori
        if (errors.length > 0) {
            console.log('\n❌ ERRORI TROVATI:');
            errors.forEach(error => {
                console.log(`• ${error.type}: ${error.message}`);
                if (error.details) {
                    console.log('  Dettagli:', error.details);
                }
            });
        }
        
        // Record mancanti
        if (missing.length > 0) {
            console.log('\n📭 RECORD MANCANTI:');
            missing.forEach(record => {
                console.log(`• ${record.regione} (${record.provincia}) - indice ${record.index}`);
            });
        }
        
        // Record con errori
        if (detailed.length > 0) {
            console.log('\n⚠️ RECORD CON ERRORI:');
            detailed.forEach(record => {
                console.log(`• ${record.regione} - campi errati: ${record.incorrectFields.join(', ')}`);
            });
        }
        
        // Statistiche dettagliate
        if (summary.jsonStats && summary.domStats) {
            console.log('\n📈 STATISTICHE DETTAGLIATE:');
            console.log('JSON:', summary.jsonStats);
            console.log('DOM:', summary.domStats);
        }
        
        const allOk = summary.basicDataMatch && summary.filtersMatch && 
                     summary.statisticsMatch && errors.length === 0;
        
        console.log(`\n${allOk ? '✅ TUTTO OK!' : '❌ VERIFICARE ERRORI'}`);
        
        return allOk;
    }

    // Metodi di utilità per test specifici
    async testSpecificRecord(regione, provincia) {
        if (!await this.initialize()) return false;
        
        const jsonRecord = this.jsonData.find(item => 
            item.regione === regione && item.provincia === provincia
        );
        
        if (!jsonRecord) {
            console.log(`❌ Record non trovato nel JSON: ${regione} (${provincia})`);
            return false;
        }
        
        // Cerca il record nella tabella
        const tableRows = document.querySelectorAll('#data-table tbody tr:not(.detail-row)');
        let found = false;
        
        tableRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const domRegione = cells[0]?.textContent?.trim();
                const domProvincia = cells[1]?.textContent?.trim();
                
                if (domRegione === regione && domProvincia === provincia) {
                    found = true;
                    console.log(`✅ Record trovato nella tabella: ${regione} (${provincia})`);
                }
            }
        });
        
        if (!found) {
            console.log(`❌ Record NON trovato nella tabella: ${regione} (${provincia})`);
        }
        
        return found;
    }

    async testAllRecords() {
        console.log('🔍 Test di tutti i record...');
        
        if (!await this.initialize()) return false;
        
        let allFound = true;
        
        for (const record of this.jsonData) {
            const found = await this.testSpecificRecord(record.regione, record.provincia);
            if (!found) allFound = false;
        }
        
        console.log(allFound ? '✅ Tutti i record trovati!' : '❌ Alcuni record mancanti');
        return allFound;
    }
}

// Funzioni di utilizzo globali
window.DataVerifier = DataVerifier;

// Funzioni di utilizzo rapido
window.verifyData = async function() {
    const verifier = new DataVerifier();
    return await verifier.verify();
};

window.testRecord = async function(regione, provincia) {
    const verifier = new DataVerifier();
    return await verifier.testSpecificRecord(regione, provincia);
};

window.testAllRecords = async function() {
    const verifier = new DataVerifier();
    return await verifier.testAllRecords();
};

// Auto-inizializzazione quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📝 Script di verifica dati caricato. Usa verifyData() per iniziare.');
    });
} else {
    console.log('📝 Script di verifica dati caricato. Usa verifyData() per iniziare.');
}