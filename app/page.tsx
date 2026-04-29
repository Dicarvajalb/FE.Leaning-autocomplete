"use client";

import React from 'react';
import { useAppStore } from '../src/store/appStore';
import { QuizSearcher } from '../src/features/quiz/QuizSearcher';

export default function HomePage() {
  const {
    searchQuery,
    setSearchQuery,
    searchLoading,
    searchError,
    searchResults,
    page,
    totalPages,
    totalResults,
    syncPath,
    loadSearch,
  } = useAppStore();

  return (
    <div className="safeArea">
      <div className="page">
        <div className="hero">
          <span className="kicker">learnning</span>
          <h1 className="title">Quiz library</h1>
          <p className="subtitle">
            Find a quiz and begin a practice round when you are ready.
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
          onSelectQuiz={(quizId) => syncPath(`/quizzes/${quizId}`)}
          searchActionLabel="Search"
          searchPlaceholder="Type a quiz title"
          actionVariant="secondary"
        />
      </div>
    </div>
  );
}
