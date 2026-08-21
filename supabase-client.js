// supabase-client.js — include dit op elke pagina vóór andere scripts
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="supabase-client.js"></script>

const SUPABASE_URL = 'https://ibsdobifxfvwxxtagphj.supabase.co';
const SUPABASE_ANON = 'sb_publishable_TzaxAnx3zhfI96D_gXZYww_fltOsn8i';

const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
  global: {
    // Profielen en andere accountgegevens moeten altijd rechtstreeks van
    // Supabase komen; een oude browserrespons mag nooit de actuele rij winnen.
    fetch: (input, init = {}) => fetch(input, { ...init, cache: 'no-store' }),
  },
});

/* De avatarbestanden horen bij de app. In Supabase bewaren we alleen dit pad. */
const CLASSIC_AVATAR_OPTIONS = [
  { id: 'fox', label: 'Vos', url: 'assets/avatars/fox.jpg', group: 'classic' },
  { id: 'dog', label: 'Hond', url: 'assets/avatars/dog.jpg', group: 'classic' },
  { id: 'cat', label: 'Kat', url: 'assets/avatars/cat.jpg', group: 'classic' },
  { id: 'rabbit', label: 'Konijn', url: 'assets/avatars/rabbit.jpg', group: 'classic' },
  { id: 'owl', label: 'Uil', url: 'assets/avatars/owl.jpg', group: 'classic' },
  { id: 'red-panda', label: 'Rode panda', url: 'assets/avatars/red-panda.jpg', group: 'classic' },
];

const AVATAR_OPTIONS = [
  { id: 'study-red-panda', label: 'Rode panda met pen', url: 'assets/avatars/study-red-panda.webp', group: 'study' },
  { id: 'study-dog', label: 'Hond met boek', url: 'assets/avatars/study-dog.webp', group: 'study' },
  { id: 'study-eagle', label: 'Slapende arend', url: 'assets/avatars/study-eagle.webp', group: 'study' },
  { id: 'study-giraffe', label: 'Giraffe met paperclip', url: 'assets/avatars/study-giraffe.webp', group: 'study' },
  { id: 'study-rabbit', label: 'Konijn met bril', url: 'assets/avatars/study-rabbit.webp', group: 'study' },
  { id: 'study-cat', label: 'Zelfverzekerde kat', url: 'assets/avatars/study-cat.webp', group: 'study' },
  ...CLASSIC_AVATAR_OPTIONS,
];

/** Zet oude preset:N-waarden zonder kapotte afbeelding om naar de nieuwe dierenfoto's. */
function resolveAvatarUrl(value) {
  const stored = String(value || '').trim();
  const oldPreset = stored.match(/^preset:(\d+)$/);
  if (oldPreset) return CLASSIC_AVATAR_OPTIONS[Number(oldPreset[1]) % CLASSIC_AVATAR_OPTIONS.length].url;
  return stored;
}

/**
 * Maak ook zonder profiles-record een bruikbaar profiel van de ingelogde user.
 * Zo blijven accountknoppen zichtbaar wanneer de profielquery tijdelijk faalt of
 * een ouder account nog geen rij in public.profiles heeft.
 */
function profileFromUser(user, profile = null) {
  if (!user && !profile) return null;
  const metadata = user?.user_metadata || {};
  const emailName = String(user?.email || '').split('@')[0];
  const username = String(
    profile?.username || metadata.username || metadata.user_name || emailName || 'gebruiker'
  ).trim();
  const displayName = String(
    profile?.display_name || metadata.display_name || metadata.full_name || username
  ).trim();
  return {
    ...(profile || {}),
    id: profile?.id || user?.id || '',
    username,
    display_name: displayName,
    avatar_url: resolveAvatarUrl(profile?.avatar_url || metadata.avatar_url || ''),
    birth_date: String(profile?.birth_date || metadata.birth_date || '').slice(0,10),
    school_class: profile?.school_class || metadata.school_class || '',
    school_profile: profile?.school_profile || metadata.school_profile || '',
    gymnasium: profile?.gymnasium ?? metadata.gymnasium ?? false,
    extra_subjects: profile?.extra_subjects || metadata.extra_subjects || [],
    excluded_subjects: profile?.excluded_subjects || metadata.excluded_subjects || [],
    hide_irrelevant_subjects: profile?.hide_irrelevant_subjects ?? metadata.hide_irrelevant_subjects ?? true,
  };
}

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
  const { data: profile, error } = await _sb
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();
  if (error) console.warn('Profielrij kon niet worden geladen; auth-gegevens worden gebruikt:', error.message);
  return profileFromUser(data.user, profile);
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

/** Controleer waar mogelijk of een e-mailadres al bij een profiel hoort. */
async function emailExists(email) {
  const { data, error } = await _sb
    .from('profiles')
    .select('id')
    .eq('email', String(email || '').trim().toLowerCase())
    .maybeSingle();
  if (error) {
    console.warn('E-mailbeschikbaarheid kon niet vooraf worden gecontroleerd:', error.message);
    return null;
  }
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

/** Alleen de sessie in deze browser uitloggen; andere apparaten blijven ingelogd. */
async function signOut() {
  const { error } = await _sb.auth.signOut({ scope: 'local' });
  if (error) throw error;
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
  const { data, error } = await _sb
    .from('synced_sets')
    .select(`set_id, synced_at, sets(*)`)
    .eq('user_id', user.id)
    .order('synced_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Hoeveel sets zijn gesynchroniseerd */
async function getSyncCount() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return 0;
  const { count, error } = await _sb
    .from('synced_sets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if (error) throw error;
  return count || 0;
}

/** Synchroniseer een set (max 5) */
async function syncSet(setId) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) throw new Error('not_logged_in');

  const { data: existing, error: existingError } = await _sb
    .from('synced_sets')
    .select('set_id')
    .eq('user_id', user.id)
    .eq('set_id', setId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing;

  const count = await getSyncCount();
  if (count >= 5) throw new Error('sync_limit_reached');
  const { data, error } = await _sb
    .from('synced_sets')
    .insert({ user_id: user.id, set_id: setId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Desynchroniseer een set */
async function unsyncSet(setId) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return;
  const { error } = await _sb.from('synced_sets').delete().eq('user_id', user.id).eq('set_id', setId);
  if (error) throw error;
  /* Alleen de privé cloudkopie van de eigenaar opruimen; de lokale set blijft bestaan. */
  const { error: setError } = await _sb
    .from('sets')
    .delete()
    .eq('id', setId)
    .eq('owner_id', user.id)
    .eq('is_public', false);
  if (setError) console.warn('De ongebruikte cloudkopie kon niet worden opgeruimd:', setError.message);
  removeSyncMapping(setId);
}

function cloudSetPayload(setObj) {
  return {
    naam: setObj.naam || setObj.title || 'Naamloze set',
    vak: setObj.vak || '',
    beschrijving: setObj.beschrijving || setObj.description || '',
    data: {
      terms: setObj.terms || setObj.pairs || setObj.data?.terms || setObj.data || [],
      datum: String(setObj.datum || setObj.data?.datum || '').slice(0, 10),
      klas: String(setObj.klas || setObj.schoolClass || setObj.data?.klas || ''),
    },
    is_public: false,
  };
}

/** Werk de privécloudversie bij; alle gekoppelde apparaten lezen deze versie. */
async function updateSyncedSet(setId, setObj) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) throw new Error('not_logged_in');
  const { data, error } = await _sb
    .from('sets')
    .update(cloudSetPayload(setObj))
    .eq('id', setId)
    .eq('owner_id', user.id)
    .eq('is_public', false)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('synced_set_not_found');
  return data;
}

/** Upload een lokale set naar Supabase */
async function uploadSet(setObj) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) throw new Error('not_logged_in');
  const { data, error } = await _sb.from('sets').insert({
    ...cloudSetPayload(setObj),
    owner_id: user.id,
  }).select().single();
  if (error) throw error;
  return data;
}

const SYNC_MAP_KEY = 'sd_cloud_sync_map';

function getSyncMap() {
  try { return JSON.parse(localStorage.getItem(SYNC_MAP_KEY) || '{}'); }
  catch (e) { return {}; }
}

function saveSyncMap(map) {
  try { localStorage.setItem(SYNC_MAP_KEY, JSON.stringify(map)); }
  catch (e) { /* De synchronisatie zelf blijft in Supabase bewaard. */ }
}

function removeSyncMapping(cloudSetId) {
  const map = getSyncMap();
  Object.keys(map).forEach(localId => {
    if (String(map[localId]) === String(cloudSetId)) delete map[localId];
  });
  saveSyncMap(map);
}

/**
 * Synchroniseert een lokale set zonder bij elke klik een duplicaat in Supabase te maken.
 * Bestaande installaties worden herkend op titel + vak en daarna lokaal gekoppeld.
 */
async function syncLocalSet(setObj) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) throw new Error('not_logged_in');

  const localId = String(setObj.id || setObj.slug || '');
  const map = getSyncMap();
  let cloudSetId = localId ? map[localId] : null;

  if (!cloudSetId) {
    const synced = await getSyncedSets();
    const title = String(setObj.title || setObj.naam || '').trim().toLowerCase();
    const subject = String(setObj.vak || '').trim().toLowerCase();
    const match = synced.find(item => {
      const cloud = item.sets || {};
      return String(cloud.naam || cloud.title || '').trim().toLowerCase() === title &&
        String(cloud.vak || '').trim().toLowerCase() === subject;
    });
    if (match) cloudSetId = match.set_id;
  }

  const payload = cloudSetPayload(setObj);

  if (cloudSetId) {
    const { data: updated, error } = await _sb
      .from('sets')
      .update(payload)
      .eq('id', cloudSetId)
      .eq('owner_id', user.id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!updated) cloudSetId = null;
  }

  if (!cloudSetId) {
    if (await getSyncCount() >= 5) throw new Error('sync_limit_reached');
    const uploaded = await uploadSet(setObj);
    cloudSetId = uploaded.id;
  }

  await syncSet(cloudSetId);
  if (localId) {
    map[localId] = cloudSetId;
    saveSyncMap(map);
  }
  return cloudSetId;
}

window.VeliosAuth = {
  client: _sb,
  AVATAR_OPTIONS, resolveAvatarUrl, profileFromUser,
  getSession, getProfile, usernameExists, emailExists, emailFromUsername,
  signOut, requireAuth, redirectIfLoggedIn,
  getSyncedSets, getSyncCount, syncSet, unsyncSet, uploadSet, updateSyncedSet, syncLocalSet,
};
