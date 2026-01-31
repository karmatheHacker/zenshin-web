import { supabase } from '../supabaseClient';

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const uploadApk = async (file, version) => {
    // 1. Upload to Storage
    const fileName = `zenshin-v${version}.apk`;
    const { error: uploadError } = await supabase.storage
        .from('apks')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('apks')
        .getPublicUrl(fileName);

    return publicUrl;
};

export const createReleaseRecord = async (version, changelog, downloadUrl) => {
    const { data, error } = await supabase
        .from('apk_releases')
        .insert([
            { version, changelog, download_url: downloadUrl }
        ]);

    if (error) throw error;
    return data;
};

export const getLatestRelease = async () => {
    const { data, error } = await supabase
        .from('apk_releases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) return null;
    return data;
};

// --- ANALYTICS ---

// --- CACHE STORE ---
const CACHE = {
    stats: { data: null, timestamp: 0, ttl: 30 * 1000 }, // 30 seconds cache
    history: { data: null, timestamp: 0, ttl: 5 * 60 * 1000 } // 5 minutes cache
};

export const trackDownload = async (releaseId) => {
    try {
        const { error } = await supabase
            .from('downloads')
            .insert([{ release_id: releaseId }]);

        if (error) {
            console.error("Supabase Analytics Error:", error);
            // alert(`Database Error: ${error.message}`); // Silent fail is better for analytics
        }
    } catch (err) {
        console.error("Tracking Exception:", err);
    }
};

export const getDownloadStats = async (forceRefresh = false) => {
    const now = Date.now();
    // Use cache if available and fresh, unless forced
    if (!forceRefresh && CACHE.stats.data && (now - CACHE.stats.timestamp < CACHE.stats.ttl)) {
        return CACHE.stats.data;
    }

    const current = new Date();
    const startOfDay = new Date(current.getFullYear(), current.getMonth(), current.getDate()).toISOString();
    const startOfWeek = new Date(current.setDate(current.getDate() - current.getDay())).toISOString();
    const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1).toISOString();

    // Parallel queries for performance
    const [total, today, week, month] = await Promise.all([
        supabase.from('downloads').select('*', { count: 'exact', head: true }),
        supabase.from('downloads').select('*', { count: 'exact', head: true }).gt('created_at', startOfDay),
        supabase.from('downloads').select('*', { count: 'exact', head: true }).gt('created_at', startOfWeek),
        supabase.from('downloads').select('*', { count: 'exact', head: true }).gt('created_at', startOfMonth),
    ]);

    const stats = {
        total: total.count || 0,
        today: today.count || 0,
        week: week.count || 0,
        month: month.count || 0
    };

    // Update Cache
    CACHE.stats = { data: stats, timestamp: now, ttl: 30 * 1000 };
    return stats;
};

export const getDownloadHistory = async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && CACHE.history.data && (now - CACHE.history.timestamp < CACHE.history.ttl)) {
        return CACHE.history.data;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
        .from('downloads')
        .select('created_at')
        .gt('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(10000); // Safety limit to prevent browser crash on massive datasets

    if (error) return [];

    // Group by date
    const grouped = data.reduce((acc, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // Fill in missing days
    const history = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString();
        history.push({
            date: dateStr,
            count: grouped[dateStr] || 0
        });
    }

    CACHE.history = { data: history, timestamp: now, ttl: 5 * 60 * 1000 };
    return history;
};

export const subscribeToStats = (callback) => {
    return supabase
        .channel('public:downloads')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'downloads' }, (payload) => {
            callback(payload); // Notify to refresh stats with payload
        })
        .subscribe();
};

export const subscribeToReleases = (callback) => {
    return supabase
        .channel('public:apk_releases')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'apk_releases' }, () => {
            callback(); // Notify to refresh releases
        })
        .subscribe();
};
