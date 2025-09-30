#!/usr/bin/env python3
"""
Script per riparare il file CSV con righe spezzate
"""

import re

def fix_csv_file(input_file, output_file):
    """
    Ripara un file CSV con righe spezzate ricomponendo i record
    """
    print(f"🔧 Riparando il file CSV: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Dividi in righe
    lines = content.split('\n')
    
    # Prima riga è l'header
    header = lines[0] if lines else ""
    expected_cols = len(header.split(','))
    
    print(f"📋 Header: {header}")
    print(f"🔢 Colonne attese: {expected_cols}")
    
    fixed_lines = [header]
    current_line = ""
    
    for i, line in enumerate(lines[1:], 1):
        if not line.strip():
            continue
            
        # Aggiungi alla riga corrente
        if current_line:
            current_line += line
        else:
            current_line = line
        
        # Conta le colonne nella riga corrente
        cols = current_line.split(',')
        
        # Se abbiamo il numero giusto di colonne, la riga è completa
        if len(cols) >= expected_cols:
            # Trova il punto dove inizia il prossimo record
            # Cerchiamo pattern come "ABRUZZO," o "LOMBARDIA," etc.
            region_pattern = r'(ABRUZZO|BASILICATA|CALABRIA|CAMPANIA|EMILIA-ROMAGNA|FRIULI-VENEZIA GIULIA|LAZIO|LIGURIA|LOMBARDIA|MARCHE|MOLISE|PIEMONTE|PUGLIA|SARDEGNA|SICILIA|TOSCANA|TRENTINO-ALTO ADIGE|UMBRIA|VALLE D\'AOSTA|VENETO),'
            
            # Trova tutte le occorrenze del pattern regione
            matches = list(re.finditer(region_pattern, current_line))
            
            if len(matches) > 1:
                # Abbiamo più record nella stessa riga
                split_point = matches[1].start()
                complete_record = current_line[:split_point].strip()
                next_record_start = current_line[split_point:].strip()
                
                fixed_lines.append(complete_record)
                current_line = next_record_start
            else:
                # Un solo record completo
                fixed_lines.append(current_line.strip())
                current_line = ""
    
    # Aggiungi l'ultima riga se presente
    if current_line.strip():
        fixed_lines.append(current_line.strip())
    
    # Scrivi il file riparato
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))
    
    print(f"✅ File riparato salvato come: {output_file}")
    print(f"📊 Righe originali: {len(lines)}")
    print(f"📊 Righe riparate: {len(fixed_lines)}")
    
    return len(fixed_lines) - 1  # -1 per l'header

def analyze_csv_structure(file_path):
    """
    Analizza la struttura del CSV per capire i problemi
    """
    print(f"🔍 Analizzando: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0].strip() if lines else ""
    expected_cols = len(header.split(','))
    
    print(f"📋 Header: {header}")
    print(f"🔢 Colonne attese: {expected_cols}")
    print(f"📄 Righe totali: {len(lines)}")
    
    # Analizza le prime 10 righe
    print("\n🔍 Prime 10 righe:")
    for i, line in enumerate(lines[:10]):
        cols = line.strip().split(',')
        status = "✅" if len(cols) == expected_cols else f"❌ ({len(cols)} cols)"
        print(f"  {i:2d}: {status} {line.strip()[:80]}...")
    
    # Conta righe problematiche
    broken_lines = 0
    for line in lines[1:]:  # Skip header
        if line.strip() and len(line.strip().split(',')) != expected_cols:
            broken_lines += 1
    
    print(f"\n⚠️  Righe con problemi: {broken_lines}/{len(lines)-1}")
    
    return {
        'total_lines': len(lines),
        'expected_cols': expected_cols,
        'broken_lines': broken_lines,
        'header': header
    }

if __name__ == "__main__":
    input_file = "Ambiti_Territoriali_Completi.csv"
    output_file = "Ambiti_Territoriali_Fixed.csv"
    
    # Analizza prima il problema
    analysis = analyze_csv_structure(input_file)
    
    if analysis['broken_lines'] > 0:
        print(f"\n🛠️  Procedendo con la riparazione...")
        records_count = fix_csv_file(input_file, output_file)
        print(f"\n✅ Processati {records_count} record")
    else:
        print("\n✅ Il file sembra già corretto!")