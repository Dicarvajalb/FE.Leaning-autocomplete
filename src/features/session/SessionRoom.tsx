import React from 'react';
import { ActionButton } from '../../components/ui';
import type { QuizSessionDetail, QuizSessionResult } from '../../types';

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: string) {
  let state = hashString(seed) || 1;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function shuffleItems<T>(items: T[], seed: string) {
  const nextItems = [...items];
  const random = createSeededRandom(seed);

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const swapValue = nextItems[index];
    nextItems[index] = nextItems[swapIndex];
    nextItems[swapIndex] = swapValue;
  }

  return nextItems;
}

export function SessionRoom({
  session,
  result,
  loading,
  currentQuestionIndex,
  selectableWords,
  extraWords,
  maxSelectableWords,
  selectedOrder,
  onToggleWord,
  onSubmit,
  submitting,
  sessionError,
  responseFeedback,
  feed,
}: {
  session: QuizSessionDetail | null;
  result: QuizSessionResult | null;
  loading: boolean;
  currentQuestionIndex: number;
  selectableWords: { word: string; label: string }[];
  extraWords: { word: string; label: string }[];
  maxSelectableWords: number;
  selectedOrder: string[];
  onToggleWord: (word: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  sessionError: string | null;
  responseFeedback: { kind: 'positive' | 'negative'; label: string } | null;
  feed: { id: string; label: string }[];
}) {
  if (loading && !session && !result) {
    return (
      <div className="card">
        <div className="cardHeader">
          <div className="cardHeaderCopy">
            <h3 className="cardTitle">Loading session</h3>
            <p className="cardSubtitle">
              Fetching your current quiz and study state.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session && !result) {
    return (
      <div className="card">
        <h3 className="cardTitle">No session loaded</h3>
        <p className="cardSubtitle">
          Start from a quiz preview to begin a quiet practice round.
        </p>
      </div>
    );
  }

  const activeSession = session ?? result?.session ?? null;
  const question = activeSession?.quiz.questions[currentQuestionIndex] ?? null;
  const phraseSegments = question
    ? question.options
        .filter((option) => option.label !== 'EXTRA')
        .map((option, index) =>
          option.label === 'SHOW'
            ? {
                id: `${question.id}-phrase-${index}`,
                kind: 'word' as const,
                word: option.word,
              }
            : {
                id: `${question.id}-phrase-${index}`,
                kind: 'blank' as const,
              },
        )
    : [];
  const phraseNodes = question
    ? (() => {
        const nodes: React.ReactNode[] = [];
        let blankIndex = 0;

        phraseSegments.forEach((segment) => {
          if (segment.kind === 'word') {
            nodes.push(
              <span key={segment.id} className="phraseWord">
                {segment.word}
              </span>,
            );
            return;
          }

          const selectedWord = selectedOrder[blankIndex] ?? null;
          blankIndex += 1;

          nodes.push(
            selectedWord ? (
              <span key={segment.id} className="phraseWord">
                {selectedWord}
              </span>
            ) : (
              <div key={segment.id} className="phraseBlank" />
            ),
          );
        });

        return nodes;
      })()
    : [];
  const wordBank = React.useMemo(
    () =>
      shuffleItems(
        [...selectableWords, ...extraWords],
        question ? `${question.id}:word-bank` : 'empty-word-bank',
      ),
    [extraWords, question, selectableWords],
  );

  if (result) {
    return (
      <div className="card">
        <div className="cardHeader">
          <div className="cardHeaderCopy">
            <h3 className="cardTitle">Session result</h3>
            <p className="cardSubtitle">
              A recap of your practice session.
            </p>
          </div>
        </div>

        <div className="resultSummaryGrid">
          {result.participants.map((item) => (
            <div key={item.participantId} className="resultSummaryCard">
              <span className="resultSummaryScore">{item.correctAnswers}/{item.answeredQuestions} correct</span>
              
            </div>
          ))}
        </div>

        <div className="feedbackSection">
          <h3 className="optionsTitle">Review</h3>
          <p className="cardSubtitle">
            Review each question, the correct phrase, and every submitted answer
          </p>

          <div className="list">
            {result.questions.map((item) => {
              const questionCopy =
                result.session.quiz.questions[item.questionIndex]?.description ??
                `Question ${item.questionIndex + 1}`;

              return (
                <div key={item.questionId} className="feedbackCard">
                  <div className="feedbackCardHeader">
                    <div className="cardHeaderCopy">
                      <h4 className="listItemTitle">
                        Question {item.questionIndex + 1}
                      </h4>
                      <p className="listItemDescription">{questionCopy}</p>
                    </div>
                    <div className="badge">
                      <span>{item.answers.length > 0 ? 'Answered' : 'No answer'}</span>
                    </div>
                  </div>

                  <div className="feedbackAnswerGroup">
                    <span className="feedbackLabel">Correct answer</span>
                    <span className="feedbackAnswerText">
                      {item.canonicalOrder.join(' · ')}
                    </span>
                  </div>

                  <div className="feedbackAnswerList">
                    {item.answers.map((answer) => (
                      <div
                        key={answer.answerId}
                        className={`feedbackAnswerRow ${
                          answer.isCorrect
                            ? 'feedbackAnswerRowPositive'
                            : 'feedbackAnswerRowNegative'
                        }`}
                      >
                        <div className="feedbackAnswerRowHeader">
                          <span className="feedbackAnswerSeat">{answer.seat}</span>
                          <span
                            className={`feedbackAnswerState ${
                              answer.isCorrect
                                ? 'feedbackAnswerStatePositive'
                                : 'feedbackAnswerStateNegative'
                            }`}
                          >
                            {answer.isCorrect ? 'Correct' : 'Wrong'}
                          </span>
                        </div>
                        <span className="feedbackAnswerText">
                          {answer.selectedOrder.join(' · ') || 'No answer'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <div className="cardHeaderCopy">
          <h3 className="cardTitle">Live session</h3>
          <p className="cardSubtitle">A quiet space for study and recall.</p>
        </div>
      </div>

      {sessionError ? <span className="error">{sessionError}</span> : null}
      {responseFeedback ? (
        <span
          className={`responseFeedback ${
            responseFeedback.kind === 'positive'
              ? 'responseFeedbackPositive'
              : 'responseFeedbackNegative'
          }`}
        >
          {responseFeedback.label}
        </span>
      ) : null}

      <div className="questionBox">
        <h4 className="questionTitle">Current prompt</h4>
        <p className="questionText">
          {question
            ? `${currentQuestionIndex + 1}. ${question.description}`
            : 'No active prompt'}
        </p>
      </div>

      {question ? (
        <>
          <div className="phraseBox">
            <h4 className="phraseTitle">Complete the phrase</h4>
            <div className="phraseRow">
              {phraseNodes}
            </div>
          </div>

          <div className="bankBox">
            <div className="bankHeader">
              <div className="cardHeaderCopy">
                <h4 className="bankTitle">Word bank</h4>
                <p className="bankSubtitle">
                  Choose the words in the right order. When the blanks are filled, the rest settles quietly.
                </p>
              </div>
            </div>

            <div className="bankGrid">
              {wordBank.map((option) => {
                const isSelected = selectedOrder.includes(option.word);
                const isLocked = !isSelected && selectedOrder.length >= maxSelectableWords;
                return (
                  <button
                    type="button"
                    key={`${question.id}-${option.label}-${option.word}`}
                    onClick={() => onToggleWord(option.word)}
                    disabled={isLocked}
                    className={`bankItem ${isSelected ? 'bankItemSelected' : ''} ${isLocked ? 'bankItemLocked' : ''}`}
                  >
                    {option.word}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sessionActions">
            <ActionButton
              label={submitting ? 'Checking...' : 'Check answer'}
              onPress={onSubmit}
            />
          </div>
        </>
      ) : null}

      <div className="feedBox">
        <h4 className="detailLabel">Previous answers</h4>
        {feed.length === 0 ? (
          <p className="detailValue">Waiting for your first response...</p>
        ) : (
          feed.map((item) => (
            <p key={item.id} className="feedItem">
              {item.label}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
