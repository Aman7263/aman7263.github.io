// supabase.js
// Initialize Supabase (assuming supabase-js is loaded via CDN or import)
const SUPABASE_URL = "https://pcjunoldozpddssszoke.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9mLZyK-_kNxvfOopEnHbEg_b_1oPBNg";

// Use ESM import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get all posts from a category
async function getPosts(category, search = '', limit = null, offset = 0) {
  try {
    const tableName = `blogger_${category.toLowerCase()}`;

    let query = supabase
      .from(tableName)
      .select('id, published_date, category, heading, content, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit).range(offset, offset + limit - 1);
    if (search) query = query.ilike('heading', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    return { posts: data || [], count };
  } catch (err) {
    return { posts: [], count: 0 };
  }
}

// Get single post by ID
async function getPostById(category, id) {
  try {
    const tableName = `blogger_${category.toLowerCase()}`;

    const { data, error } = await supabase
      .from(tableName)
      .select('id, published_date, category, heading, content, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    return null;
  }
}

// Save payment to Supabase
async function savePayment(amount, authId = null) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          auth_id: authId || null,
          amount: parseFloat(amount),
          payment_status: 'initiated'
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    throw err;
  }
}

// Expose functions globally so they can be used anywhere
window.getPosts = getPosts;
window.getPostById = getPostById;
window.savePayment = savePayment;