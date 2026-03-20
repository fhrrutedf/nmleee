'use client';

import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

interface Step {
  id: number;
  label: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="w-full py-6 px-2">
      <div className="relative flex items-center justify-between">
        {/* Connection Lines */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0">
          <motion.div 
            className="h-full bg-primary-indigo-500" 
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isActive ? '#6366f1' : '#ffffff',
                  borderColor: isCompleted || isActive ? '#6366f1' : '#e2e8f0',
                  scale: isActive ? 1.2 : 1,
                }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300 shadow-sm`}
              >
                {isCompleted ? (
                  <FiCheck className="text-white text-lg" />
                ) : (
                  <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {step.id}
                  </span>
                )}
              </motion.div>
              <span className={`absolute top-full mt-2 text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-primary-indigo-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
