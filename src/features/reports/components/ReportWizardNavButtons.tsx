import React from 'react'

export interface ReportWizardNavButtonsProps {
  step: number
  lastStepIndex: number
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
}

export function ReportWizardNavButtons({
  step,
  lastStepIndex,
  backLabel,
  nextLabel,
  onBack,
  onNext,
}: ReportWizardNavButtonsProps) {
  const showNext = step < lastStepIndex
  return (
    <div className={`grid gap-2 ${showNext ? 'grid-cols-2' : 'grid-cols-1'}`}>
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl px-3 py-3 text-center text-xs font-medium text-text-secondary transition-colors hover:bg-surface lg:border lg:border-border"
      >
        {backLabel}
      </button>
      {showNext ? (
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-primary px-3 py-3 text-center text-xs font-medium text-white shadow-md transition-transform active:scale-[0.98]"
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  )
}
