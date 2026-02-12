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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Options */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">الخيارات</label>
                        <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                    {/* Correct Answer Radio/Checkbox */}
                                    <button
                                        onClick={() =>
                                            updateQuestion(
                                                qIndex,
                                                'correctAnswer',
                                                question.type === 'true-false' ? oIndex === 0 : oIndex
                                            )
                                        }
                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${(question.type === 'true-false'
                                            ? question.correctAnswer === (oIndex === 0)
                                            : question.correctAnswer === oIndex)
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-gray-300 hover:border-green-400'
                                            }`}
                                    >
                                        {(question.type === 'true-false'
                                            ? question.correctAnswer === (oIndex === 0)
                                            : question.correctAnswer === oIndex) && (
                                                <FiCheck className="text-white" size={14} />
                                            )}
                                    </button>

                                    {/* Option Input */}
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                        placeholder={`الخيار ${oIndex + 1}`}
                                        disabled={question.type === 'true-false'}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                                    />

                                    {/* Remove Option (only for multiple choice with >2 options) */}
                                    {question.type === 'multiple' && question.options.length > 2 && (
                                        <button
                                            onClick={() => removeOption(qIndex, oIndex)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Option (only for multiple choice) */}
                        {question.type === 'multiple' && (
                            <button
                                onClick={() => addOption(qIndex)}
                                className="mt-2 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                                <FiPlus size={16} />
                                إضافة خيار
                            </button>
                        )}
                    </div>

                    {/* Correct Answer Indicator */}
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">الإجابة الصحيحة:</span>{' '}
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
                onClick={addQuestion}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
                <FiPlus size={20} />
                إضافة سؤال جديد
            </button>
        </div>
    );
}
