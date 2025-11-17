// ---------------------
// GAME LOGIC + UI
// ---------------------

let userScore = 0;
let compScore = 0;
let soundEnabled = true;

const userScoreEl = document.getElementById("user-score");
const compScoreEl = document.getElementById("comp-score");
const messageEl = document.getElementById("message");
const choiceBtns = Array.from(document.querySelectorAll(".choice-btn"));
const youPickEl = document.getElementById("you-pick");
const compPickEl = document.getElementById("comp-pick");
const resetBtn = document.getElementById("resetBtn");

// ---------------------
// SOUND EFFECTS
// ---------------------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration = 0.08, type = "sine", vol = 0.06) {
  if (!soundEnabled) return; // 🔇 stop sound if muted

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
function launchConfetti() {
  const duration = 1.2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      spread: 80,
      startVelocity: 40,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2,
      },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
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
const playGame = (userChoice) => {
  const compChoice = genCompChoice();

  // Clear previous highlights
  choices.forEach((choice) =>
    choice.classList.remove("win-glow", "lose-glow", "draw-glow")
  );

  if (userChoice === compChoice) {
    showWinner(null); // Draw
    document.getElementById(userChoice).classList.add("draw-glow");
  } else if (
    (userChoice === "rock" && compChoice === "scissors") ||
    (userChoice === "paper" && compChoice === "rock") ||
    (userChoice === "scissors" && compChoice === "paper")
  ) {
    showWinner(true); // User wins
    document.getElementById(userChoice).classList.add("win-glow");
  } else {
    showWinner(false); // Computer wins
    document.getElementById(userChoice).classList.add("lose-glow");
  }
};

// ---------------------
// COMPUTER CHOICE
// ---------------------
function genCompChoice() {
  return ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
}

const pretty = {
  rock: "✊ Rock",
  paper: "✋ Paper",
  scissors: "✌️ Scissors",
};

// ---------------------
// UI MESSAGE
// ---------------------
function setMessage(text, variant) {
  messageEl.textContent = text;
  messageEl.classList.remove("msg-win", "msg-lose", "msg-draw");

  if (variant === "win") messageEl.classList.add("msg-win");
  if (variant === "lose") messageEl.classList.add("msg-lose");
  if (variant === "draw") messageEl.classList.add("msg-draw");
}

// ---------------------
// SCORE UPDATE
// ---------------------
function updateScores() {
  userScoreEl.textContent = userScore;
  compScoreEl.textContent = compScore;
}

// ---------------------
// RESULT ANIMATION
// ---------------------
function showResultAnimation(userChoice, result) {
  const btn = document.querySelector(
    `.choice-btn[data-choice="${userChoice}"]`
  );

  btn.classList.remove("win", "lose", "draw");

  if (result === "win") btn.classList.add("win");
  else if (result === "lose") btn.classList.add("lose");
  else btn.classList.add("draw");

  setTimeout(() => {
    btn.classList.remove("win", "lose", "draw");
  }, 700);
}

// ---------------------
// GAME ROUND
// ---------------------
function playRound(userChoice) {
  if (audioCtx.state === "suspended") audioCtx.resume();

  playClick();

  // highlight selected
  choiceBtns.forEach((btn) => btn.classList.remove("selected"));
  const selectedBtn = choiceBtns.find((b) => b.dataset.choice === userChoice);
  selectedBtn.classList.add("selected");

  const compChoice = genCompChoice();

  youPickEl.textContent = pretty[userChoice];
  compPickEl.textContent = pretty[compChoice];

  // DRAW
  if (userChoice === compChoice) {
    setMessage("Draw! Try again", "draw");
    playTone(440, 0.08, "sine", 0.04);

    showResultAnimation(userChoice, "draw");
    return;
  }

  // WIN / LOSE LOGIC
  let userWins =
    (userChoice === "rock" && compChoice === "scissors") ||
    (userChoice === "paper" && compChoice === "rock") ||
    (userChoice === "scissors" && compChoice === "paper");

  if (userWins) {
    userScore++;
    updateScores();
    setMessage("You Win! 🎉", "win");
    playWin();
    launchConfetti();

    showResultAnimation(userChoice, "win");
  } else {
    compScore++;
    updateScores();
    setMessage("You Lose 😕", "lose");
    playLose();

    showResultAnimation(userChoice, "lose");
  }
}

// ---------------------
// EVENT LISTENERS
// ---------------------
choiceBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    playRound(btn.dataset.choice);
  });
});

// RESET
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
const soundToggle = document.getElementById("soundToggle");

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  if (soundEnabled) {
    soundToggle.textContent = "🔊 Sound On";
    soundToggle.classList.remove("off");
  } else {
    soundToggle.textContent = "🔇 Sound Off";
    soundToggle.classList.add("off");
  }
});
