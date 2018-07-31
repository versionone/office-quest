export class Activity {
  _id: string;
  quest_id: string;
  participant_id: string;
  state: ActivityState;
  type: number;
  start_datetime: Date;
  completion_type: CompletionType;
  message: string;
  answer: any;
  email: Email;
}

enum ActivityState {
  FUTURE = 0,
  STAGED = 32,
  NOTIFYING = 48,
  ACTIVE = 64,
  COMPLETE = 128,
}

export enum ActivityType {
  GUI = 0,
  Online = 1,
  Scramble = 2,
  Hunt = 3,
}

enum CompletionType {
  Answer = 0,
  Manual = 1,
  Automatic = 2,
}

class Email {
  subject: string;
  message: string;
  files_to_attach: string;
}
