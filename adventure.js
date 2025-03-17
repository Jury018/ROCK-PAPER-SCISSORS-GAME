window.addEventListener('DOMContentLoaded', () => {
  const choices = ['rock', 'paper', 'scissors'];
  let playerScore = 0;
  let computerScore = 0;
  let ties = 0;
  let totalRounds = 0;
  let currentLevel = 1; // Track the current level
  let levelDifficulty = 3; // Difficulty increases with each level
  let roundTimer;
  let isPlayerChoiceAllowed = true; // Remove duplicate declaration
  let debounceTimeout; // Declare debounceTimeout

  const playerChoiceImages = document.querySelectorAll('#player-choices img');
  const resultDiv = document.getElementById('result');
  const winsSpan = document.getElementById('wins');
  const losesSpan = document.getElementById('loses');
  const tiesSpan = document.getElementById('ties');
  const totalRoundsSpan = document.getElementById('total-rounds');
  const historyButton = document.getElementById('history-button');
  const resetButton = document.getElementById('reset-button');
  const gameHistoryDiv = document.getElementById('game-history');
  const historyList = document.getElementById('history-list');
  const ctx = document.getElementById('win-chart').getContext('2d');

  const bgMusic = document.getElementById('bg-music');
  const musicButton = document.getElementById('music-button');
  const musicIcon = document.getElementById('music-icon');
  const chooseSound = document.getElementById('choose-sound');
  const winSound = document.getElementById('win-sound');
  const loseSound = document.getElementById('lose-sound');
  const tieSound = document.getElementById('tie-sound');

  const modal = document.getElementById('game-modal');
  const modalMessage = document.getElementById('modal-message');
  const nextLevelButton = document.getElementById('next-level-button');
  const restartLevelButton = document.getElementById('restart-level-button');
  const closeButton = document.querySelector('.close-button');

  const chatBubble = document.getElementById('chat-bubble');  // Chat bubble element
  const computerChoiceImage = document.getElementById('computer-choice-image');  // Computer choice image element
  const roundTimerElement = document.getElementById('round-timer'); // Timer element

  function showModal(message, showNextLevelButton = true) {
    modalMessage.textContent = `${message} (Level ${currentLevel})`;
    nextLevelButton.style.display = showNextLevelButton ? 'inline-block' : 'none';
    modal.style.display = 'block';
  }

  function closeModal() {
    modal.style.display = 'none';
    resetRound(); // Reset score and history when closing the modal
    updateScoreboard(); // Ensure the scoreboard updates correctly
    clearInterval(roundTimer); // Clear the timer
    roundTimerElement.textContent = ''; // Reset the timer display
  }

  closeButton.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  nextLevelButton.addEventListener('click', () => {
    closeModal();
    currentLevel++;
    levelDifficulty++;
    alert(`Level Up! Now you're on Level ${currentLevel}. The game is getting harder!`);
    resetRound(); // Reset score and history when level is increased
    updateScoreboard(); // Ensure the scoreboard updates correctly
  });

  restartLevelButton.addEventListener('click', () => {
    closeModal();
    resetRound(); // Reset score and history when restarting the level
    updateScoreboard(); // Ensure the scoreboard updates correctly
    clearInterval(roundTimer); // Clear the timer
    roundTimerElement.textContent = ''; // Reset the timer display
  });

  function handlePlayerChoice(playerSelection) {
    if (!isPlayerChoiceAllowed) return; // Prevent multiple clicks
    isPlayerChoiceAllowed = false; // Disable further clicks
  
    clearTimeout(debounceTimeout); // Clear any existing debounce timeout
    debounceTimeout = setTimeout(() => {
      isPlayerChoiceAllowed = true; // Re-enable clicks after debounce period
    }, 1000); // Set debounce period to 1 second
  
    const computerSelection = getComputerChoice(playerSelection);
    startRoundTimer();
  
    // Show the bot image before revealing the bot's choice
    computerChoiceImage.src = 'img/bot.jpg';
  
    setTimeout(() => {
      computerChoiceImage.src = `img/${computerSelection}2.jpg`;
      const result = playRound(playerSelection, computerSelection);
      resultDiv.textContent = result;
      updateScoreboard();
      updateHistory(result, playerSelection, computerSelection);
      showOpponentInsight(result, playerSelection, computerSelection);
      winChart.data.datasets[0].data = [playerScore, computerScore, ties];
      winChart.update();
  
      // Check if the game has reached 10 wins or losses and display victory or defeat
      if (playerScore === 10) {
        setTimeout(() => {
          showModal("You win the game! Proceed to the next level.");
          isPlayerChoiceAllowed = true; // Re-enable clicks after modal
        }, 1000);
      } else if (computerScore === 10) {
        setTimeout(() => {
          showModal("You lose! Restart the current level.", false);
          isPlayerChoiceAllowed = true; // Re-enable clicks after modal
        }, 1000);
      } else {
        isPlayerChoiceAllowed = true; // Re-enable clicks after round
      }
    }, 1000);
  }
  
  playerChoiceImages.forEach(image => {
    image.addEventListener('click', (event) => {
      const playerSelection = event.target.getAttribute('data-choice');
      handlePlayerChoice(playerSelection);
    });
  });

  // Reset the game after a win or loss
function resetGame() {
  playerScore = 0;
  computerScore = 0;
  ties = 0;
  totalRounds = 0;
  currentLevel = 1;
  levelDifficulty = 3;
  updateScoreboard();
  historyList.innerHTML = ''; // Clear history
  winChart.data.datasets[0].data = [0, 0, 0];
  winChart.update();
  clearInterval(roundTimer); // Clear the timer
  roundTimerElement.textContent = ''; // Reset the timer display
}

// Reset score and history after level change
function resetRound() {
  playerScore = 0;
  computerScore = 0;
  ties = 0;
  totalRounds = 0;
  updateScoreboard();
  historyList.innerHTML = ''; // Clear history
  winChart.data.datasets[0].data = [0, 0, 0];
  winChart.update();
  clearInterval(roundTimer); // Clear the timer
  roundTimerElement.textContent = ''; // Reset the timer display
}

  // Show the history of the game
  historyButton.addEventListener('click', () => {
    gameHistoryDiv.style.display = gameHistoryDiv.style.display === 'block' ? 'none' : 'block';
  });

  // Reset the game data
  resetButton.addEventListener('click', resetGame);

  let isMusicPlaying = false;

  document.addEventListener('keydown', (event) => {
    const keyMap = { R: 'rock', P: 'paper', S: 'scissors' };
    const playerSelection = keyMap[event.key.toUpperCase()];
    if (playerSelection) {
      document.querySelector(`[data-choice="${playerSelection}"]`).click();
    }
  });

  computerChoiceImage.onerror = () => {
    computerChoiceImage.src = 'img/default.jpg';
  };

  const winChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Player Wins', 'Computer Wins', 'Ties'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#4caf50', '#f44336', '#ffc107'],
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        }
      }
    }
  });

  musicButton.addEventListener('click', toggleMusic);

  function toggleMusic() {
    if (isMusicPlaying) {
      bgMusic.pause();
      musicIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
    } else {
      bgMusic.play().catch((error) => console.error('Playback error:', error));
      musicIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
    }
    isMusicPlaying = !isMusicPlaying;
  }

  function playSound(sound) {
    try {
      sound.play();
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  [chooseSound, winSound, loseSound, tieSound].forEach((sound) => sound.load());
  window.addEventListener('click', () => {
    if (!isMusicPlaying) {
      bgMusic.play().catch((error) => console.error('Playback error:', error));
      isMusicPlaying = true;
      musicIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
    }
  }, { once: true });

  window.addEventListener('beforeunload', () => {
    bgMusic.pause();
  });

  function getComputerChoice(playerSelection) {
    // Increase difficulty by making the AI smarter as levels increase
    if (Math.random() < 0.5 + (currentLevel * 0.05)) {
      // AI makes a smarter choice
      if (playerScore > computerScore) {
        return choices[(choices.indexOf(playerSelection) + 1) % choices.length];
      } else {
        return choices[(choices.indexOf(playerSelection) + 2) % choices.length];
      }
    } else {
      // AI makes a random choice
      return choices[Math.floor(Math.random() * choices.length)];
    }
  }

  function playRound(playerSelection, computerSelection) {
    totalRounds++;
    let result;
    if (playerSelection === computerSelection) {
      ties++;
      result = "It's a tie!";
      playSound(tieSound);
    } else if (
      (playerSelection === 'rock' && computerSelection === 'scissors') ||
      (playerSelection === 'paper' && computerSelection === 'rock') ||
      (playerSelection === 'scissors' && computerSelection === 'paper')
    ) {
      playerScore++;
      result = "You win!";
      playSound(winSound);
    } else {
      computerScore++;
      result = "You lose!";
      playSound(loseSound);
    }
    return result;
  }

  function updateScoreboard() {
    winsSpan.textContent = playerScore;
    losesSpan.textContent = computerScore;
    tiesSpan.textContent = ties;
    totalRoundsSpan.textContent = totalRounds;
  }

  function updateHistory(result, playerSelection, computerSelection) {
    const historyItem = document.createElement('li');
    historyItem.textContent = `Round ${totalRounds}: You chose ${playerSelection}, Computer chose ${computerSelection} - ${result}`;
    historyList.appendChild(historyItem);
  }

  function showOpponentInsight(result, playerSelection, computerSelection) {
    const responses = {
      win: [
        `Nice one! ${playerSelection} was a brilliant choice. Keep it up! 👏`,
        `You got me good this time, ${playerSelection}! This round is yours!`,
        `Well played, I didn't see that coming! Your ${playerSelection} is unstoppable! 🔥`,
        `Ang galing mo! ${playerSelection} ang tamang choice. Tuloy mo lang! 👏`,
        `Nadale mo ako ngayon, ${playerSelection}! Sa'yo ang round na ito!`,
        `Magaling! Hindi ko inasahan ang ${playerSelection} mo! 🔥`,
        `Panalo ka! ${playerSelection} ang the best choice!`,
        `Wow! ${playerSelection} ang lupet!`,
        `Astig! ${playerSelection} ang nagdala sa'yo ng panalo!`
      ],
      lose: [
        `Oof, that ${computerSelection} really got me! Better luck next time! 😔`,
        `I had a feeling I would win with ${computerSelection}, but you gave me a good fight! 😅`,
        `Tough luck! I pulled off ${computerSelection}, but you’ll bounce back! 💪`,
        `Aray! ${computerSelection} ang tumalo sa'kin! Mas swerte ka next time! 😔`,
        `Alam kong mananalo ako sa ${computerSelection}, pero magaling ka rin! 😅`,
        `Malas lang! ${computerSelection} ang nagpanalo sa'kin, pero babawi ka! 💪`,
        `Naku, natalo ka ng ${computerSelection} ko!`,
        `Buti na lang ${computerSelection} ang pinili ko!`,
        `Maswerte ako sa ${computerSelection} ko!`
      ],
      tie: [
        `A tie! We both went with ${playerSelection}. Looks like we’re evenly matched! 🤝`,
        `That was a close one, but we both picked ${playerSelection}. Can we break the tie next time? 🤔`,
        `We both chose ${playerSelection}. This round goes to both of us! 🤞`,
        `Tabla tayo! Pareho tayong pumili ng ${playerSelection}. Mukhang patas tayo! 🤝`,
        `Ang lapit nun, pero pareho tayong ${playerSelection}. Kaya ba nating basagin ang tie next time? 🤔`,
        `Pareho tayong pumili ng ${playerSelection}. Pantay tayo sa round na ito! 🤞`,
        `Walang nanalo, pareho tayong ${playerSelection}!`,
        `Tabla! Pareho tayong magaling!`,
        `Pantay tayo! Pareho tayong ${playerSelection}!`
      ]
    };

    let insightText = '';
    if (result === "You win!") {
      insightText = responses.win[Math.floor(Math.random() * responses.win.length)];
    } else if (result === "You lose!") {
      insightText = responses.lose[Math.floor(Math.random() * responses.lose.length)];
    } else {
      insightText = responses.tie[Math.floor(Math.random() * responses.tie.length)];
    }

    chatBubble.textContent = `Opponent: "${insightText}"`;
    chatBubble.style.display = 'block';
    chatBubble.classList.add('fade-in');
    setTimeout(() => chatBubble.classList.remove('fade-in'), 500);

    const delayTime = insightText.length * 150;

    setTimeout(() => {
      chatBubble.style.display = 'none';
    }, delayTime);
  }

  function startRoundTimer() {
    let timeLeft = 10; // Set a fixed time for each round
    roundTimerElement.textContent = `Time Left: ${timeLeft}s`;
  
    if (roundTimer) {
      clearInterval(roundTimer);
    }
  
    roundTimer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        roundTimerElement.textContent = `Time Left: ${timeLeft}s`;
      } else {
        clearInterval(roundTimer);
        roundTimerElement.textContent = 'Round Over!';
        computerScore++; // Count as a loss for the player
        updateScoreboard();
        showModal("Time's up! You lose this round.", false);
      }
    }, 1000);
  }
});
