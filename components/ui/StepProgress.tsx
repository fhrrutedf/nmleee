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
  // Brand colors v2
  const ACCENT_COLOR = '#059669'; // The primary blue accent
  const INK_COLOR = '#1A1A1A';    // The deep ink black

  return (
    <div className="w-full py-8 px-4">
      <div className="relative flex items-center justify-between max-w-2xl mx-auto">
        {/* Simplified Connection Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 z-0">
          <motion.div 
            className="h-full bg-emerald-700" 
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        </div>

        {/* Steps - High Contrast Design */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? ACCENT_COLOR : isActive ? INK_COLOR : '#ffffff',
                  borderColor: isCompleted || isActive ? 'transparent' : '#f3f4f6',
                  scale: isActive ? 1.15 : 1,
                }}
                className="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all shadow-lg shadow-emerald-600/20 ring-4 ring-white"
              >
                {isCompleted ? (
                  <FiCheck className="text-white text-lg stroke-[3px]" />
                ) : (
                  <span className={`text-sm font-bold font-inter ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {step.id}
                  </span>
                )}
              </motion.div>
              
              <motion.span 
                animate={{ 
                  color: isActive ? INK_COLOR : '#9ca3af',
                  fontWeight: isActive ? 800 : 600
                }}
                className="absolute top-full mt-4 text-[10px] uppercase tracking-[0.1em] whitespace-nowrap"
              >
                {step.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
