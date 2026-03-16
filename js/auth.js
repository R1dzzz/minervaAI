const SUPABASE_URL = "https://lijrlkeyirltqqkwxpck.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpanJsa2V5aXJsdHFxa3d4cGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzY3ODgsImV4cCI6MjA4OTI1Mjc4OH0.V41Kh4sXORyNFbb6n-VdBdU8M1303cNESPzBnaMLOU0";

const { createClient } = supabase;
const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* ══════════════════════════════════════
   AUTH GUARD — redirect unauthenticated users
   Call this at the top of index.html's script
   ══════════════════════════════════════ */
async function requireAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session.user;
}


/* ══════════════════════════════════════
   REDIRECT LOGGED-IN USERS AWAY FROM AUTH PAGES
   Call this at top of login.html / register.html
   ══════════════════════════════════════ */
async function checkAuthRedirect() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    window.location.href = 'index.html';
  }
}


/* ══════════════════════════════════════
   SIGN UP
   Creates auth user + inserts profile row
   ══════════════════════════════════════ */
async function signUp(email, password, name) {
  try {

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) return { error };

    const user = data.user;

    if (!user) {
      return { error: { message: 'Account creation failed. Please try again.' } };
    }

    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: user.id,
        name,
        email,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.warn('Profile insert error (non-critical):', profileError.message);
    }

    return { data, error: null };

  } catch (err) {
    return { error: { message: err.message } };
  }
}


/* ══════════════════════════════════════
   SIGN IN
   ══════════════════════════════════════ */
async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };

  } catch (err) {
    return { error: { message: err.message } };
  }
}


/* ══════════════════════════════════════
   SIGN OUT
   ══════════════════════════════════════ */
async function signOut() {

  const { error } = await supabaseClient.auth.signOut();

  if (!error) {
    window.location.href = 'login.html';
  }

  return { error };
}


/* ══════════════════════════════════════
   GET CURRENT USER
   Returns the current auth user object
   ══════════════════════════════════════ */
async function getCurrentUser() {

  const { data: { user } } = await supabaseClient.auth.getUser();

  return user;

}


/* ══════════════════════════════════════
   GET USER PROFILE
   Fetches from the profiles table
   ══════════════════════════════════════ */
async function getUserProfile(userId) {

  try {

    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {

      const user = await getCurrentUser();

      if (user) {

        const name =
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User';

        await supabaseClient
          .from('profiles')
          .upsert({
            id: user.id,
            name,
            email: user.email,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });

        return {
          name,
          email: user.email,
          id: user.id
        };
      }

      return null;
    }

    return data;

  } catch (err) {
    console.error('Get profile error:', err);
    return null;
  }

}


/* ══════════════════════════════════════
   AUTH STATE LISTENER
   Listen to auth changes
   ══════════════════════════════════════ */
function onAuthStateChange(callback) {

  return supabaseClient.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

}