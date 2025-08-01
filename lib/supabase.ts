

// In your Supabase client initialization
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oewwlhhrwjznxkplasow.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld3dsaGhyd2p6bnhrcGxhc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDU0MjYsImV4cCI6MjA2OTM4MTQyNn0.wpSo0BESGZvmqHvcbznIl5istzJ5ob5uxM3xUu2DHF0';
export const supabase = createClient(supabaseUrl, supabaseKey);