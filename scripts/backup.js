import { PrismaClient } from '@prisma/client';
import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { format } from 'date-fns';

const prisma = new PrismaClient();
const BACKUP_DIR = join(process.cwd(), 'backups');

interface BackupMetadata {
  timestamp: string;
  tables: string[];
  recordCounts: Record<string, number>;
}

async function backup() {
  console.log('🔄 Starting database backup...');
  
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const backupFile = join(BACKUP_DIR, `backup_${timestamp}.json`);

  const tables = [
    'User', 'Product', 'Course', 'Order', 'OrderItem', 
    'Payout', 'Subscription', 'SubscriptionPlan',
    'Review', 'Coupon', 'AffiliateLink', 'PlatformEvent'
  ];

  const backup: Record<string, any[]> = {};
  const recordCounts: Record<string, number> = {};

  for (const table of tables) {
    try {
      const data = await (prisma as any)[table.toLowerCase()].findMany();
      backup[table] = data;
      recordCounts[table] = data.length;
      console.log(`✅ Backed up ${data.length} records from ${table}`);
    } catch (e) {
      console.warn(`⚠️ Could not backup ${table}:`, (e as Error).message);
    }
  }

  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      tables,
      recordCounts
    } as BackupMetadata,
    data: backup
  };

  writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`\n💾 Backup saved to: ${backupFile}`);
  console.log(`📊 Total records: ${Object.values(recordCounts).reduce((a, b) => a + b, 0)}`);

  // Keep only last 10 backups
  cleanupOldBackups();
}

function cleanupOldBackups() {
  const files = readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: join(BACKUP_DIR, f),
      time: readFileSync(join(BACKUP_DIR, f)).toString().includes('timestamp') 
        ? JSON.parse(readFileSync(join(BACKUP_DIR, f)).toString()).metadata?.timestamp || Date.now()
        : Date.now()
    }))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  if (files.length > 10) {
    const toDelete = files.slice(10);
    for (const file of toDelete) {
      try {
        require('fs').unlinkSync(file.path);
        console.log(`🗑️ Deleted old backup: ${file.name}`);
      } catch {}
    }
  }
}

async function restore(backupFile?: string) {
  if (!backupFile) {
    const files = readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.error('❌ No backup files found!');
      process.exit(1);
    }
    
    backupFile = join(BACKUP_DIR, files[0]);
    console.log(`📂 Using latest backup: ${files[0]}`);
  }

  console.log(`🔄 Restoring from: ${backupFile}`);
  
  const backupData = JSON.parse(readFileSync(backupFile).toString());
  
  // Clear existing data
  console.log('⚠️ Clearing existing data...');
  await prisma.$transaction([
    prisma.affiliateSale.deleteMany(),
    prisma.affiliateClick.deleteMany(),
    prisma.couponUsage.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.review.deleteMany(),
    prisma.platformEvent.deleteMany(),
    prisma.automatedReport.deleteMany(),
  ]);

  // Restore in correct order
  const restoreOrder = [
    'User', 'Product', 'Course', 'SubscriptionPlan',
    'Order', 'OrderItem', 'Payout', 'Subscription',
    'Review', 'Coupon', 'AffiliateLink', 'PlatformEvent'
  ];

  for (const table of restoreOrder) {
    const data = backupData.data[table];
    if (!data || data.length === 0) continue;

    console.log(`📝 Restoring ${data.length} records to ${table}...`);
    
    for (const record of data) {
      try {
        await (prisma as any)[table.toLowerCase()].upsert({
          where: { id: record.id },
          update: record,
          create: record,
        });
      } catch (e) {
        console.warn(`⚠️ Failed to restore record in ${table}:`, (e as Error).message);
      }
    }
  }

  console.log('\n✅ Restore completed!');
  console.log(`📊 Restored ${Object.values(backupData.data).flat().length} total records`);
}

const command = process.argv[2];

if (command === 'backup') {
  backup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
} else if (command === 'restore') {
  restore(process.argv[3])
    .catch(console.error)
    .finally(() => prisma.$disconnect());
} else {
  console.log('Usage:');
  console.log('  node scripts/backup.js backup     - Create backup');
  console.log('  node scripts/backup.js restore    - Restore from latest backup');
  console.log('  node scripts/backup.js restore <file> - Restore from specific file');
  prisma.$disconnect();
}
