import React, { useState } from 'react';
import { ActionButton, Input } from '../../components/ui';
import type { QuestionOptionFormState } from './quizViewModels';
import {
  QUESTION_OPTION_LABELS,
  createQuestionOptionDraft,
  moveQuestionOptionBefore,
  moveQuestionOptionToEnd,
} from './quizViewModels';

type Props = {
  options: QuestionOptionFormState[];
  onChange: (nextOptions: QuestionOptionFormState[]) => void;
};

type DropZoneState = {
  targetId: string | null;
};

export function QuestionOptionsEditor({ options, onChange }: Props) {
  const [draggedOptionId, setDraggedOptionId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropAtEndActive, setDropAtEndActive] = useState(false);

  function updateOption(
    optionId: string,
    patch: Partial<QuestionOptionFormState>,
  ) {
    onChange(
      options.map((option) =>
        option.id === optionId ? { ...option, ...patch } : option,
      ),
    );
  }

  function addOption() {
    onChange([...options, createQuestionOptionDraft()]);
  }

  function removeOption(optionId: string) {
    onChange(options.filter((option) => option.id !== optionId));
  }

  function startDragging(optionId: string) {
    setDraggedOptionId(optionId);
    setDropTargetId(null);
    setDropAtEndActive(false);
  }

  function clearDraggingState() {
    setDraggedOptionId(null);
    setDropTargetId(null);
    setDropAtEndActive(false);
  }

  function moveBefore(targetId: string | null) {
    if (!draggedOptionId) {
      return;
    }

    if (!targetId) {
      moveToEnd();
      return;
    }

    onChange(moveQuestionOptionBefore(options, draggedOptionId, targetId));
    clearDraggingState();
  }

  function moveToEnd() {
    if (!draggedOptionId) {
      return;
    }

    onChange(moveQuestionOptionToEnd(options, draggedOptionId));
    clearDraggingState();
  }

  function renderDropZone(zone: DropZoneState, key: string) {
    const isActive = dropTargetId === zone.targetId || (dropAtEndActive && zone.targetId === null);

    return (
      <div
        key={key}
        style={{
          border: '1px dashed rgba(176, 163, 147, 0.42)',
          borderRadius: 18,
          padding: 0,
          marginBottom: 10,
          backgroundColor: isActive ? '#e4efe8' : '#fbf7f0',
          borderColor: isActive ? '#6f9787' : 'rgba(176, 163, 147, 0.42)',
          height: 20,
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (draggedOptionId) {
            setDropTargetId(zone.targetId);
            setDropAtEndActive(zone.targetId === null);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          moveBefore(zone.targetId);
        }}
        onDragLeave={() => {
          if (zone.targetId === null) {
            setDropAtEndActive(false);
            return;
          }

          setDropTargetId((current) => (current === zone.targetId ? null : current));
        }}
      />
    );
  }

  return (
    <div>
      <div className="optionsHeader">
        <div className="cardHeaderCopy">
          <h3 className="optionsTitle">Options</h3>
          <p className="meta" style={{ margin: 0 }}>
            Drag the handle to reorder. Drop between options to shape the phrase with care.
          </p>
        </div>
        <ActionButton label="Add word" onPress={addOption} variant="secondary" />
      </div>

      {renderDropZone(
        { targetId: options[0]?.id ?? null },
        'drop-zone-top',
      )}

      {options.map((option, index) => {
        const isDragged = draggedOptionId === option.id;

        return (
          <React.Fragment key={option.id}>
            <div
              className="card"
              style={{
                opacity: isDragged ? 0.55 : 1,
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label={`Word ${index + 1}`}
                    value={option.word}
                    onChangeText={(value) => updateOption(option.id, { word: value })}
                    placeholder="Word"
                  />
                </div>
                <button
                  type="button"
                    draggable
                    aria-label={`Drag option ${index + 1}`}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', option.id);
                    startDragging(option.id);
                  }}
                  onDragEnd={clearDraggingState}
                  style={{
                    appearance: 'none',
                    border: '1px solid rgba(176, 163, 147, 0.42)',
                    backgroundColor: '#eef4ef',
                    color: '#22322b',
                    borderRadius: 999,
                    width: 36,
                    height: 36,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDragged ? 'grabbing' : 'grab',
                    fontSize: 18,
                    fontWeight: 900,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ::
                </button>
              </div>

              <div>
                <span className="label">Label</span>
                <div className="optionLabelRow">
                  {QUESTION_OPTION_LABELS.map((label) => {
                    const isActive = option.label === label;
                    return (
                      <button
                        type="button"
                        key={label}
                        onClick={() => updateOption(option.id, { label })}
                        className={`optionLabelChip ${isActive ? 'optionLabelChipActive' : ''}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <ActionButton
                  label="Remove"
                  onPress={() => removeOption(option.id)}
                  variant="ghost"
                />
              </div>
            </div>

            {index < options.length - 1
              ? renderDropZone(
                  {
                    targetId: options[index + 1].id,
                  },
                  `drop-zone-${option.id}-${options[index + 1].id}`,
                )
              : null}
          </React.Fragment>
        );
      })}

      <div
        style={{
          border: '1px dashed rgba(176, 163, 147, 0.42)',
          borderRadius: 18,
          padding: 0,
          marginTop: 6,
          backgroundColor: dropAtEndActive ? '#e4efe8' : '#fbf7f0',
          borderColor: dropAtEndActive ? '#6f9787' : 'rgba(176, 163, 147, 0.42)',
          height: 20,
          textAlign: 'center',
          fontSize: 12,
          lineHeight: '18px',
          color: '#6d625a'
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (draggedOptionId) {
            setDropAtEndActive(true);
            setDropTargetId(null);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          moveToEnd();
        }}
        onDragLeave={() => {
          setDropAtEndActive(false);
        }}
      />
    </div>
  );
}
