export class Activity {
  _id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  state: number;
  start_datetime: Date;
  message: string;
  choices: any;
  email_subject: string;
}

export enum ActivityType {
  GUI = 0,
  Online = 1,
  Scramble = 2,
  Hunt = 3,
  Trivia = 99,
  Notification = 100,
}

export const ActivityState = {
  FUTURE: 0,
  STAGED: 32,
  NOTIFYING: 48,
  ACTIVE: 64,
  COMPLETE: 128,
};

export class TriviaQuestionState {
  isTriviaNotAvailable: boolean;
  isTriviaNotStarted: boolean;
  isTriviaComplete: boolean;
  currentTriviaQuestion: Activity;
}
