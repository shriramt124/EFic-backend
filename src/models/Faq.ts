export interface FaqRecord {
  id: string;
  question: string;
  answerHtml: string | null;
  answerJson: unknown;
  order: number;
  published: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
