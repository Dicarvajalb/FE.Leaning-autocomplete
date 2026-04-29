import React from 'react';
import type { QuizSearchItem } from '../../types';
import { ActionButton } from '../../components/ui';

export function QuizSearchResults({
  searchLoading,
  searchError,
  searchResults,
  page,
  totalPages,
  totalResults,
  onPrev,
  onNext,
  onSelectQuiz,
}: {
  searchLoading: boolean;
  searchError: string | null;
  searchResults: QuizSearchItem[];
  page: number;
  totalPages: number;
  totalResults: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectQuiz: (quizId: string) => void;
}) {
  return (
    <>
      <div className="pager">
        <ActionButton
          label="Prev"
          onPress={onPrev}
          variant="ghost"
        />
        <div className="pagerInfo">
          <p className="pagerTitle">
            Page {page} of {totalPages}
          </p>
          <p className="pagerSub">
            {totalResults} study set{totalResults === 1 ? '' : 's'} total
          </p>
        </div>
        <ActionButton
          label="Next"
          onPress={onNext}
          variant="ghost"
        />
      </div>

      {searchError ? <span className="error">{searchError}</span> : null}
      {searchLoading ? <span className="meta">Loading study sets...</span> : null}

      <div className="list">
        {searchResults.map((quiz) => (
          <div
            key={quiz.id}
            onClick={() => onSelectQuiz(quiz.id)}
            className="listItem"
          >
            <div className="listItemHeader">
              <div className="listItemCopy">
                <h3 className="listItemTitle">{quiz.title}</h3>
                <p className="listItemMeta">
                  {quiz.topic} &middot; {quiz.difficulty}
                </p>
              </div>
              <span className="badge">{quiz.questionCount} Q</span>
            </div>
            {quiz.description ? (
              <p className="listItemDescription">
                {quiz.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
