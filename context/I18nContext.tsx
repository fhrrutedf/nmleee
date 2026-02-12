'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en' | 'es';
type Direction = 'rtl' | 'ltr';

interface LanguageConfig {
    code: Language;
    name: string;
    nativeName: string;
    direction: Direction;
}

const languages: Record<Language, LanguageConfig> = {
    ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
    en: { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
    es: { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' }
};

interface I18nContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    config: LanguageConfig;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ar');
    const [translations, setTranslations] = useState<Record<string, any>>({});

    // Load translations
    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const response = await fetch(`/locales/${language}.json`);
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error('Failed to load translations:', error);
            }
        };

        loadTranslations();

        // Update HTML attributes
        document.documentElement.lang = language;
        document.documentElement.dir = languages[language].direction;
    }, [language]);

    // Persist language preference
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('preferredLanguage', lang);
    };

    // Load saved language on mount
    useEffect(() => {
        const saved = localStorage.getItem('preferredLanguage') as Language;
        if (saved && languages[saved]) {
            setLanguageState(saved);
        }
    }, []);

    // Translation function with nested key support
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations;

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }

        return typeof value === 'string' ? value : key;
    };

    const config = languages[language];

    return (
        <I18nContext.Provider
            value={{
                language,
                direction: config.direction,
                setLanguage,
                t,
                config
            }}
        >
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}

// Language Switcher Component
export function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { language, setLanguage, config } = useI18n();

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {Object.values(languages).map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${language === lang.code
                            ? 'bg-action-blue text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    {lang.nativeName}
                </button>
            ))}
        </div>
    );
}
