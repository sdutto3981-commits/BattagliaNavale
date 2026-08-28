let gridSize = 8;
let lenNavi = [1, 2, 3, 4, 5];
let totLenNavi = lenNavi.reduce((sum, len) => sum + len, 0);

let messageElement = document.getElementById("message");
let hitsElement = document.getElementById("hits");
let shipsListElement = document.getElementById("ships-list");

let ships = [];     
let shipHits = 0;  
let timerInterval = null;
let gameStarted = false;

document.getElementById("start-game").addEventListener("click", startGame);
document.getElementById("reset-game").addEventListener("click", resetGame);

function startGame() {
  resetState();
  drawGrid();
  setNavi();
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
  messageElement.innerText = 'Premi "Inizia partita" per giocare!';
  hitsElement.innerText = "Colpi a segno: 0";
  document.getElementById("timer").innerHTML = `<span id="min">00</span>:<span id="sec">00</span>`;
}

function resetState() {
  clearInterval(timerInterval);
  timerInterval = null;
  ships = [];
  shipHits = 0;
  gameStarted = false;
}

function drawGrid() {
  let parent = document.getElementById("grid-wrapper");
  parent.innerHTML = "";

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
  ships = lenNavi.map((len) => ({ length: len, hits: 0, sunk: false, cells: [] }));

  let placedShips = 0;

  while (placedShips < ships.length) {
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

  if (element.classList.contains("hit") || element.classList.contains("disabled")) {
    return; // cella già colpita
  }

  if (element.classList.contains("ship")) {
    element.classList.add("hit");
    shipHits++;
    hitsElement.innerText = `Colpi a segno: ${shipHits}`;

    let shipIndex = element.dataset.ship;
    let ship = ships[shipIndex];
    ship.hits++;

    // riempi la prossima casellina di anteprima per quella nave
    let preview = document.getElementById(`nave-preview-${shipIndex}-${ship.hits - 1}`);
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
  }
}

function startTimer() {
  let minutes = 0;
  let seconds = 0;
  const timerElement = document.getElementById("timer");

  timerInterval = setInterval(() => {
    seconds++;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    timerElement.innerHTML = `<span id="min">${String(minutes).padStart(2, "0")}</span>:<span id="sec">${String(seconds).padStart(2, "0")}</span>`;
  }, 1000);
}