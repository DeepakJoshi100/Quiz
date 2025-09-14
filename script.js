let userName = "";
let fatherName = "";
let selectedCourse = "";
let currentQuestion = 0;
let selectedQuestions = [];
let userAnswers = [];

// Shuffle function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Start Quiz
function startQuiz() {
  userName = document.getElementById("name").value.trim();
  fatherName = document.getElementById("fname").value.trim();
  selectedCourse = document.getElementById("courseSelect").value;

  if (!userName || !fatherName || !selectedCourse) {
    alert("Please fill all details and select a course");
    return;
  }

  // Pick 50 random questions from the selected course
  const pool = questionBank[selectedCourse];
  selectedQuestions = shuffleArray([...pool]).slice(0, Math.min(50, pool.length));

  // Initialize userAnswers array for all questions
  userAnswers = new Array(selectedQuestions.length).fill("Skipped");

  document.getElementById("page1").classList.remove("active");
  document.getElementById("page2").classList.add("active");

  // Show course name
  const courseNameMap = {
    tally: "Tally ERP 9",
    web: "Web Development",
    html: "HTML",
    css: "CSS",
    js: "JavaScript",
    basic:"Basic Computer"
  };
  document.getElementById("courseName").innerText = `Course: ${courseNameMap[selectedCourse]}`;

  currentQuestion = 0;
  showQuestion();
}

// Show current question
function showQuestion() {
  const q = selectedQuestions[currentQuestion];
  document.getElementById("questionText").innerText =
    `Question ${currentQuestion + 1}: ${q.question}`;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(option => {
    const label = document.createElement("label");
    const checked = userAnswers[currentQuestion] === option ? "checked" : "";
    label.innerHTML = `<input type="radio" name="option" value="${option}" ${checked}> ${option}`;
    optionsDiv.appendChild(label);
    optionsDiv.appendChild(document.createElement("br"));
  });
}

// Next Question
function nextQuestion() {
  saveAnswer();
  currentQuestion++;

  if (currentQuestion < selectedQuestions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

// Save answer for current question
function saveAnswer() {
  const selected = document.querySelector('input[name="option"]:checked');
  if (currentQuestion >= 0 && currentQuestion < selectedQuestions.length) {
    userAnswers[currentQuestion] = selected ? selected.value : "Skipped";
  }
}

// Show Result Page
function showResult() {
  saveAnswer();

  let score = 0;
  let reviewHTML = "";

  selectedQuestions.forEach((q, index) => {
    const userAns = userAnswers[index] || "Skipped";
    const correct = q.answer;

    if (userAns === correct) score++;
    reviewHTML += `<p><b>Q${index + 1}:</b> ${q.question}<br>
                   Your Answer: ${userAns}<br>
                   Correct Answer: ${correct}</p>`;
  });

  document.getElementById("page2").classList.remove("active");
  document.getElementById("page3").classList.add("active");
  document.getElementById("userDetails").innerText = 
    `Name: ${userName} | Father's Name: ${fatherName}`;
  document.getElementById("score").innerText = 
    `Your Score: ${score}/${selectedQuestions.length}`;

  // Show course name on top of review
  const courseNameMap = {
    tally: "Tally ERP 9",
    web: "Web Development",
    html: "HTML",
    css: "CSS",
    js: "JavaScript",
    basic:"Basic Computer"
  };
  const courseLabel = document.createElement("p");
  courseLabel.innerHTML = `<b>Question Paper:</b> ${courseNameMap[selectedCourse]}`;
  document.getElementById("answersReview").innerHTML = "";
  document.getElementById("answersReview").appendChild(courseLabel);
  document.getElementById("answersReview").innerHTML += reviewHTML;
}
