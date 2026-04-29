"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { ActionButton } from '../../../src/components/ui';
import { useAppStore } from '../../../src/store/appStore';
import { useQuizSessionController } from '../../../src/hooks/useQuizSessionController';
import { SessionRoom } from '../../../src/features/session/SessionRoom';

export default function SessionPage() {
  const { syncPath } = useAppStore();
  const params = useParams();
  const sessionId = typeof params?.id === 'string' ? params.id : null;

  const controller = useQuizSessionController({ sessionId });

  return (
    <div className="safeArea">
      <div className="page">
        <div className="hero">
          <span className="kicker">learnning</span>
          <h1 className="title">Study session</h1>
          <p className="subtitle">
            No timer and one question at a time.
          </p>
          <div className="heroButtons">
            <ActionButton
              label="Back to search"
              onPress={() => syncPath('/')}
              variant="ghost"
            />
          </div>
        </div>

        <SessionRoom
          session={controller.session}
          result={controller.result}
          loading={controller.loading}
          currentQuestionIndex={controller.session?.currentQuestion ?? 0}
          selectableWords={controller.selectableWords}
          extraWords={controller.extraWords}
          maxSelectableWords={controller.maxSelectableWords}
          selectedOrder={controller.selectedOrder}
          onToggleWord={controller.toggleWord}
          onSubmit={controller.submitCurrentAnswer}
          submitting={controller.submitting}
          sessionError={controller.sessionError}
          responseFeedback={controller.responseFeedback}
          feed={controller.feed}
        />
      </div>
    </div>
  );
}
