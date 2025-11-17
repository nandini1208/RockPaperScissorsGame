// ---------------------
// GAME LOGIC + UI
// ---------------------

let userScore = 0;
let compScore = 0;

const userScoreEl = document.getElementById("user-score");
const compScoreEl = document.getElementById("comp-score");
const messageEl = document.getElementById("message");
const choiceBtns = Array.from(document.querySelectorAll(".choice-btn"));
const youPickEl = document.getElementById("you-pick");
const compPickEl = document.getElementById("comp-pick");
const resetBtn = document.getElementById("resetBtn");

// Audio context for sound effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration = 0.08, type = "sine", vol = 0.06) {
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playClick() {
  playTone(880, 0.06, "sine", 0.04);
}
function playWin() {
  playTone(660, 0.12, "sine", 0.07);
  playTone(880, 0.05, "sine", 0.04);
}
function playLose() {
  playTone(220, 0.12, "sine", 0.07);
}

function genCompChoice() {
  return ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
}

const pretty = {
  rock: "✊ Rock",
  paper: "✋ Paper",
  scissors: "✌️ Scissors",
};

function setMessage(text, variant) {
  messageEl.textContent = text;
  messageEl.classList.remove("msg-win", "msg-lose", "msg-draw");

  if (variant === "win") messageEl.classList.add("msg-win");
  if (variant === "lose") messageEl.classList.add("msg-lose");
  if (variant === "draw") messageEl.classList.add("msg-draw");
}

function updateScores() {
  userScoreEl.textContent = userScore;
  compScoreEl.textContent = compScore;
}

function playRound(userChoice) {
  if (audioCtx.state === "suspended") audioCtx.resume();

  playClick();

  choiceBtns.forEach((btn) => btn.classList.remove("selected"));
  const selectedBtn = choiceBtns.find((b) => b.dataset.choice === userChoice);
  selectedBtn.classList.add("selected");

  const compChoice = genCompChoice();

  youPickEl.textContent = pretty[userChoice];
  compPickEl.textContent = pretty[compChoice];

  if (userChoice === compChoice) {
    setMessage("Draw! Try again", "draw");
    playTone(440, 0.08, "sine", 0.04);
    return;
  }

  let userWins =
    (userChoice === "rock" && compChoice === "scissors") ||
    (userChoice === "paper" && compChoice === "rock") ||
    (userChoice === "scissors" && compChoice === "paper");

  if (userWins) {
    userScore++;
    updateScores();
    setMessage("You Win! 🎉", "win");
    playWin();
  } else {
    compScore++;
    updateScores();
    setMessage("You Lose 😕", "lose");
    playLose();
  }
}

choiceBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    playRound(btn.dataset.choice);
  });
});

resetBtn.addEventListener("click", () => {
  userScore = 0;
  compScore = 0;
  updateScores();
  youPickEl.textContent = "—";
  compPickEl.textContent = "—";
  choiceBtns.forEach((b) => b.classList.remove("selected"));
  setMessage("Play your move");
  playTone(800, 0.06, "sine", 0.05);
});
