import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ⚡ Replace with your Supabase project info
const SUPABASE_URL = "https://xosgnvwhjhovzjwcfqlr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvc2dudndoamhvdnpqd2NmcWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzYwMzIsImV4cCI6MjA3NjIxMjAzMn0.ipi5YUc5OZmnZP1TBsYbzTTEXekXxX_3sgd0OVcb9zk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
