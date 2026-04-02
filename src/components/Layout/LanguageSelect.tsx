import React from 'react';
import { useI18n } from '../../i18n';

interface LanguageSelectProps {
  inline?: boolean;
  showLabel?: boolean;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  inline = false,
  showLabel = true,
}) => {
  const { locale, setLocale, languages, t } = useI18n();

  return (
    <label className={`language-picker${inline ? ' language-picker--inline' : ''}`}>
      {showLabel && (
        <span className="language-picker__label">
          {t.languageLabel}
        </span>
      )}
      <select
        className="language-picker__select"
        value={locale}
        aria-label={t.languageLabel}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
      >
        {languages.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
};
