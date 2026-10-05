/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart3,
  LayoutDashboard,
  Cloud,
  Users,
  User,
  Building2,
  Megaphone,
  Code2,
  Menu,
  X,
  Globe,
  UploadCloud,
  Bot,
  FileSpreadsheet,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../authClient';

const IS_STRIPE_ENABLED = import.meta.env.VITE_ENABLE_STRIPE === 'true' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname.includes('dev');

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [language, setLanguage] = React.useState<'en' | 'zh'>('en');
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-darkbg text-slate-200 font-sans selection:bg-brand selection:text-white relative overflow-hidden">
      {/* Ambient Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[30%] bg-brand-400/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#0a0c10]/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/receipt_guard_logo.png" alt="Receipt Guard Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-brand-500/20 object-cover" />
              <span className="font-bold text-xl tracking-tight">Receipt Guard</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Features' : '特色功能'}</a>
              <a href="#use-cases" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Mission' : '使命'}</a>
              <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{language === 'en' ? 'Pricing' : '收費'}</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setLanguage(lang => lang === 'en' ? 'zh' : 'en')}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-2"
              >
                <Globe className="w-4 h-4" />
                {language === 'en' ? '中文' : 'EN'}
              </button>
              <div className="w-px h-4 bg-white/20"></div>
              {session ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-brand text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {language === 'en' ? 'Back to Dashboard' : '返回主介面'}
                  </button>

                  <div className="hidden lg:flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-brand">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-300 max-w-[120px] truncate">
                      {session.user.user_metadata?.full_name || session.user.email?.split('@')[0]}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 px-2"
                    title={language === 'en' ? 'Sign Out' : '登出'}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">{language === 'en' ? 'Sign Out' : '登出'}</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    {language === 'en' ? 'Log in' : '登入'}
                  </button>
                  <button
                    onClick={() => navigate('/auth')}
                    className="bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
                  >
                    {language === 'en' ? 'Start Free' : '免費開始'}
                  </button>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-darkbg border-b border-white/10 px-4 pt-2 pb-4 space-y-1">
            <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5">{language === 'en' ? 'Features' : '特色功能'}</a>
            <a href="#use-cases" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5">{language === 'en' ? 'Mission' : '使命'}</a>
            <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5">{language === 'en' ? 'Pricing' : '收費'}</a>
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => { setLanguage(lang => lang === 'en' ? 'zh' : 'en'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-base font-medium text-slate-400 hover:text-white bg-white/5 rounded-lg"
              >
                <Globe className="w-5 h-5" />
                {language === 'en' ? '切換至中文' : 'Switch to English'}
              </button>

              {session ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {session.user.user_metadata?.full_name || 'User'}
                      </span>
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full bg-brand text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-brand-600 flex items-center justify-center gap-2 mt-2"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {language === 'en' ? 'Back to Dashboard' : '返回主介面'}
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center px-4 py-3 text-base font-medium text-slate-400 hover:text-red-400 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    {language === 'en' ? 'Sign Out' : '登出'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/auth');
                    }}
                    className="w-full text-center px-4 py-2 text-base font-medium text-slate-400 hover:text-white"
                  >
                    {language === 'en' ? 'Log in' : '登入'}
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/auth');
                    }}
                    className="w-full bg-brand text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-brand-600"
                  >
                    {language === 'en' ? 'Start Free' : '免費開始'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-400 to-purple-400 blur-[100px] rounded-full mix-blend-multiply"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">


            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-5xl mx-auto leading-[1.2]"
            >
              {language === 'en' ? (
                <>Stop Typing. Start Scaling. <br />
                  <span className="text-gradient">Eliminate Receipt Admin with AI.</span></>
              ) : (
                <>告別人手輸入，專注業務擴張。<br />
                  <span className="text-gradient">AI 助你秒速處理收據雜務。</span></>
              )}
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-lg md:text-xl font-medium text-slate-400 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              {language === 'en' ? (
                "Turn crumpled receipts and faded invoices into clean, actionable data in 3 seconds. We're currently in Open Beta—help us build the ultimate tool for lean teams."
              ) : (
                "將皺巴巴的收據與模糊的發票，在 3 秒內轉化為清晰的數據。太平門科技工作室 目前處於 Open Beta (公開測試) 階段 —— 誠邀你與我們一同打造最適合精實團隊的報銷工具。"
              )}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium text-slate-400"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> {language === 'en' ? 'No coding required' : '無需編碼'}</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> {language === 'en' ? 'Setup in minutes' : '數分鐘內完成設置'}</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> {language === 'en' ? 'Syncs with your tools' : '與你的工具同步'}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col items-center justify-center gap-3"
            >
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate(session ? '/dashboard' : '/auth')}
                  className="w-full sm:w-auto px-8 py-4 bg-brand text-white rounded-full font-medium text-lg hover:bg-brand-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1"
                >
                  <span>
                    {session
                      ? (language === 'en' ? 'Enter System' : '進入系統')
                      : (language === 'en' ? 'Join the Free Beta (Get 20 Credits)' : '立即加入免費 Beta 版 (送 20 個積分)')}
                  </span>
                </button>
              </div>
              <p className="text-sm text-slate-400 font-medium mt-2 max-w-2xl">
                {language === 'en' ? 'Zero data retention (For existing version) • Your feedback shapes our future' : '零數據殘留 (限目前版本) • 你的意見將決定產品走向'}
              </p>
            </motion.div>

            {/* Dashboard Mockup Removed */}

            {/* Logo Strip Removed */}
          </div>
        </section>

        {/* 2. Features Section */}
        <section id="features" className="py-24 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                {language === 'en' ? 'Manual data entry is pure Muda (Waste).' : '人手輸入數據，是徹頭徹尾的「無駄」(Muda / 浪費)。'}
              </h2>
              <p className="text-lg text-slate-400 mb-4">
                {language === 'en' ? 'Typing out expenses is the ultimate productivity killer. Tai Ping Mun cuts out this invisible waste. Snap a photo, upload a PDF, and let our AI agent do the heavy lifting.' : '從辨認模糊的高熱感紙到修正人手輸入錯誤，記錄開支是生產力的頭號殺手。太平門科技工作室 專門為精實團隊掃除這種「隱形成本」。'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-brand-600" />,
                  en_title: "Limitless AI Extraction",
                  zh_title: "極致 AI 辨識",
                  en_description: "Powered by state-of-the-art vision models to extract amounts, dates, and merchants accurately. Blurred text or handwritten notes? No problem.",
                  zh_description: "搭載最先進視覺模型，精準提取金額、日期及商戶名稱。無論是手寫筆記還是歪斜的照片，通通難不倒它。"
                },
                {
                  icon: <Cloud className="w-6 h-6 text-brand-600" />,
                  en_title: "True \"Burn-After-Reading\" Privacy",
                  zh_title: "「閱後即焚」隱私保障",
                  en_description: "Your financial data is yours. Files are permanently deleted right after extraction, and we never train our models on your receipt images.",
                  zh_description: "你的財務數據只屬於你。數據提取完成後，檔案會立即從伺服器中永久刪除，我們絕不儲存你的收據影像。"
                },
                {
                  icon: <BarChart3 className="w-6 h-6 text-brand-600" />,
                  en_title: "Frictionless CSV Exports",
                  zh_title: "無縫 CSV 匯出",
                  en_description: "Export instantly to standardized CSVs ready to drop into Excel or your favorite accounting software—no complex integrations attached.",
                  zh_description: "一鍵匯出格式統一的 CSV 檔案，直接放入 Excel 或你常用的會計軟件，無需任何複雜整合。"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-darkbg p-8 rounded-2xl shadow-soft border border-white/10 hover:shadow-card transition-shadow"
                >
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{language === 'en' ? feature.en_title : feature.zh_title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{language === 'en' ? feature.en_description : feature.zh_description}</p>
                </motion.div>
              ))}
            </div>

            {/* 3 Step Usage Guide */}
            <div className="mt-12 bg-darkbg rounded-3xl border border-white/10 p-8 md:p-12 shadow-card">
              <div className="text-center mb-10">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  {language === 'en' ? 'Three Simple Steps' : '簡單三步，即刻完成'}
                </h3>
                <p className="text-slate-400">
                  {language === 'en' ? 'Skip the complex setup. Extracting data shouldn\'t be harder than snapping a photo.' : '告別繁雜的設定。提取數據應該同影相一樣簡單。'}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 relative text-center">
                {/* Connecting Line for Desktop */}
                <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[3px] bg-white/10 z-0 overflow-hidden rounded-full">
                  <div className="h-full bg-gradient-to-r from-transparent via-brand-400 to-transparent w-1/2 animate-[neon-flow_3s_linear_infinite] shadow-[0_0_10px_#3392f4]"></div>
                </div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center group">
                  <div className="w-20 h-20 rounded-full bg-darkbg border border-white/10 shadow-soft flex items-center justify-center mb-6 group-hover:border-brand-500/50 group-hover:shadow-brand transition-all relative">
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand text-white text-sm flex items-center justify-center font-bold shadow-lg">1</div>
                    <UploadCloud className="w-10 h-10 text-brand-400 group-hover:text-brand transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{language === 'en' ? 'Drag & Drop' : '拖曳上傳'}</h4>
                  <p className="text-sm text-slate-400 max-w-[250px]">
                    {language === 'en' ? 'Upload messy receipts or PDF invoices. No pre-processing or sorting required.' : '直接上傳雜亂無章的收據或 PDF 發票，完全無需事先整理。'}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center group">
                  <div className="w-20 h-20 rounded-full bg-darkbg border border-white/10 shadow-soft flex items-center justify-center mb-6 group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all relative">
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand text-white text-sm flex items-center justify-center font-bold shadow-lg">2</div>
                    <Bot className="w-10 h-10 text-purple-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{language === 'en' ? 'Execute AI' : '一鍵執行 AI'}</h4>
                  <p className="text-sm text-slate-400 max-w-[250px]">
                    {language === 'en' ? 'Our AI analyzes the raw image and intelligently extracts amounts, dates, and vendors instantly.' : 'AI 會即時分析原始圖片，智能且精準地提取金額、日期和商戶名稱。'}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center group">
                  <div className="w-20 h-20 rounded-full bg-darkbg border border-white/10 shadow-soft flex items-center justify-center mb-6 group-hover:border-green-500/50 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all relative">
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand text-white text-sm flex items-center justify-center font-bold shadow-lg">3</div>
                    <FileSpreadsheet className="w-10 h-10 text-green-400 group-hover:text-green-500 transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{language === 'en' ? 'Neat Results' : '完美結果'}</h4>
                  <p className="text-sm text-slate-400 max-w-[250px]">
                    {language === 'en' ? 'Download a perfectly structured CSV file that is ready for accounting or data analysis.' : '即時下載結構完美的 CSV 檔案，隨時可用於會計入帳或數據分析。'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Use Cases Section */}
        <section id="use-cases" className="py-24 bg-darkbg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                  {language === 'en' ? 'Help Us Kill the "Muda" Together.' : '與我們聯手消滅「無駄」。'}
                </h2>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-slate-300 leading-relaxed space-y-4">
                  <p>
                    {language === 'en' ? 'Tai Ping Mun was born out of our own daily frustration with administrative waste. As builders ourselves, we created the tool we wished we had, for people like you who are busy building the future. Your "brutally honest" feedback is our fuel. Found a bug? Need a specific feature? Tell us, and we\'ll ship it.' : '太平門科技工作室 誕生於我們對繁瑣雜務的切膚之痛。身為同樣在拼搏的「過來人」，我們開發了這套理想中的工具，旨在協助每一位專注於創造價值的你。正因處於測試階段，你的「直白反饋」對我們至關重要。有 Bug？想要新功能？儘管開聲，我們為你動工。'}
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <a href="#pricing" className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                    {language === 'en' ? 'Join the Mission' : '加入我們的使命'} <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-card border border-white/10 bg-white/5 aspect-square md:aspect-[4/3]">
                  {/* User Provided Graphic */}
                  <img src="/mission_graphic.png" alt="Mission Graphic" className="absolute inset-0 w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Pricing Section */}
        <section id="pricing" className="py-24 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                {language === 'en' ? 'Simple Pricing' : '簡單明瞭的定價'}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-8">
              {/* Beta */}
              <div className="bg-darkbg rounded-3xl p-8 shadow-soft border border-white/10 flex flex-col transition-all duration-300 hover:bg-white/5 hover:-translate-y-2 hover:border-brand-500/50 hover:shadow-brand">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {language === 'en' ? 'Beta Participant' : 'Beta 測試參與者'}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$0</span>
                </div>
                <p className="text-slate-400 mb-8 font-medium">
                  {language === 'en' ? '20 Free AI Scans' : '20 次免費 AI 掃描'}
                </p>
                <ul className="space-y-4 mb-8 flex-1">
                  {(language === 'en'
                    ? ['Shape the Roadmap', 'Direct Founder Access']
                    : ['參與塑造產品藍圖', '直接與創始人對話']).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full py-3 px-6 rounded-full border border-white/10 font-medium text-white hover:bg-white/5 transition-colors"
                >
                  {language === 'en' ? 'Join the Mission' : '加入使命'}
                </button>
              </div>

              {/* Flexible Top-up */}
              <div className="bg-darkbg rounded-3xl p-8 shadow-soft border border-white/10 flex flex-col relative transition-all duration-300 hover:bg-white/5 hover:-translate-y-2 hover:border-brand-500/50 hover:shadow-brand">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {language === 'en' ? 'Flexible Top-up' : '按需增值 (Top-up)'}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$10</span>
                  <span className="text-slate-500"> USD</span>
                </div>
                <p className="text-slate-500 mb-8 font-medium">
                  {language === 'en' ? '130 Credits (~$0.08/scan)' : '130 個積分 (約 $0.08/次)'}
                </p>
                <ul className="space-y-4 mb-8 flex-1">
                  {(language === 'en'
                    ? ['Credits Never Expire', 'Priority Processing']
                    : ['積分永不過期', '優先處理']).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
                {IS_STRIPE_ENABLED ? (
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full py-3 px-6 rounded-full bg-brand text-white font-medium hover:bg-brand-600 transition-colors shadow-lg shadow-brand/20 active:scale-95"
                  >
                    {language === 'en' ? 'Purchase Credits' : '購買積分'}
                  </button>
                ) : (
                  <button className="w-full py-3 px-6 rounded-full bg-darkbg font-medium text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors cursor-not-allowed">
                    {language === 'en' ? 'Coming Soon' : '即將推出'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section Removed */}

        {/* FAQ Section */}
        <section className="py-24 bg-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Frequently asked questions</h2>
              <p className="text-lg text-slate-400">Everything you need to know about the product and billing.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: language === 'en' ? "Is there a free trial?" : "有提供免費試用嗎？",
                  a: language === 'en' ? "Yes, you can try Tai Ping Mun for free. Every new account starts with 20 complimentary credits to let you experience the full power of our AI." : "有的，你可以免費試用 太平門科技工作室。每個新帳戶開通時都會獲得 20 個免費積分，讓你完整體驗我們 AI 的強大功能。"
                },
                {
                  q: language === 'en' ? "How does billing work?" : "請問收費模式是怎樣的？",
                  a: language === 'en' ? "Currently, we are operating in a free Open Beta. In the future, we will offer a flexible 'top-up credits' system, meaning you only pay for what you actually use. Stay tuned for our official pricing launch." : "目前我們正處於免費公開測試階段。未來我們將推出靈活的「按需增值 (Top-up credits)」模式，這意味著你只需為實際使用的用量付費。敬請期待我們稍後公佈的正式收費方案。"
                },
                {
                  q: language === 'en' ? "How secure is my data?" : "我的數據安全嗎？",
                  a: language === 'en' ? "Your privacy is our top priority. We do not use cloud storage for your data, nor do we permanently save any uploaded files. All images are processed strictly for AI extraction to generate your CSV files and are discarded immediately. We guarantee that your data is never used to train our AI models." : "你的私隱是我們的首要任務。我們沒有使用雲端數據庫庫儲存你的資料，亦絕對不會永久保留任何上傳的檔案。所有上傳的圖片僅用於 AI 數據抽取並即時用作生成 CSV 檔案，完成後即被銷毀。我們保證你的數據永遠不會被用作訓練我們的 AI 模型。"
                }
              ].map((faq, i) => (
                <div key={i} className="bg-darkbg border border-white/10 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Final CTA Section */}
        <section className="py-24 bg-darkbg relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-white/5 rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50"></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                  {language === 'en' ? 'Ready to reclaim your time?' : '準備好奪回你的時間了嗎？'}
                </h2>
                <div className="flex flex-col items-center gap-4 mt-8">
                  <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => navigate('/auth')}
                      className="w-full sm:w-auto px-10 py-4 bg-darkbg text-slate-200 rounded-full font-bold text-lg hover:bg-white/5 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {language === 'en' ? 'Get Started for Free' : '免費開始'}
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-4">
                    {language === 'en' ? 'Built for lean workflows by Tai Ping Mun Tech Studio.' : '為精實團隊而設 — 太平門科技工作室。'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-darkbg border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="font-bold text-xl tracking-tight text-white">{language === 'en' ? 'Tai Ping Mun' : '太平門科技工作室'}</span>
          </div>
          <p className="text-slate-400 max-w-sm mb-12">
            {language === 'en' ? 'Eliminate administrative waste and focus on building what matters.' : '消滅繁瑣雜務，專注創造核心價值。'}
          </p>

          <div className="w-full pt-8 border-t border-white/10">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} {language === 'en' ? 'Tai Ping Mun Tech Studio by Edmond Chan' : '太平門科技工作室 by Edmond Chan'}. {language === 'en' ? 'All rights reserved.' : '版權所有'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
