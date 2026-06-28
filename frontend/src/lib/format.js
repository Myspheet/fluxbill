// Money is kobo (integer) everywhere. Convert at the UI edge only.

export function formatKobo(kobo) {
  const naira = (Number(kobo) || 0) / 100
  return '₦' + naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Short form for big hero numbers, e.g. 24000000 kobo -> "₦240,000".
export function formatKoboShort(kobo) {
  const naira = (Number(kobo) || 0) / 100
  return '₦' + naira.toLocaleString('en-NG', { maximumFractionDigits: 0 })
}

export function nairaToKobo(naira) {
  return Math.round((Number(naira) || 0) * 100)
}
