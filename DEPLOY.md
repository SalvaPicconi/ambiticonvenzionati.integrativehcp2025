# Flusso di Rilascio (Staging -> Main)

Questo repository usa un ramo di staging per testare le modifiche prima della pubblicazione su `main` (produzione).

## Rami principali
- `main`: produzione. Aggiornare solo dopo verifica completata su staging.
- `staging`: ambiente di test. Qui si validano le modifiche prima del merge su `main`.

## Flusso consigliato
1. Crea un branch feature dalla base di `staging`:
   - Nome suggerito: `feat/<breve-descrizione>` oppure `fix/<breve-descrizione>`
2. Sviluppa e committa le modifiche sul branch feature
3. Apri una Pull Request verso `staging`
4. Verifica locale:
   - Esegui lo script di verifica e/o avvia la pagina `verify.html`
   - Controlla che i filtri (regione, provincia, comune, ente) funzionino con i nuovi dati
   - Controlla che le statistiche corrispondano a `data.json`
5. Quando i test passano, fai merge su `staging`
6. Esegui una verifica finale su `staging`
7. Apri una Pull Request da `staging` a `main` e completa il rilascio

## Verifica locale rapida
Sono disponibili due modalità:

- Script di avvio verifica con server e pagina di test:
  - `./start-verification.sh` apre `http://localhost:8000/verify.html`
  - Da pagina `verify.html` puoi usare i pulsanti o la console (comando `await verifyData()`).

- Script CLI `verify-before-merge.sh` (headless):
  - Valida struttura e conteggi di `data.json`
  - Fallisce (exit code != 0) in caso di problemi

## Hook pre-push (opzionale)
Per evitare di pushare cambi senza verifica, puoi attivare un hook locale:

1. Copia l'esempio nella cartella hook di Git:
   - `cp .githooks/pre-push.example .git/hooks/pre-push && chmod +x .git/hooks/pre-push`
2. Ora, ad ogni `git push`, verrà eseguito `./verify-before-merge.sh` e il push verrà bloccato se fallisce.

Nota: gli hook Git non vengono versionati automaticamente perché risiedono in `.git/hooks`. Per questo forniamo un file di esempio in `.githooks/`.

## Regole suggerite (GitHub Branch Protection)
- Richiedere PR per `main` (no push diretti)
- Almeno 1 approvazione per PR su `main`
- (Opz.) Richiedere che lo script di verifica passi prima del merge (CI futura)

## Convenzioni
- Commit chiari e atomici
- Aggiornare `README.md`/documentazione quando si modificano flussi o script
- I file dei dati principali: `data.json` (corrente), `data_backup.json`/`data_v1.json` (storico)

## Troubleshooting
- Porta 8000 occupata: lo script la libera automaticamente; in alternativa eseguire `killall python3`.
- Il server non parte: assicurarsi di avere Python 3 installato.
- Dati non caricati su `verify.html`: controllare `data.json` e la console del browser.