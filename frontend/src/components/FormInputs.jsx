import { useCallback, useEffect, useRef, useState } from 'react'

export function Select({ label, value, onChange, options, placeholder = 'Select…', error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      {label && <label className="label">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-sm text-left transition outline-none ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : open
              ? 'border-nomba-yellow ring-2 ring-nomba-yellow/40'
              : 'border-neutral-300 hover:border-neutral-400 focus:border-nomba-yellow focus:ring-2 focus:ring-nomba-yellow/40'
        }`}
      >
        <span className={selected ? 'text-ink' : 'text-neutral-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronIcon className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-neutral-200 bg-white py-1 shadow-lg animate-scale-in overflow-hidden max-h-60 overflow-y-auto">
          {placeholder && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 ${
                !value ? 'text-nomba-black font-medium bg-nomba-yellow/5' : 'text-neutral-400'
              }`}
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 flex items-center justify-between ${
                value === opt.value ? 'text-nomba-black font-medium bg-nomba-yellow/5' : 'text-ink'
              }`}
            >
              {opt.label}
              {value === opt.value && <CheckIcon className="h-4 w-4 text-nomba-yellow" />}
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function DateInput({ label, value, onChange, placeholder = 'Pick a date', error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const hasValue = !!value

  function formatDisplay(val) {
    if (!val) return ''
    return new Date(val + 'T00:00:00').toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function handleSelect(dateStr) {
    onChange(dateStr)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {label && <label className="label">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center rounded-lg border bg-white px-3 py-2.5 text-sm text-left transition outline-none ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : open
              ? 'border-nomba-yellow ring-2 ring-nomba-yellow/40'
              : 'border-neutral-300 hover:border-neutral-400 focus:border-nomba-yellow focus:ring-2 focus:ring-nomba-yellow/40'
        }`}
      >
        <CalendarIcon className="h-4 w-4 text-neutral-400 mr-2 shrink-0" />
        <span className={`flex-1 ${hasValue ? 'text-ink' : 'text-neutral-400'}`}>
          {hasValue ? formatDisplay(value) : placeholder}
        </span>
        {hasValue && (
          <span
            role="button"
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onChange('') }}
            className="p-0.5 rounded hover:bg-neutral-100"
          >
            <XIcon className="h-3.5 w-3.5 text-neutral-400" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 rounded-xl border border-neutral-200 bg-white shadow-lg animate-scale-in p-3 w-[280px]">
          <CalendarPicker value={value} onSelect={handleSelect} />
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function CalendarPicker({ value, onSelect }) {
  const today = new Date()
  const selectedDate = value ? new Date(value + 'T00:00:00') : null

  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() || today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth())
  const [pickerMode, setPickerMode] = useState('days')

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }, [viewMonth, viewYear])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }, [viewMonth, viewYear])

  const firstDay = new Date(viewYear, viewMonth, 1)
  const startDay = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function isToday(day) {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
  }

  function isSelected(day) {
    if (!selectedDate) return false
    return day === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear()
  }

  function selectDay(day) {
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onSelect(`${viewYear}-${m}-${d}`)
  }

  function goToday() {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    selectDay(today.getDate())
  }

  function selectMonth(m) {
    setViewMonth(m)
    setPickerMode('days')
  }

  function selectYear(y) {
    setViewYear(y)
    setPickerMode('months')
  }

  // Year range for the year picker (show 12 years centered on current view)
  const yearStart = viewYear - 5
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i)

  if (pickerMode === 'years') {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => setViewYear(viewYear - 12)} className="p-1 rounded-lg hover:bg-neutral-100 transition">
            <ChevronLeftIcon className="h-4 w-4 text-neutral-600" />
          </button>
          <span className="text-sm font-semibold text-ink">
            {yearStart} – {yearStart + 11}
          </span>
          <button type="button" onClick={() => setViewYear(viewYear + 12)} className="p-1 rounded-lg hover:bg-neutral-100 transition">
            <ChevronRightIcon className="h-4 w-4 text-neutral-600" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => selectYear(y)}
              className={`py-2 rounded-lg text-sm font-medium transition ${
                y === viewYear
                  ? 'bg-nomba-yellow text-nomba-black font-bold'
                  : y === today.getFullYear()
                    ? 'bg-neutral-100 text-ink'
                    : 'text-ink hover:bg-neutral-100'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (pickerMode === 'months') {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => setViewYear(viewYear - 1)} className="p-1 rounded-lg hover:bg-neutral-100 transition">
            <ChevronLeftIcon className="h-4 w-4 text-neutral-600" />
          </button>
          <button type="button" onClick={() => setPickerMode('years')} className="text-sm font-semibold text-ink hover:text-nomba-yellow transition">
            {viewYear}
          </button>
          <button type="button" onClick={() => setViewYear(viewYear + 1)} className="p-1 rounded-lg hover:bg-neutral-100 transition">
            <ChevronRightIcon className="h-4 w-4 text-neutral-600" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => selectMonth(i)}
              className={`py-2 rounded-lg text-sm font-medium transition ${
                i === viewMonth && viewYear === (selectedDate?.getFullYear() || today.getFullYear())
                  ? 'bg-nomba-yellow text-nomba-black font-bold'
                  : i === today.getMonth() && viewYear === today.getFullYear()
                    ? 'bg-neutral-100 text-ink'
                    : 'text-ink hover:bg-neutral-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Month/year nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-neutral-100 transition">
          <ChevronLeftIcon className="h-4 w-4 text-neutral-600" />
        </button>
        <button type="button" onClick={() => setPickerMode('months')} className="text-sm font-semibold text-ink hover:text-nomba-yellow transition">
          {MONTHS_FULL[viewMonth]} {viewYear}
        </button>
        <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-neutral-100 transition">
          <ChevronRightIcon className="h-4 w-4 text-neutral-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-neutral-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => selectDay(day)}
              className={`h-8 w-8 mx-auto rounded-lg text-sm font-medium transition flex items-center justify-center ${
                isSelected(day)
                  ? 'bg-nomba-yellow text-nomba-black font-bold'
                  : isToday(day)
                    ? 'bg-neutral-100 text-ink font-semibold'
                    : 'text-ink hover:bg-neutral-100'
              }`}
            >
              {day}
            </button>
          ),
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
        <button type="button" onClick={goToday} className="text-xs font-medium text-nomba-black hover:text-nomba-yellow transition">
          Today
        </button>
        {value && (
          <button type="button" onClick={() => onSelect('')} className="text-xs font-medium text-neutral-500 hover:text-red-600 transition">
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}
