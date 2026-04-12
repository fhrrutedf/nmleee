import { sendBroadcastEmail } from './lib/email'; 

async function test() {
    try {
        console.log('Sending broadcast...');
        const result = await sendBroadcastEmail({
            to: 'noaf0949@gmail.com', 
            customerName: 'Ahmad User', 
            subject: 'Test Broadcast Subject', 
            content: 'This is a test <b>broadcast</b>'
        });
        console.log('Result:', result);
    } catch(e) {
        console.error('Error:', e);
    }
}
test();
