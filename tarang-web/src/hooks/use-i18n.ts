import { create } from 'zustand'
import { locales, LocaleType } from './locales'

interface i18nStore {
    language: 'en' | 'hi'
    t: LocaleType
    setLanguage: (lang: 'en' | 'hi') => void
}

export const useI18n = create<i18nStore>((set: any) => ({
    language: 'en',
    t: locales.en,
    setLanguage: (lang: 'en' | 'hi') => set({ language: lang, t: locales[lang] }),
}))
