// Data for different subjects
const subjectData = {
    'General Awareness': [
        {
            question: "What is the capital of India?",
            options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
            correctAnswer: "New Delhi"
        },
        {
            question: "Who is the current President of India?",
            options: ["Narendra Modi", "Droupadi Murmu", "Ram Nath Kovind", "Pranab Mukherjee"],
            correctAnswer: "Droupadi Murmu"
        }
        // Add more questions
    ],
    'Science': [
        {
            question: "What is the chemical symbol for Gold?",
            options: ["Ag", "Fe", "Au", "Cu"],
            correctAnswer: "Au"
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            correctAnswer: "Mars"
        }
        // Add more questions
    ],
    'Math': [
        {
            question: "What is 7 × 8?",
            options: ["54", "56", "62", "64"],
            correctAnswer: "56"
        },
        {
            question: "What is the square root of 144?",
            options: ["10", "12", "14", "16"],
            correctAnswer: "12"
        }
        // Add more questions
    ],
    'English': [
        {
            question: "What is a synonym for 'Happy'?",
            options: ["Sad", "Joyful", "Angry", "Tired"],
            correctAnswer: "Joyful"
        },
        {
            question: "What is the plural of 'Child'?",
            options: ["Childs", "Childrens", "Children", "Child"],
            correctAnswer: "Children"
        }
        // Add more questions
    ]
};

// Authorized student credentials with improved security
const validCredentials = [
    { name: "Aryan Singh", passwordHash: hashPassword("Ar2016") },
    { name: "Aditya Singh", passwordHash: hashPassword("Ad2017") }
];

// Global variables to track app state
let currentView = 'login';
let currentSubject = '';
let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let questions = [];
let timerInterval = null;
let timeLeft = 90;
let studentName = '';
let studentEmail = '';
let studentPassword = '';
let quizStartTime = null;
let questionStartTime = null;
let questionTimeTaken = [];
let retryAttempts = 0;
const MAX_RETRY_ATTEMPTS = 1;

// Simple password hashing function
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === '' || emailRegex.test(email);
}

// Format time for display
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} min ${secs} sec`;
}

// Input validation functions (kept the same as before)
function validateName() { /* ... */ }
function validatePassword() { /* ... */ }
function validateEmail() { /* ... */ }

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const nameInput = document.getElementById('student-name');
    const passwordInput = document.getElementById('student-password');
    const emailInput = document.getElementById('student-email');
    const passwordToggle = document.getElementById('password-toggle');
    const nameError = document.getElementById('name-error');
    const passwordError = document.getElementById('password-error');
    const emailError = document.getElementById('email-error');

    // Password toggle functionality
    passwordToggle.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            passwordToggle.textContent = '👁️';
        }
    });

    // Input validation functions
    function validateName() {
        const name = nameInput.value.trim();
        if (name.length < 2) {
            nameError.style.display = 'block';
            nameInput.classList.add('is-invalid');
            return false;
        }
        nameError.style.display = 'none';
        nameInput.classList.remove('is-invalid');
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value;
        if (password.length < 4) {
            passwordError.textContent = 'Password must be at least 4 characters';
            passwordError.style.display = 'block';
            passwordInput.classList.add('is-invalid');
            return false;
        }
        passwordError.style.display = 'none';
        passwordInput.classList.remove('is-invalid');
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        if (email && !isValidEmail(email)) {
            emailError.style.display = 'block';
            emailInput.classList.add('is-invalid');
            return false;
        }
        emailError.style.display = 'none';
        emailInput.classList.remove('is-invalid');
        return true;
    }

    // Add real-time validation
    nameInput.addEventListener('input', validateName);
    passwordInput.addEventListener('input', validatePassword);
    emailInput.addEventListener('input', validateEmail);

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all inputs
        const isNameValid = validateName();
        const isPasswordValid = validatePassword();
        const isEmailValid = validateEmail();

        // If any validation fails, stop
        if (!isNameValid || !isPasswordValid || !isEmailValid) {
            return;
        }

        // Perform login
        const name = nameInput.value.trim();
        const password = passwordInput.value;
        const email = emailInput.value.trim();

        // Find matching credential with hashed password
        const hashedPassword = hashPassword(password);
        const matchedCredential = validCredentials.find(
            cred => cred.name === name && cred.passwordHash === hashedPassword
        );

        if (matchedCredential) {
            // Successful login
            studentName = name;
            studentEmail = email;
            
            // Clear sensitive inputs
            passwordInput.value = '';
            
            // Show subject selection
            showSubjectSelection();
        } else {
            // Failed login
            passwordError.textContent = 'Invalid name or password!';
            passwordError.style.display = 'block';
        }
    });
});

// Existing helper functions (make sure these are defined)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show subject selection screen
function showSubjectSelection() {
    currentView = 'subjects';
    clearInterval(timerInterval);
    retryAttempts = 0; // Reset retry attempts
    
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="student-info">
            <strong>Student:</strong> ${studentName}
            ${studentEmail ? ` | <strong>Email:</strong> ${studentEmail}` : ''}
        </div>
        <h1 style="color: #2c3e50;">Select a Subject</h1>
        <p class="welcome-text" style="color: #7f8c8d; font-size: 1.1em;">Choose your adventure in knowledge!</p>
        
        <div class="subject-buttons">
            <button class="subject-button general" onclick="selectSubject('General Awareness')">
                <i class="fas fa-globe"></i> General Awareness
            </button>
            <button class="subject-button science" onclick="selectSubject('Science')">
                <i class="fas fa-flask"></i> Science
            </button>
            <button class="subject-button math" onclick="selectSubject('Math')">
                <i class="fas fa-calculator"></i> Math
            </button>
            <button class="subject-button english" onclick="selectSubject('English')">
                <i class="fas fa-book"></i> English
            </button>
        </div>
        
        <div style="margin-top: 30px;">
            <button class="button back-button" onclick="goToHome()" style="background: #e74c3c;">Logout</button>
            <button class="button" onclick="viewPreviousResults()" style="background: #3498db;">View My Results</button>
        </div>
    `;
}

// Select subject and start quiz
function selectSubject(subject) {
    currentSubject = subject;
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    questionTimeTaken = [];
    
    // Get questions for the selected subject
    questions = [...subjectData[subject]];
    
    // Shuffle questions
    questions.sort(() => Math.random() - 0.5);
    
    // Start the quiz
    startQuiz();
}

// Start quiz and display first question (kept mostly the same)
function startQuiz() { /* ... */ }

// Update timer (kept the same)
function updateTimer() { /* ... */ }

// Display current question (kept the same)
function displayQuestion() { /* ... */ }

// Select and record answer (kept the same)
function selectAnswer(selectedOption) { /* ... */ }

// Submit quiz with enhanced result tracking
function submitQuiz() {
    clearInterval(timerInterval);
    const totalTime = (new Date() - quizStartTime) / 1000;

    // Only save result if it's not a retry or within max retry attempts
    if (retryAttempts < MAX_RETRY_ATTEMPTS) {
        const resultData = {
            student: studentName,
            email: studentEmail,
            subject: currentSubject,
            score: score,
            maxScore: questions.length * 10,
            correctAnswers: score / 10,
            totalQuestions: questions.length,
            date: new Date().toISOString(),
            totalTime: totalTime,
            isRetry: retryAttempts > 0,
            performanceLevel: calculatePerformanceLevel(score, questions.length),
            details: userAnswers.map((answer, index) => ({
                question: questions[index].question,
                selected: answer.selected,
                correct: answer.correct,
                timeTaken: questionTimeTaken[index]
            }))
        };

        const allResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
        allResults.push(resultData);
        localStorage.setItem('quizResults', JSON.stringify(allResults));
    }

    // Quiz completion HTML with performance-based messaging
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="student-info">
            <strong>Student:</strong> ${studentName} | <strong>Subject:</strong> ${currentSubject}
        </div>
        <h1 style="color: #27ae60;">Quiz Completed!</h1>
        <div class="result-summary" style="background: #ecf0f1; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2c3e50;">Your Score: ${score}/${questions.length * 10}</h2>
            <p style="font-size: 1.2em;">Correct Answers: ${score/10}/${questions.length}</p>
            <p style="font-size: 1.2em;">Time Taken: ${formatTime(totalTime)}</p>
            <p style="font-size: 1.2em; color: ${getPerformanceColor(score, questions.length)}">
                Performance: ${calculatePerformanceLevel(score, questions.length)}
            </p>
        </div>
        <div style="margin-top: 30px;">
            <button class="button" onclick="showSubjectSelection()" style="background: #3498db;">New Quiz</button>
            <button class="button" onclick="viewPreviousResults()" style="background: #9b59b6;">View Results</button>
            ${retryAttempts < MAX_RETRY_ATTEMPTS ? 
                `<button class="button" onclick="retryQuiz()" style="background: #e67e22;">Retry (${MAX_RETRY_ATTEMPTS - retryAttempts} attempts left)</button>` 
                : ''}
        </div>
    `;
}

// Calculate performance level
function calculatePerformanceLevel(score, totalQuestions) {
    const percentage = (score / (totalQuestions * 10)) * 100;
    if (percentage >= 90) return 'Excellent 🏆';
    if (percentage >= 75) return 'Very Good 👍';
    if (percentage >= 60) return 'Good 👌';
    if (percentage >= 50) return 'Average 😐';
    return 'Need Improvement 📚';
}

// Get performance color
function getPerformanceColor(score, totalQuestions) {
    const percentage = (score / (totalQuestions * 10)) * 100;
    if (percentage >= 90) return '#2ecc71';  // Green
    if (percentage >= 75) return '#3498db';  // Blue
    if (percentage >= 60) return '#f39c12';  // Orange
    if (percentage >= 50) return '#e67e22';  // Dark Orange
    return '#e74c3c';  // Red
}

// Retry quiz with limitation
function retryQuiz() {
    if (retryAttempts < MAX_RETRY_ATTEMPTS) {
        retryAttempts++;
        selectSubject(currentSubject);
    } else {
        alert('You have used all retry attempts for this quiz.');
        showSubjectSelection();
    }
}

// View previous results (with performance insights)
function viewPreviousResults() {
    const allResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const studentResults = allResults.filter(result => 
        result.student.toLowerCase() === studentName.toLowerCase()
    );
    
    const container = document.querySelector('.container');
    let resultsHTML = `
        <div class="student-info">
            <strong>Student:</strong> ${studentName}
            ${studentEmail ? ` | <strong>Email:</strong> ${studentEmail}` : ''}
        </div>
        <h1 style="color: #2c3e50;">Your Quiz Results</h1>
        <div class="performance-summary">
            <h3>Performance Insights</h3>
            ${generatePerformanceSummary(studentResults)}
        </div>
        <button class="button" onclick="generatePDF()" style="background: #e74c3c; margin-bottom: 20px;">Download PDF</button>
    `;
    
    if (studentResults.length === 0) {
        resultsHTML += `
            <div class="result-container" style="text-align: center; padding: 20px;">
                <p>No quiz results found.</p>
            </div>
        `;
    } else {
        studentResults.forEach((result, index) => {
            resultsHTML += `
                <div class="result-container" style="background: #f8f9fa; padding: 20px; margin: 10px 0; border-radius: 10px;">
                    <h3 style="color: #2980b9;">${result.subject} Quiz</h3>
                    <p>Score: ${result.score}/${result.maxScore}</p>
                    <p>Performance: <span style="color: ${getPerformanceColor(result.score, result.totalQuestions)}">
                        ${result.performanceLevel}
                    </span></p>
                    <p>Date: ${new Date(result.date).toLocaleString()}</p>
                    ${result.isRetry ? '<p style="color: #e74c3c;">Retry Attempt</p>' : ''}
                    <button class="button" onclick="viewDetailedResult(${index})" style="background: #3498db;">Details</button>
                </div>
            `;
        });
    }
    
    resultsHTML += `<button class="button back-button" onclick="showSubjectSelection()" style="background: #7f8c8d;">Back</button>`;
    
    container.innerHTML = resultsHTML;
}

// Generate performance summary
function generatePerformanceSummary(results) {
    if (results.length === 0) return '<p>No performance data available.</p>';

    const totalAttempts = results.length;
    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalAttempts;
    const bestPerformance = Math.max(...results.map(r => r.score / r.maxScore * 100));
    const subjectPerformance = results.reduce((acc, result) => {
        acc[result.subject] = (acc[result.subject] || []).concat(result.score / result.maxScore * 100);
        return acc;
    }, {});

    let summaryHTML = `
        <div style="background: #ecf0f1; padding: 15px; border-radius: 10px;">
            <p><strong>Total Quiz Attempts:</strong> ${totalAttempts}</p>
            <p><strong>Average Score:</strong> ${averageScore.toFixed(2)}%</p>
            <p><strong>Best Performance:</strong> ${bestPerformance.toFixed(2)}%</p>
            <h4>Subject-wise Performance</h4>
    `;

    Object.entries(subjectPerformance).forEach(([subject, scores]) => {
        const avgSubjectScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        summaryHTML += `
            <p>${subject}: ${avgSubjectScore.toFixed(2)}% 
                <span style="color: ${getPerformanceColor(avgSubjectScore, 100)}">
                    (${calculatePerformanceLevel(avgSubjectScore, 100)})
                </span>
            </p>
        `;
    });

    summaryHTML += `</div>`;
    return summaryHTML;
}

// Generate PDF of detailed quiz results
function generatePDF() {
    // Check if jspdf is available
    if (typeof jspdf === 'undefined') {
        alert('PDF generation library not loaded. Please refresh the page.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    
    // Set basic document properties
    doc.setFontSize(18);
    doc.text(`Detailed Quiz Results for ${studentName}`, 15, 20);
    
    const allResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    let y = 30;
    
    const studentResults = allResults.filter(result => 
        result.student.toLowerCase() === studentName.toLowerCase()
    );
    
    if (studentResults.length === 0) {
        doc.setFontSize(12);
        doc.text('No quiz results found.', 15, y);
    } else {
        studentResults.forEach(result => {
            // Overall Quiz Summary
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 255); // Blue color
            doc.text(`Quiz: ${result.subject}`, 15, y);
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0); // Black color
            y += 10;
            doc.text(`Date: ${new Date(result.date).toLocaleString()}`, 15, y);
            y += 10;
            doc.text(`Total Score: ${result.score}/${result.maxScore}`, 15, y);
            y += 10;
            doc.text(`Correct Answers: ${result.correctAnswers}/${result.totalQuestions}`, 15, y);
            y += 10;
            doc.text(`Total Time: ${formatTime(result.totalTime)}`, 15, y);
            y += 15;

            // Detailed Question Breakdown
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 255); // Blue color
            doc.text('Question Details:', 15, y);
            y += 10;

            result.details.forEach((detail, index) => {
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0); // Black color
                
                // Question
                doc.text(`Q${index + 1}: ${detail.question}`, 15, y);
                y += 10;

                // Correct/Incorrect Indication
                const statusColor = detail.correct ? [0, 128, 0] : [255, 0, 0]; // Green/Red
                doc.setTextColor(...statusColor);
                doc.text(`Status: ${detail.correct ? 'Correct' : 'Incorrect'}`, 20, y);
                y += 10;

                // Selected Answer
                doc.setTextColor(0, 0, 0); // Black
                doc.text(`Your Answer: ${detail.selected}`, 20, y);
                y += 10;

                // Time Taken
                doc.text(`Time Taken: ${detail.timeTaken.toFixed(2)} seconds`, 20, y);
                y += 15;

                // Add a line separator
                doc.setDrawColor(200);
                doc.line(15, y, 195, y);
                y += 5;

                // Page break if needed
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
            });

            // Add page break between results if multiple
            doc.addPage();
            y = 20;
        });
    }
    
    doc.save(`${studentName}_quiz_results.pdf`);
}

// Helper function to format time (already defined in previous code)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} min ${secs} sec`;
}
// Return to home/login screen
function goToHome() {
    // Reset all global variables
    currentView = 'login';
    currentSubject = '';
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    questions = [];
    timerInterval = null;
    timeLeft = 90;
    studentName = '';
    studentEmail = '';
    studentPassword = '';
    
    // Reload the initial login form
    const container = document.querySelector('.container');
    container.innerHTML = `
        <h1>Welcome to Knowledge World</h1>
        <div class="logo-container">
            <div class="logo-background"></div>
            <div class="stars"></div>
            <img src="earth_logo.png" alt="Earth Logo" class="logo-image">
        </div>
        
        <p class="welcome-text">Embark on an exciting journey of learning and discovery! Test your knowledge across various subjects and challenge yourself to excel!</p>
        
        <div id="login-form">
            <h2>Student Login</h2>
            <div class="form-group">
                <label for="student-name">Your Name:</label>
                <input type="text" id="student-name" class="form-control" placeholder="Enter your full name" required>
                <div id="name-error" class="error-message">Please enter a valid name</div>
            </div>
            <div class="form-group">
                <label for="student-password">Password:</label>
                <div class="password-field">
                    <input type="password" id="student-password" class="form-control" placeholder="Enter your password" required>
                    <button type="button" id="password-toggle" class="password-toggle">👁️</button>
                </div>
                <div id="password-error" class="error-message">Invalid name or password!</div>
            </div>
            <div class="form-group">
                <label for="student-email">Email (optional):</label>
                <input type="email" id="student-email" class="form-control" placeholder="Enter your email">
                <div id="email-error" class="error-message">Please enter a valid email</div>
            </div>
            <button class="button" id="login-button">Start Quiz</button>
        </div>
    `;

    // Re-add event listeners
    document.getElementById('login-button').addEventListener('click', handleLogin);
    document.getElementById('password-toggle').addEventListener('click', function() {
        const passwordInput = document.getElementById('student-password');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            this.textContent = '👁️';
        }
    });
}