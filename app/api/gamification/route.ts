import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Points configuration
const POINTS_CONFIG = {
    LESSON_COMPLETE: 10,
    QUIZ_PASS: 25,
    COURSE_COMPLETE: 100,
    FIRST_COMMENT: 5,
    STREAK_7_DAYS: 50,
    PERFECT_QUIZ: 50,
};

// Get user points and achievements
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get or create user gamification record
        let gamification = await prisma.userGamification.findUnique({
            where: { userEmail: session.user.email }
        });

        if (!gamification) {
            gamification = await prisma.userGamification.create({
                data: {
                    userEmail: session.user.email,
                    userName: session.user.name || 'طالب',
                    totalPoints: 0,
                    level: 1,
                    achievements: []
                }
            });
        }

        // Calculate level based on points
        const level = calculateLevel(gamification.totalPoints);

        // Update level if changed
        if (level > gamification.level) {
            await prisma.userGamification.update({
                where: { userEmail: session.user.email },
                data: { level }
            });
            gamification.level = level;
        }

        // Get leaderboard (top 10)
        const leaderboard = await prisma.userGamification.findMany({
            orderBy: { totalPoints: 'desc' },
            take: 10,
            select: {
                userName: true,
                totalPoints: true,
                level: true
            }
        });

        return NextResponse.json({
            gamification,
            leaderboard,
            pointsConfig: POINTS_CONFIG,
            nextLevelPoints: getPointsForLevel(level + 1)
        });

    } catch (error) {
        console.error('Error fetching gamification:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gamification data' },
            { status: 500 }
        );
    }
}

// Award points to user
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, courseId, lessonId, quizScore } = await request.json();

        let points = 0;
        let achievement = null;

        switch (action) {
            case 'LESSON_COMPLETE':
                points = POINTS_CONFIG.LESSON_COMPLETE;
                break;
            case 'QUIZ_PASS':
                points = POINTS_CONFIG.QUIZ_PASS;
                if (quizScore === 100) {
                    points += POINTS_CONFIG.PERFECT_QUIZ;
                    achievement = 'perfect_quiz';
                }
                break;
            case 'COURSE_COMPLETE':
                points = POINTS_CONFIG.COURSE_COMPLETE;
                achievement = 'course_master';
                break;
            case 'FIRST_COMMENT':
                points = POINTS_CONFIG.FIRST_COMMENT;
                achievement = 'first_comment';
                break;
        }

        // Get current gamification data
        let gamification = await prisma.userGamification.findUnique({
            where: { userEmail: session.user.email }
        });

        if (!gamification) {
            gamification = await prisma.userGamification.create({
                data: {
                    userEmail: session.user.email,
                    userName: session.user.name || 'طالب',
                    totalPoints: 0,
                    level: 1,
                    achievements: []
                }
            });
        }

        // Update points
        const newTotal = gamification.totalPoints + points;
        const newLevel = calculateLevel(newTotal);

        const updateData: any = {
            totalPoints: newTotal
        };

        if (newLevel > gamification.level) {
            updateData.level = newLevel;
        }

        if (achievement && !gamification.achievements.includes(achievement)) {
            updateData.achievements = [...gamification.achievements, achievement];
        }

        await prisma.userGamification.update({
            where: { userEmail: session.user.email },
            data: updateData
        });

        // Create notification for level up
        if (newLevel > gamification.level) {
            await prisma.notification.create({
                data: {
                    type: 'INTERNAL',
                    title: '🎉 مبروك! تم ترقيتك!',
                    content: `لقد وصلت للمستوى ${newLevel}! استمر في التعلم!`,
                    receiverEmail: session.user.email,
                    isRead: false
                }
            });
        }

        return NextResponse.json({
            success: true,
            pointsEarned: points,
            totalPoints: newTotal,
            newLevel: newLevel > gamification.level ? newLevel : null,
            achievement: achievement
        });

    } catch (error) {
        console.error('Error awarding points:', error);
        return NextResponse.json(
            { error: 'Failed to award points' },
            { status: 500 }
        );
    }
}

function calculateLevel(points: number): number {
    // Level formula: every 500 points = new level
    return Math.floor(points / 500) + 1;
}

function getPointsForLevel(level: number): number {
    return (level - 1) * 500;
}
