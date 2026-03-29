'use client';

import { useState } from 'react';
import { FiPlus, FiX, FiCheck } from 'react-icons/fi';

interface Question {
    question: string;
    type: 'multiple' | 'true-false';
    options: string[];
    correctAnswer: number | boolean;
}

interface QuizBuilderProps {
    initialQuestions?: Question[];
    onChange?: (questions: Question[]) => void;
}

export default function QuizBuilder({ initialQuestions = [], onChange }: QuizBuilderProps) {
    const [questions, setQuestions] = useState<Question[]>(
        initialQuestions.length > 0 ? initialQuestions : [createEmptyQuestion()]
    );

    function createEmptyQuestion(): Question {
        return {
            question: '',
            type: 'multiple',
            options: ['', '', '', ''],
            correctAnswer: 0,
        };
    }

    const addQuestion = () => {
        const newQuestions = [...questions, createEmptyQuestion()];
        setQuestions(newQuestions);
        onChange?.(newQuestions);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
        onChange?.(newQuestions);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };

        // If changing to true-false, reset options and correct answer
        if (field === 'type' && value === 'true-false') {
            newQuestions[index].options = ['صحيح', 'خطأ'];
            newQuestions[index].correctAnswer = true;
        }
        // If changing to multiple choice, reset to 4 options
        else if (field === 'type' && value === 'multiple') {
            newQuestions[index].options = ['', '', '', ''];
            newQuestions[index].correctAnswer = 0;
        }

        setQuestions(newQuestions);
        onChange?.(newQuestions);
    };

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(newQuestions);
        onChange?.(newQuestions);
    };

    const addOption = (questionIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options.push('');
        setQuestions(newQuestions);
        onChange?.(newQuestions);
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
            (_, i) => i !== optionIndex
        );
        // Adjust correct answer if needed
        const currentQ = newQuestions[questionIndex];
        if (currentQ.type === 'multiple' && typeof currentQ.correctAnswer === 'number') {
            if (currentQ.correctAnswer >= currentQ.options.length) {
                newQuestions[questionIndex].correctAnswer = 0;
            }
        }
        setQuestions(newQuestions);
        onChange?.(newQuestions);
    };

    return (
        <div className="space-y-6">
            {questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-white border border-gray-200 rounded-lg p-6">
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">السؤال {qIndex + 1}</h3>
                        {questions.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        )}
                    </div>

                    {/* Question Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">نوع السؤال</label>
                        <select
                            value={question.type}
                            onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                        >
                            <option value="multiple">اختيار من متعدد</option>
                            <option value="true-false">صح أو خطأ</option>
                        </select>
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">نص السؤال</label>
                        <textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            placeholder="اكتب السؤال هنا..."
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                        />
                    </div>

                    {/* Options */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">الخيارات</label>
                        <div className="space-y-3">
                            {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex flex-row-reverse sm:flex-row items-center gap-3 w-full">
                                    {/* Correct Answer Radio/Checkbox */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuestion(
                                                qIndex,
                                                'correctAnswer',
                                                question.type === 'true-false' ? oIndex === 0 : oIndex
                                            )
                                        }
                                        className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors ${(question.type === 'true-false'
                                            ? question.correctAnswer === (oIndex === 0)
                                            : question.correctAnswer === oIndex)
                                            ? 'bg-green-500 border-green-500 shadow-md scale-105'
                                            : 'border-gray-300 hover:border-green-400'
                                            }`}
                                    >
                                        {(question.type === 'true-false'
                                            ? question.correctAnswer === (oIndex === 0)
                                            : question.correctAnswer === oIndex) && (
                                                <FiCheck className="text-white" size={16} />
                                            )}
                                    </button>

                                    {/* Option Input */}
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            placeholder={`الخيار ${oIndex + 1}`}
                                            disabled={question.type === 'true-false'}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ink disabled:bg-gray-50 text-sm shadow-lg shadow-emerald-600/20 transition-shadow"
                                        />
                                    </div>

                                    {/* Remove Option (only for multiple choice with >2 options) */}
                                    {question.type === 'multiple' && question.options.length > 2 && (
                                        <button
                                            type="button"
                                            title="حذف الخيار"
                                            onClick={() => removeOption(qIndex, oIndex)}
                                            className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        >
                                            <FiX size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Option (only for multiple choice) */}
                        {question.type === 'multiple' && (
                            <button
                                type="button"
                                onClick={() => addOption(qIndex)}
                                className="mt-4 flex items-center gap-2 text-emerald-600 hover:text-indigo-700 text-sm font-bold bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
                            >
                                <FiPlus size={18} />
                                إضافة خيار
                            </button>
                        )}
                    </div>

                    {/* Correct Answer Indicator */}
                    <div className="text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-2">
                        <span className="text-emerald-600">الإجابة الصحيحة:</span>{' '}
                        {question.type === 'true-false'
                            ? question.correctAnswer
                                ? 'صحيح'
                                : 'خطأ'
                            : `الخيار ${(question.correctAnswer as number) + 1}`}
                    </div>
                </div>
            ))}

            {/* Add Question Button */}
            <button
                type="button"
                onClick={addQuestion}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 transition-all shadow-lg shadow-emerald-600/20"
            >
                <FiPlus size={22} />
                إضافة سؤال جديد
            </button>
        </div>
    );
}

