import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../services/api";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Assuming 'username' is used as email for Supabase auth
            await signIn(username, password);
            navigate('/admin-dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dark min-h-screen bg-dark-bg font-display text-gray-200 relative overflow-hidden flex flex-col">

            {/* BACKGROUND */}
            <div className="absolute inset-0 halftone-pattern opacity-40 pointer-events-none" />

            {/* HEADER */}
            <header className="fixed top-0 left-0 w-full z-50">
                <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 flex items-center gap-4">
                    <Link to="/" className="size-8 text-primary drop-shadow-[0_0_8px_rgba(255,95,0,0.5)]">
                        <img src="/logo.png" alt="Zenshin Logo" className="w-full h-full object-contain" />
                    </Link>
                    <h1 className="text-xl font-black uppercase italic text-white">
                        Zenshin
                    </h1>
                </div>
            </header>

            {/* MAIN */}
            <main className="flex-grow flex items-center justify-center px-6 py-20 relative z-10">
                <div className="w-full max-w-[480px] flex flex-col items-center">

                    {/* STATUS BADGE */}
                    <div className="mb-10">
                        <div className="glass-card px-5 py-2 rounded-full flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">bolt</span>
                            <span className="text-[12px] font-black uppercase tracking-[0.25em]">
                                1,247+ Soldiers Active
                            </span>
                        </div>
                    </div>

                    {/* CARD */}
                    <div className="glass-card w-full p-10 md:p-12 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 size-48 bg-primary/20 blur-[60px] rounded-full" />
                        <div className="absolute -bottom-24 -left-24 size-48 bg-primary/10 blur-[60px] rounded-full" />

                        <div className="relative z-10 space-y-8">

                            {/* TITLE */}
                            <div className="text-center">
                                <h2 className="text-4xl md:text-5xl font-black italic uppercase leading-[0.9]">
                                    Admin <br />
                                    <span className="text-primary neon-text">Access</span>
                                </h2>
                                <p className="text-gray-500 text-xs font-black uppercase tracking-widest mt-4">
                                    Protocol Identification Required
                                </p>
                            </div>

                            {/* FORM */}
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-center text-xs font-bold uppercase">
                                        {error}
                                    </div>
                                )}

                                {/* USERNAME */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                        Admin Email
                                    </label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary">
                                            mail
                                        </span>
                                        <input
                                            type="email"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="admin@zenshin.com"
                                            className="w-full h-16 pl-12 pr-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder:text-gray-700 focus:ring-0 transition outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>

                                {/* PASSWORD */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                        Admin Password
                                    </label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary">
                                            lock
                                        </span>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter security phrase..."
                                            className="w-full h-16 pl-12 pr-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder:text-gray-700 focus:ring-0 transition outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>

                                {/* BUTTON */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-primary text-black rounded-2xl font-black uppercase italic shadow-[0_0_30px_rgba(255,95,0,0.3)] hover:-translate-y-1 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            Unlock Protocol
                                            <span className="material-symbols-outlined">lock_open</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* DIVIDER */}
                            <div className="flex items-center gap-4">
                                <div className="flex-grow h-px bg-white/5" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                                    Secure Node
                                </span>
                                <div className="flex-grow h-px bg-white/5" />
                            </div>

                            {/* WARNING */}
                            <p className="text-gray-500 text-[11px] italic text-center leading-relaxed">
                                Warning: Unauthorized access attempts will be logged and reported
                                to the Zenshin tactical unit.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="py-12 relative z-10">
                <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <span className="text-primary font-black uppercase italic text-lg">
                            Zenshin
                        </span>
                        <span className="text-gray-700">/</span>
                        <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
                            © 2024 Admin Terminal
                        </span>
                    </div>

                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                        <span className="hover:text-primary cursor-pointer">Protocol</span>
                        <span className="hover:text-primary cursor-pointer">Manifesto</span>
                        <span className="hover:text-primary cursor-pointer">Support</span>
                    </div>

                    <div className="flex gap-4">
                        <div className="size-10 rounded-xl glass-card flex items-center justify-center hover:text-primary">
                            <span className="material-symbols-outlined">security</span>
                        </div>
                        <div className="size-10 rounded-xl glass-card flex items-center justify-center hover:text-primary">
                            <span className="material-symbols-outlined">terminal</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
