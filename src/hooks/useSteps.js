import { useState } from 'react';

// FIXME useTabs, useWizard ?
export default function useSteps (steps, initialStep = 0) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const hasNext = currentStep < steps.length - 1;
  const handleNext = () => {
    if (hasNext) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleStepClick = event => {
    const i = Number(event.target.dataset.value);
    if (!isNaN(i) && i < steps.length) setCurrentStep(i);
  };
  return {
    currentStep,
    setCurrentStep,
    hasNext,
    handleNext,
    handleStepClick
  };
}
