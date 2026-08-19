export const POLL_MIN_OPTIONS = 2;
export const POLL_MAX_OPTIONS = 10;

export function validateCreatePoll(input: {
  question: string;
  options: string[];
  startsAt?: string;
  expiresAt?: string;
}): string | null {
  if (!input.question.trim()) {
    return 'Question is required';
  }

  const validOptions = input.options.map((o) => o.trim()).filter(Boolean);
  if (validOptions.length < POLL_MIN_OPTIONS) {
    return 'At least two valid options are required';
  }

  if (input.expiresAt && new Date(input.expiresAt).getTime() <= Date.now()) {
    return 'Expiry time must be in the future';
  }

  if (
    input.startsAt &&
    input.expiresAt &&
    new Date(input.startsAt).getTime() >= new Date(input.expiresAt).getTime()
  ) {
    return 'Expiry time must be after start time';
  }

  return null;
}

export function getValidPollOptions(options: string[]): string[] {
  return options.map((o) => o.trim()).filter(Boolean);
}
