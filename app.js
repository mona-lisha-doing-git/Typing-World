
const sessionWPMs = [];

// Wait until the DOM is fully loaded
document.getElementById("navElement1").addEventListener("click", function(e) {
    e.preventDefault();
    
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY <= 100) {
        alert("You are already at Home part of the Page!");
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

   /* From the nav options */
   document.getElementById("navElement2").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("analytics").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("navElement3").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("leaderboard").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("navElement4").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("account").scrollIntoView({ behavior: "smooth" });
});


  // Typing part
  const timerDisplay = document.getElementById('timer');
  const resetBtn = document.getElementById('resetBtn');
  const typebox = document.querySelector('.customTextarea');
  const textbox = document.getElementById('textbox');
  const speedDisplay = document.querySelector('#speed h2');
  const accuracyDisplay = document.querySelector('#accuracy h2');

  let timer = 30;
  let timerStarted = false;
  let timerInterval;

  let sampleText = '';
  let charTotal = 0;

  async function loadRandomSentence() {
    const response = await fetch('sentences.txt');
    const text = await response.text();
    const lines = text.trim().split('\n');
  
    let allWords = [];
    while (allWords.length < 100) {
      const line = lines[Math.floor(Math.random() * lines.length)];
      const words = line.trim().split(/\s+/);
      allWords.push(...words);
    }
  
    const finalText = allWords.slice(0, 100).join(' ');
    sampleText = finalText;
    charTotal = sampleText.length;
    textbox.innerText = sampleText;
  }
  
  function startTimer() {
    if (timerStarted) return;
    timerStarted = true;

    timerInterval = setInterval(() => {
      timer--;
      timerDisplay.textContent = `Time: ${timer}s`;

      if (timer <= 0) {
        clearInterval(timerInterval);
        timerDisplay.textContent = "Time's up!";
        typebox.disabled = true;
        calculateResults();
      }
    }, 1000);
  }

  function resetAll() {
    clearInterval(timerInterval);
    timer = 30;
    timerStarted = false;
    typebox.disabled = false;
    typebox.value = '';
    timerDisplay.textContent = 'Time: 30s';
    speedDisplay.textContent = '0 wpm';
    accuracyDisplay.textContent = '100%';
    loadRandomSentence();
  }

  function calculateResults() {
    const typed = typebox.value.trim().replace(/\s+/g, ' ');
    const expected = sampleText.trim().replace(/\s+/g, ' ');
  
    const typedChars = typed.split('');
    const expectedChars = expected.split('');
  
    let correctChars = 0;
    const minLength = Math.min(typedChars.length, expectedChars.length);
  
    for (let i = 0; i < minLength; i++) {
      if (typedChars[i] === expectedChars[i]) {
        correctChars++;
      }
    }
  
    // Accuracy based on typed length: what % of typed characters were correct
    const accuracy = typedChars.length === 0
      ? 0
      : (correctChars / typedChars.length) * 100;
  
    // WPM (Words per minute), assuming a 30-second test
    const wordsTyped = typed.split(' ').filter(word => word !== '').length;
    const wpm = Math.round((wordsTyped * 60) / 30); // 30 seconds
  
    // Display the results
    speedDisplay.textContent = `${isNaN(wpm) ? 0 : wpm} wpm`;
    accuracyDisplay.textContent = `${isNaN(accuracy) ? 0 : accuracy.toFixed(0)}%`;

// Show result modal
showResultModal(wpm, accuracy);

}

  // Start timer on first input
  typebox.addEventListener('input', startTimer);

  // Reset button logic
  resetBtn.addEventListener('click', resetAll);

  // Load a sentence on page load
  window.onload = loadRandomSentence;


  /* Analytics (Graph Part) */

  const ctx = document.getElementById('analyticsChart').getContext('2d');

  const analyticsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // We'll push session labels dynamically
      datasets: [{
        label: 'Words Per Minute',
        data: [],
        borderColor: '#0077b6',
        backgroundColor: 'rgba(0, 119, 182, 0.2)',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: '#0077b6',
        tension: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'WPM'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Session'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Typing Performance',
          font: {
            size: 18
          }
        }
      }
    }
  });  

/* Leaderboard */
const leaderboardKey = 'typing_leaderboard';

let leaderboardData = JSON.parse(localStorage.getItem(leaderboardKey)) || [];

function saveLeaderboard() {
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboardData));
}

function getCurrentWPM() {
    const wpmText = document.querySelector('#speed h2').innerText;
    const wpm = parseInt(wpmText.replace('wpm', '').trim(), 10);
    return isNaN(wpm) ? 0 : wpm;
}

function updateLeaderboard(username, wpm) {
    leaderboardData.push({ username, wpm });
    leaderboardData.sort((a, b) => b.wpm - a.wpm);
    saveLeaderboard();
    renderLeaderboard();
}

function renderLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = `
        <h2>Leaderboard</h2>
        <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 8px; border: 1px solid #ddd;">Rank</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Username</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">WPM</th>
                </tr>
            </thead>
            <tbody>
                ${leaderboardData.map((entry, index) => `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${entry.username}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${entry.wpm}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button id="resetLeaderboardBtn" class="glow-button">Reset Leaderboard</button>
        <div style="margin-top: 10px;">
            <p id="info" style="font-size: 14px; color: #555;">
                *When clicking the "reset button"! The leaderboard will be cleared after you refresh the page.
            </p>
        </div>
    `;
}

function resetLeaderboard() {
    leaderboardData = [];
    saveLeaderboard();
    renderLeaderboard();
    // alert("The leaderboard will be cleared after you refresh the page.");
}

window.addEventListener('DOMContentLoaded', renderLeaderboard());

document.getElementById('submitScoreBtn').addEventListener('click', () => {
    const username = prompt("Enter your name:");
    if (!username) return alert("Username is required.");

    const wpm = getCurrentWPM();
    updateLeaderboard(username, wpm);

    // Track WPM for analytics chart
  sessionWPMs.push(wpm);
  analyticsChart.data.labels.push(`Session ${sessionWPMs.length}`);
  analyticsChart.data.datasets[0].data.push(wpm);
  analyticsChart.update();
});

document.getElementById('resetLeaderboardBtn').addEventListener('click', resetLeaderboard());
document.getElementById('resetLeaderboardBtn').addEventListener('click', () => {
  alert("The leaderboard is already empty.");
});

/* Modal */
// Modal Elements
const resultModal = document.getElementById('resultModal');
const wpmResult = document.getElementById('wpmResult');
const accuracyResult = document.getElementById('accuracyResult');
const wpmLabel = document.getElementById('wpmLabel');
const okBtn = document.getElementById('okBtn');
const closeBtn = document.querySelector('.close-btn');

// Show result modal
function showResultModal(wpm, accuracy) {
    wpmResult.textContent = `WPM: ${wpm}`;
    accuracyResult.textContent = `Accuracy: ${accuracy.toFixed(0)}%`;
    wpmLabel.textContent = getWpmLabel(wpm);
    resultModal.style.display = 'block';
}

// Generate label based on WPM
function getWpmLabel(wpm) {
    if (wpm >= 100) return "You are Max Verstappen 🏎️";
    if (wpm >= 80) return "You are an Octopus 🐙";
    if (wpm >= 65) return "You are a Cheetah 🐆";
    if (wpm >= 50) return "You are a Horse 🐎";
    if (wpm >= 40) return "You are Usain Bolt 🏃‍♂️";
    if (wpm >= 30) return "You are a Rabbit 🐇";
    if (wpm >= 25) return "You are a Turtle 🐢";
    if (wpm >= 20) return "You are an Old Granny 👵";
    return "You are a Snail 🐌";
}

function closeModal() {
  document.getElementById("resultModal").style.display = "none";
}
// Modal button actions
okBtn.addEventListener('click', closeModal);

closeBtn.addEventListener('click', () => {
    resultModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === resultModal) resultModal.style.display = 'none';
});
