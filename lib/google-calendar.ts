import { prisma } from '@/lib/db';

// Refresh Google Calendar access token if expired
async function getValidAccessToken(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            googleCalendarAccessToken: true,
            googleCalendarRefreshToken: true,
            googleCalendarTokenExpiry: true,
            googleCalendarConnected: true,
        },
    });

    if (!user?.googleCalendarConnected || !user.googleCalendarAccessToken) {
        return null;
    }

    // Check if token is expired (with 5 min buffer)
    const isExpired = user.googleCalendarTokenExpiry
        ? new Date() >= new Date(user.googleCalendarTokenExpiry.getTime() - 5 * 60 * 1000)
        : false;

    if (!isExpired) {
        return user.googleCalendarAccessToken;
    }

    // Refresh the token
    if (!user.googleCalendarRefreshToken) return null;

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                refresh_token: user.googleCalendarRefreshToken,
                grant_type: 'refresh_token',
            }),
        });

        const tokens = await response.json();
        if (tokens.error) return null;

        await prisma.user.update({
            where: { id: userId },
            data: {
                googleCalendarAccessToken: tokens.access_token,
                googleCalendarTokenExpiry: tokens.expires_in
                    ? new Date(Date.now() + tokens.expires_in * 1000)
                    : undefined,
            },
        });

        return tokens.access_token;
    } catch {
        return null;
    }
}

// Create a Google Calendar event with Google Meet link
export async function createCalendarEvent(
    sellerId: string,
    eventData: {
        title: string;
        description?: string;
        startDateTime: Date;
        durationMinutes: number;
        customerName: string;
        customerEmail: string;
    }
): Promise<{ eventId: string; meetLink: string } | null> {
    const accessToken = await getValidAccessToken(sellerId);
    if (!accessToken) return null;

    const endDateTime = new Date(
        eventData.startDateTime.getTime() + eventData.durationMinutes * 60 * 1000
    );

    const event = {
        summary: eventData.title,
        description: eventData.description || `استشارة مع ${eventData.customerName}`,
        start: {
            dateTime: eventData.startDateTime.toISOString(),
            timeZone: 'Asia/Riyadh',
        },
        end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'Asia/Riyadh',
        },
        attendees: [
            { email: eventData.customerEmail, displayName: eventData.customerName },
        ],
        conferenceData: {
            createRequest: {
                requestId: `meet-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 60 },
                { method: 'popup', minutes: 15 },
            ],
        },
    };

    try {
        const response = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        );

        const createdEvent = await response.json();

        if (createdEvent.error) {
            console.error('Google Calendar error:', createdEvent.error);
            return null;
        }

        const meetLink = createdEvent.conferenceData?.entryPoints?.find(
            (ep: any) => ep.entryPointType === 'video'
        )?.uri || createdEvent.hangoutLink;

        return {
            eventId: createdEvent.id,
            meetLink: meetLink || '',
        };
    } catch (error) {
        console.error('Failed to create calendar event:', error);
        return null;
    }
}

// Delete a Google Calendar event
export async function deleteCalendarEvent(
    sellerId: string,
    eventId: string
): Promise<boolean> {
    const accessToken = await getValidAccessToken(sellerId);
    if (!accessToken) return false;

    try {
        await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
            {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        return true;
    } catch {
        return false;
    }
}
