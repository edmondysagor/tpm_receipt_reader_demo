import { useState, FormEvent, useEffect } from 'react';
import { Mail, Lock, User, AlertCircle, Loader2, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthScreen() {
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/dashboard');
            }
        });
    }, [navigate]);

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [signUpSuccess, setSignUpSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                // Sign In with Supabase
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password: pwd,
                });
                if (signInError) {
                    setError(signInError.message);
                } else {
                    // On successful login, go to dashboard
                    navigate('/dashboard');
                }
            } else {
                // Sign Up with Supabase
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password: pwd,
                    options: { data: { full_name: name } },
                });
                if (signUpError) {
                    setError(signUpError.message);
                } else if (data?.user?.identities?.length === 0) {
                    // User already exists
                    setError('An account with this email already exists. Please sign in instead.');
                } else {
                    // Sign up successful — show confirmation message
                    setSignUpSuccess(true);
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Show email confirmation screen after successful sign up
    if (signUpSuccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[420px] z-10"
                >
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-8 pb-10 shadow-2xl border border-slate-800/60 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-500/20 mx-auto">
                            <Mail size={28} />
                        </div>
                        <h1 className="text-[28px] font-bold tracking-tight text-white mb-3">Check Your Email</h1>
                        <p className="text-slate-400 text-[15px] mb-2">
                            We've sent a confirmation link to:
                        </p>
                        <p className="text-brand font-semibold text-[15px] mb-6">{email}</p>
                        <p className="text-slate-500 text-[13px] mb-8">
                            Please click the link in the email to verify your account, then come back here to sign in.
                        </p>
                        <button
                            onClick={() => {
                                setSignUpSuccess(false);
                                setIsLogin(true);
                                setPwd('');
                            }}
                            className="w-full py-3.5 bg-brand hover:bg-brand/90 active:bg-brand/80 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(13,127,242,0.3)] text-[15px]"
                        >
                            Back to Sign In
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[420px] z-10"
            >
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-8 pb-10 shadow-2xl border border-slate-800/60">

                    <div className="flex flex-col items-center mb-8 text-center pt-2">
                        <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6 shadow-2xl shadow-brand/20 overflow-hidden border border-white/10 relative group">
                            <img
                                src="/receipt_guard_logo.png"
                                alt="Receipt Guard Logo"
                                className="w-full h-full object-cover scale-110 transition-transform duration-500 group-hover:scale-125"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand/20 to-transparent pointer-events-none" />
                        </div>
                        <h2 className="text-xl font-semibold text-brand tracking-widest uppercase mb-1 flex items-center gap-2">
                            <Activity size={18} />
                            Receipt Guard
                        </h2>
                        <h1 className="text-[28px] font-bold tracking-tight text-white mb-2 leading-tight">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-slate-400 text-[15px]">
                            {isLogin ? 'Enter your credentials to access your AI workspace.' : 'Join the future of receipt automation.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all placeholder:text-slate-500 text-[15px]"
                                    placeholder="Full Name"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all placeholder:text-slate-500 text-[15px]"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                    className={`w-full bg-slate-950/50 border ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-800 focus:ring-brand/50 focus:border-brand'} text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-500 text-[15px]`}
                                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                                    required
                                />
                            </div>
                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-red-400 text-[13px] mt-2 flex items-center gap-1 font-medium px-1"
                                    >
                                        <AlertCircle size={14} /> {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between pt-1 pb-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 bg-slate-950 border-slate-700 rounded text-brand focus:ring-brand focus:ring-offset-slate-900 transition-all cursor-pointer" />
                                    <span className="text-[13px] text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                                </label>
                                <button type="button" className="text-[13px] font-medium text-brand hover:text-cyan-400 transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-brand hover:bg-brand/90 active:bg-brand/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(13,127,242,0.3)] mt-4 text-[15px] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-7">
                        <div className="flex-1 h-px bg-slate-800"></div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-slate-800"></div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            const { error } = await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: {
                                    redirectTo: `${window.location.origin}/dashboard`,
                                },
                            });
                            if (error) setError(error.message);
                        }}
                        className="w-full py-3.5 bg-slate-800/60 hover:bg-slate-800 active:bg-slate-700 border border-slate-700 text-slate-300 font-medium rounded-xl transition-all flex items-center justify-center gap-3 text-[15px] group"
                    >
                        <svg className="w-[18px] h-[18px] group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-slate-400 text-[14px] mt-8">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-brand hover:text-cyan-400 font-semibold transition-colors underline-offset-2 hover:underline"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
