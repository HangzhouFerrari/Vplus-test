// supabase-client.js — include dit op elke pagina vóór andere scripts
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="supabase-client.js"></script>

const SUPABASE_URL = 'https://ibsdobifxfvwxxtagphj.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlic2RvYmlmeGZ2d3h4dGFncGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODEwODgsImV4cCI6MjA5NDc1NzA4OH0.wkay8tnyREzuIs0P038pAgsoxvEj1gi7Rg1QUVifTc0';

const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ─── AUTH HELPERS ─── */

/** Haal huidige sessie + user op. Geeft null terug als uitgelogd. */
async function getSession() {
  const { data: { session } } = await _sb.auth.getSession();
  return session;
}

/** Haal profiel op van ingelogde gebruiker */
async function getProfile() {
  const session = await getSession();
  if (!session) return null;
  const { data } = await _sb.auth.getUser();
  if (!data?.user) return null;
  const { data: profile } = await _sb
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  return profile;
}

/** Check of username al bestaat */
async function usernameExists(username) {
  const { data } = await _sb
    .from('profiles')
    .select('id')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  return !!data;
}

/** Haal email op van username (voor username-login) */
async function emailFromUsername(username) {
  const { data } = await _sb
    .from('profiles')
    .select('id')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  if (!data) return null;
  // We kunnen geen email ophalen via RLS, maar we kunnen inloggen via magic link
  // In praktijk: sla email op in profiles voor username-login
  const { data: profileFull } = await _sb
    .from('profiles')
    .select('email')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  return profileFull?.email || null;
}

/** Uitloggen */
async function signOut() {
  await _sb.auth.signOut();
}

/** Redirect naar login als niet ingelogd */
async function requireAuth(redirectTo = 'login.html') {
  const session = await getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

/** Redirect weg van login als al ingelogd */
async function redirectIfLoggedIn(to = 'index.html') {
  const session = await getSession();
  if (session) {
    window.location.href = to;
  }
}

/* ─── SETS HELPERS ─── */

/** Haal gesynchroniseerde sets op van huidige gebruiker */
async function getSyncedSets() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return [];
  const { data } = await _sb
    .from('synced_sets')
    .select(`set_id, synced_at, sets(*)`)
    .eq('user_id', user.id)
    .order('synced_at', { ascending: false });
  return data || [];
}

/** Hoeveel sets zijn gesynchroniseerd */
async function getSyncCount() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return 0;
  const { count } = await _sb
    .from('synced_sets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  return count || 0;
}

/** Synchroniseer een set (max 5) */
async function syncSet(setId) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) throw new Error('not_logged_in');
  const count = await getSyncCount();
  if (count >= 5) throw new Error('sync_limit_reached');
  const { error } = await _sb.from('synced_sets').insert({ user_id: user.id, set_id: setId });
  if (error) throw error;
}

/** Desynchroniseer een set */
async function unsyncSet(setId) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return;
  await _sb.from('synced_sets').delete().eq('user_id', user.id).eq('set_id', setId);
}

/** Upload een lokale set naar Supabase */
async function uploadSet(setObj) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) throw new Error('not_logged_in');
  const { data, error } = await _sb.from('sets').insert({
    owner_id: user.id,
    naam: setObj.naam || setObj.title || 'Naamloze set',
    vak: setObj.vak || '',
    beschrijving: setObj.beschrijving || '',
    data: setObj.pairs || setObj.data || [],
    is_public: false,
  }).select().single();
  if (error) throw error;
  return data;
}

window.VeliosAuth = {
  client: _sb,
  getSession, getProfile, usernameExists, emailFromUsername,
  signOut, requireAuth, redirectIfLoggedIn,
  getSyncedSets, getSyncCount, syncSet, unsyncSet, uploadSet,
};
