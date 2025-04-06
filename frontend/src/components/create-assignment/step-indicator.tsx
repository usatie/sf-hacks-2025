interface StepIndicatorProps {
  currentStep: number
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: "Upload" },
    { number: 2, label: "Edit" },
    { number: 3, label: "Review" },
  ]

  return (
    <div className="flex justify-center items-center gap-2 py-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {index > 0 && <div className={`h-0.5 w-12 ${currentStep > index ? "bg-primary" : "bg-border"}`} />}
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= step.number ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {step.number}
          </div>
        </div>
      ))}
    </div>
  )
}

