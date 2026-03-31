import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = join(process.cwd(), 'backups');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === 'backup') {
      if (!existsSync(BACKUP_DIR)) {
        mkdirSync(BACKUP_DIR, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = join(BACKUP_DIR, `backup_${timestamp}.json`);

      const tables = ['User', 'Product', 'Course', 'Order', 'OrderItem', 'Payout', 
                       'Subscription', 'SubscriptionPlan', 'Review', 'Coupon'];
      
      const backup: Record<string, any[]> = {};
      const counts: Record<string, number> = {};

      for (const table of tables) {
        try {
          const data = await (prisma as any)[table.toLowerCase()].findMany();
          backup[table] = data;
          counts[table] = data.length;
        } catch {}
      }

      const backupData = {
        metadata: { timestamp: new Date().toISOString(), tables, counts },
        data: backup
      };

      writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

      // Log the backup event
      await prisma.platformEvent.create({
        data: {
          eventType: 'BACKUP_CREATED',
          severity: 'success',
          title: 'نسخة احتياطية جديدة',
          description: `تم إنشاء نسخة احتياطية تحتوي على ${Object.values(counts).reduce((a,b) => a+b, 0)} سجل`,
          actorId: adminUser.id,
          actorType: 'admin',
          actorName: adminUser.name || adminUser.email,
        }
      });

      return NextResponse.json({ 
        success: true, 
        file: backupFile,
        counts,
        total: Object.values(counts).reduce((a, b) => a + b, 0)
      });
    }

    if (action === 'restore') {
      const { file } = await req.json();
      const backupFile = file || getLatestBackup();
      
      if (!backupFile || !existsSync(backupFile)) {
        return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
      }

      const backupData = JSON.parse(readFileSync(backupFile).toString());
      const counts: Record<string, number> = {};

      // Restore in order
      const order = ['User', 'Product', 'Course', 'SubscriptionPlan', 'Order', 
                      'OrderItem', 'Payout', 'Subscription', 'Review', 'Coupon'];

      for (const table of order) {
        const data = backupData.data[table];
        if (!data) continue;

        for (const record of data) {
          try {
            await (prisma as any)[table.toLowerCase()].upsert({
              where: { id: record.id },
              update: record,
              create: record,
            });
          } catch {}
        }
        counts[table] = data.length;
      }

      await prisma.platformEvent.create({
        data: {
          eventType: 'BACKUP_RESTORED',
          severity: 'success',
          title: 'استعادة البيانات',
          description: `تم استعادة ${Object.values(counts).reduce((a,b) => a+b, 0)} سجل من النسخة الاحتياطية`,
          actorId: adminUser.id,
          actorType: 'admin',
          actorName: adminUser.name || adminUser.email,
        }
      });

      return NextResponse.json({ success: true, counts });
    }

    if (action === 'list') {
      if (!existsSync(BACKUP_DIR)) {
        return NextResponse.json({ backups: [] });
      }

      const files = readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
        .map(f => {
          const path = join(BACKUP_DIR, f);
          const stat = readFileSync(path);
          const data = JSON.parse(stat.toString());
          return {
            file: f,
            path: path,
            timestamp: data.metadata?.timestamp || new Date().toISOString(),
            total: Object.values(data.metadata?.counts || {}).reduce((a: any, b: any) => a + b, 0)
          };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return NextResponse.json({ backups: files });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function getLatestBackup(): string | null {
  if (!existsSync(BACKUP_DIR)) return null;
  
  const files = readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  return files.length > 0 ? join(BACKUP_DIR, files[0]) : null;
}
