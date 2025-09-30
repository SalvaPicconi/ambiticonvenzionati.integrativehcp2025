#!/usr/bin/env python3
"""
Script per analizzare e convertire il file Excel degli Ambiti Territoriali
"""

import pandas as pd
import json
from datetime import datetime
import sys

def analyze_excel_structure(file_path):
    """
    Analizza la struttura del file Excel per capire come sono organizzati i dati
    """
    print(f"🔍 Analizzando file: {file_path}")
    
    try:
        # Prima controlla quanti fogli ci sono
        excel_file = pd.ExcelFile(file_path)
        sheet_names = excel_file.sheet_names
        
        print(f"📊 Informazioni generali:")
        print(f"   • Fogli nel file: {len(sheet_names)}")
        print(f"   • Nomi fogli: {sheet_names}")
        
        # Leggi tutti i fogli e combinali
        all_dataframes = []
        total_rows = 0
        
        for sheet_name in sheet_names:
            print(f"\n📋 Leggendo foglio: {sheet_name}")
            df_sheet = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Aggiungi una colonna per identificare il foglio di origine
            df_sheet['FoglioOrigine'] = sheet_name
            
            print(f"   • Righe: {len(df_sheet)}")
            print(f"   • Colonne: {list(df_sheet.columns)}")
            
            all_dataframes.append(df_sheet)
            total_rows += len(df_sheet)
        
        # Combina tutti i dataframe
        df_combined = pd.concat(all_dataframes, ignore_index=True)
        
        print(f"\n🔗 Dati combinati:")
        print(f"   • Righe totali: {len(df_combined)}")
        print(f"   • Colonne: {len(df_combined.columns)}")
        print(f"   • Dimensioni: {df_combined.shape}")
        
        print(f"\n📋 Colonne presenti:")
        for i, col in enumerate(df_combined.columns, 1):
            print(f"   {i:2d}. {col}")
        
        print(f"\n🔍 Prime 5 righe del dataset combinato:")
        print(df_combined.head().to_string())
        
        print(f"\n📈 Statistiche per colonna:")
        for col in df_combined.columns:
            if col != 'FoglioOrigine':  # Skip la colonna che abbiamo aggiunto
                null_count = df_combined[col].isnull().sum()
                unique_count = df_combined[col].nunique()
                print(f"   • {col}: {unique_count} valori unici, {null_count} nulli")
        
        # Analisi per regione se disponibile
        regione_col = None
        for col in df_combined.columns:
            if 'regione' in col.lower() or 'direzione' in col.lower():
                regione_col = col
                break
        
        if regione_col:
            print(f"\n🗺️ Distribuzione per {regione_col}:")
            regioni_count = df_combined[regione_col].value_counts()
            for regione, count in regioni_count.items():
                print(f"   • {regione}: {count} record")
        
        # Analisi per foglio
        print(f"\n📊 Distribuzione per foglio:")
        fogli_count = df_combined['FoglioOrigine'].value_counts()
        for foglio, count in fogli_count.items():
            print(f"   • {foglio}: {count} record")
        
        return df_combined
        
    except Exception as e:
        print(f"❌ Errore durante l'analisi: {e}")
        return None

def convert_excel_to_json(df, output_file):
    """
    Converte il DataFrame in formato JSON compatibile con il sito
    """
    print(f"\n🔄 Convertendo in formato JSON...")
    
    # Mappa le colonne del file Excel ai nomi che ci aspettiamo
    column_mapping = {
        'REGIONE': 'Regione',
        'Nominativo Ambito TERRITORIALE': 'Ente', 
        'Indirizzo Ambito ': 'Indirizzo_Ente',  # Nota: c'è uno spazio alla fine!
        'ProvinciaAmbito': 'Provincia',
        'Comune capofila Ambito Territoriale': 'Comune_Ambito',
        'Comune Competenza Territoriale': 'Comune_Competenza',
        'CAP di Competenza Territoriale': 'CAP',
        'Cod Competenza Territoriale': 'Codice'
    }
    
    # Rinomina le colonne
    df_renamed = df.rename(columns=column_mapping)
    
    print(f"📋 Colonne rinominate:")
    for old, new in column_mapping.items():
        if old in df.columns:
            print(f"   • {old} → {new}")
    
    # Raggruppa i dati per COMUNE CAPOFILA per creare la struttura corretta
    grouped_data = []
    
    # Raggruppa per Regione, Provincia, Ente e Comune Capofila
    for (regione, provincia, ente, comune_capofila), group in df_renamed.groupby(['Regione', 'Provincia', 'Ente', 'Comune_Ambito']):
        
        # Tutti i comuni che ricadono sotto questo capofila
        comuni_competenza = group['Comune_Competenza'].unique().tolist()
        numero_comuni = len(comuni_competenza)
        
        # Prendi il primo record per i dettagli dell'ente (sono tutti uguali nel gruppo)
        primo_record = group.iloc[0]
        
        # Dettagli ente
        dettaglio_ente = {
            "ente": ente,
            "indirizzo": primo_record['Indirizzo_Ente'] if pd.notna(primo_record['Indirizzo_Ente']) else "",
            "comuneCapofila": comune_capofila if pd.notna(comune_capofila) else "",
            "provincia": provincia if pd.notna(provincia) else "",
        }
        
        # Lista dettagli comuni
        dettagli_comuni = []
        for _, row in group.iterrows():
            dettaglio_comune = {
                "comune": row['Comune_Competenza'] if pd.notna(row['Comune_Competenza']) else "",
                "cap": str(int(row['CAP'])) if pd.notna(row['CAP']) and row['CAP'] != '' else "",
                "codice": row['Codice'] if pd.notna(row['Codice']) else ""
            }
            # Evita duplicati
            if dettaglio_comune not in dettagli_comuni:
                dettagli_comuni.append(dettaglio_comune)
                
        
        # Crea il record per questo ambito
        record = {
            "regione": regione,
            "provincia": provincia,
            "numeroComuni": numero_comuni,
            "dettaglioEnte": dettaglio_ente,
            "comuniCompetenza": comuni_competenza,
            "dettagliComuni": dettagli_comuni
        }
        
        grouped_data.append(record)
        
        print(f"✅ Processato: {regione} ({provincia}) - {ente} - {numero_comuni} comuni")
    
    # Crea la struttura finale JSON
    json_structure = {
        "metadata": {
            "title": "Ambiti Territoriali Italiani - Dataset Completo",
            "description": "Dati completi degli ambiti territoriali con enti gestori e comuni di competenza",
            "version": "2.0.0",
            "createdAt": datetime.now().isoformat() + "Z",
            "recordCount": len(grouped_data),
            "sourceFile": "911_Estrazione-Ambiti-con-competenze-territoriali-_11-settembre-2025.xlsx",
            "totalRecords": len(df_renamed),
            "regionsIncluded": df_renamed['Regione'].unique().tolist()
        },
        "ambiti_territoriali": grouped_data
    }
    
    # Salva il file JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(json_structure, f, ensure_ascii=False, indent=2)
    
    print(f"✅ File JSON salvato: {output_file}")
    print(f"📊 Record processati: {len(grouped_data)} ambiti territoriali")
    print(f"📊 Record originali: {len(df_renamed)} righe")
    
    return json_structure

def main():
    excel_file = "911_Estrazione-Ambiti-con-competenze-territoriali-_11-settembre-2025.xlsx"
    json_file = "data_new.json"
    
    print("🚀 Inizio processo di conversione Excel → JSON")
    print("=" * 60)
    
    # Analizza la struttura
    df = analyze_excel_structure(excel_file)
    
    if df is not None:
        # Converti in JSON
        json_data = convert_excel_to_json(df, json_file)
        
        print(f"\n✅ Conversione completata!")
        print(f"📁 File di output: {json_file}")
        print(f"🎯 Pronto per l'integrazione nel sito")
    else:
        print("❌ Impossibile processare il file Excel")
        sys.exit(1)

if __name__ == "__main__":
    main()