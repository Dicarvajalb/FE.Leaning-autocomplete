"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  createQuestion,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  getCurrentUser,
  getQuiz,
  logout,
  searchQuizzes,
  updateQuestion,
  updateQuiz,
} from '../services/quizApi';
import type {
  QuizDetail,
  QuizSearchItem,
} from '../types';
import {
  emptyQuestionForm,
  emptyQuizForm,
  errorWithFallback,
  normalizeQuestionForm,
  normalizeQuizForm,
  quizToForm,
  type QuestionFormState,
  type QuizFormState,
} from '../features/quiz/quizViewModels';
import {
  readQuizImportFile,
  type ParsedQuizImport,
} from '../features/quiz/quizImport';

type AdminAccessState = 'checking' | 'authenticated' | 'unauthenticated';

type AppStoreValue = {
  syncRoute: (nextRoute: string, replace?: boolean) => void;
  syncPath: (targetPath: string, replace?: boolean) => void;
  adminAccessState: AdminAccessState;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  searchLoading: boolean;
  searchError: string | null;
  searchResults: QuizSearchItem[];
  totalResults: number;
  selectedQuizId: string | null;
  selectedQuiz: QuizDetail | null;
  quizForm: QuizFormState;
  setQuizForm: React.Dispatch<React.SetStateAction<QuizFormState>>;
  selectedQuestionId: string | null;
  setSelectedQuestionId: React.Dispatch<React.SetStateAction<string | null>>;
  questionForm: QuestionFormState;
  setQuestionForm: React.Dispatch<React.SetStateAction<QuestionFormState>>;
  statusMessage: string;
  savingQuiz: boolean;
  savingQuestion: boolean;
  importingQuizzes: boolean;
  totalPages: number;
  handleLogout: () => Promise<void>;
  loadSearch: (nextPage?: number) => Promise<void>;
  loadQuiz: (quizId: string) => Promise<void>;
  saveQuiz: () => Promise<void>;
  removeQuiz: () => Promise<void>;
  saveQuestion: () => Promise<void>;
  removeQuestion: (questionId: string) => Promise<void>;
  importQuizzesFromFile: (file: File) => Promise<void>;
  beginNewQuiz: () => void;
  refreshSelectedQuiz: (quizId: string) => Promise<QuizDetail>;
};

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminAccessState, setAdminAccessState] =
    useState<AdminAccessState>('checking');

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<QuizSearchItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDetail | null>(null);
  const [quizForm, setQuizForm] = useState<QuizFormState>(emptyQuizForm());
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(
    emptyQuestionForm(),
  );
  const [statusMessage, setStatusMessage] = useState(
    'Use the search panel to load a quiz or create a new one.',
  );
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [importingQuizzes, setImportingQuizzes] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalResults / limit)),
    [totalResults],
  );

  const syncPath = (targetPath: string, replace = false) => {
    if (replace) {
      router.replace(targetPath);
    } else {
      router.push(targetPath);
    }
  };

  const syncRoute = (nextRoute: string, replace = false) => {
    const targetPath =
      nextRoute === 'admin'
        ? '/admin'
        : nextRoute === 'login'
          ? '/login'
          : nextRoute === 'search'
            ? '/'
            : nextRoute === 'session'
              ? '/sessions'
              : '/';
    syncPath(targetPath, replace);
  };

  function resetAdminState() {
    setSearchQuery('');
    setPage(1);
    setSearchLoading(false);
    setSearchError(null);
    setSearchResults([]);
    setTotalResults(0);
    setSelectedQuizId(null);
    setSelectedQuiz(null);
    setQuizForm(emptyQuizForm());
    setSelectedQuestionId(null);
    setQuestionForm(emptyQuestionForm());
    setStatusMessage('Use the search panel to load a quiz or create a new one.');
    setSavingQuiz(false);
    setSavingQuestion(false);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // The cookie may already be gone; we still clear the local UI.
    } finally {
      resetAdminState();
      syncRoute('login', true);
    }
  }

  async function loadSearch(nextPage = page) {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const result = await searchQuizzes(searchQuery.trim(), nextPage, limit);
      setSearchResults(result.items);
      setTotalResults(result.total);
      setPage(result.page);
      setStatusMessage(
        `Loaded ${result.items.length} quizzes from page ${result.page}.`,
      );
    } catch {
      const message = errorWithFallback(
        'Unable to search quizzes',
        'The last loaded results remain on screen. Try searching again or refreshing the page.',
      );
      setSearchError(message);
      setStatusMessage(message);
    } finally {
      setSearchLoading(false);
    }
  }

  async function loadQuiz(quizId: string) {
    try {
      const quiz = await getQuiz(quizId);
      setSelectedQuizId(quiz.id);
      setSelectedQuiz(quiz);
      setQuizForm(quizToForm(quiz));
      setSelectedQuestionId(null);
      setQuestionForm(emptyQuestionForm());
      setStatusMessage(`Loaded quiz ${quiz.title}.`);
    } catch {
      const message = errorWithFallback(
        'Unable to load quiz',
        'The public quiz list is still available. Select another quiz or try again.',
      );
      setStatusMessage(message);
      window.alert(message);
    }
  }

  async function refreshSelectedQuiz(quizId: string) {
    const quiz = await getQuiz(quizId);
    setSelectedQuiz(quiz);
    setQuizForm(quizToForm(quiz));
    return quiz;
  }

  async function saveQuiz() {
    const payload = normalizeQuizForm(quizForm);
    if (!payload.title || !payload.topic) {
      window.alert('Title and topic are required.');
      return;
    }

    setSavingQuiz(true);
    try {
      const quiz = selectedQuizId
        ? await updateQuiz(selectedQuizId, payload)
        : await createQuiz(payload);
      setSelectedQuizId(quiz.id);
      setSelectedQuiz(quiz);
      setQuizForm(quizToForm(quiz));
      setStatusMessage(
        selectedQuizId ? 'Quiz updated successfully.' : 'Quiz created successfully.',
      );
      await loadSearch();
    } catch {
      const message = errorWithFallback(
        'Unable to save quiz',
        'Your form data stays in the editor, so you can retry after checking the connection or the required fields.',
      );
      setStatusMessage(message);
      window.alert(message);
    } finally {
      setSavingQuiz(false);
    }
  }

  async function removeQuiz() {
    if (!selectedQuizId) {
      return;
    }

    if (window.confirm('Delete quiz. This action cannot be undone.')) {
      try {
        await deleteQuiz(selectedQuizId);
        setSelectedQuizId(null);
        setSelectedQuiz(null);
        setQuizForm(emptyQuizForm());
        setSelectedQuestionId(null);
        setQuestionForm(emptyQuestionForm());
        setStatusMessage('Quiz deleted successfully.');
        await loadSearch();
      } catch {
        const message = errorWithFallback(
          'Unable to delete quiz',
          'The quiz remains unchanged in the backend. You can retry the delete action once the connection is stable.',
        );
        setStatusMessage(message);
        window.alert(message);
      }
    }
  }

  async function saveQuestion() {
    if (!selectedQuizId) {
      window.alert('Load or create a quiz before editing questions.');
      return;
    }

    const payload = normalizeQuestionForm(questionForm);
    if (!payload.description || payload.options.length === 0) {
      window.alert('Description and options are required.');
      return;
    }

    setSavingQuestion(true);
    try {
      if (selectedQuestionId) {
        await updateQuestion(selectedQuizId, selectedQuestionId, payload);
      } else {
        await createQuestion(selectedQuizId, payload);
      }

      const refreshedQuiz = await refreshSelectedQuiz(selectedQuizId);
      setSelectedQuiz(refreshedQuiz);
      setSelectedQuizId(refreshedQuiz.id);
      setQuizForm(quizToForm(refreshedQuiz));
      setSelectedQuestionId(null);
      setQuestionForm(emptyQuestionForm());
      setStatusMessage(
        selectedQuestionId
          ? 'Question updated successfully.'
          : 'Question created successfully.',
      );
      await loadSearch();
    } catch {
      const message = errorWithFallback(
        'Unable to save question',
        'Your question edits stay in the form, so nothing is lost. You can retry after fixing the connection or the option list.',
      );
      setStatusMessage(message);
      window.alert(message);
    } finally {
      setSavingQuestion(false);
    }
  }

  async function importQuizzesFromPayload(payload: ParsedQuizImport) {
    if (payload.quizzes.length === 0) {
      throw new Error('Import file does not contain any quizzes');
    }

    setImportingQuizzes(true);
    const createdQuizIds: string[] = [];
    try {
      let createdQuizCount = 0;
      let createdQuestionCount = 0;
      let lastImportedQuizId: string | null = null;

      for (const quizInput of payload.quizzes) {
        const createdQuiz = await createQuiz({
          title: quizInput.title,
          topic: quizInput.topic,
          difficulty: quizInput.difficulty,
          description: quizInput.description,
        });

        createdQuizIds.push(createdQuiz.id);
        createdQuizCount += 1;
        lastImportedQuizId = createdQuiz.id;

        for (const question of quizInput.questions ?? []) {
          await createQuestion(createdQuiz.id, question);
          createdQuestionCount += 1;
        }
      }

      await loadSearch();

      if (lastImportedQuizId) {
        await loadQuiz(lastImportedQuizId);
      }

      const quizLabel = createdQuizCount === 1 ? 'quiz' : 'quizzes';
      const questionLabel =
        createdQuestionCount === 1 ? 'question' : 'questions';
      const message = `Imported ${createdQuizCount} ${quizLabel}${createdQuestionCount > 0 ? ` and ${createdQuestionCount} ${questionLabel}` : ''}.`;
      setStatusMessage(message);
      window.alert(message);
    } catch (error) {
      for (const quizId of createdQuizIds.reverse()) {
        try {
          await deleteQuiz(quizId);
        } catch {
          // Best effort rollback only.
        }
      }

      throw error;
    } finally {
      setImportingQuizzes(false);
    }
  }

  async function importQuizzesFromFile(file: File) {
    if (!file) {
      return;
    }

    try {
      const payload = await readQuizImportFile(file);
      await importQuizzesFromPayload(payload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The JSON file could not be imported.';
      const friendlyMessage = errorWithFallback(
        'Unable to import quizzes',
        message,
      );
      setStatusMessage(friendlyMessage);
      window.alert(friendlyMessage);
    }
  }

  async function removeQuestion(questionId: string) {
    if (!selectedQuizId) {
      return;
    }

    setStatusMessage('Deleting question...');
    try {
      await deleteQuestion(selectedQuizId, questionId);
      await refreshSelectedQuiz(selectedQuizId);
      setSelectedQuestionId(null);
      setQuestionForm(emptyQuestionForm());
      setStatusMessage('Question deleted successfully.');
      await loadSearch();
    } catch {
      const message = errorWithFallback(
        'Unable to delete question',
        'The question is still present in the quiz. You can retry the action after reconnecting.',
      );
      setStatusMessage(message);
      window.alert(message);
    }
  }

  function beginNewQuiz() {
    setSelectedQuizId(null);
    setSelectedQuiz(null);
    setQuizForm(emptyQuizForm());
    setSelectedQuestionId(null);
    setQuestionForm(emptyQuestionForm());
    setStatusMessage('Creating a new quiz.');
  }

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    void loadSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!pathname || !pathname.startsWith('/admin')) {
      setAdminAccessState('unauthenticated');
      return;
    }

    let cancelled = false;
    setAdminAccessState('checking');

    void (async () => {
      try {
        const currentUser = await getCurrentUser();
        if (cancelled) {
          return;
        }

        if (currentUser.role !== 'ADMIN') {
          setAdminAccessState('unauthenticated');
          syncRoute('login', true);
          return;
        }

        setAdminAccessState('authenticated');
      } catch {
        if (cancelled) {
          return;
        }

        setAdminAccessState('unauthenticated');
        syncRoute('login', true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!pathname || !pathname.startsWith('/admin') || adminAccessState !== 'authenticated') {
      return;
    }

    void loadSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, adminAccessState]);

  useEffect(() => {
    if (!pathname || !pathname.startsWith('/login')) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const currentUser = await getCurrentUser();
        if (cancelled) {
          return;
        }

        if (currentUser.role === 'ADMIN') {
          syncRoute('admin', true);
        }
      } catch {
        // Stay on the login page when there is no active session.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const value = useMemo<AppStoreValue>(
    () => ({
      syncRoute,
      syncPath,
      adminAccessState,
      searchQuery,
      setSearchQuery,
      page,
      setPage,
      limit,
      searchLoading,
      searchError,
      searchResults,
      totalResults,
      selectedQuizId,
      selectedQuiz,
      quizForm,
      setQuizForm,
      selectedQuestionId,
      setSelectedQuestionId,
      questionForm,
      setQuestionForm,
      statusMessage,
      savingQuiz,
      savingQuestion,
      importingQuizzes,
      totalPages,
      handleLogout,
      loadSearch,
      loadQuiz,
      saveQuiz,
      removeQuiz,
      saveQuestion,
      removeQuestion,
      importQuizzesFromFile,
      beginNewQuiz,
      refreshSelectedQuiz,
    }),
    [
      adminAccessState,
    beginNewQuiz,
    handleLogout,
    importQuizzesFromFile,
    limit,
    page,
    questionForm,
      importingQuizzes,
      removeQuestion,
      removeQuiz,
      savingQuestion,
      savingQuiz,
      searchError,
      searchLoading,
      searchQuery,
      searchResults,
      selectedQuestionId,
    selectedQuiz,
    selectedQuizId,
    statusMessage,
    totalPages,
    totalResults,
    quizForm,
    loadSearch,
    loadQuiz,
    saveQuiz,
    saveQuestion,
    refreshSelectedQuiz,
  ],
  );

  return (
    <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }

  return context;
}
