# Battaglia Navale

Un piccolo gioco di Battaglia Navale (Battleship) giocabile in solitario nel browser: la flotta nemica viene posizionata a caso sulla griglia e devi affondarla il più in fretta possibile.

## Note tecniche

### Tema grafico
Tema "oceano": griglia su sfondo blu , celle azzurre  colpo a segno in rosso , acqua (tiro a vuoto) in grigio chiaro.

### Dimensione della griglia
Quadrata, lato configurabile da **5 a 12 celle** (default 8x8). Il valore è impostato dall'utente nel pannello Impostazioni e applicato dinamicamente alla griglia CSS (`grid-template-columns`) al momento dell'avvio partita.

### Numero e dimensione delle navi
- Numero di navi configurabile da **1 a 6** (default 5).
- Lunghezza di ciascuna nave configurabile singolarmente da **1 cella fino alla dimensione della griglia** (default: 1, 2, 3, 4, 5 caselle).
- I campi di lunghezza si rigenerano automaticamente quando si cambia il numero di navi o la dimensione della griglia.

### Modalità di posizionamento delle navi
Posizionamento **casuale** ad ogni nuova partita:
1. Per ogni nave si sceglie una cella di partenza casuale e un orientamento casuale (orizzontale o verticale).
2. Si verifica che la nave rientri nei bordi della griglia e non si sovrapponga a navi già posizionate.
3. Se il tentativo non è valido, se ne genera un altro, fino a un massimo di 4000 tentativi complessivi.
4. Se non è possibile posizionare tutte le navi (impostazioni incompatibili con la griglia), la partita non parte e viene mostrato un messaggio d'errore.

Le navi sono invisibili sulla griglia finché non vengono colpite.

### Tipo di temporizzazione
**Cronometro che conta in avanti** (non un countdown): parte da `00:00` quando si preme "Inizia partita" e si aggiorna ogni secondo tramite `setInterval`. Si ferma automaticamente al raggiungimento della vittoria o quando si preme "Reset".

### Elementi creati dinamicamente in JavaScript
Generati a runtime, non presenti staticamente nell'HTML:
- Le celle della griglia (`div.grid-element`, una per ogni cella, con id `cell-riga-colonna`).
- Le righe dell'elenco navi nel pannello laterale (`div.ship-row`), una per nave, con etichetta e caselline di anteprima.
- Le caselline di anteprima di ogni nave (`div.nave-preview`), che si colorano di rosso ad ogni colpo ricevuto.
- I campi di input per la lunghezza di ogni nave nel pannello Impostazioni (`input.ship-size-input`), rigenerati ogni volta che cambia il numero di navi o la dimensione della griglia.
- Il testo del timer (`span#min`, `span#sec`), riscritto ogni secondo.