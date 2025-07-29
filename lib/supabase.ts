import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://oewwlhhrwjznxkplasow.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld3dsaGhyd2p6bnhrcGxhc293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDU0MjYsImV4cCI6MjA2OTM4MTQyNn0.wpSo0BESGZvmqHvcbznIl5istzJ5ob5uxM3xUu2DHF0'
);