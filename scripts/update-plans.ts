import { prisma } from '../lib/db';

async function updatePlans() {
  const plans = await prisma.subscriptionPlan.findMany();
  
  if (plans.length === 0) {
    console.log('No plans found in database.');
    process.exit(0);
  }
  
  console.log(`Found ${plans.length} plans to update...\n`);
  
  for (const plan of plans) {
    let planType = 'GROWTH';
    if (plan.price === 0) planType = 'FREE';
    else if (plan.price >= 30 && plan.price < 100) planType = 'PRO';
    else if (plan.price >= 100) planType = 'AGENCY';
    
    await prisma.subscriptionPlan.update({
      where: { id: plan.id },
      data: { planType }
    });
    
    console.log(`✓ Updated "${plan.name}" ($${plan.price}) -> ${planType}`);
  }
  
  console.log('\n✅ All plans updated successfully!');
  process.exit(0);
}

updatePlans().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
