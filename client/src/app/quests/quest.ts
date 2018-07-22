export class Quest {
  _id?: string;
  name: string;
  organizer_email: string;
  base_url: string;
  activities: Activity[];
}

class Activity {
  activity_type: ActivityType;
  start_datetime: Date;
  completion_type: CompletionType;
  message: string;
  answer: any;
  activity_url: string;
  answer_url: string;
  email: Email;
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
