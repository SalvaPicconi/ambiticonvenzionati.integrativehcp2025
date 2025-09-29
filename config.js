// Configurazione globale per Ambiti Territoriali Dashboard
const CONFIG = {
    // Informazioni applicazione
    app: {
        title: "Ambiti Territoriali - Dashboard",
        version: "1.0.0",
        author: "Dashboard Team",
        description: "Dashboard per l'analisi degli ambiti territoriali italiani",
        language: "it",
        locale: "it-IT"
    },

    // Configurazione dati
    data: {
        jsonFile: "./data.json",
        autoRefresh: false,
        enableCache: false,
        maxRecords: 10000,
        defaultSort: { key: "regione", direction: "asc" }
    },

    // Configurazione UI
    ui: {
        theme: "auto", // auto, light, dark
        compactMode: false,
        enableAnimations: true,
        showTooltips: true,
        responsiveBreakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1280
        }
    },

    // Configurazione funzionalità
    features: {
        analytics: true,
        charts: true,
        export: true,
        notifications: true,
        themes: true,
        validation: true,
        search: true,
        filters: true,
        expandableRows: true,
        sorting: true
    },

    // Configurazione export
    export: {
        formats: {
            csvAggregato: {
                enabled: true,
                filename: "ambiti_territoriali_aggregato",
                includeTimestamp: true
            },
            csvDettagliato: {
                enabled: true,
                filename: "ambiti_territoriali_dettagliato",
                includeTimestamp: true
            },
            excel: {
                enabled: true,
                filename: "ambiti_territoriali",
                includeTimestamp: true
            },
            json: {
                enabled: true,
                filename: "ambiti_territoriali",
                includeTimestamp: true,
                formatted: true
            }
        },
        includeMetadata: true
    },

    // Configurazione validazione
    validation: {
        enabled: true,
        strict: false,
        autoFix: true,
        showWarnings: true,
        requiredFields: [
            "regione",
            "provincia", 
            "numeroComuni",
            "entiUnici"
        ]
    },

    // Configurazione sviluppo
    development: {
        enableDebugMode: false,
        enableConsoleLogging: true,
        showPerformanceMetrics: false,
        enableTestSuite: true
    }
};

// Utility per gestire la configurazione
const ConfigUtils = {
    // Ottieni valore di configurazione con path notation
    get: (path, defaultValue = null) => {
        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : defaultValue;
        }, CONFIG);
    },

    // Imposta valore di configurazione
    set: (path, value) => {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, CONFIG);
        target[lastKey] = value;
    },

    // Verifica se funzionalità è abilitata
    isEnabled: (feature) => {
        return ConfigUtils.get(`features.${feature}`, false);
    },

    // Ottieni configurazione per componente specifico
    getComponent: (component) => {
        return ConfigUtils.get(component, {});
    }
};

// Export per altri moduli
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.ConfigUtils = ConfigUtils;
}

// Auto-applicazione configurazioni da URL
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Modalità debug da URL
    if (urlParams.get('debug') === 'true') {
        CONFIG.development.enableDebugMode = true;
        CONFIG.development.enableConsoleLogging = true;
        CONFIG.development.showPerformanceMetrics = true;
    }

    // Override tema da URL
    if (urlParams.get('theme')) {
        CONFIG.ui.theme = urlParams.get('theme');
    }
    
    // Modalità compatta da URL
    if (urlParams.get('compact') === 'true') {
        CONFIG.ui.compactMode = true;
    }
}