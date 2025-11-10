export interface Config {
  _id?: string;  // Add _id field as optional
  title: string;
  branch: string;
  displayBranch?: string;  // Optional display branch for BSH dashboard
  academicYear: string;
  year: number;
  semester: number;
  section: string;
  theorySubjects: TheorySubject[];
  labSubjects: LabSubject[];
}

export interface TheorySubject {
  teacherName: string;
  subjectName: string;
}

export interface LabSubject {
  labTeacherName: string;
  labName: string;
}

export interface Ratings {
  Q1: number;
  Q2: number;
  Q3: number;
  Q4: number;
  Q5: number;
  Q6: number;
  Q7: number;
  Q8: number;
  Q9: number;
  Q10: number;
}

export interface TheoryFeedback {
  teacherName: string;
  subjectName: string;
  ratings: Ratings;
}

export interface LabFeedback {
  labTeacherName: string;
  labName: string;
  ratings: Ratings;
}

export interface FeedbackSubmission {
  configTitle: string;
  theoryFeedback: TheoryFeedback[];
  labFeedback: LabFeedback[];
  collegeComments: string;
  departmentComments: string;
}

export const QUESTIONS = [
  "Teacher's Knowledge base in respect of the subject taught?",
  "Communication Skills in terms of explaining concepts, theories etc",
  "Teacher make use of examples/ completion of course syllabus as scheduled.",
  "Encouraging students in asking questions and clearing their doubts satisfactorily",
  "Class management- interaction with students (Motivation)",
  "Self discipline/Punctuality/Individual behavior of teacher",
  "Use of Powerpoint presentation/ ICT tools",
  "Board usage/ Subject notes",
  "Voice is louder and clear",
  "Overall rating of the teacher"
];

export const BRANCHES = [
  'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI', 'AIML', 'DS', 'CS', 'IT', 'MBA', 'MCA'
];
