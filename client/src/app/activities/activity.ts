export class Activity {
  _id: string;
  quest_id: string;
  type: number;
  start_datetime: Date;
  message: string;
  answer: any;
  faux: any;
  email: Email;
}

export enum ActivityType {
  GUI = 0,
  Online = 1,
  Scramble = 2,
  Hunt = 3,
}
class Email {
  subject: string;
  message: string;
  files_to_attach: string;
}
