const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://xmbtbqjdyveqgedumqvx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtYnRicWpkeXZlcWdlZHVtcXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTMxMDYsImV4cCI6MjA4NjY2OTEwNn0.uyUsgTGrMELH9HvPxOx-hDPxEJ3qM72pqdkmJiJAlE0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("Checking database tables...");
  // Try to query the 'Order' table which is essential for the marketplace
  const { data, error } = await supabase.from('Order').select('id').limit(1);

  if (error) {
    if (error.code === 'PGRST116' || error.message.includes('not find')) {
      console.log("DATABASE STATUS: Tables are NOT synced yet.");
    } else {
      console.error("ERROR:", error.message);
    }
  } else {
    console.log("DATABASE STATUS: Tables are successfully synced! ✅");
  }
}

checkTables();
