window.addEventListener('DOMContentLoaded', () => {
  const choices = ['rock', 'paper', 'scissors'];
  let playerScore = 0;
  let computerScore = 0;
  let ties = 0;
  let totalRounds = 0;
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

//Image Placeholder 
computerChoiceImage.onerror = () => {
  computerChoiceImage.src = 'img/default.jpg';
};

  // Initialize Chart.js
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

  // Toggle Music
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

  // Ensure music playback on user interaction
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

  // Stop music when leaving the page
  window.addEventListener('beforeunload', () => {
    bgMusic.pause();
  });
  

  // Game logic
function getComputerChoice(streak) {
  if (streak > 3) {
    // Make computer smarter
    return choices[Math.floor(Math.random() * choices.length)];
  } else {
    // Random choice
    return choices[Math.floor(Math.random() * choices.length)];
  }
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

  // AI Insight Logic (Casual tone with Tagalog responses added)
  function showOpponentInsight(result, playerSelection, computerSelection) {
    let insightText = '';
    let delayTime = 5000; // Default delay time (in milliseconds)

    const responses = {
      win: [
        `Well played, champ! You totally nailed it with ${playerSelection}. Keep it up!`,
        `Nice one! ${playerSelection} is the perfect move! You're on fire! 🔥`,
        `Oof, I wasn't ready for that! You crushed me with ${playerSelection}! 👊`,
        `Oh wow, you got me good! I was thinking of going with ${computerSelection}, but you beat me to it!`,
        `Wow, amazing move! ${playerSelection} just knocked me out! Keep going!`,
        `Looks like I'm no match for you. I was planning ${computerSelection}, but you beat me fair and square!`,
        `Ang galing mo! ${playerSelection} was the perfect move! How'd you do that? 😎`,
        `Wow, hindi ko inaasahan yan! You really outsmarted me with ${playerSelection}! 🎉`,
        `Sobrang bilis mo! ${playerSelection} totally crushed me! Di ko nasunod! 😅`
      ],
      lose: [
        `Aww, tough luck! I went with ${computerSelection} this time. Better luck next round! 😔`,
        `Oops, I saw that coming! I knew I had the upper hand with ${computerSelection}. Don't worry, you'll get it next time!`,
        `You almost had it! I pulled off ${computerSelection}, HAHAHA 😝`,
        `Looks like I got lucky this time. ${computerSelection} was a strong choice, huh?`,
        `Haha, gotcha! ${computerSelection} beats ${playerSelection} every time! Try again! 😏`,
        `You gave it your best shot, but ${computerSelection} was too strong this time.`,
        `Hindi pa ngayon! ${computerSelection} was just a little better this round. Pero laban pa! 💪`,
        `Teka lang! ${computerSelection} lang pala ang tumama, next time, ako! 😜`,
        `Aba, natukso ako! ${computerSelection} wins this round! Pero susunod, ikaw na!`
      ],
      tie: [
        `It's a draw! We both went with ${playerSelection}. I guess we're on the same wavelength! 🤔`,
        `Well, well... We’re evenly matched, huh? ${playerSelection} for both of us. Nice! 🤝`,
        `Madaya kang Kupal ka, ${playerSelection}! We’re too much alike.`,
        `Hmm, a tie! I can’t say I’m surprised, we both had the same move. Let’s try again!`,
        `We're both too good! This round is a tie. Let’s see who wins the next one! 🔥`,
        `A perfect match! We both choose ${playerSelection}. Time for the tiebreaker!`,
        `Bilog na naman! Pareho tayo ng pinili, baka Gin na ang susunod! 😎`,
        `Pareho lang tayo! Wala pang panalo, pero malay mo panalo na ako sa puso mo👀`,
        `Pati tayo pareho lang! Pero sure ako, sa susunod ako na gusto mo`
      ]
    };

    // Select appropriate response based on the result of the round
    if (result === "You win!") {
      insightText = responses.win[Math.floor(Math.random() * responses.win.length)];
    } else if (result === "You lose!") {
      insightText = responses.lose[Math.floor(Math.random() * responses.lose.length)];
    } else {
      insightText = responses.tie[Math.floor(Math.random() * responses.tie.length)];
    }

    // Display opponent's response in the chat bubble
    chatBubble.textContent = `Opponent: "${insightText}"`;
    chatBubble.style.display = 'block';
    
    chatBubble.classList.add('fade-in');
setTimeout(() => chatBubble.classList.remove('fade-in'), 500);

    // Adjust delay time based on the length of the response for better readability
    delayTime = insightText.length * 90; // Add 90ms per character (longer reading time for longer text)

    // Hide the chat bubble after the delay
    setTimeout(() => {
      chatBubble.style.display = 'none';
    }, delayTime);
  }

  // Round timer logic
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
      const computerSelection = getComputerChoice();

      // Start the timer at the beginning of the round
      startRoundTimer();

      setTimeout(() => {
        // Display the placeholder bot image before showing the actual choice
        computerChoiceImage.src = 'img/bot.jpg';

        // Add animation or delay here to simulate thinking
        setTimeout(() => {
          // After the delay, reveal the actual computer choice
          computerChoiceImage.src = `img/${computerSelection}2.jpg`;
          const result = playRound(playerSelection, computerSelection);
          resultDiv.textContent = result;
          updateScoreboard();
          updateHistory(result, playerSelection, computerSelection);
          showOpponentInsight(result, playerSelection, computerSelection);  // Show opponent insight after each round
          winChart.data.datasets[0].data = [playerScore, computerScore, ties];
          winChart.update();
        }, 500); // Delay before revealing the computer's choice (0.5 second delay)

      }, 1000); // Total time before showing the computer’s actual choice (1 second delay)

      chooseSound.play();
    });
  });

  // Reset functionality
  resetButton.addEventListener('click', () => {
  clearInterval(roundTimer);
  roundTimerElement.textContent = '';
});
  resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game?')) {
      playerScore = 0;
      computerScore = 0;
      ties = 0;
      totalRounds = 0;
      updateScoreboard();
      historyList.innerHTML = '';
      resultDiv.textContent = '';
      computerChoiceImage.src = 'img/bot.jpg';  // Show placeholder image on reset
      gameHistoryDiv.style.display = 'none';
      winChart.data.datasets[0].data = [0, 0, 0];
      winChart.update();
    }
  });

  // Toggle history visibility
  historyButton.addEventListener('click', () => {
    gameHistoryDiv.style.display = gameHistoryDiv.style.display === 'none' ? 'block' : 'none';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const backToHomepageButton = document.getElementById('back-to-homepage');
  if (backToHomepageButton) {
    backToHomepageButton.addEventListener('click', () => {
      window.location.href = 'index.html?fromGamePage=true';  // Redirect to index.html with the parameter
    });
  } else {
    console.error("Back to Homepage button not found!");
  }
});