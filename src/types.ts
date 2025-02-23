export interface Question {
  question: string;
  answer: number;
  options: string[];
  descriptionAnswer: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestion: number;
  correctAnswers: number;
  answeredQuestions: Set<number>;
  isFinished: boolean;
}