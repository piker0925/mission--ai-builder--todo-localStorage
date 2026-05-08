export interface Step {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isImportant: boolean;
  myDayDate: string | null;
  dueDate: string | null;
  note: string;
  steps: Step[];
  color: "none" | "red" | "blue" | "green" | "yellow" | "purple";
  createdAt: number;
  updatedAt: number;
}
