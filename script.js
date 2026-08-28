let gridSize = 8;
let numNavi = 5;
let lenNavi = [1, 2, 3, 4, 5];
let messageElement = document.getElementById("message");
let hitNavi = 0;
let totLenNavi = 15;

document.getElementById("start-game").addEventListener("click", function () {
  drawGrid();
  setNavi();
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

function checkNave(elementId) {
  let hit = false;
  if (document.getElementById(elementId).classList.contains("ship")) {
    hit = true;
    document.getElementById(elementId).classList.add("hit");
  }
  if (hit) {
    messageElement.innerText = "Colpito!";
    hitNavi++;
  } else {
    messageElement.innerText = "Miss!";
  }
}

function checkWin() {
  if (hitNavi === totLenNavi) {
    messageElement.innerText = "Hai vinto!";
  }
}