import { Question } from '../types';

export class QuizService {
  private static instance: QuizService;
  private baseUrl: string = '/db.json';

  private constructor() {}

  public static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  public async getQuestions(): Promise<Question[]> {
    try {
      const response = await fetch(this.baseUrl, {
        cache: 'no-cache'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }
}