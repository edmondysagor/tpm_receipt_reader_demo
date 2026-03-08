import { useState, useRef, useEffect, ChangeEvent, DragEvent, useCallback, useMemo, FormEvent } from 'react';
import {
  CloudUpload,
  Activity,
  Database,
  FileText,
  ChevronRight,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  X,
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  User,
  Bell,
  AlertCircle,
  Loader2,
  MoreVertical,
  Check,
  Cpu,
  Edit2,
  Save,
  X as XIcon,
  LineChart,
  Tags,
  Workflow,
  Upload,
  ArrowRight,
  Lock,
  Key,
  Command,
  Mail,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabaseClient';

interface DataRow {
  id: string;
  seqNo: string;
  merchantName: string;
  date: string;
  totalAmount: string;
  currency: string;
  category: string;
  paymentMethod: string;
  summary: string;
  status: 'Success' | 'Processing' | 'Needs Review' | 'Failed' | 'Duplicate';
  progress?: number;
  statusMessage?: string;
  isDuplicate?: boolean;
  duplicateOf?: string;
  confidenceScore?: number;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// In production (Vercel), use the Railway backend URL.
// In development (Vite), use '/api' which is proxied to localhost:8000.
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function LoginScreen({ onLogin }: { onLogin: () => void }) {
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
          onLogin();
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-cyan-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-brand/20">
              <Command size={28} />
            </div>
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
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: window.location.origin,
                },
              });
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);

  // Fetch credits balance from Supabase profiles table
  const fetchCredits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setCreditsBalance(data.credits_balance ?? 0);
      }
    } catch (e) {
      console.warn('Failed to fetch credits:', e);
    }
  };

  // Listen to Supabase auth state changes
  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');
        setUserEmail(session.user.email || '');
        fetchCredits(session.user.id);
      }
      setAuthLoading(false);
    });

    // Subscribe to auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');
        setUserEmail(session.user.email || '');
        fetchCredits(session.user.id);
      } else {
        setUserName('');
        setUserEmail('');
        setCreditsBalance(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const [isHoveringUpload, setIsHoveringUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [tableData, setTableData] = useState<DataRow[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // AI Disclaimer state
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimer] = useState(() => {
    return localStorage.getItem('ai_disclaimer_agreed') === 'true';
  });
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // Edit mode state
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<DataRow>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreFileInputRef = useRef<HTMLInputElement>(null);

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    return tableData.filter(row => {
      if (row.id.startsWith('job-')) return true; // Always show placeholders during upload/processing

      // 1. Status Filter
      if (filterStatus !== 'All' && row.status !== filterStatus) return false;

      // 2. Text Search
      if (searchQuery.trim() === '') return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        row.merchantName.toLowerCase().includes(searchLower) ||
        row.summary.toLowerCase().includes(searchLower) ||
        row.category.toLowerCase().includes(searchLower) ||
        row.date.toLowerCase().includes(searchLower) ||
        row.totalAmount.toLowerCase().includes(searchLower) ||
        row.seqNo.toLowerCase().includes(searchLower)
      );
    });
  }, [tableData, searchQuery, filterStatus]);

  // --- Stats derived from FULL table data ---
  const successCount = tableData.filter(r => r.status === 'Success').length;
  const reviewCount = tableData.filter(r => r.status === 'Needs Review').length;
  const failedCount = tableData.filter(r => r.status === 'Failed' || r.status === 'Duplicate').length;

  // Fetch available models on mount
  useEffect(() => {
    fetch(`${API_BASE}/models`)
      .then(res => res.json())
      .then(data => {
        setAvailableModels(data.models || []);
        setSelectedModel(data.default || '');
      })
      .catch(() => {
        // Fallback if backend is unreachable
        setAvailableModels([
          { id: 'qwen3.5:397b-cloud', name: 'Qwen 3.5 397B (Cloud)', description: 'High accuracy, cloud-based' },
          { id: 'qwen3-vl:8b', name: 'Qwen 3 VL 8B (Local)', description: 'Fast, local testing' },
        ]);
        setSelectedModel('qwen3.5:397b-cloud');
      });
  }, []);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };
  // --- Credit and Billing Logic ---
  const handleTopUp = async () => {
    try {
      setIsCheckoutLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Replace API_BASE with your actual backend URL or use the existing const
      const response = await fetch(`${API_BASE}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      addToast(error.message || 'Payment service unavailable', 'error');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const ACCEPTED_EXTS = ['.pdf', '.png', '.jpeg', '.jpg'];

  const processFiles = useCallback((fileArray: File[]) => {
    // Filter to accepted types
    const validFiles = fileArray.filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXTS.includes(ext);
    });
    if (validFiles.length === 0) {
      addToast('No supported files (PDF, PNG, JPEG only)', 'error');
      return;
    }
    const oversized = validFiles.filter(f => f.size > 50 * 1024 * 1024);
    if (oversized.length > 0) {
      addToast(`${oversized.length} file(s) exceed 50MB limit`, 'error');
      return;
    }
    // Append to existing files, dedup by name+size
    setSelectedFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}__${f.size}`));
      const newFiles = validFiles.filter(f => !existing.has(`${f.name}__${f.size}`));
      if (newFiles.length === 0) {
        addToast('Files already added', 'info');
        return prev;
      }
      return [...prev, ...newFiles];
    });
    addToast(`${validFiles.length} file(s) added`, 'success');
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveringUpload(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveringUpload(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHoveringUpload(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
  };

  const handleAddMoreFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
    // Reset the input so the same file can be re-selected
    if (addMoreFileInputRef.current) addMoreFileInputRef.current.value = '';
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          addToast('File(s) ready for analysis', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return next;
    });
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    setTableData(prev => prev.filter(row => !selectedRows.includes(row.id)));
    setSelectedRows([]);
    addToast(`Deleted ${selectedRows.length} record(s)`, 'success');
  };

  const handleEditClick = (row: DataRow) => {
    setEditingRowId(row.id);
    setEditFormData(row);
  };

  const handleSaveEdit = () => {
    if (!editingRowId) return;
    setTableData(prev => prev.map(row =>
      row.id === editingRowId ? { ...row, ...editFormData } as DataRow : row
    ));
    setEditingRowId(null);
    setEditFormData({});
    addToast('Record updated', 'success');
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditFormData({});
  };

  const handleExportCSV = () => {
    const exportData = tableData.filter(r => !r.id.startsWith('job-'));
    if (exportData.length === 0) {
      addToast('No data to export', 'error');
      return;
    }

    const headers = ['Seq No.', 'Merchant', 'Date', 'Status', 'Category', 'Summary', 'Currency', 'Amount', 'Payment Method', 'Notes', 'Confidence Score'];
    const csvRows = [headers.join(',')];

    for (const row of exportData) {
      const values = [
        `"${row.seqNo}"`,
        `"${row.merchantName.replace(/"/g, '""')}"`,
        `"${row.date}"`,
        `"${row.status}"`,
        `"${row.category}"`,
        `"${row.summary.replace(/"/g, '""')}"`,
        `"${row.currency}"`,
        `"${row.totalAmount}"`,
        `"${row.paymentMethod}"`,
        `"${row.isDuplicate ? `Duplicate of #${row.duplicateOf}` : ''}"`,
        `"${row.confidenceScore ?? ''}"`
      ];
      csvRows.push(values.join(','));
    }

    const csvContent = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    link.download = `receipts_export_${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    // Delay cleanup so the browser can finish the download
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
    addToast(`Exported ${exportData.length} records to CSV`, 'success');
  };

  const handleExecuteAnalysis = async () => {
    if (selectedFiles.length === 0) {
      addToast('Please upload file(s) first', 'error');
      return;
    }

    setAnalyzing(true);

    // Create a placeholder "Processing" row
    const placeholderId = `job-${Date.now()}`;
    const placeholderRow: DataRow = {
      id: placeholderId,
      seqNo: '—',
      merchantName: `Processing ${selectedFiles.length} file(s)...`,
      date: new Date().toISOString().split('T')[0],
      totalAmount: '—',
      currency: '',
      category: '',
      paymentMethod: '',
      summary: 'Waiting for AI...',
      status: 'Processing',
      progress: 0,
      statusMessage: 'Uploading files...',
    };
    setTableData(prev => [placeholderRow, ...prev]);

    try {
      // 1. Upload files to backend
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files', file));
      formData.append('model', 'qwen3.5:4b');

      // Get current session token for credit check
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      });

      if (!uploadRes.ok) {
        // Handle insufficient credits (403)
        if (uploadRes.status === 403) {
          setShowCreditModal(true);
          throw new Error('INSUFFICIENT_CREDITS');
        }
        throw new Error(`Upload failed (${uploadRes.status})`);
      }

      const uploadData = await uploadRes.json();
      const jobId: string = uploadData.job_id;

      addToast(`Upload complete — Job ID: ${jobId.slice(0, 8)}...`, 'info');

      // Update placeholder status
      setTableData(prev =>
        prev.map(row =>
          row.id === placeholderId
            ? { ...row, statusMessage: 'Connecting to AI stream...' }
            : row
        )
      );

      // 2. Listen to SSE progress stream
      const evtSource = new EventSource(`${API_BASE}/progress/${jobId}`);

      evtSource.onmessage = (event) => {
        const state = JSON.parse(event.data);
        const progress: number = state.progress ?? 0;
        const status: string = state.status ?? '';

        // Update the placeholder row's progress
        setTableData(prev =>
          prev.map(row =>
            row.id === placeholderId
              ? { ...row, progress, statusMessage: status }
              : row
          )
        );

        if (progress === 100) {
          evtSource.close();
          setAnalyzing(false);

          if (state.error) {
            // Mark as Failed
            setTableData(prev =>
              prev.map(row =>
                row.id === placeholderId
                  ? {
                    ...row,
                    status: 'Failed' as const,
                    progress: undefined,
                    summary: state.error,
                    statusMessage: undefined,
                  }
                  : row
              )
            );
            addToast(`Analysis failed: ${state.error}`, 'error');
          } else if (state.result && Array.isArray(state.result)) {
            // Calculate and map backend result inside setTableData so 'prev' is correctly scoped
            setTableData(prev => {
              const currentMaxSeq = prev.length > 0
                ? Math.max(0, ...prev.filter(r => !r.id.startsWith('job-') && r.seqNo).map(r => parseInt(r.seqNo.replace('#', ''), 10) || 0))
                : 0;

              const newRows: DataRow[] = state.result.map((item: any, idx: number) => ({
                id: `${jobId}-${idx}`,
                seqNo: `#${String(currentMaxSeq + 1 + idx).padStart(5, '0')}`,
                merchantName: item.merchant_name ?? 'Unknown',
                date: item.date ?? '—',
                totalAmount: item.total_amount != null ? String(item.total_amount) : '0.00',
                currency: item.currency ?? 'HKD',
                category: item.category ?? 'Uncategorized',
                paymentMethod: item.payment_method ?? 'Unknown',
                summary: item.summary ?? '—',
                status: item.is_duplicate ? 'Duplicate' : 'Success',
                isDuplicate: item.is_duplicate,
                duplicateOf: item.duplicate_of,
                confidenceScore: item.confidence_score,
              }));

              const without = prev.filter(row => row.id !== placeholderId);
              return [...without, ...newRows];
            });
            addToast(`Analysis complete — ${state.result.length} receipt(s) extracted`, 'success');
            // Refresh credit balance after successful analysis
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session?.user) fetchCredits(session.user.id);
            });
          }

          // Clear files
          handleClearFiles();
        }
      };

      evtSource.onerror = () => {
        evtSource.close();
        setAnalyzing(false);
        setTableData(prev =>
          prev.map(row =>
            row.id === placeholderId
              ? {
                ...row,
                status: 'Failed' as const,
                progress: undefined,
                summary: 'Lost connection to progress stream',
                statusMessage: undefined,
              }
              : row
          )
        );
        addToast('Lost connection to backend', 'error');
      };

    } catch (error: any) {
      setAnalyzing(false);

      if (error.message === 'INSUFFICIENT_CREDITS') {
        // Remove the placeholder row entirely so it doesn't leave a "Failed" ghost row if credits are 0
        setTableData(prev => prev.filter(row => row.id !== placeholderId));
        return; // Modal is already open, no need for toast
      }

      setTableData(prev =>
        prev.map(row =>
          row.id === placeholderId
            ? {
              ...row,
              status: 'Failed' as const,
              progress: undefined,
              summary: error.message || 'Unknown error',
              statusMessage: undefined,
            }
            : row
        )
      );
      addToast(error.message || 'Upload failed', 'error');
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedRows.length === tableData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map(r => r.id));
    }
  };

  const handleAgreeDisclaimer = () => {
    localStorage.setItem('ai_disclaimer_agreed', 'true');
    setHasAgreedToDisclaimer(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  // Show a loading state while checking Supabase session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => {
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-brand/30 selection:text-white">

      {/* Insufficient Credits Modal Layer */}
      <AnimatePresence>
        {showCreditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-effect rounded-2xl w-full max-w-md p-8 shadow-2xl border border-red-500/30 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
              <button
                onClick={() => setShowCreditModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white">Insufficient Credits</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your current credit balance is insufficient to process all selected files. Please choose a recharge package or reduce the number of uploaded files to continue.
                </p>
              </div>

              <div className="flex justify-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isCheckoutLoading) {
                      setShowCreditModal(false);
                      setIsTopUpModalOpen(true);
                    }
                  }}
                  className={`px-8 py-3 w-full sm:w-auto bg-gradient-to-r from-brand to-blue-600 hover:from-blue-500 hover:to-brand text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(13,127,242,0.5)] transition-all flex items-center justify-center gap-2 ${isCheckoutLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isCheckoutLoading ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
                  {isCheckoutLoading ? 'Redirecting...' : 'Visit Billing Center'}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Disclaimer Modal Overlay */}
      <AnimatePresence>
        {!hasAgreedToDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-effect rounded-2xl w-full max-w-lg p-8 shadow-2xl border border-brand/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-purple-500" />

              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white">AI Liability & Accuracy Terms</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Welcome to AI Receipt Reader MVP! Please review our extraction policy before continuing.
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-5 text-sm space-y-4 mb-6 border border-slate-800 text-slate-300">
                <p>
                  <strong>1. Strict Privacy (No Data Retained):</strong> This is a Beta application. We do NOT store your uploaded files or extracted data. Images are processed and immediately discarded. <span className="text-amber-400">Refreshing the page will clear your session history permanently.</span>
                </p>
                <p>
                  <strong>2. Handwriting Limitations:</strong> This system uses advanced language models. While highly accurate with printed receipts, handwritten numbers or ambiguous text can trigger misinterpretations.
                </p>
                <p>
                  <strong>3. User Verification Required:</strong> Data is provided "as is". You are responsible for independently verifying all critical numbers, especially the Total Amount, before finalizing or exporting records to CSV.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group mb-8">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={disclaimerChecked}
                    onChange={(e) => setDisclaimerChecked(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-900 peer-checked:bg-brand peer-checked:border-brand transition-all flex items-center justify-center">
                    <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors select-none">
                  I understand that AI extraction may contain errors and I will verify key data before use.
                </span>
              </label>

              <button
                disabled={!disclaimerChecked}
                onClick={handleAgreeDisclaimer}
                className="w-full py-3 px-4 bg-brand hover:bg-brand/90 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                I Agree & Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex w-full transition-all duration-500 ${!hasAgreedToDisclaimer ? 'blur-sm pointer-events-none select-none opacity-50' : ''}`}>
        {/* Sidebar */}
        <aside className={`w-64 border-r border-slate-800/50 glass-effect hidden ${isDesktopSidebarOpen ? 'lg:flex' : 'lg:hidden'} flex-col sticky top-0 h-screen z-50 transition-all duration-300`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-brand rounded-full shadow-[0_0_10px_rgba(13,127,242,0.5)]" />
              <h1 className="text-xl font-bold tracking-tight text-white">TPM Receipt Guard (Beta)</h1>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'history', icon: History, label: 'History' },
                { id: 'settings', icon: Settings, label: 'Settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === item.id
                    ? 'bg-brand/10 text-brand font-medium'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-slate-800/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800/50 shadow-2xl z-50 flex flex-col pt-safe lg:hidden"
              >
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-brand rounded-full shadow-[0_0_10px_rgba(13,127,242,0.5)]" />
                      <h1 className="text-xl font-bold tracking-tight text-white line-clamp-1">Receipt Guard</h1>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1 -mr-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
                    >
                      <XIcon size={20} />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {[
                      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                      { id: 'history', icon: History, label: 'History' },
                      { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === item.id
                          ? 'bg-brand/10 text-brand font-medium'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                          }`}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6 border-t border-slate-800/50 pb-safe">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Top Up Modal Layer */}
        <AnimatePresence>
          {isTopUpModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-effect rounded-2xl w-full max-w-md p-8 shadow-2xl border border-brand/30 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-emerald-400" />
                <button
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                  disabled={isCheckoutLoading}
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2">
                    <Activity size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Get More Credits</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Power up your receipt OCR and document analysis with more credits.
                  </p>
                </div>

                {/* Pricing Cards */}
                <div className="space-y-4 mb-8">
                  <div className="border border-brand/40 bg-brand/10 rounded-xl p-5 flex items-center justify-between relative overflow-hidden group hover:border-brand/60 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-start gap-1">
                      <span className="text-white font-bold text-2xl">130 Credits</span>
                      <span className="text-brand text-xs font-semibold bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full w-fit">One-time purchase</span>
                    </div>
                    <div className="relative z-10 text-right flex flex-col items-end">
                      <span className="text-3xl font-black text-white">$10</span>
                      <span className="text-brand/60 text-xs font-medium tracking-wide">USD</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-3">
                  <button
                    disabled={true}
                    className={`px-8 py-3 w-full bg-gradient-to-r from-brand to-blue-600/50 text-white/70 font-semibold rounded-lg shadow-none cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    <Activity size={18} />
                    Checkout via Stripe
                  </button>
                  <span className="text-brand text-sm font-medium animate-pulse tracking-wide">
                    ✨ Coming soon ✨
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 pb-safe">
          {/* Topbar */}
          <header className="h-16 border-b border-slate-800/50 glass-effect flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
                  } else {
                    setIsMobileMenuOpen(true);
                  }
                }}
                className="p-1.5 -ml-1.5 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-brand/50 rounded-lg"
              >
                <Menu size={22} />
              </button>
              <div className={`flex items-center gap-3 ${isDesktopSidebarOpen ? 'lg:hidden' : ''}`}>
                <div className="w-1.5 h-5 bg-brand rounded-full hidden sm:block" />
                <h1 className="text-base font-bold text-white tracking-tight truncate sm:max-w-none max-w-[140px]">
                  <span className="hidden sm:inline">TPM Receipt Guard (Beta)</span>
                  <span className="sm:hidden">Receipt Guard</span>
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs font-mono">
              <Activity size={14} className="text-brand" />
              <span>TPM Receipt Guard v1.3.0</span>
            </div>

            <div className="flex items-center gap-6">
              {/* Credit Balance Badge & Top Up */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTopUpModalOpen(true)}
                  disabled={isCheckoutLoading}
                  className="px-3 py-1 bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand rounded-full text-xs font-semibold transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(13,127,242,0.15)] hover:shadow-[0_0_15px_rgba(13,127,242,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckoutLoading ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
                  Top Up
                </button>

                {creditsBalance !== null && (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 rounded-full px-3 py-1">
                    <span className="text-sm">🪙</span>
                    <span className="text-xs font-semibold text-amber-400">{creditsBalance}</span>
                    <span className="text-[10px] text-amber-400/70 hidden sm:inline">Credits</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-right">
                <div className="hidden sm:block">
                  <div className="text-xs font-medium text-white">{userName}</div>
                  <div className="text-[10px] text-slate-500">{userEmail}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand">
                  <User size={16} />
                </div>
              </div>

            </div>
          </header>

          {activeTab === 'dashboard' && (
            <div className="p-8 space-y-8">
              {/* Status & Header Info */}
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-white">Processing Hub</h2>
                  <p className="text-slate-400 text-sm">Drag and drop receipts below to extract data instantly.</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Processing Summary Widget */}
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <div className="flex flex-col items-center px-3 border-r border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Success</span>
                      <span className="text-sm font-bold text-green-400">{successCount}</span>
                    </div>
                    <div className="flex flex-col items-center px-3 border-r border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Review</span>
                      <span className="text-sm font-bold text-amber-400">{reviewCount}</span>
                    </div>
                    <div className="flex flex-col items-center px-3">
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Failed</span>
                      <span className="text-sm font-bold text-red-400">{failedCount}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-brand font-mono uppercase tracking-[0.2em] mb-1">System Status</div>
                    <div className="flex items-center justify-end gap-2 text-green-400 text-sm font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Operational
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Ingestion Card */}
              <section>
                <div className="glass-effect rounded-xl p-8 border-l-4 border-brand shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Database size={120} />
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    {/* Title & Description */}
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-white flex items-center justify-center gap-2">
                        <Upload className="text-brand" size={20} />
                        Data Ingestion
                      </h3>
                      <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                        Batch upload supported: <span className="text-white font-medium">PDF, PNG, JPEG</span>. Max file size: 50MB.
                      </p>
                    </div>

                    {/* Upload Box – centered */}
                    <div className="w-full max-w-[500px]">
                      {selectedFiles.length === 0 ? (
                        <label
                          className={`
                          relative flex flex-col items-center justify-center w-full h-full min-h-[140px]
                          border-2 border-dashed rounded-xl cursor-pointer
                          transition-all duration-300 overflow-hidden
                          ${isHoveringUpload ? 'border-brand bg-brand/10' : 'border-slate-700 bg-slate-800/30'}
                        `}
                          onMouseEnter={() => setIsHoveringUpload(true)}
                          onMouseLeave={() => setIsHoveringUpload(false)}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className="flex flex-col items-center justify-center py-6">
                            <motion.div
                              animate={isHoveringUpload ? { y: -5 } : { y: 0 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <CloudUpload className={`w-10 h-10 mb-2 ${isHoveringUpload ? 'text-brand' : 'text-slate-500'}`} />
                            </motion.div>
                            <p className="text-sm text-slate-300">
                              <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">or drag and drop (multi-file supported)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.png,.jpeg,.jpg"
                            multiple
                          />
                        </label>
                      ) : (
                        <div
                          className={`relative h-full flex flex-col gap-2 p-4 border-2 rounded-xl max-h-[200px] overflow-y-auto custom-scrollbar transition-all ${isHoveringUpload ? 'border-brand bg-brand/10' : 'border-brand/30 bg-brand/5'}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-brand font-mono">{selectedFiles.length} file(s) selected</span>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-brand hover:text-brand/80 cursor-pointer transition-colors">
                                + Add more
                                <input
                                  type="file"
                                  className="hidden"
                                  ref={addMoreFileInputRef}
                                  onChange={handleAddMoreFiles}
                                  accept=".pdf,.png,.jpeg,.jpg"
                                  multiple
                                />
                              </label>
                              <span className="text-slate-700">|</span>
                              <button
                                onClick={handleClearFiles}
                                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                              >
                                Clear all
                              </button>
                            </div>
                          </div>
                          {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-lg">
                              <div className="w-8 h-8 bg-brand/20 rounded flex items-center justify-center text-brand flex-shrink-0">
                                <FileText size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{file.name}</p>
                                <p className="text-[10px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(idx)}
                                className="p-1 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <p className="text-[10px] text-slate-600 text-center mt-1">Drop more files here to add to batch</p>
                          {uploading && (
                            <div className="absolute inset-0 bg-darkbg/60 flex items-center justify-center rounded-xl">
                              <Loader2 className="text-brand animate-spin" size={24} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Execute Analysis Button */}
                    <AnimatePresence>
                      {selectedFiles.length > 0 && !uploading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <button
                              onClick={handleExecuteAnalysis}
                              disabled={analyzing}
                              className={`
                                relative px-8 py-3 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(13,127,242,0.4)] flex items-center gap-3 tracking-widest text-xs transition-all
                                ${analyzing ? 'bg-slate-700 cursor-not-allowed' : 'bg-brand animate-glow'}
                              `}
                            >
                              {analyzing ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  ANALYZING...
                                </>
                              ) : (
                                <>
                                  <Activity size={16} />
                                  EXECUTE ANALYSIS
                                </>
                              )}
                            </button>
                            <p className="text-[10px] text-slate-500/80 max-w-[300px] text-center leading-tight">
                              By clicking Execute, you acknowledge our <strong className="text-amber-500/70 font-semibold">Beta Privacy & Liability Terms</strong>. We are not liable for any financial loss or damages resulting from AI extraction errors.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>

              {/* Preview Table Section */}
              <section className="space-y-6">

                {/* AI Accuracy Disclaimer Banner */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-4 items-start shadow-inner">
                  <div className="mt-0.5">
                    <AlertCircle className="text-amber-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-amber-500 font-medium text-sm mb-2">
                      Beta Privacy & AI Liability Notice
                    </h4>
                    <ul className="text-amber-400/80 text-xs leading-relaxed space-y-1.5 list-disc list-inside">
                      <li>We <strong>DO NOT</strong> store your files; data is processed and immediately discarded.</li>
                      <li>Refreshing the page will clear your session history permanently.</li>
                      <li>Data is automatically extracted by the AI and may contain inaccuracies due to complex handwriting or poor image quality.</li>
                      <li className="text-amber-500 font-semibold list-none -ml-4 pl-4 before:content-[''] border-l-2 border-amber-500 mt-2 p-1 bg-amber-500/10 rounded-r">
                        Please independently verify key numbers (e.g. Total Amount) and use the inline editing feature to correct any errors before exporting.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-slate-300 whitespace-nowrap">
                      Preview (table view)
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-500 rounded border border-slate-700 font-mono">
                      READ-ONLY
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand transition-all w-full lg:w-64"
                      />
                    </div>
                    <div className="relative flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200">
                      <Filter size={16} className="text-slate-500" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent border-none outline-none cursor-pointer focus:ring-0 appearance-none pr-4"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                        <option value="Duplicate">Duplicate</option>
                        <option value="Needs Review">Needs Review</option>
                      </select>
                    </div>
                    <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-lg text-brand text-sm hover:bg-brand/20 transition-all font-medium"
                    >
                      <Download size={16} />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Bulk Actions Bar */}
                <AnimatePresence>
                  {selectedRows.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-brand/10 border border-brand/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-brand font-medium">
                          <CheckCircle2 size={18} />
                          {selectedRows.length} items selected
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleDeleteSelected}
                            className="px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded transition-all flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                          <button
                            onClick={() => setSelectedRows([])}
                            className="p-1 text-slate-500 hover:text-slate-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="glass-effect rounded-xl border border-slate-800/50 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-brand/20">
                          <th className="px-6 py-4 w-12 border-r border-slate-800/30">
                            <button
                              onClick={toggleAllSelection}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${filteredData.filter(r => !r.id.startsWith('job-')).length > 0 && selectedRows.length === filteredData.filter(r => !r.id.startsWith('job-')).length
                                ? 'bg-brand border-brand text-white'
                                : 'border-slate-700 hover:border-brand'
                                }`}
                            >
                              {filteredData.filter(r => !r.id.startsWith('job-')).length > 0 && selectedRows.length === filteredData.filter(r => !r.id.startsWith('job-')).length && <Check size={12} />}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest border-r border-slate-800/30">Seq No.</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest border-r border-slate-800/30">Merchant</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest border-r border-slate-800/30">Date</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest border-r border-slate-800/30">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest border-r border-slate-800/30">Category</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest border-r border-slate-800/30">Summary</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest border-r border-slate-800/30">Amount</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest border-r border-slate-800/30">Payment Method</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest border-r border-slate-800/30">Confidence</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-brand uppercase tracking-widest w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {filteredData.filter(row => row.id !== `job-${Date.now()}`).length > 0 && filteredData.map((row) => (
                          <tr
                            key={row.id}
                            className={`group border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors
                            ${selectedRows.includes(row.id) ? 'bg-brand/5' : ''}
                            ${row.isDuplicate ? 'opacity-50 grayscale' : ''}
                          `}
                          >
                            <td className="px-6 py-4 border-r border-slate-800/20">
                              <button
                                onClick={() => toggleRowSelection(row.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedRows.includes(row.id)
                                  ? 'bg-brand border-brand text-white'
                                  : 'border-slate-700 hover:border-brand'
                                  }`}
                              >
                                {selectedRows.includes(row.id) && <Check size={12} />}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-slate-400 border-r border-slate-800/20">{row.seqNo}</td>
                            <td className="px-6 py-4 text-sm font-medium text-white border-r border-slate-800/20">
                              {editingRowId === row.id ? (
                                <input
                                  type="text"
                                  value={editFormData.merchantName || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, merchantName: e.target.value })}
                                  className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 flex-1 w-full min-w-[80px]"
                                />
                              ) : (
                                row.merchantName
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-300 border-r border-slate-800/20">
                              {editingRowId === row.id ? (
                                <input
                                  type="text"
                                  value={editFormData.date || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                  className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 w-full min-w-[80px]"
                                />
                              ) : (
                                row.date
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm border-r border-slate-800/20">
                              <div className="flex flex-col gap-1.5 min-w-[120px]">
                                <div className="flex items-center gap-2">
                                  {row.status === 'Success' && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                  {row.status === 'Processing' && <Loader2 size={12} className="text-brand animate-spin" />}
                                  {row.status === 'Needs Review' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                  {row.status === 'Failed' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                  {row.status === 'Duplicate' && <AlertCircle size={12} className="text-slate-400" />}
                                  <span className={`text-[10px] font-bold uppercase tracking-wider
                                  ${row.status === 'Success' ? 'text-green-400' : ''}
                                  ${row.status === 'Processing' ? 'text-brand' : ''}
                                  ${row.status === 'Needs Review' ? 'text-amber-400' : ''}
                                  ${row.status === 'Failed' ? 'text-red-400' : ''}
                                  ${row.status === 'Duplicate' ? 'text-slate-400' : ''}
                                `}>
                                    {row.status}
                                  </span>
                                </div>
                                {row.status === 'Processing' && row.progress != null && (
                                  <div className="space-y-1">
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${row.progress}%` }}
                                        className="h-full bg-brand"
                                      />
                                    </div>
                                    {row.statusMessage && (
                                      <p className="text-[9px] text-slate-500 truncate max-w-[160px]">{row.statusMessage}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm border-r border-slate-800/20">
                              {editingRowId === row.id ? (
                                <input
                                  type="text"
                                  value={editFormData.category || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                  className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 w-full min-w-[80px]"
                                />
                              ) : (
                                <span className={`
                                px-2 py-1 rounded-md text-[10px] font-medium border
                                ${row.category === 'Infrastructure' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                                ${row.category === 'Marketing' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                                ${row.category === 'Utilities' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                                ${row.category === 'Meals & Entertainment' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                                ${!['Infrastructure', 'Marketing', 'Utilities', 'Meals & Entertainment'].includes(row.category) && row.category ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : ''}
                              `}>
                                  {row.category || '—'}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-300 italic border-r border-slate-800/20">
                              {row.isDuplicate ? (
                                <span className="text-red-400 flex items-center gap-1">
                                  <AlertCircle size={12} />
                                  Duplicate of #{row.duplicateOf}
                                </span>
                              ) : editingRowId === row.id ? (
                                <input
                                  type="text"
                                  value={editFormData.summary || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
                                  className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 w-full min-w-[100px]"
                                />
                              ) : (
                                row.summary
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-white border-r border-slate-800/20">
                              {editingRowId === row.id ? (
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    value={editFormData.currency || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                                    className="bg-slate-800 text-white border border-slate-600 rounded px-1 py-1 w-10 text-xs"
                                  />
                                  <input
                                    type="number"
                                    value={editFormData.totalAmount || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, totalAmount: e.target.value })}
                                    className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 w-16"
                                  />
                                </div>
                              ) : (
                                <>
                                  {row.currency && <span className="text-[10px] text-slate-500 mr-1">{row.currency}</span>}
                                  {row.totalAmount}
                                </>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400 border-r border-slate-800/20">
                              {editingRowId === row.id ? (
                                <input
                                  type="text"
                                  value={editFormData.paymentMethod || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, paymentMethod: e.target.value })}
                                  className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 w-full min-w-[80px]"
                                />
                              ) : (
                                row.paymentMethod
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-center border-r border-slate-800/20">
                              {row.confidenceScore != null ? (
                                <span className={`
                                px-2 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1
                                ${row.confidenceScore >= 90 ? 'text-green-400 bg-green-400/10' : ''}
                                ${row.confidenceScore >= 70 && row.confidenceScore < 90 ? 'text-amber-400 bg-amber-400/10' : ''}
                                ${row.confidenceScore < 70 ? 'text-red-400 bg-red-400/10' : ''}
                              `}>
                                  {row.confidenceScore >= 90 ? '✅ High' : row.confidenceScore >= 70 ? '⚠️ Medium' : '❌ Low'}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {editingRowId === row.id ? (
                                <div className="flex items-center justify-start gap-1">
                                  <button onClick={handleSaveEdit} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded transition-all" title="Save">
                                    <Save size={14} />
                                  </button>
                                  <button onClick={handleCancelEdit} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-all" title="Cancel">
                                    <XIcon size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditClick(row)}
                                  className="p-1.5 text-slate-400 hover:text-brand hover:bg-brand/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {/* Empty State */}
                        <tr className="h-48 bg-slate-900/20">
                          <td colSpan={10} className="text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-600">
                                <FileText size={24} />
                              </div>
                              <p className="text-slate-300 font-medium text-sm">
                                {tableData.length === 0 ? 'No records yet' : filteredData.length === 0 ? 'No records match search/filter' : 'Waiting for further ingestion...'}
                              </p>
                              <p className="text-slate-500 text-xs max-w-xs mx-auto">
                                {tableData.length === 0
                                  ? 'Upload receipt files above and click "Execute Analysis" to start.'
                                  : filteredData.length === 0 ? 'Try adjusting your search query or status filter.'
                                    : 'New records will appear here automatically as they are processed by the engine.'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* History Tab MVP Placeholder */}
          {activeTab === 'history' && (
            <div className="p-12 flex flex-col items-center justify-center min-h-[80vh] text-center">
              <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center mb-8 relative">
                <History className="text-brand absolute z-10" size={48} />
                <div className="absolute inset-0 border border-brand/30 rounded-full animate-ping opacity-20" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">History MVP</h2>
              <div className="inline-block px-4 py-1.5 bg-brand/20 text-brand border border-brand/30 rounded-full text-xs font-mono uppercase tracking-widest mb-8">
                Under Development • Coming Soon
              </div>

              <p className="text-slate-400 max-w-lg mb-12 leading-relaxed">
                We are currently building out the persistent data layer to save all your extracted receipts permanently.
              </p>

              <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
                <div className="glass-effect p-6 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center mb-4">
                    <Database size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Persistent Database</h3>
                  <p className="text-sm text-slate-500">All successfully processed receipts will be stored in a PostgreSQL database, so you never lose track of an expense.</p>
                </div>
                <div className="glass-effect p-6 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center mb-4">
                    <LineChart size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h3>
                  <p className="text-sm text-slate-500">Visualize monthly spending trends, category breakdowns, and total expenses natively within the History tab.</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab MVP Placeholder */}
          {activeTab === 'settings' && (
            <div className="p-12 flex flex-col items-center justify-center min-h-[80vh] text-center">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-8">
                <Settings className="text-slate-400" size={48} />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">Application Settings</h2>
              <div className="inline-block px-4 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-xs font-mono uppercase tracking-widest mb-8">
                Under Development • Coming Soon
              </div>

              <p className="text-slate-400 max-w-lg mb-12 leading-relaxed">
                Tailor the AI Receipt Reader to match your exact accounting workflows and business logic.
              </p>

              <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
                <div className="glass-effect p-6 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-brand/40 transition-colors">
                  <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center mb-4 relative z-10">
                    <Tags size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 relative z-10">Custom Categories</h3>
                  <p className="text-sm text-slate-500 relative z-10">Define your own custom AI categorization options (e.g. "Ride Sharing", "Software Subs").</p>
                </div>
                <div className="glass-effect p-6 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-4 relative z-10">
                    <Workflow size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 relative z-10">Auto-Export Workflows</h3>
                  <p className="text-sm text-slate-500 relative z-10">Connect your Google account to automatically push approved receipts directly into a Google Sheet.</p>
                </div>
              </div>
            </div>
          )}
          {/* Footer */}
          <footer className="mt-auto pt-12 pb-8 px-8 border-t border-slate-800/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-slate-600 text-[10px] tracking-widest font-mono">
              </div>
              <div className="flex gap-6">
                <div className="text-slate-500 text-xs">
                  &copy; {new Date().getFullYear()} TPM Tech Studio @ Edmond Chan. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </main>

        {/* Toast Notifications */}
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className={`
                flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border glass-effect min-w-[280px]
                ${toast.type === 'success' ? 'border-green-500/30 text-green-400' : ''}
                ${toast.type === 'error' ? 'border-red-500/30 text-red-400' : ''}
                ${toast.type === 'info' ? 'border-brand/30 text-brand' : ''}
              `}
              >
                {toast.type === 'success' && <CheckCircle2 size={18} />}
                {toast.type === 'error' && <AlertCircle size={18} />}
                {toast.type === 'info' && <Activity size={18} />}
                <span className="text-sm font-medium flex-1">{toast.message}</span>
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div >
    </div >
  );
}
