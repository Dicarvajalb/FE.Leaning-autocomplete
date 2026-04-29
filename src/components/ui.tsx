import React from 'react';

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  onSubmitEditing,
  returnKeyType = 'done',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmitEditing && !multiline) {
      onSubmitEditing();
    }
  };

  return (
    <div className="field">
      <span className="label">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="input textArea"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="input"
        />
      )}
    </div>
  );
}

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}) {
  const variantClass = {
    primary: '',
    secondary: 'buttonSecondary',
    danger: 'buttonDanger',
    ghost: 'buttonGhost',
  }[variant];

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      data-variant={variant}
      className={`button ${variantClass}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {label}
    </button>
  );
}

export function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="cardHeader">
        <div className="cardHeaderCopy">
          <h2 className="cardTitle">{title}</h2>
          {subtitle ? <p className="cardSubtitle">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
