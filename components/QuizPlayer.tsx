'use client';

import { useState } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

interface Question {
    question: string;
    type: 'multiple' | 'true-false';
    options?: string[];
}

interface Quiz {
    id: string;
    title: string;
    description?: string;
    timeLimit?: number;
    passingScore: number;
    questions: Question[];
}

interface QuizPlayerProps {
    quiz: Quiz;
    onComplete: (score: number, isPassed: boolean) => void;
}

export default function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<{ score: number; isPassed: boolean } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnswer = (val: any) => {
        setAnswers({ ...answers, [currentQuestion]: val });
    };

    const submitQuiz = async () => {
        if (Object.keys(answers).length < quiz.questions.length) {
            if (!confirm('لم تقم بالإجابة على جميع الأسئلة. هل أنت متأكد من التسليم؟')) {
                return;
            }
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers,
                    timeSpent: 0 // Implement timer if needed
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                setSubmitted(true);
                onComplete(data.score, data.isPassed);
            } else {
                alert('حدث خطأ أثناء تسليم الاختبار');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    if (submitted && result) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                {result.isPassed ? (
                    <FiCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
                ) : (
                    <FiXCircle className="mx-auto text-6xl text-red-500 mb-4" />
                )}

                <h2 className="text-2xl font-bold mb-2">
                    {result.isPassed ? 'تهانينا! لقد اجتزت الاختبار' : 'للأسف، لم تجتز الاختبار'}
                </h2>

                <div className="text-4xl font-bold text-indigo-600 mb-4">
                    {result.score.toFixed(1)}%
                </div>

                <p className="text-gray-600 mb-6">
                    درجة النجاح المطلوبة: {quiz.passingScore}%
                </p>

                <button
                    onClick={() => window.location.reload()} // Simple retry or close
                    className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    إغلاق
                </button>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-gray-900">{quiz.title}</h2>
                    <p className="text-sm text-gray-500">
                        سؤال {currentQuestion + 1} من {quiz.questions.length}
                    </p>
                </div>
                {quiz.timeLimit && (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        <FiClock />
                        <span>{quiz.timeLimit} دقيقة</span>
                    </div>
                )}
            </div>

            {/* Question Body */}
            <div className="p-6">
                <p className="text-lg font-medium text-gray-800 mb-6">
                    {question.question}
                </p>

                <div className="space-y-3">
                    {question.type === 'multiple' && question.options?.map((option, idx) => (
                        <label
                            key={idx}
                            className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${answers[currentQuestion] === idx
                                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                    : 'hover:bg-gray-50 border-gray-200'
                                }`}
                        >
                            <input
                                type="radio"
                                name={`q-${currentQuestion}`}
                                checked={answers[currentQuestion] === idx}
                                onChange={() => handleAnswer(idx)}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <span>{option}</span>
                        </label>
                    ))}

                    {question.type === 'true-false' && (
                        <div className="flex gap-4">
                            <label
                                className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${answers[currentQuestion] === true
                                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                        : 'hover:bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`q-${currentQuestion}`}
                                    checked={answers[currentQuestion] === true}
                                    onChange={() => handleAnswer(true)}
                                    className="hidden"
                                />
                                صح
                            </label>
                            <label
                                className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${answers[currentQuestion] === false
                                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                        : 'hover:bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`q-${currentQuestion}`}
                                    checked={answers[currentQuestion] === false}
                                    onChange={() => handleAnswer(false)}
                                    className="hidden"
                                />
                                خطأ
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="p-4 bg-gray-50 border-t flex justify-between">
                <button
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 text-gray-600 disabled:opacity-50 hover:bg-gray-200 rounded-lg"
                >
                    السابق
                </button>

                {currentQuestion < quiz.questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        التالي
                    </button>
                ) : (
                    <button
                        onClick={submitQuiz}
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70"
                    >
                        {loading ? 'جاري التسليم...' : 'تسليم الإجابات'}
                    </button>
                )}
            </div>
        </div>
    );
}
