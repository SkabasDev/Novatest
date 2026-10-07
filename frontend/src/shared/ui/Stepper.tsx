const STEP_LABELS = ['Producto', 'Datos', 'Resumen', 'Resultado'];

interface StepperProps {
  /** 1-based current step (1..4). */
  currentStep: number;
}

/** 4-segment progress indicator used by the header, the card/delivery modal and the summary backdrop (spec §4). */
export function Stepper({ currentStep }: StepperProps) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-1" role="presentation">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          return (
            <div
              key={label}
              className={`h-[3px] rounded-sm ${
                isCurrent ? 'bg-primary' : isCompleted ? 'bg-primary/55' : 'bg-line-strong'
              }`}
            />
          );
        })}
      </div>
      <p className="mt-2 font-mono text-overline uppercase text-fg-3">
        Paso {currentStep} de 4 · {STEP_LABELS[currentStep - 1]}
      </p>
    </div>
  );
}
