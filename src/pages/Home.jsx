import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLatestRelease, trackDownload, subscribeToReleases } from '../services/api';

const DISCORD_INVITE = "https://discord.gg/PH3hXQMZwN";

export default function Home() {
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [releaseId, setReleaseId] = useState(null);

    const loadLatestApk = useCallback(async () => {
        const release = await getLatestRelease();
        if (release) {
            setDownloadUrl(release.download_url);
            setReleaseId(release.id);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        loadLatestApk();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Subscription
    useEffect(() => {
        const subscription = subscribeToReleases(() => {
            loadLatestApk();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [loadLatestApk]);

    const handleDownload = () => {
        if (!downloadUrl) {
            alert("No release available yet! Stay tuned.");
            return;
        }

        // 1. Initiate Download IMMEDIATELY
        window.location.href = downloadUrl;

        // 2. Track in background (don't await, don't block)
        if (releaseId) {
            trackDownload(releaseId).catch(err => {
                console.warn("Analytics failed, but download started:", err);
            });
        }
    };

    const handlePressStart = () => {
        timerRef.current = setTimeout(() => {
            navigate('/admin-login');
        }, 3000); // 3 seconds long press
    };

    const handlePressEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return (
        <div className="dark bg-dark-bg text-gray-200 font-display min-h-screen overflow-x-hidden">

            {/* NAVBAR */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-dark-bg/80 backdrop-blur-xl">
                <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 flex justify-between items-center relative">
                    <a href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Zenshin Logo" className="w-8 h-8 object-contain" />
                        <span
                            className="text-xl font-black italic uppercase text-white cursor-pointer select-none"
                            onMouseDown={handlePressStart}
                            onMouseUp={handlePressEnd}
                            onMouseLeave={handlePressEnd}
                            onTouchStart={handlePressStart}
                            onTouchEnd={handlePressEnd}
                        >
                            <span className="text-primary">Zenshin</span>
                        </span>
                    </a>

                    <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-10 text-xs font-bold uppercase tracking-widest text-gray-400">
                        <a onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary cursor-pointer transition-colors">Features</a>
                        <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="hover:text-primary cursor-pointer transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1892.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.1023.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                            </svg>
                            Community
                        </a>
                    </nav>

                    <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer" className="bg-primary text-black px-6 h-10 rounded-full text-xs font-black uppercase hover:scale-105 transition cursor-pointer flex items-center justify-center">
                        Join Crew
                    </a>
                </div>
            </header>

            {/* HERO */}
            <section className="relative max-w-[1280px] mx-auto px-6 lg:px-10 pt-10 pb-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">


                <div className="relative z-10 space-y-6 md:space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <h2 className="text-4xl md:text-8xl font-black italic uppercase leading-[0.9] tracking-tight text-white">
                        Master the <br />
                        <span className="text-primary">Zenshin</span> <br />
                        Way
                    </h2>

                    <p className="text-gray-400 max-w-xl border-l-4 border-primary/30 pl-6 text-sm md:text-base">
                        The ultimate dedicated reader for Lookism. No distractions, no other series — just the high-octane saga of Daniel Park in zero lag.
                    </p>

                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80 bg-primary/10 px-4 py-2 rounded-lg w-fit mx-auto lg:mx-0">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Official chapter at 9 PM on Thursday
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
                        <button
                            onClick={handleDownload}
                            className="bg-primary text-black px-6 h-12 md:px-10 md:h-16 rounded-2xl font-black italic uppercase text-sm md:text-base hover:-translate-y-1 transition cursor-pointer"
                        >
                            Get the App →
                        </button>

                        <button
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            className="glass-card px-6 h-12 md:px-10 md:h-16 rounded-2xl font-black italic uppercase text-white text-sm md:text-base hover:bg-white/5 transition cursor-pointer"
                        >
                            Features
                        </button>
                    </div>
                </div>

                {/* PHONE MOCK */}
                <div className="relative flex justify-center mt-8 lg:mt-0">
                    {/* Glow removed */}
                    <div className="relative w-[240px] md:w-[300px] aspect-[9/19.5] rounded-[2.5rem] md:rounded-[3.5rem] p-2 bg-black iphone-bezel">
                        <div className="w-full h-full rounded-[2rem] md:rounded-[2.5rem] bg-black overflow-hidden border border-white/10 relative">
                            <img
                                src="/raw-hero.jpg"
                                alt="App Screenshot"
                                className="w-full h-full object-fill"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SHOWCASE */}
            <section id="features" className="py-24 bg-dark-accent/30 border-y border-white/5">
                <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white mb-4">
                            System <span className="text-primary">Features</span>
                        </h2>
                        <p className="text-gray-400">Advanced capabilities for the ultimate reader.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-center">
                            <div className="relative w-[200px] md:w-[280px] aspect-[9/19.5] rounded-[2.5rem] md:rounded-[3rem] p-2 bg-black iphone-bezel mb-8 shadow-2xl">
                                <div className="w-full h-full rounded-[2rem] md:rounded-[2.2rem] bg-black overflow-hidden border border-white/10 relative">
                                    <img src="/feat-notification.jpg" alt="Instant Notifications" className="w-full h-full object-fill" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black italic uppercase text-white mb-2">Instant Alerts</h3>
                            <p className="text-gray-400 text-center text-sm px-4">Never miss a chapter. Real-time push notifications the second a new update drops.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col items-center">
                            <div className="relative w-[200px] md:w-[280px] aspect-[9/19.5] rounded-[2.5rem] md:rounded-[3rem] p-2 bg-black iphone-bezel mb-8 shadow-2xl">
                                <div className="w-full h-full rounded-[2rem] md:rounded-[2.2rem] bg-black overflow-hidden border border-white/10 relative">
                                    <img src="/feat-options.jpg" alt="Reading Options" className="w-full h-full object-fill" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black italic uppercase text-white mb-2">Dual Reading Mode</h3>
                            <p className="text-gray-400 text-center text-sm px-4">Choose your weapon. Use our optimized in-app reader or open directly in your favorite external apps.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col items-center">
                            <div className="relative w-[200px] md:w-[280px] aspect-[9/19.5] rounded-[2.5rem] md:rounded-[3rem] p-2 bg-black iphone-bezel mb-8 shadow-2xl">
                                <div className="w-full h-full rounded-[2rem] md:rounded-[2.2rem] bg-black overflow-hidden border border-white/10 relative">
                                    <img src="/feat-reader.jpg" alt="Immersive Reader" className="w-full h-full object-fill" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black italic uppercase text-white mb-2">Immersive Output</h3>
                            <p className="text-gray-400 text-center text-sm px-4">Crystal clear quality. Experience every panel exactly as the artist intended.</p>
                        </div>
                    </div>
                </div>
            </section>



            {/* FOOTER */}
            <footer className="border-t border-white/5 py-10 text-center text-xs uppercase tracking-widest text-gray-500">
                © 2026 Zenshin Protocol
            </footer>

        </div>
    );
}
