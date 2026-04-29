"use client";

import React from 'react';
import { createQuizSession } from '../src/services/quizApi';
import { useAppStore } from '../src/store/appStore';
import { QuizSearcher } from '../src/features/quiz/QuizSearcher';
import { QuizPreview } from '../src/features/quiz/QuizPreview';

export default function HomePage() {
  const previewFocusRef = React.useRef<HTMLDivElement | null>(null);
  const {
    searchQuery,
    setSearchQuery,
    searchLoading,
    searchError,
    searchResults,
    page,
    totalPages,
    totalResults,
    selectedQuiz,
    syncPath,
    loadSearch,
    loadQuiz,
  } = useAppStore();

  React.useEffect(() => {
    if (!selectedQuiz || !previewFocusRef.current) {
      return;
    }

    previewFocusRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    previewFocusRef.current.focus();
  }, [selectedQuiz]);

  async function launchSession() {
    if (!selectedQuiz) {
      window.alert('Load a quiz before starting a session.');
      return;
    }

    try {
      const session = await createQuizSession(selectedQuiz.id, {});
      syncPath(`/sessions/${session.id}`);
    } catch {
      window.alert('The quiz could not start right now. The preview stays on screen so you can try again.');
    }
  }

  return (
    <div className="safeArea">
      <div className="page">
        <div className="hero">
          <span className="kicker">learnning</span>
          <h1 className="title">Quiz library</h1>
          <p className="subtitle">
            Find a quiz, preview it, and begin a practice round when you are ready.
          </p>
        </div>
        <QuizSearcher
          title="Search quizzes"
          subtitle="Search by title or topic"
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchLoading={searchLoading}
          searchError={searchError}
          searchResults={searchResults}
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          onSearch={() => void loadSearch(1)}
          onPrev={() => void loadSearch(Math.max(1, page - 1))}
          onNext={() => void loadSearch(Math.min(totalPages, page + 1))}
          onSelectQuiz={(quizId) => void loadQuiz(quizId)}
          searchActionLabel="Search"
          searchPlaceholder="Type a quiz title"
          actionVariant="secondary"
        />

        {selectedQuiz ? (
          <div ref={previewFocusRef} tabIndex={-1}>
            <QuizPreview
              quiz={selectedQuiz}
              onStartSolo={() => void launchSession()}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
