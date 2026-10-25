import { useTranslation } from 'react-i18next'
import { PageHeading } from '../components/molecules/PageHeading'
import { SectionGrid } from '../components/organisms/SectionGrid'
import { Toolbar } from '../components/organisms/Toolbar'
import { HomeTemplate } from '../components/templates/HomeTemplate'
import { useTheme } from '../hooks/useTheme'
import { languages } from '../i18n'

const sectionKeys = ['fundamentals', 'processes', 'memory', 'storage', 'caseStudies'] as const

export function HomePage() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const sections = sectionKeys.map((key) => ({ key, label: t(`sections.${key}`) }))

  return (
    <HomeTemplate
      toolbar={
        <Toolbar
          languages={languages}
          currentLanguage={i18n.resolvedLanguage}
          onLanguageChange={(language) => i18n.changeLanguage(language)}
          isDark={theme === 'dark'}
          themeLabel={t('toolbar.darkMode')}
          onThemeToggle={toggleTheme}
        />
      }
      heading={<PageHeading title={t('home.title')} subtitle={t('home.subtitle')} />}
      content={<SectionGrid sections={sections} />}
    />
  )
}
