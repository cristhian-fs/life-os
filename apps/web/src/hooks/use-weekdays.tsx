import { useTranslation } from 'react-i18next'

// Values are ISO-8601 weekdays (Mon=1..Sun=7) — must match the API's
// utcISODay(), which is what active_weekdays is actually checked against
// when computing streaks. A Sunday-first numbering here silently shifts
// every picked day by one on the backend.
export function useWeekDays() {
  const { t } = useTranslation()

  const WEEKDAYS = [
    {
      label: t('habits.form.week_days.mon'),
      value: '1',
    },
    {
      label: t('habits.form.week_days.tue'),
      value: '2',
    },
    {
      label: t('habits.form.week_days.wed'),
      value: '3',
    },
    {
      label: t('habits.form.week_days.thu'),
      value: '4',
    },
    {
      label: t('habits.form.week_days.fri'),
      value: '5',
    },
    {
      label: t('habits.form.week_days.sat'),
      value: '6',
    },
    {
      label: t('habits.form.week_days.sun'),
      value: '7',
    },
  ]

  return { WEEKDAYS }
}
