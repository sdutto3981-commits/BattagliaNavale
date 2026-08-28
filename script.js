document.getElementById("start-game").addEventListener("click", function () {
  drawGrid();
});

function drawGrid() {
  let parent = document.getElementById("grid-wrapper");
  parent.innerHTML = ""; // Pulisci il contenuto esistente

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let element = document.createElement("div");
      element.id = `cell-${i}-${j}`;
      element.addEventListener("click", function () {
          // Gestisci il clic sulla cella
          console.log(`Hai cliccato sulla cella ${element.id}`);
      });
      element.classList.add("grid-element");

      parent.appendChild(element);
    }
  }
}