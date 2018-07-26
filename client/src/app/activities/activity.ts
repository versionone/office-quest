export class Activity {
  _id: string;
  quest_id: string;
  participant_id: string;
  state: ActivityState;
  organizer_email: string;
  base_url: string;
  type: ActivityType;
  start_datetime: Date;
  completion_type: CompletionType;
  message: string;
  answer: any;
  activity_url: string;
  answer_url: string;
  email: Email;
}

enum ActivityState {
  FUTURE = 0,
  STAGED = 32,
  ACTIVE = 64,
  COMPLETE = 128,
}

enum ActivityType {
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
  file_path: string;
}
