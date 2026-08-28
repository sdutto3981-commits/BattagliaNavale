import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, push, set, query, orderByChild, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import {
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyDux-C2znjXzD1x-MR6t340GTgUhk6m9Ho",
  authDomain: "battaglianavale-f9c34.firebaseapp.com",
  databaseURL: "https://battaglianavale-f9c34-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "battaglianavale-f9c34",
  storageBucket: "battaglianavale-f9c34.firebasestorage.app",
  messagingSenderId: "359622454307",
  appId: "1:359622454307:web:fcbd7f48ec3228198fd596",
  measurementId: "G-KB1X9FH4QT",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

await signInAnonymously(auth);

console.log("Signed in anonymously: ", auth.currentUser.uid);

async function signInWithGoogle() {
  try {
    if (auth.currentUser && auth.currentUser.isAnonymous) {
      await linkWithPopup(auth.currentUser, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  } catch (error) {
    if (error.code === "auth/credential-already-in-use") {
      await signInWithPopup(auth, googleProvider);
    } else if (error.code !== "auth/popup-closed-by-user") {
      console.error("Errore durante l'accesso con Google:", error);
    }
  }
}

async function handleGoogleSignOut() {
  await signOut(auth);
  await signInAnonymously(auth); 
}

let gridSize = 8;
let lenNavi = [1, 2, 3, 4, 5];
let totLenNavi = 15;

let messageElement = document.getElementById("message");
let hitsElement = document.getElementById("hits");
let shipsListElement = document.getElementById("ships-list");
let settingsPanel = document.getElementById("settings-panel");
let settingsError = document.getElementById("settings-error");
let numShipsInput = document.getElementById("num-ships");
let gridSizeInput = document.getElementById("grid-size");
let shipSizesInputs = document.getElementById("ship-sizes-inputs");

let ships = [];
let shipHits = 0;
let totalShots = 0;       
let elapsedMinutes = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let gameStarted = false;
let currentScore = 0;

let scoreModalElement = document.getElementById("score-modal");
if (!scoreModalElement) {
  console.error(
    'Elemento "#score-modal" non trovato nel DOM: verifica che index.html contenga il markup del modal e che il browser non stia usando una versione in cache.',
  );
}
let scoreModal = scoreModalElement ? new bootstrap.Modal(scoreModalElement) : null;
let modalTimeElement = document.getElementById("modal-time");
let modalAttemptsElement = document.getElementById("modal-attempts");
let modalScoreElement = document.getElementById("modal-score");
let playerNameInput = document.getElementById("player-name");
let saveScoreBtn = document.getElementById("save-score-btn");
let leaderboardElement = document.getElementById("leaderboard");

let googleSigninBtn = document.getElementById("google-signin-btn");
let googleSignoutBtn = document.getElementById("google-signout-btn");
let userGreeting = document.getElementById("user-greeting");
let userAvatar = document.getElementById("user-avatar");
let userNameElement = document.getElementById("user-name");
let modalGoogleSigninBtn = document.getElementById("modal-google-signin-btn");
let modalSigninHint = document.getElementById("modal-signin-hint");

document.getElementById("start-game").addEventListener("click", startGame);
document.getElementById("reset-game").addEventListener("click", resetGame);
document.getElementById("toggle-settings").addEventListener("click", () => {
  settingsPanel.classList.toggle("visible");
});
numShipsInput.addEventListener("input", renderShipSizeInputs);
gridSizeInput.addEventListener("input", renderShipSizeInputs);
saveScoreBtn.addEventListener("click", handleSaveScore);
googleSigninBtn.addEventListener("click", signInWithGoogle);
googleSignoutBtn.addEventListener("click", handleGoogleSignOut);
modalGoogleSigninBtn.addEventListener("click", signInWithGoogle);

onAuthStateChanged(auth, updateAuthUI);

function updateAuthUI(user) {
  let isGoogleUser = Boolean(user && !user.isAnonymous);

  if (isGoogleUser) {
    googleSigninBtn.classList.add("d-none");
    userGreeting.classList.remove("d-none");
    userAvatar.src = user.photoURL || "";
    userNameElement.innerText = user.displayName || user.email || "Ammiraglio";

    playerNameInput.value = user.displayName || "";
    playerNameInput.disabled = true;
    modalSigninHint.classList.add("d-none");
    modalGoogleSigninBtn.classList.add("d-none");
    saveScoreBtn.classList.remove("d-none");
  } else {
    googleSigninBtn.classList.remove("d-none");
    userGreeting.classList.add("d-none");

    playerNameInput.value = "";
    playerNameInput.disabled = false;
    modalSigninHint.classList.remove("d-none");
    modalGoogleSigninBtn.classList.remove("d-none");
    saveScoreBtn.classList.add("d-none");
  }
}

renderShipSizeInputs();

function renderShipSizeInputs() {
  let count = clamp(parseInt(numShipsInput.value) || 1, 1, 6);
  numShipsInput.value = count;
  let maxLen = clamp(parseInt(gridSizeInput.value) || 8, 5, 12);

  let existing = shipSizesInputs.querySelectorAll("input").length;
  shipSizesInputs.innerHTML = "";

  for (let i = 0; i < count; i++) {
    let wrap = document.createElement("div");
    wrap.classList.add("ship-size-item");

    let label = document.createElement("span");
    label.innerText = `Nave ${i + 1}`;

    let input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = String(maxLen);
    input.value = String(Math.min(i + 1, maxLen));
    input.classList.add("ship-size-input");

    wrap.appendChild(label);
    wrap.appendChild(input);
    shipSizesInputs.appendChild(wrap);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function readSettings() {
  gridSize = clamp(parseInt(gridSizeInput.value) || 8, 5, 12);
  gridSizeInput.value = gridSize;

  let sizeInputs = shipSizesInputs.querySelectorAll(".ship-size-input");
  lenNavi = Array.from(sizeInputs).map((input) =>
    clamp(parseInt(input.value) || 1, 1, gridSize),
  );
  totLenNavi = lenNavi.reduce((sum, len) => sum + len, 0);
}

function startGame() {
  settingsError.innerText = "";
  readSettings();
  resetState();
  drawGrid();

  let placed = setNavi();
  if (!placed) {
    document.getElementById("grid-wrapper").innerHTML = "";
    settingsError.innerText =
      "Le navi scelte non entrano nella griglia: riducile o ingrandisci la griglia.";
    settingsPanel.classList.add("visible");
    return;
  }

  setMenu();
  startTimer();
  gameStarted = true;
  messageElement.innerText = "Buona fortuna, ammiraglio!";
}

function resetGame() {
  resetState();
  document.getElementById("grid-wrapper").innerHTML = "";
  document.getElementById("menu").classList.remove("visible");
  shipsListElement.innerHTML = "";
  settingsError.innerText = "";
  messageElement.innerText = 'Premi "Inizia partita" per giocare!';
  hitsElement.innerText = "Colpi a segno: 0";
  document.getElementById("timer").innerHTML =
    `<span id="min">00</span>:<span id="sec">00</span>`;
}

function resetState() {
  clearInterval(timerInterval);
  timerInterval = null;
  ships = [];
  shipHits = 0;
  totalShots = 0;
  elapsedMinutes = 0;
  elapsedSeconds = 0;
  gameStarted = false;
}

function drawGrid() {
  let parent = document.getElementById("grid-wrapper");
  parent.innerHTML = "";
  parent.style.gridTemplateColumns = `repeat(${gridSize}, 45px)`;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let element = document.createElement("div");
      element.id = `cell-${i}-${j}`;
      element.classList.add("grid-element");
      element.addEventListener("click", function () {
        if (!gameStarted) return;
        checkNave(element.id);
        checkWin();
      });
      parent.appendChild(element);
    }
  }
}

function setNavi() {
  ships = lenNavi.map((len) => ({
    length: len,
    hits: 0,
    sunk: false,
    cells: [],
  }));

  let placedShips = 0;
  let attempts = 0;
  let maxAttempts = 4000;

  while (placedShips < ships.length) {
    if (attempts++ > maxAttempts) {
      return false;
    }

    let len = ships[placedShips].length;
    let x = Math.floor(Math.random() * gridSize);
    let y = Math.floor(Math.random() * gridSize);
    let isVertical = Math.random() < 0.5;

    let cellIds = [];
    let fits = true;

    if (isVertical) {
      if (x + len <= gridSize) {
        for (let i = 0; i < len; i++) {
          let id = `cell-${x + i}-${y}`;
          if (document.getElementById(id).classList.contains("ship")) {
            fits = false;
            break;
          }
          cellIds.push(id);
        }
      } else {
        fits = false;
      }
    } else {
      if (y + len <= gridSize) {
        for (let i = 0; i < len; i++) {
          let id = `cell-${x}-${y + i}`;
          if (document.getElementById(id).classList.contains("ship")) {
            fits = false;
            break;
          }
          cellIds.push(id);
        }
      } else {
        fits = false;
      }
    }

    if (fits) {
      cellIds.forEach((id) => {
        let cell = document.getElementById(id);
        cell.classList.add("ship");
        cell.dataset.ship = placedShips;
      });
      ships[placedShips].cells = cellIds;
      placedShips++;
    }
  }

  return true;
}

function setMenu() {
  let menu = document.getElementById("menu");
  menu.classList.add("visible");
  shipsListElement.innerHTML = "";

  ships.forEach((ship, i) => {
    let shipDiv = document.createElement("div");
    shipDiv.classList.add("ship-row");
    shipDiv.id = `ship-row-${i}`;

    let text = document.createElement("p");
    text.innerText = `Nave ${i + 1}: ${ship.length} caselle`;
    text.classList.add("ship-label");
    shipDiv.appendChild(text);

    let previewWrap = document.createElement("div");
    previewWrap.classList.add("preview-wrap");
    for (let j = 0; j < ship.length; j++) {
      let cell = document.createElement("div");
      cell.classList.add("nave-preview");
      cell.id = `nave-preview-${i}-${j}`;
      previewWrap.appendChild(cell);
    }
    shipDiv.appendChild(previewWrap);

    shipsListElement.appendChild(shipDiv);
  });
}

function checkNave(elementId) {
  let element = document.getElementById(elementId);

  if (
    element.classList.contains("hit") ||
    element.classList.contains("disabled")
  ) {
    return; 
  }

  totalShots++;

  if (element.classList.contains("ship")) {
    element.classList.add("hit");
    shipHits++;
    hitsElement.innerText = `Colpi a segno: ${shipHits}`;

    let shipIndex = element.dataset.ship;
    let ship = ships[shipIndex];
    ship.hits++;

    let preview = document.getElementById(
      `nave-preview-${shipIndex}-${ship.hits - 1}`,
    );
    if (preview) preview.classList.add("hit");

    if (ship.hits === ship.length) {
      ship.sunk = true;
      document.getElementById(`ship-row-${shipIndex}`).classList.add("sunk");
      messageElement.innerText = "Nave affondata!";
    } else {
      messageElement.innerText = "Colpito!";
    }
  } else {
    element.classList.add("disabled");
    messageElement.innerText = "Acqua!";
  }
}

function checkWin() {
  if (shipHits === totLenNavi) {
    messageElement.innerText = "Hai vinto! Flotta nemica distrutta.";
    clearInterval(timerInterval);
    gameStarted = false;

    currentScore = calcolaPunteggio();
    modalTimeElement.innerText = formatTime();
    modalAttemptsElement.innerText = String(totalShots);
    modalScoreElement.innerText = String(currentScore);
    saveScoreBtn.disabled = false;
    saveScoreBtn.innerText = "Salva punteggio";
    updateAuthUI(auth.currentUser); 

    if (scoreModal) {
      scoreModal.show();
    } else {
      console.error('Impossibile aprire il modal punteggio: elemento "#score-modal" mancante.');
    }
  }
}

async function handleSaveScore() {
  let user = auth.currentUser;
  if (!user || user.isAnonymous) {
    modalSigninHint.classList.remove("d-none");
    modalGoogleSigninBtn.classList.remove("d-none");
    return;
  }

  let nome = user.displayName || "Ammiraglio";

  saveScoreBtn.disabled = true;
  saveScoreBtn.innerText = "Salvataggio...";

  try {
    await salvaPunteggio(nome, currentScore, user.uid);
    if (scoreModal) scoreModal.hide();
  } catch (error) {
    console.error("Errore nel salvataggio del punteggio:", error);
    saveScoreBtn.disabled = false;
    saveScoreBtn.innerText = "Salva punteggio";
  }
}

function startTimer() {
  elapsedMinutes = 0;
  elapsedSeconds = 0;
  const timerElement = document.getElementById("timer");

  timerInterval = setInterval(() => {
    elapsedSeconds++;
    if (elapsedSeconds === 60) {
      elapsedMinutes++;
      elapsedSeconds = 0;
    }
    timerElement.innerHTML = `<span id="min">${String(elapsedMinutes).padStart(2, "0")}</span>:<span id="sec">${String(elapsedSeconds).padStart(2, "0")}</span>`;
  }, 1000);
}


function calcolaPunteggio() {
  let difficultyBase = gridSize * 20 + totLenNavi * 30 + ships.length * 20;

  let minAttempts = totLenNavi;
  let extraAttempts = Math.max(0, totalShots - minAttempts);
  let attemptsPenalty = extraAttempts * 15;

  let timeInSeconds = elapsedMinutes * 60 + elapsedSeconds;
  let timePenalty = timeInSeconds * 3;

  let score = Math.round(difficultyBase - attemptsPenalty - timePenalty);
  return Math.max(0, score);
}

function formatTime() {
  return `${String(elapsedMinutes).padStart(2, "0")}:${String(elapsedSeconds).padStart(2, "0")}`;
}


async function salvaPunteggio(nome, punteggio, uid) {
  const nuovoPunteggio = push(ref(db, "leaderboard"));
  await set(nuovoPunteggio, {
    nome: nome,
    punteggio: punteggio,
    timestamp: Date.now(),
    uid: uid,
  });
}


const leaderboardQuery = query(ref(db, "leaderboard"), orderByChild("punteggio"), limitToLast(10));
onValue(leaderboardQuery, (snapshot) => {
  leaderboardElement.innerHTML = "";

  let entries = [];
  snapshot.forEach((childSnapshot) => {
    entries.push(childSnapshot.val());
  });

  if (entries.length === 0) {
    let empty = document.createElement("p");
    empty.id = "leaderboard-empty";
    empty.innerText = "Nessun punteggio ancora registrato.";
    leaderboardElement.appendChild(empty);
    return;
  }

  entries.reverse();

  entries.forEach((entry, index) => {
    let leaderboardEntry = document.createElement("div");
    leaderboardEntry.classList.add("leaderboard-entry");

    let rank = document.createElement("span");
    rank.classList.add("leaderboard-rank");
    rank.innerText = `${index + 1}.`;

    let name = document.createElement("span");
    name.classList.add("leaderboard-name");
    name.innerText = entry.nome;

    let score = document.createElement("span");
    score.classList.add("leaderboard-score");
    score.innerText = entry.punteggio;

    leaderboardEntry.appendChild(rank);
    leaderboardEntry.appendChild(name);
    leaderboardEntry.appendChild(score);
    leaderboardElement.appendChild(leaderboardEntry);
  });
});