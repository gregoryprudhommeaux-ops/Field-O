import React from 'react'

interface StepNavigationProps {
  currentStepIndex: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  nextLabel?: string
  previousLabel?: string
  disablePrevious?: boolean
  disableNext?: boolean
}

export function StepNavigation({
  currentStepIndex,
  totalSteps,
  onPrevious,
  onNext,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  disablePrevious = false,
  disableNext = false,
}: StepNavigationProps) {
  return (
    <div className="sticky bottom-16 z-20 mt-6 border-t border-white/10 bg-zinc-900/95 px-4 py-4 backdrop-blur lg:bottom-0">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <button
          className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-200 disabled:opacity-40"
          onClick={onPrevious}
          disabled={disablePrevious}
        >
          {previousLabel}
        </button>

        <div className="flex flex-1 items-center gap-2 px-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const active = index <= currentStepIndex
            return <div key={index} className={`h-2 flex-1 rounded-full ${active ? 'bg-orange-400' : 'bg-zinc-700'}`} />
          })}
        </div>

        <button
          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-40"
          onClick={onNext}
          disabled={disableNext}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}

