'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiClock, FiCheck, FiX } from 'react-icons/fi';

interface Question {
    question: string;
    type: 'multiple' | 'true-false';
    options: string[];
    correctAnswer: number | boolean;
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    passingScore: number;
    timeLimit: number | null;
    questions: Question[];
}

export default function TakeQuizPage() {
    const params = useParams();
    const quizId = params.quizId as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || submitted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted]);

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`/api/quizzes/${quizId}`);
            if (response.ok) {
                const data = await response.json();
                setQuiz(data);
                setAnswers(new Array(data.questions.length).fill(null));

                if (data.timeLimit) {
                    setTimeLeft(data.timeLimit * 60); // Convert to seconds
                }
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!quiz || submitted) return;

        setSubmitted(true);
        setLoading(true);

        try {
            const response = await fetch(`/api/quizzes/${quizId}/attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers,
                    studentName: 'الطالب', // Should be from session
                    studentEmail: 'student@example.com', // Should be from session
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading && !quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">الاختبار غير موجود</p>
            </div>
        );
    }

    // Show results
    if (submitted && result) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${result.isPassed ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            {result.isPassed ? (
                                <FiCheck className="text-green-600" size={40} />
                            ) : (
                                <FiX className="text-red-600" size={40} />
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {result.isPassed ? 'نجحت!' : 'للأسف، لم تنجح'}
                        </h1>

                        <p className="text-xl text-gray-600 mb-8">
                            حصلت على {result.score.toFixed(0)}% من {quiz.passingScore}%
                        </p>

                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">الإجابات الصحيحة</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {result.correctAnswers} / {result.totalQuestions}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">الدرجة</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {result.score.toFixed(0)}%
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                إعادة المحاولة
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                رجوع
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                            {quiz.description && (
                                <p className="text-gray-600 mt-1">{quiz.description}</p>
                            )}
                        </div>
                        {timeLeft !== null && (
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                <FiClock className={timeLeft < 300 ? 'text-red-600' : 'text-gray-600'} />
                                <span className={timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {quiz.questions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {qIndex + 1}. {question.question}
                            </h3>

                            <div className="space-y-2">
                                {question.options.map((option, oIndex) => (
                                    <label
                                        key={oIndex}
                                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${qIndex}`}
                                            checked={answers[qIndex] === oIndex || (question.type === 'true-false' && answers[qIndex] === (oIndex === 0))}
                                            onChange={() => {
                                                const newAnswers = [...answers];
                                                newAnswers[qIndex] = question.type === 'true-false' ? (oIndex === 0) : oIndex;
                                                setAnswers(newAnswers);
                                            }}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-900">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || answers.some(a => a === null)}
                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        {loading ? 'جاري التقديم...' : 'تقديم الاختبار'}
                    </button>
                    {answers.some(a => a === null) && (
                        <p className="text-sm text-amber-600 mt-2 text-center">
                            يرجى الإجابة على جميع الأسئلة قبل التقديم
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
