#!/bin/bash
set -euo pipefail

# Verifica rapida prima del merge su main
# - Controlla che data.json esista e sia JSON valido
# - Esegue alcuni check di struttura minimi
# - Conta ambiti, regioni, e verifica campi chiave

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${YELLOW}➜${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
fail() { echo -e "${RED}✗${NC} $*"; }

info "Verifica pre-merge in corso..."

# 1) Presenza file
if [[ ! -f data.json ]]; then
  fail "data.json non trovato nella root del progetto"
  exit 1
fi
success "data.json presente"

# 2) Validità JSON e struttura base
python3 - <<'PY'
import json, sys
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
# Controlli base
assert 'ambiti_territoriali' in data and isinstance(data['ambiti_territoriali'], list), 'ambiti_territoriali mancante o non lista'
meta = data.get('metadata', {})
assert isinstance(meta, dict), 'metadata mancante o non oggetto'
regions = meta.get('regionsIncluded', [])
assert isinstance(regions, list) and len(regions) > 0, 'regionsIncluded mancante/vuoto'
# Conteggi
print(f"AMB: {len(data['ambiti_territoriali'])}")
print(f"REG: {len(regions)}")
# Verifica 3 record campione minimi
sample = data['ambiti_territoriali'][:3]
for i, it in enumerate(sample):
    assert 'regione' in it, f'record {i} senza regione'
    de = it.get('dettaglioEnte', {})
    assert isinstance(de, dict) and 'ente' in de, f'record {i} senza dettaglioEnte.ente'
PY
success "JSON valido e struttura base OK"

# 3) Test filtri essenziali con Python
python3 - <<'PY'
import json
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
ambiti = data['ambiti_territoriali']
# Regioni
regioni = sorted(set([a.get('regione','') for a in ambiti if a.get('regione')]))
print('Regioni:', len(regioni))
# Filtro regione su prima regione
if regioni:
    test_reg = regioni[0]
    filtrati = [a for a in ambiti if a.get('regione','').lower() == test_reg.lower()]
    assert len(filtrati) > 0, 'Filtro per regione non restituisce risultati'
# Filtro per ente/capofila (stringa generica comune)
needle = 'COMUNE'
filtrati2 = []
for a in ambiti:
    de = a.get('dettaglioEnte', {})
    s = ((de.get('ente','') + ' ' + de.get('comuneCapofila','')).lower())
    if needle.lower() in s:
        filtrati2.append(a)
assert len(filtrati2) > 0, 'Filtro ente/capofila non trova nulla con "COMUNE"'
print('Filtri OK')
PY
success "Filtri base OK"

success "Verifica pre-merge completata"
