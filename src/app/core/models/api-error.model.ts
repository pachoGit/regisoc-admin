export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string>;
}

export interface ParsedApiError {
  status: number;
  title: string;
  message: string;
  fieldErrors: Record<string, string>;
}
