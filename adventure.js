window.addEventListener('DOMContentLoaded', () => {
  const choices = ['rock', 'paper', 'scissors'];
  let playerScore = 0;
  let computerScore = 0;
  let ties = 0;
  let totalRounds = 0;
  let currentLevel = 1; // Track the current level
  let levelDifficulty = 1; // Difficulty increases with each level
  let roundTimer;

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

  let isMusicPlaying = false;

  const chatBubble = document.getElementById('chat-bubble');  // Chat bubble element
  const computerChoiceImage = document.getElementById('computer-choice-image');  // Computer choice image element
  const roundTimerElement = document.getElementById('round-timer'); // Timer element

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

  musicButton.addEventListener('click', () => {
    if (isMusicPlaying) {
      bgMusic.pause();
      musicIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
      isMusicPlaying = false;
    } else {
      bgMusic.play().catch((error) => console.error('Playback error:', error));
      musicIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
      isMusicPlaying = true;
    }
  });

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

  function getComputerChoice(streak) {
    const isHarder = streak >= levelDifficulty;
    return isHarder ? choices[Math.floor(Math.random() * choices.length)] : choices[Math.floor(Math.random() * choices.length)];
  }

  function playRound(playerSelection, computerSelection) {
    totalRounds++;
    let result;
    if (playerSelection === computerSelection) {
      ties++;
      result = "It's a tie!";
      tieSound.play();
    } else if (
      (playerSelection === 'rock' && computerSelection === 'scissors') ||
      (playerSelection === 'paper' && computerSelection === 'rock') ||
      (playerSelection === 'scissors' && computerSelection === 'paper')
    ) {
      playerScore++;
      result = "You win!";
      winSound.play();
    } else {
      computerScore++;
      result = "You lose!";
      loseSound.play();
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
    let insightText = '';
    let delayTime = 5000;

    const responses = {
      win: [
        `Nice one! ${playerSelection} was a brilliant choice. Keep it up! 👏`,
        `You got me good this time, ${playerSelection}! This round is yours!`,
        `Well played, I didn't see that coming! Your ${playerSelection} is unstoppable! 🔥`
      ],
      lose: [
        `Oof, that ${computerSelection} really got me! Better luck next time! 😔`,
        `I had a feeling I would win with ${computerSelection}, but you gave me a good fight! 😅`,
        `Tough luck! I pulled off ${computerSelection}, but you’ll bounce back! 💪`
      ],
      tie: [
        `A tie! We both went with ${playerSelection}. Looks like we’re evenly matched! 🤝`,
        `That was a close one, but we both picked ${playerSelection}. Can we break the tie next time? 🤔`,
        `We both chose ${playerSelection}. This round goes to both of us! 🤞`
      ]
    };

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

    delayTime = insightText.length * 90;

    setTimeout(() => {
      chatBubble.style.display = 'none';
    }, delayTime);
  }

  function startRoundTimer() {
    let timeLeft = 10;
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
      }
    }, 1000);
  }

  playerChoiceImages.forEach(image => {
    image.addEventListener('click', (event) => {
      const playerSelection = event.target.getAttribute('data-choice');
      const computerSelection = getComputerChoice(currentLevel);

      startRoundTimer();

      setTimeout(() => {
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
        }, 500);
      }, 1000);
      
      // Check if the game has reached 10 wins and display victory or defeat
      if (playerScore === 10) {
        setTimeout(() => {
          alert("You win the game!");
          resetGame();
        }, 1000);
      } else if (computerScore === 10) {
        setTimeout(() => {
          alert("You lose! Game Over.");
          resetGame();
        }, 1000);
      }

      // Update the level after every 10 rounds
      if (totalRounds % 10 === 0 && totalRounds !== 0) {
        currentLevel++;
        levelDifficulty++;
        alert(`Level Up! Now you're on Level ${currentLevel}. The game is getting harder!`);
        resetRound(); // Reset score and history when level is increased
      }
    });
  });

  // Reset the game after a win or loss
  function resetGame() {
    playerScore = 0;
    computerScore = 0;
    ties = 0;
    totalRounds = 0;
    currentLevel = 1;
    levelDifficulty = 1;
    updateScoreboard();
    updateHistory('Game reset after victory/defeat', '', '');
    winChart.data.datasets[0].data = [0, 0, 0];
    winChart.update();
  }

  // Reset score and history after level change
  function resetRound() {
    ties = 0;
    totalRounds = 0;
    updateScoreboard();
    updateHistory('Round reset for level up', '', '');
    winChart.data.datasets[0].data = [0, 0, 0];
    winChart.update();
  }

  // Show the history of the game
  historyButton.addEventListener('click', () => {
    gameHistoryDiv.style.display = gameHistoryDiv.style.display === 'block' ? 'none' : 'block';
  });

  // Reset the game data
  resetButton.addEventListener('click', resetGame);
});
      