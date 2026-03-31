import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Check if user follows a seller
export async function GET(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        
        // Get current user session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ isFollowing: false });
        }

        // Find seller by username
        const seller = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });

        if (!seller) {
            return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
        }

        // Check if following
        const follow = await prisma.sellerFollower.findUnique({
            where: {
                followerId_sellerId: {
                    followerId: session.user.id,
                    sellerId: seller.id
                }
            }
        });

        // Get follower count
        const followerCount = await prisma.sellerFollower.count({
            where: { sellerId: seller.id }
        });

        return NextResponse.json({
            isFollowing: !!follow,
            followerCount,
            settings: follow ? {
                notifyNewProducts: follow.notifyNewProducts,
                notifyNewCourses: follow.notifyNewCourses,
                notifyOffers: follow.notifyOffers
            } : null
        });

    } catch (error) {
        console.error('Error checking follow status:', error);
        return NextResponse.json(
            { error: 'Failed to check follow status' },
            { status: 500 }
        );
    }
}

// Follow a seller
export async function POST(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        
        // Get current user session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find seller by username
        const seller = await prisma.user.findUnique({
            where: { username },
            select: { id: true, name: true }
        });

        if (!seller) {
            return NextResponse.json(
                { error: 'Seller not found' },
                { status: 404 }
            );
        }

        // Can't follow yourself
        if (seller.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot follow yourself' },
                { status: 400 }
            );
        }

        // Create follow relationship
        const follow = await prisma.sellerFollower.upsert({
            where: {
                followerId_sellerId: {
                    followerId: session.user.id,
                    sellerId: seller.id
                }
            },
            update: {},
            create: {
                followerId: session.user.id,
                sellerId: seller.id
            }
        });

        // Get updated follower count
        const followerCount = await prisma.sellerFollower.count({
            where: { sellerId: seller.id }
        });

        return NextResponse.json({
            success: true,
            isFollowing: true,
            followerCount,
            message: `You are now following ${seller.name}`
        });

    } catch (error) {
        console.error('Error following seller:', error);
        return NextResponse.json(
            { error: 'Failed to follow seller' },
            { status: 500 }
        );
    }
}

// Unfollow a seller
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        
        // Get current user session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find seller by username
        const seller = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });

        if (!seller) {
            return NextResponse.json(
                { error: 'Seller not found' },
                { status: 404 }
            );
        }

        // Delete follow relationship
        await prisma.sellerFollower.deleteMany({
            where: {
                followerId: session.user.id,
                sellerId: seller.id
            }
        });

        // Get updated follower count
        const followerCount = await prisma.sellerFollower.count({
            where: { sellerId: seller.id }
        });

        return NextResponse.json({
            success: true,
            isFollowing: false,
            followerCount,
            message: 'Unfollowed successfully'
        });

    } catch (error) {
        console.error('Error unfollowing seller:', error);
        return NextResponse.json(
            { error: 'Failed to unfollow seller' },
            { status: 500 }
        );
    }
}

// Update follow settings
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        const body = await request.json();
        
        // Get current user session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Find seller by username
        const seller = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });

        if (!seller) {
            return NextResponse.json(
                { error: 'Seller not found' },
                { status: 404 }
            );
        }

        // Update notification settings
        const follow = await prisma.sellerFollower.update({
            where: {
                followerId_sellerId: {
                    followerId: session.user.id,
                    sellerId: seller.id
                }
            },
            data: {
                notifyNewProducts: body.notifyNewProducts ?? true,
                notifyNewCourses: body.notifyNewCourses ?? true,
                notifyOffers: body.notifyOffers ?? true
            }
        });

        return NextResponse.json({
            success: true,
            settings: {
                notifyNewProducts: follow.notifyNewProducts,
                notifyNewCourses: follow.notifyNewCourses,
                notifyOffers: follow.notifyOffers
            }
        });

    } catch (error) {
        console.error('Error updating follow settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
