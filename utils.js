// Utilità generali per Ambiti Territoriali Dashboard
const Utils = {
    // === MANIPOLAZIONE DATE ===
    
    // Formatta una data secondo il pattern specificato
    formatDate: (date, pattern = 'DD/MM/YYYY') => {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return pattern
            .replace('YYYY', year)
            .replace('DD', day)
            .replace('MM', month)
            .replace('HH', hours)
            .replace('mm', minutes);
    },
    
    // Ottieni timestamp corrente in formato ISO
    getCurrentTimestamp: () => new Date().toISOString(),
    
    // Ottieni data formattata per filename
    getDateForFilename: () => {
        const now = new Date();
        return Utils.formatDate(now, 'YYYY-MM-DD');
    },

    // === MANIPOLAZIONE STRINGHE ===
    
    // Capitalizza la prima lettera di ogni parola
    capitalizeWords: (str) => {
        if (!str) return '';
        return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    },
    
    // Tronca stringa con ellipsis
    truncate: (str, length = 50, suffix = '...') => {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },
    
    // Rimuovi caratteri speciali per sicurezza
    sanitize: (str) => {
        if (!str) return '';
        return str.replace(/[<>'"&]/g, match => {
            const entityMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '&': '&amp;'
            };
            return entityMap[match];
        });
    },

    // === VALIDAZIONE ===
    
    // Valida email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Valida CAP italiano
    isValidCAP: (cap) => {
        const capRegex = /^\d{5}$/;
        return capRegex.test(cap);
    },

    // === MANIPOLAZIONE ARRAY E OGGETTI ===
    
    // Raggruppa array per proprietà
    groupBy: (array, key) => {
        if (!Array.isArray(array)) return {};
        
        return array.reduce((groups, item) => {
            const group = typeof key === 'function' ? key(item) : item[key];
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
            return groups;
        }, {});
    },
    
    // Ordina array per proprietà
    sortBy: (array, key, direction = 'asc') => {
        if (!Array.isArray(array)) return [];
        
        return [...array].sort((a, b) => {
            let aVal = typeof key === 'function' ? key(a) : a[key];
            let bVal = typeof key === 'function' ? key(b) : b[key];
            
            // Gestione valori null/undefined
            if (aVal == null) aVal = '';
            if (bVal == null) bVal = '';
            
            // Conversione numerica se possibile
            if (!isNaN(aVal) && !isNaN(bVal)) {
                aVal = Number(aVal);
                bVal = Number(bVal);
            }
            
            let result = 0;
            if (aVal < bVal) result = -1;
            if (aVal > bVal) result = 1;
            
            return direction === 'desc' ? -result : result;
        });
    },
    
    // Rimuovi duplicati da array
    unique: (array, key = null) => {
        if (!Array.isArray(array)) return [];
        
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = typeof key === 'function' ? key(item) : item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        }
        
        return [...new Set(array)];
    },
    
    // Filtra array con condizioni multiple
    filterBy: (array, filters) => {
        if (!Array.isArray(array)) return [];
        
        return array.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (value === '' || value == null) return true;
                
                const itemValue = item[key];
                if (itemValue == null) return false;
                
                if (typeof value === 'string') {
                    return String(itemValue).toLowerCase().includes(value.toLowerCase());
                }
                
                return itemValue === value;
            });
        });
    },
    
    // Deep clone di oggetti
    deepClone: (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = Utils.deepClone(obj[key]);
            });
            return copy;
        }
    },

    // === MANIPOLAZIONE NUMERI ===
    
    // Formatta numero con separatori
    formatNumber: (num, decimals = 0, locale = 'it-IT') => {
        if (num == null || isNaN(num)) return '0';
        
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },
    
    // Formatta dimensioni file
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Calcola percentuale
    percentage: (value, total) => {
        if (total === 0) return 0;
        return (value / total) * 100;
    },

    // === STORAGE ===
    
    storage: {
        // LocalStorage con supporto oggetti
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Errore salvataggio localStorage:', error);
                return false;
            }
        },
        
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Errore lettura localStorage:', error);
                return defaultValue;
            }
        },
        
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Errore rimozione localStorage:', error);
                return false;
            }
        }
    },

    // === DEBOUNCE/THROTTLE ===
    
    // Debounce - esegue funzione dopo delay dall'ultima chiamata
    debounce: (func, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    // === DOM UTILITIES ===
    
    // Query selector sicuro
    $: (selector, context = document) => {
        return context.querySelector(selector);
    },
    
    // Query selector all
    $$: (selector, context = document) => {
        return Array.from(context.querySelectorAll(selector));
    },
    
    // Rimuovi tutti i figli di un elemento
    empty: (element) => {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    // === CSV UTILITIES ===
    
    // Converti array di oggetti in CSV
    arrayToCSV: (data, delimiter = ',') => {
        if (!Array.isArray(data) || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvData = [
            headers.join(delimiter),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header] || '';
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(delimiter)
            )
        ];
        
        return csvData.join('\n');
    },

    // === BROWSER DETECTION ===
    
    // Informazioni browser
    getBrowserInfo: () => {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        return {
            name: browser,
            userAgent: ua,
            mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            online: navigator.onLine,
            language: navigator.language
        };
    },

    // === UTILITIES VARIE ===
    
    // Sleep/delay
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // Genera ID unico
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Verifica se stringa è JSON valido
    isValidJSON: (str) => {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    },
    
    // Converti stringa in numero se possibile
    toNumber: (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
        }
        return 0;
    },
    
    // Escape HTML
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // URL-safe string
    urlSafe: (str) => {
        return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
            return '%' + c.charCodeAt(0).toString(16);
        });
    }
};

// Export per Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Global per browser
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}