import { useState, FormEvent, useEffect } from 'react';
import { Mail, Lock, User, AlertCircle, Loader2, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { auth } from '../authClient';

export default function AuthScreen() {
    const navigate = useNavigate();

    useEffect(() => {
        auth.getSession().then(({ data: { session } }) => {
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                await auth.login(email, pwd);
                navigate('/dashboard');
            } else {
                await auth.register(email, pwd, name);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setError(null);
        setLoading(true);
        try {
            if (!credentialResponse.credential) {
                throw new Error('Google did not return credential token');
            }
            await auth.loginWithGoogle(credentialResponse.credential);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

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

                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google login failed or was cancelled')}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            width="100%"
                            text={isLogin ? 'signin_with' : 'signup_with'}
                        />
                    </div>

                    <p className="text-center text-slate-400 text-[14px] mt-8">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
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
