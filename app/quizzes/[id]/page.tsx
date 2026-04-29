"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { ActionButton } from '../../../src/components/ui';
import { useAppStore } from '../../../src/store/appStore';
import { QuizPreview } from '../../../src/features/quiz/QuizPreview';
import { createQuizSession } from '../../../src/services/quizApi';

export default function QuizPreviewPage() {
  const { loadQuiz, selectedQuiz, syncPath } = useAppStore();
  const params = useParams();
  const quizId = typeof params?.id === 'string' ? params.id : null;

  React.useEffect(() => {
    if (quizId) {
      void loadQuiz(quizId);
    }
  }, [quizId]);

  async function launchSession() {
    if (!selectedQuiz) return;
    try {
      const session = await createQuizSession(selectedQuiz.id, {});
      syncPath(`/sessions/${session.id}`);
    } catch {
      window.alert('The quiz could not start right now.');
    }
  }

  return (
    <div className="safeArea">
      <div className="page">
        <div className="hero">
          <span className="kicker">learning</span>
          <h1 className="title">Quiz preview</h1>
          <p className="subtitle">
            Review the details and start your practice session.
          </p>
          <div className="heroButtons">
            <ActionButton
              label="Back to search"
              onPress={() => syncPath('/')}
              variant="ghost"
            />
          </div>
        </div>

        {selectedQuiz ? (
          <QuizPreview
            quiz={selectedQuiz}
            onStartSolo={() => void launchSession()}
          />
        ) : (
          <div className="card">
            <p className="cardSubtitle">Loading quiz details...</p>
          </div>
        )}
      </div>
    </div>
  );
}
