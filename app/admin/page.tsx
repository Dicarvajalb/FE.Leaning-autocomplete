"use client";

import React from 'react';
import { ActionButton, Input, Section } from '../../src/components/ui';
import { QuestionOptionsEditor } from '../../src/features/quiz/QuestionOptionsEditor';
import { QuizSearcher } from '../../src/features/quiz/QuizSearcher';
import {
  QUIZ_DIFFICULTIES,
  questionToForm,
} from '../../src/features/quiz/quizViewModels';
import { useAppStore } from '../../src/store/appStore';

export default function AdminPage() {
  const importInputRef = React.useRef<HTMLInputElement | null>(null);
  const {
    adminAccessState,
    handleLogout,
    searchLoading,
    searchError,
    searchResults,
    page,
    totalPages,
    totalResults,
    loadSearch,
    loadQuiz,
    searchQuery,
    setSearchQuery,
    selectedQuizId,
    selectedQuiz,
    quizForm,
    setQuizForm,
    saveQuiz,
    removeQuiz,
    selectedQuestionId,
    setSelectedQuestionId,
    questionForm,
    setQuestionForm,
    saveQuestion,
    removeQuestion,
    beginNewQuiz,
    savingQuiz,
    savingQuestion,
    importingQuizzes,
    statusMessage,
    importQuizzesFromFile,
  } = useAppStore();

  if (adminAccessState === 'checking') {
    return (
      <div className="safeArea">
        <div className="page">
          <div className="hero">
            <span className="kicker">learnning Admin</span>
            <h1 className="title">Checking access</h1>
            <p className="subtitle">
              Verifying your session before opening the calm editor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="safeArea">
      <div className="page">
        <div className="hero">
          <span className="kicker">learnning Admin</span>
          <h1 className="title">Quiet editor</h1>
          <p className="subtitle">
            Manage published quizzes and their questions with a restrained, readable workspace.
          </p>
          <div className="heroButtons">
            <ActionButton label="Logout" onPress={handleLogout} variant="ghost" />
            <ActionButton
              label="New quiz"
              onPress={beginNewQuiz}
              variant="secondary"
            />
            <ActionButton
              label={importingQuizzes ? 'Importing...' : 'Import JSON'}
              onPress={() => importInputRef.current?.click()}
              variant="secondary"
              disabled={importingQuizzes}
            />
            <ActionButton
              label={searchLoading ? 'Loading...' : 'Refresh'}
              onPress={() => void loadSearch(page)}
              variant="ghost"
            />
          </div>
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) {
              return;
            }

            await importQuizzesFromFile(file);
          }}
        />

        <div className="columns">
          <div className="column leftColumn">
            <QuizSearcher
              title="Search quizzes"
              subtitle="Search by title and open a quiz in the editor."
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

            <Section
              title={selectedQuizId ? 'Edit quiz' : 'Create quiz'}
              subtitle="Quiz changes are validated and audited by the backend."
              action={
                <ActionButton
                  label={savingQuiz ? 'Saving...' : selectedQuizId ? 'Save changes' : 'Create'}
                  onPress={() => void saveQuiz()}
                />
              }
            >
              <Input
                label="Title"
                value={quizForm.title}
                onChangeText={(value) =>
                  setQuizForm((current) => ({ ...current, title: value }))
                }
                placeholder="Displayed quiz title"
              />
              <Input
                label="Topic"
                value={quizForm.topic}
                onChangeText={(value) =>
                  setQuizForm((current) => ({ ...current, topic: value }))
                }
                placeholder="Quiz topic"
              />
              <span className="label">Difficulty</span>
              <div className="optionLabelRow">
                {QUIZ_DIFFICULTIES.map((difficulty) => {
                  const isActive = quizForm.difficulty === difficulty;
                  return (
                    <button
                      type="button"
                      key={difficulty}
                      onClick={() => setQuizForm((current) => ({ ...current, difficulty }))}
                      className={`optionLabelChip ${isActive ? 'optionLabelChipActive' : ''}`}
                    >
                      {difficulty}
                    </button>
                  );
                })}
              </div>
              <Input
                label="Description"
                value={quizForm.description}
                onChangeText={(value) =>
                  setQuizForm((current) => ({ ...current, description: value }))
                }
                placeholder="Optional description"
                multiline
              />

              {selectedQuiz ? (
                <div className="detailBox">
                  <span className="detailLabel">Quiz ID</span>
                  <span className="detailValue">{selectedQuiz.id}</span>
                  <span className="detailLabel">Published content</span>
                  <span className="detailValue">
                    Once saved, the quiz is available to the public catalog.
                  </span>
                  <ActionButton
                    label="Delete quiz"
                    onPress={() => void removeQuiz()}
                    variant="danger"
                  />
                </div>
              ) : null}
            </Section>
          </div>

          <div className="column rightColumn">
            <Section
              title="Manage questions"
              subtitle="One question type is supported: autocomplete order selection."
            >
              {selectedQuiz ? (
                <>
                  <div className="quizHeaderBox">
                    <h3 className="quizHeaderTitle">{selectedQuiz.title}</h3>
                    <p className="quizHeaderSub">
                      {selectedQuiz.questions?.length ?? 0} question
                      {(selectedQuiz.questions?.length ?? 0) === 1 ? '' : 's'}
                    </p>
                  </div>

                  <div className="list">
                    {(selectedQuiz.questions ?? []).map((question, index) => {
                      const isActive = selectedQuestionId === question.id;
                      return (
                        <div
                          key={question.id}
                          onClick={() => {
                            setSelectedQuestionId(question.id);
                            setQuestionForm(questionToForm(question));
                          }}
                          className={`questionItem ${isActive ? 'questionItemActive' : ''}`}
                        >
                          <div className="listItemHeader">
                            <div className="listItemCopy">
                              <h4 className="listItemTitle">
                                {index + 1}. {question.description}
                              </h4>
                              <p className="listItemMeta">
                                {question.type} · {question.options.length} options
                              </p>
                            </div>
                          </div>
                          <div className="list">
                            {question.options.map((option) => (
                              <div
                                key={`${question.id}-${option.word}-${option.label}`}
                                className="optionChipRow"
                              >
                                <span className="optionWord">{option.word}</span>
                                <span className="badge">{option.label}</span>
                              </div>
                            ))}
                          </div>
                          <ActionButton
                            label="Delete question"
                            onPress={(e) => {
                              (e as unknown as React.MouseEvent).stopPropagation();
                              void removeQuestion(question.id);
                            }}
                            variant="danger"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <Section
                    title={selectedQuestionId ? 'Edit question' : 'Create question'}
                    subtitle="Server-side validation enforces the deterministic question model."
                    action={
                      <ActionButton
                        label={savingQuestion ? 'Saving...' : 'Save question'}
                        onPress={() => void saveQuestion()}
                      />
                    }
                  >
                    <Input
                      label="Description"
                      value={questionForm.description}
                      onChangeText={(value) =>
                        setQuestionForm((current) => ({
                          ...current,
                          description: value,
                        }))
                      }
                      placeholder="Question description"
                      multiline
                    />
                    <QuestionOptionsEditor
                      options={questionForm.options}
                      onChange={(nextOptions) =>
                        setQuestionForm((current) => ({
                          ...current,
                          options: nextOptions,
                        }))
                      }
                    />
                  </Section>
                </>
              ) : (
                <div className="emptyState">
                  <h3 className="emptyStateTitle">No quiz selected</h3>
                  <p className="emptyStateBody">
                    Load an existing quiz or create a new one to manage its questions.
                  </p>
                </div>
              )}
            </Section>

            <Section
              title="Admin notes"
              subtitle="The frontend talks directly to the protected admin endpoints."
            >
              <p className="note">• CRUD routes are used for quizzes and questions.</p>
              <p className="note">• Validation is handled server-side via AJV.</p>
              <p className="note">• Saved quizzes appear in public search.</p>
              <p className="note">• Mutations are audited by the backend.</p>
              <p className="note">• Import JSON accepts either an array of quizzes or a {`{ quizzes: [...] }`} object.</p>
            </Section>
          </div>
        </div>

        <div className="footer">
          <p className="footerText">{statusMessage}</p>
        </div>
      </div>
    </div>
  );
}
