import React from 'react';
import type { QuizDetail } from '../../types';
import { ActionButton, Section } from '../../components/ui';

export function QuizPreview({
  quiz,
  onStartSolo,
}: {
  quiz: QuizDetail;
  onStartSolo?: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  async function handleShare() {
    try {
      const url = `${window.location.origin}/quizzes/${quiz.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert('Failed to copy the link.');
    }
  }

  return (
    <Section title="Quiz preview" subtitle="A quick look before you begin the practice round.">
      <div className="quizHeaderBox">
        <h3 className="quizHeaderTitle">{quiz.title}</h3>
        <p className="quizHeaderSub">
          {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'} to study
        </p>
      </div>

      <div className="heroButtons">
        {onStartSolo ? (
          <ActionButton label="Begin practice" onPress={onStartSolo} />
        ) : null}
        <ActionButton
          label={copied ? 'Link copied!' : 'Share quiz'}
          onPress={() => void handleShare()}
          variant="secondary"
        />
      </div>
    </Section>
  );
}
