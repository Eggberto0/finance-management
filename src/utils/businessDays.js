const NATIONAL_HOLIDAYS = [
  '01-01', '04-21', '05-01', '09-07',
  '10-12', '11-02', '11-15', '11-20', '12-25',
]

function isHoliday(date) {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return NATIONAL_HOLIDAYS.includes(mmdd)
}

function isBusinessDay(date) {
  const day = date.getDay()
  return day !== 0 && day !== 6 && !isHoliday(date)
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function getLastBusinessDay(year, month) {
  const lastDay = new Date(year, month, 0)
  while (!isBusinessDay(lastDay)) {
    lastDay.setDate(lastDay.getDate() - 1)
  }
  return lastDay
}

export function getNthBusinessDay(year, month, n) {
  const date = new Date(year, month - 1, 1)
  let count = 0
  while (true) {
    if (isBusinessDay(date)) {
      count++
      if (count === n) return date
    }
    date.setDate(date.getDate() + 1)
    if (date.getMonth() !== month - 1) break
  }
  return null
}

export function getNthWeekday(year, month, n, weekday) {
  const date = new Date(year, month - 1, 1)
  let count = 0
  while (date.getMonth() === month - 1) {
    if (date.getDay() === weekday) {
      count++
      if (count === n) return date
    }
    date.setDate(date.getDate() + 1)
  }
  return null
}

export function applyFallback(date, fallback) {
  if (isBusinessDay(date)) return date
  const direction = fallback === 'before' ? -1 : 1
  const result = new Date(date)
  while (!isBusinessDay(result)) {
    result.setDate(result.getDate() + direction)
  }
  return result
}

export function calcRuleDate(rule, year, month) {
  const { type, day, weekday, fallback } = rule.dayRule

  let date
  if (type === 'fixed') {
    date = new Date(year, month - 1, day, 12, 0, 0)
    date = applyFallback(date, fallback)
  } else if (type === 'lastBusinessDay') {
    date = getLastBusinessDay(year, month)
    date.setHours(12, 0, 0, 0)
  } else if (type === 'nthBusinessDay') {
    date = getNthBusinessDay(year, month, day)
    date?.setHours(12, 0, 0, 0)
  } else if (type === 'nthWeekday') {
    date = getNthWeekday(year, month, day, weekday)
    date?.setHours(12, 0, 0, 0)
  }

  return date ?? null
}