export class Activity {
  _id: string;
  participant_name: string;
  participant_email: string;
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
