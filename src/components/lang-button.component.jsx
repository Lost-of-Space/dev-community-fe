import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'uk' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isEnglish = i18n.language === 'en';

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{isEnglish ? '🇬🇧' : '🇺🇦'}</span>
      <button
        onClick={toggleLanguage}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300
          ${isEnglish ? 'bg-royalblue' : 'bg-yellow'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300
            ${isEnglish ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
