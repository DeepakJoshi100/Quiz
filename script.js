// ===== Variables =====
let userName = "";
let fatherName = "";
let selectedCourse = "";
let currentQuestion = 0;
let selectedQuestions = [];
let userAnswers = [];
let timerDuration = 45 * 60; // 45 minutes
let timerInterval;
let timeTaken = 0;

// ===== Google Sheet URL =====
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx1oIGoQR4K5HJAwBCFPSFP1_88g1Ffe-wprLKsQJ3fFwd1vuwsehz38LWHfMhA7Kiq/exec"; // replace with your URL

// ===== Shuffle Function =====
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ===== Start Quiz =====
function startQuiz() {
  userName = document.getElementById("name").value.trim();
  fatherName = document.getElementById("fname").value.trim();
  selectedCourse = document.getElementById("courseSelect").value;

  if (!userName || !fatherName || !selectedCourse) {
    alert("Please fill all details and select a course");
    return;
  }

  const pool = questionBank[selectedCourse];
  selectedQuestions = shuffleArray([...pool]).slice(0, Math.min(50, pool.length));
  userAnswers = new Array(selectedQuestions.length).fill("Skipped");

  document.getElementById("page1").classList.remove("active");
  document.getElementById("page2").classList.add("active");

  const courseNameMap = {
    tally: "Tally ERP 9",
    web: "Web Development",
    html: "HTML",
    css: "CSS",
    js: "JavaScript",
    basic: "Basic Computer"
  };
  document.getElementById("courseName").innerText = `Course: ${courseNameMap[selectedCourse]}`;

  currentQuestion = 0;
  showQuestion();
  startTimer(timerDuration);
}

// ===== Show Question =====
function showQuestion() {
  const q = selectedQuestions[currentQuestion];
  document.getElementById("questionText").innerText =
    `Question ${currentQuestion + 1}: ${q.question}`;

  document.getElementById("progress").innerText =
    `(${currentQuestion + 1} of ${selectedQuestions.length})`;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(option => {
    const label = document.createElement("label");
    const checked = userAnswers[currentQuestion] === option ? "checked" : "";
    label.innerHTML = `<input type="radio" name="option" value="${option}" ${checked}> ${option}`;
    optionsDiv.appendChild(label);
    optionsDiv.appendChild(document.createElement("br"));
  });

  // Update navigation buttons
  const navButtons = document.querySelectorAll("#page2 .nav-btn");
  const prevBtn = navButtons[0];
  const nextBtn = navButtons[1];

  prevBtn.disabled = currentQuestion === 0;
  nextBtn.innerText = currentQuestion === selectedQuestions.length - 1 ? "Finish" : "Next";
}

// ===== Save Answer =====
function saveAnswer() {
  const selected = document.querySelector('input[name="option"]:checked');
  if (currentQuestion >= 0 && currentQuestion < selectedQuestions.length) {
    userAnswers[currentQuestion] = selected ? selected.value : "Skipped";
  }
}

// ===== Previous Question =====
function prevQuestion() {
  saveAnswer();
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
}

// ===== Next Question =====
function nextQuestion() {
  saveAnswer();
  if (currentQuestion < selectedQuestions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    showResult();
  }
}

// ===== Timer =====
function startTimer(duration) {
  let timeRemaining = duration;
  const timerElement = document.getElementById("timer");

  timerInterval = setInterval(() => {
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    timerElement.innerText = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    timeTaken = duration - timeRemaining;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert("Time is up! Submitting quiz...");
      showResult();
    }
    timeRemaining--;
  }, 1000);
}

// ===== Show Result =====
function showResult() {
  saveAnswer();
  clearInterval(timerInterval);

  let score = 0, correct = 0, wrong = 0, skipped = 0;
  let reviewHTML = "";

  selectedQuestions.forEach((q, index) => {
    const userAns = userAnswers[index] || "Skipped";
    const correctAns = q.answer;

    if (userAns === correctAns) {
      score++;
      correct++;
      reviewHTML += `<p class="correct"><b>Q${index + 1}:</b> ${q.question}<br>
                     Your Answer: ${userAns}<br>
                     Correct Answer: ${correctAns}</p>`;
    } else if (userAns === "Skipped") {
      skipped++;
      reviewHTML += `<p class="skipped"><b>Q${index + 1}:</b> ${q.question}<br>
                     Your Answer: Skipped<br>
                     Correct Answer: ${correctAns}</p>`;
    } else {
      wrong++;
      reviewHTML += `<p class="wrong"><b>Q${index + 1}:</b> ${q.question}<br>
                     Your Answer: ${userAns}<br>
                     Correct Answer: ${correctAns}</p>`;
    }
  });

  document.getElementById("page2").classList.remove("active");
  document.getElementById("page3").classList.add("active");

  document.getElementById("userDetails").innerText =
    `Name: ${userName} | Father's Name: ${fatherName}`;
  const percentage = ((score / selectedQuestions.length) * 100).toFixed(2);
  document.getElementById("score").innerText =
    `Your Score: ${score}/${selectedQuestions.length} (${percentage}%)`;

  let minutesTaken = Math.floor(timeTaken / 60);
  let secondsTaken = timeTaken % 60;
  document.getElementById("analysis").innerHTML =
    `<b>Analysis:</b><br>
     Total Questions: ${selectedQuestions.length}<br>
     Attempted: ${correct + wrong}<br>
     Correct: ${correct}<br>
     Wrong: ${wrong}<br>
     Skipped: ${skipped}<br>
     Time Taken: ${minutesTaken}:${secondsTaken < 10 ? "0" : ""}${secondsTaken}`;

  const courseNameMap = {
    tally: "Tally ERP 9",
    web: "Web Development",
    html: "HTML",
    css: "CSS",
    js: "JavaScript",
    basic: "Basic Computer"
  };
  const courseLabel = document.createElement("p");
  courseLabel.innerHTML = `<b>Question Paper:</b> ${courseNameMap[selectedCourse]}`;
  document.getElementById("answersReview").innerHTML = "";
  document.getElementById("answersReview").appendChild(courseLabel);
  document.getElementById("answersReview").innerHTML += reviewHTML;

  // ===== Send to Google Sheet =====
  const data = {
    name: userName,
    fatherName: fatherName,
    course: selectedCourse,
    score: score,
    answers: userAnswers,
    timeTaken: timeTaken
  };
  sendToGoogleSheet(data);
}

// ===== Send Data to Google Sheet =====
function sendToGoogleSheet(data) {
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(() => console.log("Data sent to Google Sheet"))
  .catch(err => console.error("Error sending data:", err));
}

// ===== Exit Quiz =====
function exitQuiz() {
  document.getElementById("page3").classList.remove("active");
  document.getElementById("page1").classList.add("active");
  document.getElementById("name").value = "";
  document.getElementById("fname").value = "";
  document.getElementById("courseSelect").value = "";
  userAnswers = [];
  selectedQuestions = [];
  currentQuestion = 0;
}
