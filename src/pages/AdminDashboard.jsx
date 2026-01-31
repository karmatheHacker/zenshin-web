import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, uploadApk, createReleaseRecord, getLatestRelease, getDownloadStats, getDownloadHistory, subscribeToStats } from "../services/api";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [version, setVersion] = useState("");
    const [changelog, setChangelog] = useState("");
    const [message, setMessage] = useState(null);
    const [latestRelease, setLatestRelease] = useState(null);
    const [stats, setStats] = useState({ total: 0, today: 0, week: 0, month: 0 });
    const [graphData, setGraphData] = useState([]);

    const loadRelease = useCallback(async () => {
        const data = await getLatestRelease();
        if (data) setLatestRelease(data);
    }, []);

    const loadStats = useCallback(async (force = false) => {
        const [statData, histData] = await Promise.all([
            getDownloadStats(force),
            getDownloadHistory(force)
        ]);
        setStats(statData);
        setGraphData(histData);
    }, []);

    const loadData = useCallback(async () => {
        await Promise.all([loadRelease(), loadStats()]);
    }, [loadRelease, loadStats]);

    useEffect(() => {
        loadData();

        // Subscribe to realtime updates
        let debounceTimer;
        const subscription = subscribeToStats(() => {
            // User requested DB source of truth.
            // We use a debounce to prevent spamming the DB during high traffic,
            // but ensure we get the actual latest values from the database.
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadStats(true); // Force refresh from DB
            }, 500);
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(debounceTimer); // Clear timer on unmount
        };
    }, [loadData, loadStats]); // Added dependencies

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin-login');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !version) {
            setMessage({ type: 'error', text: 'Please select a file and enter a version.' });
            return;
        }

        setUploading(true);
        setMessage(null);

        try {
            // 1. Upload APK
            const publicUrl = await uploadApk(file, version);

            // 2. Create DB Record
            await createReleaseRecord(version, changelog, publicUrl);

            setMessage({ type: 'success', text: 'Upload successful! Release published.' });
            setFile(null);
            setVersion("");
            setChangelog("");
            loadRelease(); // Refresh stats
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setUploading(false);
        }
    };

    // Generate SVG path for chart
    const getChartPath = (fill) => {
        if (!graphData.length) return "";

        const width = 100;
        const height = 100;
        const maxVal = Math.max(...graphData.map(d => d.count), 5); // Minimum scale of 5

        // Calculate points
        const points = graphData.map((d, i) => {
            const x = (i / (graphData.length - 1)) * width;
            const y = height - (d.count / maxVal) * 80; // utilize 80% of height max
            return `${x},${y}`;
        });

        if (fill) {
            // Close the path for fill
            return `M0,100 L${points.join(" L")} L100,100 Z`;
        }

        // Stroke only
        return `M${points.join(" L")}`;
    };

    return (
        <div className="dark bg-dark-bg font-display text-gray-200 min-h-screen flex flex-col">

            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-dark-bg/80 backdrop-blur-xl">
                <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="size-8 text-primary">
                                <img src="/logo.png" alt="Zenshin Logo" className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-xl font-black italic uppercase text-white">
                                Zenshin
                            </h2>
                        </Link>
                        <div className="h-8 w-px bg-white/10" />
                        <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
                            Realtime Analytics
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xs font-bold text-white">Administrator</p>
                            <p className="text-[10px] text-gray-500">Session: Active</p>
                        </div>
                        <button onClick={handleSignOut} className="size-10 rounded-full glass-card flex items-center justify-center hover:border-primary/50 transition cursor-pointer">
                            <span className="material-symbols-outlined text-gray-400">
                                logout
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="flex-grow max-w-[1440px] mx-auto w-full p-6 lg:p-10 space-y-8">

                {/* STATS */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        ["Latest Version", latestRelease?.version || "N/A", "Stable"],
                        ["Total Downloads", stats.total.toLocaleString(), "Lifetime"],
                        ["Today", stats.today.toLocaleString(), "24h"],
                        ["This Week", stats.week.toLocaleString(), "7d"],
                    ].map(([title, value, delta], i) => (
                        <div
                            key={title}
                            className={`glass-card p-6 rounded-2xl relative overflow-hidden ${i === 0 ? "bg-primary/5 border-primary/20" : ""
                                }`}
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                                {title}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span
                                    className={`text-4xl font-black ${i === 0 ? "text-primary" : "text-white"
                                        }`}
                                >
                                    {value}
                                </span>
                                <span className="text-xs font-bold text-gray-500">
                                    {delta}
                                </span>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* UPLOAD FORM */}
                    <section className="lg:col-span-1 glass-card p-8 rounded-3xl space-y-6">
                        <div>
                            <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">cloud_upload</span>
                                Deploy New Version
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Upload .apk file to release channels
                            </p>
                        </div>

                        {message && (
                            <div className={`px-4 py-3 rounded-xl text-center text-xs font-bold uppercase ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                    message.type === 'info' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpload} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                    Version Tag
                                </label>
                                <input
                                    type="text"
                                    placeholder="v1.0.2"
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    className="w-full h-12 pl-4 pr-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-700 focus:ring-0 transition outline-none focus:border-primary/50"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                    APK File
                                </label>
                                <input
                                    type="file"
                                    accept=".apk"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                    Changelog (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={changelog}
                                    onChange={(e) => setChangelog(e.target.value)}
                                    placeholder="- Bug fixes..."
                                    className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-700 focus:ring-0 transition outline-none focus:border-primary/50 text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full h-12 bg-primary text-black rounded-xl font-black uppercase italic hover:scale-[1.02] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Uploading...
                                    </>
                                ) : 'Publish Release'}
                            </button>
                        </form>
                    </section>

                    {/* CHART */}
                    <section className="lg:col-span-2 glass-card p-8 rounded-3xl space-y-6">
                        <div>
                            <h3 className="text-xl font-black uppercase italic text-white leading-none">
                                Download Trends
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Last 30 days activity overview
                            </p>
                        </div>

                        <div className="relative h-[300px]">
                            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FF5F00" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#FF5F00" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                <path
                                    d={getChartPath(true)} // Fill path
                                    fill="url(#chartGradient)"
                                    className="transition-all duration-1000 ease-out"
                                />
                                <path
                                    d={getChartPath(false)} // Stroke path
                                    fill="none"
                                    stroke="#FF5F00"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>

                            <div className="absolute bottom-0 inset-x-0 flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600 px-2">
                                <span>30 Days Ago</span>
                                <span>Today</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* RECENT RELEASES (Placeholder for now) */}
                <section className="glass-card rounded-3xl overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black uppercase italic text-white">
                                Release History
                            </h3>
                            <p className="text-sm text-gray-500">
                                Log of published versions
                            </p>
                        </div>
                        <button
                            onClick={() => setMessage({ type: 'info', text: 'History archive coming soon.' })}
                            className="bg-white/10 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition"
                        >
                            View All
                        </button>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            <tr>
                                <th className="px-8 py-5">Version</th>
                                <th className="px-8 py-5">Release Date</th>
                                <th className="px-8 py-5">Size</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {latestRelease ? (
                                <tr className="hover:bg-white/[0.02]">
                                    <td className="px-8 py-5 text-white font-bold">{latestRelease.version}</td>
                                    <td className="px-8 py-5 text-gray-400">{new Date(latestRelease.created_at).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 text-gray-400">45 MB</td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <a href={latestRelease.download_url} className="text-primary text-xs font-bold uppercase hover:underline">Download</a>
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center text-gray-500 uppercase text-xs font-bold tracking-widest">
                                        No releases found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-white/5 py-8">
                <div className="max-w-[1440px] mx-auto px-6 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest text-gray-500">
                        Analytics Protocol v2.4
                    </span>
                    <span className="text-xs uppercase tracking-widest text-gray-500">
                        Zenshin
                    </span>
                </div>
            </footer>
        </div>
    );
}
