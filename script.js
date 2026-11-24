// ==========================================
// TIC TAC TOE PRO - ULTIMATE EDITION
// ==========================================

// ELEMENTS

const mainMenu = document.getElementById("mainMenu");
const gameScreen = document.getElementById("gameScreen");

const startBtn = document.getElementById("startBtn");
const menuBtn = document.getElementById("menuBtn");
const restartBtn = document.getElementById("restartBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const modeSelect = document.getElementById("modeSelect");
const sizeSelect = document.getElementById("sizeSelect");
const difficultySelect = document.getElementById("difficultySelect");
const symbolSelect = document.getElementById("symbolSelect");

const difficultySetting = document.getElementById("difficultySetting");
const symbolSetting = document.getElementById("symbolSetting");

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");

const resultElement = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const resultIcon = document.getElementById("resultIcon");

const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const drawsElement = document.getElementById("draws");

const playerXCard = document.getElementById("playerX");
const playerOCard = document.getElementById("playerO");

const labelX = document.getElementById("labelX");
const labelO = document.getElementById("labelO");

const soundBtn = document.getElementById("soundBtn");

// ==========================================
// GAME VARIABLES
// ==========================================

let size = 3;
let board = [];

let currentPlayer = "X";

let humanMark = "X";
let aiMark = "O";

let gameMode = "ai";
let difficulty = "impossible";

let gameOver = false;
let aiThinking = false;
let soundEnabled = true;

let winningLines = [];

let scores = {
    X: 0,
    O: 0,
    draws: 0
};

// ==========================================
// SOUND SYSTEM
// ==========================================

let audioContext = null;

function playSound(frequency = 400, duration = 0.1) {

    if (!soundEnabled) return;

    try {

        if (!audioContext) {
            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(
            0.12,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.start();
        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {
        console.log("Sound unavailable");
    }
}

soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    soundBtn.textContent = soundEnabled
        ? "🔊 SOUND"
        : "🔇 MUTED";

    if (soundEnabled) {
        playSound(650);
    }
});

// ==========================================
// MENU SYSTEM
// ==========================================

function updateMenuSettings() {

    const isAI = modeSelect.value === "ai";

    difficultySetting.style.display =
        isAI ? "block" : "none";

    symbolSetting.style.display =
        isAI ? "block" : "none";
}

modeSelect.addEventListener(
    "change",
    updateMenuSettings
);

function openMainMenu() {

    gameScreen.classList.add("hidden");
    mainMenu.classList.remove("hidden");

    playSound(400);
}

menuBtn.addEventListener(
    "click",
    openMainMenu
);

// ==========================================
// START GAME
// ==========================================

function startGame() {

    gameMode = modeSelect.value;

    size = Number(sizeSelect.value);

    difficulty = difficultySelect.value;

    humanMark = symbolSelect.value;

    aiMark = humanMark === "X" ? "O" : "X";

    currentPlayer = "X";

    gameOver = false;
    aiThinking = false;

    board = Array(size * size).fill("");

    createWinningLines();

    mainMenu.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    resultElement.classList.remove("show");

    boardElement.innerHTML = "";

    boardElement.classList.toggle(
        "four",
        size === 4
    );

    updateGameInformation();

    createBoard();

    updateScores();
    updatePlayerCards();
    updateStatus();

    playSound(550);

    // If the user selected O, the AI starts as X.

    if (gameMode === "ai" && currentPlayer === aiMark) {

        aiThinking = true;

        updateStatus();

        setTimeout(() => {
            if (!gameOver) {
                executeAIMove();
            }
        }, 500);
    }
}

startBtn.addEventListener(
    "click",
    startGame
);

// ==========================================
// GAME INFORMATION
// ==========================================

function updateGameInformation() {

    document.getElementById("modeDisplay").textContent =
        gameMode === "ai"
            ? "PLAYER VS AI"
            : "PLAYER VS PLAYER";

    const difficultyNames = {
        easy: "EASY",
        medium: "MEDIUM",
        hard: "HARD",
        expert: "EXPERT",
        impossible: "IMPOSSIBLE"
    };

    document.getElementById("difficultyDisplay").textContent =
        gameMode === "ai"
            ? difficultyNames[difficulty]
            : "LOCAL MODE";

    document.getElementById("boardDisplay").textContent =
        `${size} × ${size}`;

    document.getElementById("gameSubtitle").textContent =
        gameMode === "ai"
            ? `Defeat the ${difficultyNames[difficulty]} AI.`
            : "Challenge your friend!";

    labelX.textContent =
        gameMode === "local"
            ? "PLAYER X"
            : humanMark === "X"
                ? "YOU"
                : "AI PLAYER";

    labelO.textContent =
        gameMode === "local"
            ? "PLAYER O"
            : humanMark === "O"
                ? "YOU"
                : "AI PLAYER";
}

// ==========================================
// CREATE WINNING LINES
// ==========================================

function createWinningLines() {

    winningLines = [];

    // ROWS

    for (let row = 0; row < size; row++) {

        const line = [];

        for (let col = 0; col < size; col++) {
            line.push(row * size + col);
        }

        winningLines.push(line);
    }

    // COLUMNS

    for (let col = 0; col < size; col++) {

        const line = [];

        for (let row = 0; row < size; row++) {
            line.push(row * size + col);
        }

        winningLines.push(line);
    }

    // DIAGONALS

    const diagonal1 = [];
    const diagonal2 = [];

    for (let i = 0; i < size; i++) {

        diagonal1.push(i * size + i);

        diagonal2.push(
            i * size + (size - 1 - i)
        );
    }

    winningLines.push(diagonal1);
    winningLines.push(diagonal2);
}

// ==========================================
// CREATE BOARD
// ==========================================

function createBoard() {

    boardElement.innerHTML = "";

    for (let i = 0; i < board.length; i++) {

        const cell = document.createElement("button");

        cell.type = "button";
        cell.className = "cell";

        cell.dataset.index = i;

        cell.setAttribute(
            "aria-label",
            `Cell ${i + 1}`
        );

        cell.addEventListener("click", () => {
            handleMove(i);
        });

        boardElement.appendChild(cell);
    }
}

// ==========================================
// HANDLE PLAYER MOVE
// ==========================================

function handleMove(index) {

    if (gameOver || aiThinking) return;

    if (board[index] !== "") return;

    // Prevent the player from moving during AI's turn.

    if (
        gameMode === "ai" &&
        currentPlayer !== humanMark
    ) {
        return;
    }

    makeMove(index);

    if (gameOver) return;

    // AI TURN

    if (gameMode === "ai") {

        if (currentPlayer === aiMark) {

            aiThinking = true;

            updateStatus();

            setTimeout(() => {

                if (!gameOver) {
                    executeAIMove();
                }

            }, 450);
        }
    }
}

// ==========================================
// MAKE MOVE
// ==========================================

function makeMove(index) {

    if (gameOver || board[index] !== "") return;

    board[index] = currentPlayer;

    const cell = boardElement.children[index];

    cell.textContent = currentPlayer;

    cell.classList.add(
        "taken",
        currentPlayer.toLowerCase()
    );

    cell.disabled = true;

    playSound(
        currentPlayer === "X" ? 520 : 700
    );

    const winner = checkWinner(board);

    if (winner) {

        finishGame(
            winner.player,
            winner.line
        );

        return;
    }

    if (board.every(value => value !== "")) {

        finishGame("draw");

        return;
    }

    currentPlayer =
        currentPlayer === "X" ? "O" : "X";

    updateStatus();
    updatePlayerCards();
}

// ==========================================
// WIN CHECK
// ==========================================

function checkWinner(state) {

    for (const line of winningLines) {

        const first = state[line[0]];

        if (
            first !== "" &&
            line.every(index => state[index] === first)
        ) {

            return {
                player: first,
                line: line
            };
        }
    }

    return null;
}

// ==========================================
// FINISH GAME
// ==========================================

function finishGame(winner, line = []) {

    gameOver = true;
    aiThinking = false;

    if (winner === "draw") {

        scores.draws++;

        resultIcon.textContent = "🤝";

        resultTitle.textContent = "IT'S A DRAW!";

        resultTitle.style.color = "#00e5ff";

        resultText.textContent =
            "An incredible match! Nobody wins.";

        statusElement.innerHTML =
            '<span class="status-dot"></span> GAME DRAW';

        playSound(300, 0.3);

    } else {

        scores[winner]++;

        const humanWon =
            gameMode === "local" ||
            winner === humanMark;

        if (humanWon) {

            resultIcon.textContent = "🏆";

            resultTitle.textContent =
                gameMode === "ai"
                    ? "YOU WIN!"
                    : `PLAYER ${winner} WINS!`;

            resultTitle.style.color = "#36f5a0";

            resultText.textContent =
                gameMode === "ai"
                    ? "Amazing! You defeated the AI."
                    : "Congratulations on your victory!";

        } else {

            resultIcon.textContent = "🤖";

            resultTitle.textContent = "AI WINS!";

            resultTitle.style.color = "#b66cff";

            resultText.textContent =
                "The AI was stronger this time!";
        }

        statusElement.innerHTML =
            `<span class="status-dot"></span> ${winner} WINS!`;

        playSound(850, 0.3);

        line.forEach(index => {

            boardElement.children[index]
                .classList.add("winning");

        });
    }

    resultElement.classList.add("show");

    [...boardElement.children].forEach(cell => {
        cell.disabled = true;
    });

    updateScores();
    updatePlayerCards();
}

// ==========================================
// UPDATE UI
// ==========================================

function updateStatus() {

    if (gameOver) return;

    let message;

    if (aiThinking) {

        message = "AI IS THINKING...";

    } else if (
        gameMode === "ai" &&
        currentPlayer === aiMark
    ) {

        message = "AI'S TURN";

    } else {

        message = `PLAYER ${currentPlayer}'S TURN`;
    }

    statusElement.innerHTML =
        `<span class="status-dot"></span> ${message}`;
}

function updatePlayerCards() {

    playerXCard.classList.toggle(
        "active",
        !gameOver && currentPlayer === "X"
    );

    playerOCard.classList.toggle(
        "active",
        !gameOver && currentPlayer === "O"
    );
}

function updateScores() {

    scoreXElement.textContent = scores.X;

    scoreOElement.textContent = scores.O;

    drawsElement.textContent = scores.draws;
}

// ==========================================
// AI SYSTEM
// ==========================================

function executeAIMove() {

    if (gameOver) {
        aiThinking = false;
        return;
    }

    const move = getAIMove();

    aiThinking = false;

    if (move !== -1) {
        makeMove(move);
    }
}

function getAIMove() {

    switch (difficulty) {

        case "easy":
            return randomMove(board);

        case "medium":
            return tacticalMove(board);

        case "hard":
            return hardAIMove(board);

        case "expert":
            return expertAIMove(board);

        case "impossible":
            return impossibleAIMove(board);

        default:
            return randomMove(board);
    }
}

// ==========================================
// RANDOM AI
// ==========================================

function randomMove(state) {

    const empty = [];

    state.forEach((cell, index) => {

        if (cell === "") {
            empty.push(index);
        }

    });

    if (empty.length === 0) return -1;

    return empty[
        Math.floor(Math.random() * empty.length)
    ];
}

// ==========================================
// TACTICAL AI
// ==========================================

function findTacticalMove(state, player) {

    for (let i = 0; i < state.length; i++) {

        if (state[i] !== "") continue;

        state[i] = player;

        const result = checkWinner(state);

        state[i] = "";

        if (result) {
            return i;
        }
    }

    return -1;
}

function tacticalMove(state) {

    // Win if possible.

    let move = findTacticalMove(state, aiMark);

    if (move !== -1) return move;

    // Block the opponent.

    move = findTacticalMove(state, humanMark);

    if (move !== -1) return move;

    // Prefer center on 3x3.

    if (size === 3 && state[4] === "") {
        return 4;
    }

    return randomMove(state);
}

// ==========================================
// MINIMAX AI - 3x3
// ==========================================

function minimax(state, maximizing, depth) {

    const result = checkWinner(state);

    if (result) {

        if (result.player === aiMark) {
            return 10 - depth;
        }

        return depth - 10;
    }

    if (state.every(cell => cell !== "")) {
        return 0;
    }

    if (maximizing) {

        let best = -Infinity;

        for (let i = 0; i < state.length; i++) {

            if (state[i] !== "") continue;

            state[i] = aiMark;

            const score = minimax(
                state,
                false,
                depth + 1
            );

            state[i] = "";

            best = Math.max(best, score);
        }

        return best;

    } else {

        let best = Infinity;

        for (let i = 0; i < state.length; i++) {

            if (state[i] !== "") continue;

            state[i] = humanMark;

            const score = minimax(
                state,
                true,
                depth + 1
            );

            state[i] = "";

            best = Math.min(best, score);
        }

        return best;
    }
}

function minimaxMove(state) {

    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < state.length; i++) {

        if (state[i] !== "") continue;

        state[i] = aiMark;

        const score = minimax(
            state,
            false,
            0
        );

        state[i] = "";

        if (score > bestScore) {

            bestScore = score;

            bestMove = i;
        }
    }

    return bestMove;
}

// ==========================================
// 4x4 AI EVALUATION
// ==========================================

function evaluateBoard(state) {

    const result = checkWinner(state);

    if (result) {

        return result.player === aiMark
            ? 100000
            : -100000;
    }

    let score = 0;

    const weights = [0, 3, 15, 75, 500];

    for (const line of winningLines) {

        let aiCount = 0;
        let humanCount = 0;

        for (const index of line) {

            if (state[index] === aiMark) {
                aiCount++;
            }

            if (state[index] === humanMark) {
                humanCount++;
            }
        }

        // AI opportunities

        if (humanCount === 0) {
            score += weights[aiCount];
        }

        // Player threats

        if (aiCount === 0) {
            score -= weights[humanCount];
        }
    }

    return score;
}

// ==========================================
// MOVE ORDERING
// ==========================================

function orderedMoves(state, limit = 8) {

    const moves = [];

    for (let i = 0; i < state.length; i++) {

        if (state[i] !== "") continue;

        const row = Math.floor(i / size);

        const col = i % size;

        const centerDistance =
            Math.abs(row - (size - 1) / 2) +
            Math.abs(col - (size - 1) / 2);

        moves.push({
            index: i,
            priority: -centerDistance
        });
    }

    moves.sort((a, b) => {
        return b.priority - a.priority;
    });

    return moves
        .slice(0, limit)
        .map(move => move.index);
}

// ==========================================
// ALPHA-BETA SEARCH
// ==========================================

function searchAI(
    state,
    depth,
    alpha,
    beta,
    maximizing
) {

    const result = checkWinner(state);

    if (result) {

        if (result.player === aiMark) {
            return 100000 + depth;
        }

        return -100000 - depth;
    }

    if (
        depth === 0 ||
        state.every(cell => cell !== "")
    ) {
        return evaluateBoard(state);
    }

    const moves = orderedMoves(
        state,
        depth >= 5 ? 6 : 8
    );

    if (maximizing) {

        let best = -Infinity;

        for (const move of moves) {

            state[move] = aiMark;

            const score = searchAI(
                state,
                depth - 1,
                alpha,
                beta,
                false
            );

            state[move] = "";

            best = Math.max(best, score);

            alpha = Math.max(alpha, best);

            if (beta <= alpha) {
                break;
            }
        }

        return best;

    } else {

        let best = Infinity;

        for (const move of moves) {

            state[move] = humanMark;

            const score = searchAI(
                state,
                depth - 1,
                alpha,
                beta,
                true
            );

            state[move] = "";

            best = Math.min(best, score);

            beta = Math.min(beta, best);

            if (beta <= alpha) {
                break;
            }
        }

        return best;
    }
}

// ==========================================
// ADVANCED AI MOVE
// ==========================================

function advancedAIMove(state, depth) {

    // Win immediately.

    let move = findTacticalMove(state, aiMark);

    if (move !== -1) return move;

    // Block immediate loss.

    move = findTacticalMove(state, humanMark);

    if (move !== -1) return move;

    let bestScore = -Infinity;
    let bestMove = -1;

    const candidates = orderedMoves(
        state,
        depth >= 5 ? 6 : 8
    );

    for (const index of candidates) {

        state[index] = aiMark;

        const score = searchAI(
            state,
            depth - 1,
            -Infinity,
            Infinity,
            false
        );

        state[index] = "";

        if (score > bestScore) {

            bestScore = score;

            bestMove = index;
        }
    }

    return bestMove !== -1
        ? bestMove
        : randomMove(state);
}

// ==========================================
// HARD AI
// ==========================================

function hardAIMove(state) {

    if (size === 3) {
        return minimaxMove(state);
    }

    return advancedAIMove(state, 2);
}

// ==========================================
// EXPERT AI
// ==========================================

function expertAIMove(state) {

    if (size === 3) {
        return minimaxMove(state);
    }

    return advancedAIMove(state, 3);
}

// ==========================================
// IMPOSSIBLE AI
// ==========================================

function impossibleAIMove(state) {

    if (size === 3) {

        // Perfect minimax search.

        return minimaxMove(state);
    }

    // Deeper search for 4x4.

    return advancedAIMove(state, 5);
}

// ==========================================
// BUTTONS
// ==========================================

restartBtn.addEventListener("click", () => {

    playSound(500);

    // Restart without resetting scores.

    startGame();
});

resetScoreBtn.addEventListener("click", () => {

    scores = {
        X: 0,
        O: 0,
        draws: 0
    };

    updateScores();

    startGame();

    playSound(450);
});

// ==========================================
// INITIALIZATION
// ==========================================

updateMenuSettings();

updateScores();

console.log(
    "TIC TAC TOE PRO - ULTIMATE EDITION LOADED"
);
