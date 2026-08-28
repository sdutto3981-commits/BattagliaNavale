let gridSize = 8;
let numNavi = 5;
let lenNavi = [1, 2, 3, 4, 5];
let messageElement = document.getElementById("message");
let hitNavi = 0;
let totLenNavi = 15;
let hitsElement = document.getElementById("hits");  

document.getElementById("start-game").addEventListener("click", function () {
  drawGrid();
  setNavi();
  setMenu();
  startTimer();
});

function drawGrid() {
  let parent = document.getElementById("grid-wrapper");
  parent.innerHTML = ""; // Pulisci il contenuto esistente

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let element = document.createElement("div");
      element.id = `cell-${i}-${j}`;
      element.addEventListener("click", function () {
          checkNave(element.id);
          checkWin();
      });
      element.classList.add("grid-element");

      parent.appendChild(element);
    }
  }
}

function setNavi() {
  let placedShips = 0;

  while (placedShips < numNavi) {
    let x = Math.floor(Math.random() * gridSize);
    let y = Math.floor(Math.random() * gridSize);
    let cell = document.getElementById(`cell-${x}-${y}`);
    let isVertical = Math.random() < 0.5;

    if (isVertical) {
      if (x + lenNavi[placedShips] < gridSize) {
        let canPlace = true;
        for (let i = 0; i < lenNavi[placedShips]; i++) {
          if (document.getElementById(`cell-${x + i}-${y}`).classList.contains("ship")) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          for (let i = 0; i < lenNavi[placedShips]; i++) {
            document.getElementById(`cell-${x + i}-${y}`).classList.add("ship");
          }
          placedShips++;
        }
      }
    } else {
      if (y + lenNavi[placedShips] < gridSize) {
        let canPlace = true;
        for (let i = 0; i < lenNavi[placedShips]; i++) {
          if (document.getElementById(`cell-${x}-${y + i}`).classList.contains("ship")) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          for (let i = 0; i < lenNavi[placedShips]; i++) {
            document.getElementById(`cell-${x}-${y + i}`).classList.add("ship");
          }
          placedShips++;
        }
      }
    }
  }
}

function setMenu() {
  let menu = document.getElementById("menu");
  menu.style.display = "inline";

  for (let i = 0; i < lenNavi.length; i++) {
    let shipDiv = document.createElement("div");
    let text = document.createElement("p");
    text.innerText = `Nave ${i + 1}: ${lenNavi[i]} caselle`;
    shipDiv.appendChild(text);
    for (let j = 0; j < lenNavi[i]; j++) {
      let cell = document.createElement("div");
      cell.classList.add("nave-preview");
      shipDiv.appendChild(cell);
    }
    menu.appendChild(shipDiv);
  }
}

function checkNave(elementId) {
  let element = document.getElementById(elementId);
  let hit = false;
  if (element.classList.contains("ship")) {
    hit = true;
  }
  if (hit) {
    if (element.classList.contains('disabled') || element.classList.contains('hit')){
      return; 
    }
    messageElement.innerText = "Colpito!";
    hitNavi++;
    hitsElement.innerText = `Hit: ${hitNavi}`;
    element.classList.add("hit");
    
  } else {
    if (element.classList.contains('disabled') || element.classList.contains('hit')){ 
      return;
    }
    messageElement.innerText = "Miss!";
    hitNavi++;
    hitsElement.innerText = `Hit: ${hitNavi}`;
    element.classList.add("disabled");
  }
}

function checkWin() {
  if (hitNavi === totLenNavi) {
    messageElement.innerText = "Hai vinto!";
  }
}

function startTimer() {
  let minutes = 0;
  let seconds = 0;
  const timerElement = document.getElementById("timer");

  setInterval(() => {
    seconds++;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    timerElement.innerHTML = `<span id="min">${String(minutes).padStart(2, '0')}</span>:<span id="sec">${String(seconds).padStart(2, '0')}</span>`;
  }, 1000);
}