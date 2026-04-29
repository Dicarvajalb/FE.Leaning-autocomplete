import type {
  CreateQuestionInput,
  CreateQuizInput,
  QuestionOptionLabel,
} from '../../types';

type QuizImportQuestion = CreateQuestionInput;

export type QuizImportItem = CreateQuizInput & {
  questions?: QuizImportQuestion[];
};

export type QuizImportPayload =
  | QuizImportItem[]
  | {
      quizzes: QuizImportItem[];
    };

export type ParsedQuizImport = {
  quizzes: QuizImportItem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeQuestion(question: unknown, quizIndex: number, questionIndex: number) {
  if (!isRecord(question)) {
    throw new Error(
      `Quiz ${quizIndex + 1}, question ${questionIndex + 1}: question must be an object`,
    );
  }

  const description = normalizeString(question.description);
  const type = question.type;
  const options = question.options;

  if (type !== 'AUTOCOMPLETE_ORDER') {
    throw new Error(
      `Quiz ${quizIndex + 1}, question ${questionIndex + 1}: only AUTOCOMPLETE_ORDER questions are supported`,
    );
  }

  if (!Array.isArray(options) || options.length === 0) {
    throw new Error(
      `Quiz ${quizIndex + 1}, question ${questionIndex + 1}: options must be a non-empty array`,
    );
  }

  const seenWords = new Set<string>();
  let hideCount = 0;
  let showCount = 0;

  const normalizedOptions = options.map((option, optionIndex) => {
    if (!isRecord(option)) {
      throw new Error(
        `Quiz ${quizIndex + 1}, question ${questionIndex + 1}, option ${optionIndex + 1}: option must be an object`,
      );
    }

    const word = normalizeString(option.word);
    const label = option.label;

    if (!word) {
      throw new Error(
        `Quiz ${quizIndex + 1}, question ${questionIndex + 1}, option ${optionIndex + 1}: word is required`,
      );
    }

    if (seenWords.has(word)) {
      throw new Error(
        `Quiz ${quizIndex + 1}, question ${questionIndex + 1}: option words must be unique`,
      );
    }

    if (label !== 'HIDE' && label !== 'SHOW' && label !== 'EXTRA') {
      throw new Error(
        `Quiz ${quizIndex + 1}, question ${questionIndex + 1}, option ${optionIndex + 1}: label must be HIDE, SHOW, or EXTRA`,
      );
    }

    if (label === 'HIDE') {
      hideCount += 1;
    }

    if (label === 'SHOW') {
      showCount += 1;
    }

    seenWords.add(word);

    return { word, label: label as QuestionOptionLabel };
  });

  if (hideCount === 0 || showCount === 0) {
    throw new Error(
      `Quiz ${quizIndex + 1}, question ${questionIndex + 1}: each question must include at least one HIDE option and one SHOW option`,
    );
  }

  return {
    description,
    type: 'AUTOCOMPLETE_ORDER' as const,
    options: normalizedOptions,
  };
}

function normalizeQuizItem(item: unknown, quizIndex: number): QuizImportItem {
  if (!isRecord(item)) {
    throw new Error(`Quiz ${quizIndex + 1}: quiz must be an object`);
  }

  const title = normalizeString(item.title);
  const topic = normalizeString(item.topic);
  const difficulty = item.difficulty;
  const description = item.description;
  const questions = item.questions;

  if (!title) {
    throw new Error(`Quiz ${quizIndex + 1}: title is required`);
  }

  if (!topic) {
    throw new Error(`Quiz ${quizIndex + 1}: topic is required`);
  }

  if (difficulty !== 'EASY' && difficulty !== 'MEDIUM' && difficulty !== 'HARD') {
    throw new Error(`Quiz ${quizIndex + 1}: difficulty must be EASY, MEDIUM, or HARD`);
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    throw new Error(`Quiz ${quizIndex + 1}: description must be a string or null`);
  }

  if (questions !== undefined && !Array.isArray(questions)) {
    throw new Error(`Quiz ${quizIndex + 1}: questions must be an array`);
  }

  return {
    title,
    topic,
    difficulty,
    description:
      typeof description === 'string' ? description.trim() || null : null,
    questions: Array.isArray(questions)
      ? questions.map((question, questionIndex) =>
          normalizeQuestion(question, quizIndex, questionIndex),
        )
      : [],
  };
}

export function parseQuizImportJson(json: unknown): ParsedQuizImport {
  const quizzes = Array.isArray(json)
    ? json
    : isRecord(json) && Array.isArray(json.quizzes)
      ? json.quizzes
      : null;

  if (!quizzes) {
    throw new Error('Import file must contain an array of quizzes or a { quizzes: [...] } object');
  }

  return {
    quizzes: quizzes.map((item, index) => normalizeQuizItem(item, index)),
  };
}

export async function readQuizImportFile(file: File): Promise<ParsedQuizImport> {
  const rawText = await file.text();
  const parsed = JSON.parse(rawText) as unknown;
  return parseQuizImportJson(parsed);
}
