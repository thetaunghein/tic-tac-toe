// Game State
let currentGrid = 0;
let gameMode = "pvp";
let currentPlayer = "X";
let isGameActive = true;
let boardState = [];
let scoreX = 0;
let scoreO = 0;

// DOM Elements
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("nav a");
const scoreXDisplay = document.getElementById("scoreX");
const scoreODisplay = document.getElementById("scoreO");
const statusDisplay = document.getElementById("status");
const gameBoard = document.getElementById("game-board");
const gameTitle = document.getElementById("game-title");

// Navigation Function
function showPage(pageId) {
  pages.forEach((p) => p.classList.remove("active"));
  document.getElementById(pageId)?.classList.add("active");

  navLinks.forEach((a) => a.classList.remove("active"));
  if (pageId === "selection-page")
    document.getElementById("nav-selection")?.classList.add("active");
  if (pageId === "how-to-play-page")
    document.getElementById("nav-how")?.classList.add("active");
  if (pageId === "about-page")
    document.getElementById("nav-about")?.classList.add("active");
}

// Event Listeners for Nav (Safeguarded)
document
  .getElementById("nav-selection")
  ?.addEventListener("click", () => showPage("selection-page"));
document
  .getElementById("nav-how")
  ?.addEventListener("click", () => showPage("how-to-play-page"));
document
  .getElementById("nav-about")
  ?.addEventListener("click", () => showPage("about-page"));

// Grid Selection Logic
const card3 = document.getElementById("card-3x3");
const card5 = document.getElementById("card-5x5");
const pvpBtn = document.getElementById("pvp-btn");
const pvcBtn = document.getElementById("pvc-btn");

card3?.addEventListener("click", () => selectGrid(3));
card5?.addEventListener("click", () => selectGrid(5));

function selectGrid(size) {
  currentGrid = size;
  card3?.classList.remove("selected");
  card5?.classList.remove("selected");

  if (size === 3) card3?.classList.add("selected");
  else card5?.classList.add("selected");

  if (pvpBtn) pvpBtn.disabled = false;
  if (pvcBtn) pvcBtn.disabled = false;
}

// Game Controls
pvpBtn?.addEventListener("click", () => startGame("pvp"));
pvcBtn?.addEventListener("click", () => startGame("pvc"));
document
  .getElementById("reset-board-btn")
  ?.addEventListener("click", resetBoard);
document
  .getElementById("back-menu-btn")
  ?.addEventListener("click", () => showPage("selection-page"));

function startGame(mode) {
  gameMode = mode;
  scoreX = 0;
  scoreO = 0;
  if (scoreXDisplay) scoreXDisplay.innerText = "0";
  if (scoreODisplay) scoreODisplay.innerText = "0";
  if (gameTitle) {
    gameTitle.innerText =
      currentGrid === 3 ? "Ultimate 3x3 Challenge" : "Ultimate 5x5 Challenge";
  }
  initBoard();
  showPage("game-page");
}

function initBoard() {
  if (!gameBoard) return;
  gameBoard.innerHTML = '<svg id="winning-line-svg"></svg>';
  gameBoard.className = `board board-${currentGrid}x${currentGrid}`;
  boardState = Array(currentGrid * currentGrid).fill("");
  currentPlayer = "X";
  isGameActive = true;
  updateStatus(`Player X's Turn`);

  for (let i = 0; i < currentGrid * currentGrid; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", () => handleMove(i));
    gameBoard.appendChild(cell);
  }
}

function handleMove(index) {
  if (boardState[index] !== "" || !isGameActive) return;

  makeMove(index, currentPlayer);

  if (isGameActive && gameMode === "pvc" && currentPlayer === "O") {
    setTimeout(computerMove, 500);
  }
}

function makeMove(index, player) {
  boardState[index] = player;
  const cell = document.querySelector(`.cell[data-index="${index}"]`);
  if (cell) {
    cell.innerText = player;
    cell.classList.add(player.toLowerCase());
  }

  const winningIndices = checkWin(player);

  if (winningIndices) {
    drawWinningLine(winningIndices, player);
    endGame(player);
  } else if (boardState.every((cell) => cell !== "")) {
    endGame("draw");
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus(`Player ${currentPlayer}'s Turn`);
  }
}

function drawWinningLine(indices, player) {
  const svg = document.getElementById("winning-line-svg");
  if (!svg || !gameBoard) return;

  const boardRect = gameBoard.getBoundingClientRect();

  const startCell = document
    .querySelector(`.cell[data-index="${indices[0]}"]`)
    ?.getBoundingClientRect();
  const endCell = document
    .querySelector(`.cell[data-index="${indices[indices.length - 1]}"]`)
    ?.getBoundingClientRect();

  if (!startCell || !endCell) return;

  const x1 = startCell.left - boardRect.left + startCell.width / 2;
  const y1 = startCell.top - boardRect.top + startCell.height / 2;
  const x2 = endCell.left - boardRect.left + endCell.width / 2;
  const y2 = endCell.top - boardRect.top + endCell.height / 2;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.classList.add("winning-line");
  line.style.stroke = player === "X" ? "var(--neon-x)" : "var(--neon-o)";
  line.style.color = player === "X" ? "var(--neon-x)" : "var(--neon-o)";

  svg.appendChild(line);
}

function computerMove() {
  if (!isGameActive) return;
  const available = boardState
    .map((v, i) => (v === "" ? i : null))
    .filter((v) => v !== null);
  if (available.length > 0) {
    const random = available[Math.floor(Math.random() * available.length)];
    makeMove(random, "O");
  }
}

function checkWin(player) {
  const size = currentGrid;
  const winLength = size === 3 ? 3 : 4;
  const directions = [
    { r: 0, c: 1 },
    { r: 1, c: 0 },
    { r: 1, c: 1 },
    { r: 1, c: -1 },
  ];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (boardState[r * size + c] !== player) continue;
      for (let { r: dr, c: dc } of directions) {
        let indices = [];
        for (let i = 0; i < winLength; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (
            nr >= 0 &&
            nr < size &&
            nc >= 0 &&
            nc < size &&
            boardState[nr * size + nc] === player
          ) {
            indices.push(nr * size + nc);
          } else break;
        }
        if (indices.length === winLength) return indices;
      }
    }
  }
  return null;
}

function updateStatus(msg) {
  if (statusDisplay) statusDisplay.innerText = msg;
}

function endGame(winner) {
  isGameActive = false;
  if (winner === "draw") {
    updateStatus("It's a Tie!");
  } else {
    updateStatus(`Player ${winner} Wins!`);
    if (winner === "X") scoreX++;
    else scoreO++;
    if (scoreXDisplay) scoreXDisplay.innerText = scoreX;
    if (scoreODisplay) scoreODisplay.innerText = scoreO;

    if (typeof confetti !== "undefined") {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors:
          winner === "X" ? ["#ff007a", "#ffffff"] : ["#00dfd8", "#ffffff"],
      });
    }
  }
}

function resetBoard() {
  initBoard();
}

// --- NEW AUDIO SYSTEM (FILE BASED) ---

const sounds = {
  X: new Audio("x.wav"),
  O: new Audio("o.wav"),
  win: new Audio("win.mp3"),
};

/**
 * Plays the specified sound file
 * @param {string} key - 'X', 'O', or 'win'
 */
function playEffect(key) {
  if (sounds[key]) {
    // Reset sound to beginning in case of rapid clicks
    sounds[key].currentTime = 0;
    sounds[key].play().catch((error) => {
      console.log(
        "Audio play blocked by browser. Interact with the page first.",
      );
    });
  }
}

// --- INTEGRATION INTO GAME LOGIC ---

// 1. Update makeMove to play X or O sounds
const originalMakeMove = makeMove;
makeMove = function (index, player) {
  playEffect(player);
  originalMakeMove(index, player);
};

// 2. Update endGame to play the win sound
const originalEndGame = endGame;
endGame = function (winner) {
  if (winner !== "draw") {
    playEffect("win");
  }
  originalEndGame(winner);
};
