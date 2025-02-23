import './style.css';
import { Question, QuizState } from './types';
import { QuizService } from './services/QuizService';

let state: QuizState = {
  questions: [],
  currentQuestion: -1,
  correctAnswers: 0,
  answeredQuestions: new Set(),
  isFinished: false
};

function getRandomQuestion(): number {
  const availableQuestions = state.questions.length;
  let randomIndex;
  
  do {
    randomIndex = Math.floor(Math.random() * availableQuestions);
  } while (state.answeredQuestions.has(randomIndex));
  
  return randomIndex;
}

function checkAnswer(selectedOption: number, correctAnswer: number): boolean {
  return selectedOption === correctAnswer;
}

function disableAllOptions() {
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(button => {
    button.setAttribute('disabled', 'true');
  });
}

function showAnswerFeedback(selectedButton: HTMLElement, isCorrect: boolean) {
  selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');
  
  if (!isCorrect) {
    const correctButton = document.querySelectorAll('.option-btn')[state.questions[state.currentQuestion].answer] as HTMLElement;
    correctButton.classList.add('correct');
  }

  // Add description after answering
  const questionContainer = document.querySelector('.quiz-container')!;
  const descriptionElement = document.createElement('div');
  descriptionElement.className = 'answer-description';
  descriptionElement.innerHTML = `
    <p class="description-text">
      ${state.questions[state.currentQuestion].descriptionAnswer}
    </p>
  `;
  questionContainer.appendChild(descriptionElement);
  addNextButton();
}


function updateUI() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  if (state.isFinished) {
    app.innerHTML = `
      <div class="quiz-container">
        <h2>Quiz Completado!</h2>
        <p>Respuestas correctas: ${state.correctAnswers} de ${state.questions.length}</p>
        <button onclick="location.reload()">Reiniciar Quiz</button>
      </div>
    `;
    return;
  }

  const question = state.questions[state.currentQuestion];
  
  app.innerHTML = `
    <div class="quiz-container">
      <h2>Pregunta ${state.answeredQuestions.size + 1} de ${state.questions.length}</h2>
      <p class="question">${question.question}</p>
      <div class="options">
        ${question.options.map((option, index) => `
          <button onclick="window.handleAnswer(${index}, this)" class="option-btn">
            ${option}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

async function startQuiz() {
  try {
    const quizService = QuizService.getInstance();
    state.questions = await quizService.getQuestions();
    state.currentQuestion = getRandomQuestion();
    updateUI();
  } catch (error) {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = `
      <div class="quiz-container">
        <h2>Error</h2>
        <p>No se pudieron cargar las preguntas. Por favor, intente nuevamente.</p>
        <button onclick="location.reload()">Reintentar</button>
      </div>
    `;
  }
}

function addNextButton() {
  const questionContainer = document.querySelector('.quiz-container')!;
  const nextButtonElement = document.createElement('div');
  nextButtonElement.className = 'next-button-container';
  nextButtonElement.innerHTML = `
    <button onclick="window.nextQuestion()" class="next-btn">Siguiente Pregunta</button>
  `;
  questionContainer.appendChild(nextButtonElement);
}

function validateQuizProgress(): boolean {
  if (state.answeredQuestions.size === state.questions.length) {
    state.isFinished = true;
    return true;
  }
  return false;
}

// Modify nextQuestion to use the new validation
(window as any).nextQuestion = () => {
  if (!validateQuizProgress()) {
    state.currentQuestion = getRandomQuestion();
  }
  updateUI();
};

// Modify handleAnswer to use the new validation
(window as any).handleAnswer = (selectedOption: number, buttonElement: HTMLElement) => {
  const currentQuestion = state.questions[state.currentQuestion];
  const isCorrect = checkAnswer(selectedOption, currentQuestion.answer);
  
  disableAllOptions();
  showAnswerFeedback(buttonElement, isCorrect);
  
  if (isCorrect) {
    state.correctAnswers++;
  }
  
  state.answeredQuestions.add(state.currentQuestion);
};

startQuiz();