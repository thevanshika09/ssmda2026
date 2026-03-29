import { useState, useEffect, useRef } from "react";

const API = "http://localhost:3001";

// ─── Inject styles once ───────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #faf7f2;
    --paper: #f4f0e8;
    --warm-white: #fffef9;
    --ink: #1a1410;
    --ink-soft: #3d3530;
    --ink-muted: #7a6e65;
    --ink-faint: #b0a89e;
    --accent: #c8450a;
    --accent-soft: rgba(200,69,10,0.08);
    --accent-mid: rgba(200,69,10,0.18);
    --gold: #d4920a;
    --green: #1a7a4a;
    --green-soft: rgba(26,122,74,0.1);
    --border: rgba(26,20,16,0.1);
    --border-strong: rgba(26,20,16,0.18);
    --shadow-sm: 0 1px 3px rgba(26,20,16,0.06), 0 1px 2px rgba(26,20,16,0.04);
    --shadow-md: 0 4px 16px rgba(26,20,16,0.08), 0 2px 6px rgba(26,20,16,0.05);
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --radius: 14px;
    --radius-sm: 8px;
  }

  body { font-family: var(--font-body); background: var(--cream); color: var(--ink); -webkit-font-smoothing: antialiased; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }

  .login-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; font-family: var(--font-body); }
  @media (max-width: 768px) { .login-page { grid-template-columns: 1fr; } .login-left { display: none !important; } }

  .login-left { background: var(--ink); display: flex; flex-direction: column; justify-content: space-between; padding: 48px; position: relative; overflow: hidden; }
  .login-left-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 20%, rgba(200,69,10,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(212,146,10,0.15) 0%, transparent 50%); pointer-events: none; }
  .login-left-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; }
  .login-brand { position: relative; z-index: 1; animation: fadeUp 0.6s ease both; display: flex; align-items: center; gap: 12px; }
  .login-brand-mark { width: 40px; height: 40px; border-radius: 10px; background: var(--accent); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(200,69,10,0.4); }
  .login-brand-name { color: #fff; font-family: var(--font-display); font-size: 20px; font-weight: 600; }
  .login-hero { position: relative; z-index: 1; animation: fadeUp 0.6s 0.1s ease both; opacity: 0; animation-fill-mode: forwards; }
  .login-hero-quote { color: rgba(255,255,255,0.9); font-family: var(--font-display); font-size: clamp(26px, 3vw, 38px); line-height: 1.35; margin-bottom: 24px; }
  .login-hero-quote em { color: #f4a261; font-style: italic; }
  .login-features { display: flex; flex-direction: column; gap: 12px; }
  .login-feature { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.6); font-size: 14px; }
  .login-feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

  .login-right { background: var(--warm-white); display: flex; align-items: center; justify-content: center; padding: 48px 40px; }
  .login-form-wrap { width: 100%; max-width: 380px; animation: fadeUp 0.5s 0.15s ease both; opacity: 0; animation-fill-mode: forwards; }
  .login-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
  .login-title { font-family: var(--font-display); font-size: 38px; font-weight: 700; color: var(--ink); line-height: 1.2; margin-bottom: 10px; }
  .login-subtitle { color: var(--ink-muted); font-size: 15px; line-height: 1.65; margin-bottom: 40px; }
  .google-btn { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 15px 24px; background: var(--ink); color: white; border: none; border-radius: var(--radius); cursor: pointer; font-family: var(--font-body); font-size: 15px; font-weight: 500; text-decoration: none; box-shadow: 0 4px 20px rgba(26,20,16,0.2); transition: transform 0.15s, box-shadow 0.15s; }
  .google-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(26,20,16,0.25); }
  .google-btn-icon { width: 22px; height: 22px; border-radius: 4px; background: white; display: flex; align-items: center; justify-content: center; }
  .login-divider { display: flex; align-items: center; gap: 16px; margin: 28px 0; color: var(--ink-faint); font-size: 12px; }
  .login-divider::before, .login-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .login-trust { display: flex; flex-direction: column; gap: 10px; }
  .login-trust-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--ink-muted); }
  .trust-icon { width: 28px; height: 28px; border-radius: 6px; background: var(--paper); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }

  .app-shell { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; font-family: var(--font-body); }
  @media (max-width: 900px) { .app-shell { grid-template-columns: 1fr; } .sidebar { display: none !important; } }

  .sidebar { background: var(--ink); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
  .sidebar-top { padding: 28px 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .sidebar-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
  .sidebar-brand-mark { width: 32px; height: 32px; border-radius: 8px; background: var(--accent); display: flex; align-items: center; justify-content: center; }
  .sidebar-brand-name { color: white; font-family: var(--font-display); font-size: 17px; font-weight: 600; }
  .sidebar-user { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.06); }
  .sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); flex-shrink: 0; }
  .sidebar-user-info { flex: 1; min-width: 0; }
  .sidebar-user-name { color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-user-email { color: rgba(255,255,255,0.35); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-nav { padding: 16px 12px; flex: 1; }
  .sidebar-label { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.25); padding: 0 12px; margin-bottom: 8px; }
  .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-sm); cursor: pointer; margin-bottom: 2px; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 400; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; font-family: var(--font-body); }
  .sidebar-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
  .sidebar-item.active { background: rgba(200,69,10,0.2); color: #f4a261; font-weight: 500; }
  .sidebar-item-badge { margin-left: auto; background: var(--accent); color: white; font-size: 10px; font-weight: 600; border-radius: 20px; padding: 2px 7px; }
  .sidebar-bottom { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.06); }
  .sidebar-logout { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-sm); color: rgba(255,255,255,0.35); font-size: 13px; cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; font-family: var(--font-body); }
  .sidebar-logout:hover { color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.04); }

  .main-content { background: var(--cream); min-height: 100vh; overflow-y: auto; }
  .content-header { padding: 40px 48px 0; border-bottom: 1px solid var(--border); }
  @media (max-width: 768px) { .content-header { padding: 24px 20px 0; } .email-list { padding: 20px !important; } .toolbar { padding: 16px 20px 0 !important; } }
  .content-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
  .content-title { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
  .content-subtitle { color: var(--ink-muted); font-size: 14px; margin-bottom: 24px; }
  .content-tabs { display: flex; gap: 0; margin-top: 4px; }
  .content-tab { padding: 12px 20px; font-size: 13px; font-weight: 500; color: var(--ink-muted); border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; display: flex; align-items: center; gap: 8px; font-family: var(--font-body); }
  .content-tab.active { color: var(--ink); border-bottom-color: var(--accent); }
  .content-tab:hover { color: var(--ink); }
  .tab-count { background: var(--paper); color: var(--ink-muted); font-size: 11px; padding: 1px 7px; border-radius: 20px; }
  .content-tab.active .tab-count { background: var(--accent-soft); color: var(--accent); }

  .toolbar { display: flex; align-items: center; justify-content: space-between; padding: 20px 48px 0; gap: 12px; }
  .toolbar-left { display: flex; align-items: center; gap: 10px; }
  .refresh-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--radius-sm); background: var(--warm-white); border: 1px solid var(--border-strong); color: var(--ink-soft); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: var(--font-body); }
  .refresh-btn:hover { background: var(--paper); border-color: var(--ink-muted); }
  .count-label { color: var(--ink-muted); font-size: 13px; }

  .email-list { padding: 24px 48px; display: flex; flex-direction: column; gap: 12px; }

  .email-card { background: var(--warm-white); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s; animation: fadeUp 0.4s ease both; }
  .email-card:hover { box-shadow: var(--shadow-md); border-color: var(--border-strong); transform: translateY(-1px); }
  .email-card-top { padding: 18px 20px 0; }
  .email-card-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 10px; }
  .email-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 16px; font-weight: 700; color: white; }
  .email-meta { flex: 1; min-width: 0; }
  .email-from-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 2px; }
  .email-from { font-weight: 600; font-size: 14px; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .email-date { font-size: 11px; color: var(--ink-faint); flex-shrink: 0; }
  .email-addr { font-size: 12px; color: var(--ink-muted); }
  .email-subject { font-weight: 600; font-size: 15px; color: var(--ink); margin-bottom: 6px; line-height: 1.4; }
  .email-snippet { font-size: 13px; color: var(--ink-muted); line-height: 1.6; margin-bottom: 14px; }

  .summary-box { margin: 0 20px 14px; background: linear-gradient(135deg, #fff8f0, #fff4e6); border: 1px solid rgba(200,69,10,0.2); border-left: 3px solid var(--accent); border-radius: var(--radius-sm); padding: 14px 16px; animation: slideDown 0.3s ease; }
  .summary-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .summary-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
  .summary-text { font-size: 13px; color: var(--ink-soft); line-height: 1.7; }

  .reply-box { margin: 0 20px 14px; background: var(--paper); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); padding: 14px; animation: slideDown 0.25s ease; }
  .reply-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 10px; }
  .reply-textarea { width: 100%; padding: 12px 14px; background: white; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); resize: vertical; font-family: var(--font-body); font-size: 13px; color: var(--ink); line-height: 1.6; outline: none; transition: border-color 0.15s; }
  .reply-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .reply-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 10px; }

  .card-actions { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border); background: var(--paper); }
  .card-actions-spacer { flex: 1; }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; white-space: nowrap; }
  .btn-ai { background: var(--accent-soft); border-color: rgba(200,69,10,0.25); color: var(--accent); }
  .btn-ai:hover { background: var(--accent-mid); border-color: var(--accent); }
  .btn-ai:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn-reply { background: var(--warm-white); border-color: var(--border-strong); color: var(--ink-soft); }
  .btn-reply:hover { background: var(--paper); border-color: var(--ink-muted); }
  .btn-reply.active { background: var(--paper); border-color: var(--ink-muted); }
  .btn-send { background: var(--ink); border-color: var(--ink); color: white; font-weight: 600; }
  .btn-send:hover { background: var(--ink-soft); }
  .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ghost { background: transparent; border-color: var(--border); color: var(--ink-muted); }
  .btn-ghost:hover { border-color: var(--border-strong); color: var(--ink); }
  .sent-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--green); background: var(--green-soft); border: 1px solid rgba(26,122,74,0.2); padding: 7px 14px; border-radius: var(--radius-sm); }

  .skeleton { background: linear-gradient(90deg, var(--paper) 0%, var(--warm-white) 50%, var(--paper) 100%); background-size: 800px 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
  .skeleton-card { background: var(--warm-white); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm); }
  .empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; text-align: center; }
  .empty-icon { width: 64px; height: 64px; border-radius: 16px; background: var(--paper); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 28px; }
  .empty-title { font-family: var(--font-display); font-size: 22px; color: var(--ink); margin-bottom: 8px; }
  .empty-sub { color: var(--ink-muted); font-size: 14px; line-height: 1.6; }
  .error-banner { margin: 20px 48px; padding: 16px 20px; background: #fff5f5; border: 1px solid rgba(200,69,10,0.3); border-left: 3px solid var(--accent); border-radius: var(--radius-sm); color: #9a2000; font-size: 14px; display: flex; align-items: center; gap: 10px; }
  .loading-dots { display: inline-flex; gap: 3px; align-items: center; }
  .loading-dots span { width: 4px; height: 4px; border-radius: 50%; background: currentColor; animation: pulse 1.2s ease infinite; }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
  .av-0 { background: #c8450a; } .av-1 { background: #1a7a4a; } .av-2 { background: #1e5fa8; }
  .av-3 { background: #7c3a8e; } .av-4 { background: #d4920a; } .av-5 { background: #2a8a8a; }
`;

if (!document.getElementById("mailmind-styles")) {
  const el = document.createElement("style");
  el.id = "mailmind-styles";
  el.textContent = css;
  document.head.appendChild(el);
}

const Icon = ({ d, size = 16, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const Icons = {
  mail: ["M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z","m22 6-10 7L2 6"],
  sparkle: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",
  send: ["m22 2-7 20-4-9-9-4Z","M22 2 11 13"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","m16 17 5-5-5-5","M21 12H9"],
  refresh: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5",
  inbox: ["M22 12h-6l-2 3h-4l-2-3H2","M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"],
  check: "M20 6 9 17l-5-5",
};

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-left-grid" />
        <div className="login-brand">
          <div className="login-brand-mark"><Icon d={Icons.mail} size={18} strokeWidth={2} /></div>
          <span className="login-brand-name">MailMind</span>
        </div>
        <div className="login-hero">
          <p className="login-hero-quote">Your inbox,<br />finally <em>under control.</em></p>
          <div className="login-features">
            {["AI-powered email summaries in one click","Reply intelligently without leaving the app","Works with your existing Gmail — no setup"].map((f, i) => (
              <div className="login-feature" key={i}><div className="login-feature-dot" />{f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-eyebrow">Welcome back</div>
          <h1 className="login-title">Sign in to<br />MailMind AI</h1>
          <p className="login-subtitle">Connect your Gmail account and let AI handle the heavy lifting. Your emails stay private.</p>
          <a href={`${API}/auth/google`} className="google-btn">
            <div className="google-btn-icon"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="16" height="16" alt="G" /></div>
            Continue with Google
          </a>
          <div className="login-divider">encrypted & secure</div>
          <div className="login-trust">
            {[{icon:"🔒",text:"OAuth 2.0 — we never store your password"},{icon:"👁️",text:"Read and send on your behalf only"},{icon:"🗑️",text:"Revoke access anytime from Google settings"}].map((t,i)=>(
              <div className="login-trust-item" key={i}><div className="trust-icon">{t.icon}</div>{t.text}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{display:"flex",gap:12,marginBottom:12}}>
        <div className="skeleton" style={{width:40,height:40,borderRadius:"50%",flexShrink:0}} />
        <div style={{flex:1}}>
          <div className="skeleton" style={{height:13,width:"40%",marginBottom:7}} />
          <div className="skeleton" style={{height:11,width:"60%"}} />
        </div>
      </div>
      <div className="skeleton" style={{height:14,width:"80%",marginBottom:8}} />
      <div className="skeleton" style={{height:11,width:"95%",marginBottom:5}} />
      <div className="skeleton" style={{height:11,width:"70%"}} />
    </div>
  );
}

const AVATAR_COLORS = ["av-0","av-1","av-2","av-3","av-4","av-5"];
function getAvatarColor(str) {
  let h = 0;
  for (let c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function EmailCard({ email, index, onSummarize, onReply }) {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const textareaRef = useRef(null);

  const fromName = email.from.replace(/<.*>/, "").trim() || email.from;
  const fromEmail = email.from.match(/<(.+)>/)?.[1] || email.from;
  const initial = fromName.charAt(0).toUpperCase();

  const handleSummarize = async () => {
    setLoadingSummary(true);
    setSummary(await onSummarize(email.id));
    setLoadingSummary(false);
  };

  const toggleReply = () => {
    setShowReply(v => !v);
    if (!showReply) setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    await onReply(email.id, replyText);
    setSendingReply(false); setReplySent(true); setShowReply(false); setReplyText("");
  };

  const formattedDate = (() => {
    try {
      const d = new Date(email.date), now = new Date();
      if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
      return d.toLocaleDateString([],{month:"short",day:"numeric"});
    } catch { return ""; }
  })();

  return (
    <div className="email-card" style={{animationDelay:`${index*60}ms`}}>
      <div className="email-card-top">
        <div className="email-card-header">
          <div className={`email-avatar ${getAvatarColor(fromName)}`}>{initial}</div>
          <div className="email-meta">
            <div className="email-from-row">
              <span className="email-from">{fromName}</span>
              <span className="email-date">{formattedDate}</span>
            </div>
            <span className="email-addr">{fromEmail}</span>
          </div>
        </div>
        <div className="email-subject">{email.subject || "(No subject)"}</div>
        <div className="email-snippet">{email.snippet}</div>
      </div>

      {summary && (
        <div className="summary-box">
          <div className="summary-header"><Icon d={Icons.sparkle} size={13} /><span className="summary-label">AI Summary</span></div>
          <p className="summary-text">{summary}</p>
        </div>
      )}

      {showReply && (
        <div className="reply-box">
          <div className="reply-label">Compose reply to {fromName.split(" ")[0]}</div>
          <textarea ref={textareaRef} className="reply-textarea" placeholder={`Hi ${fromName.split(" ")[0]},\n\n`} value={replyText} onChange={e=>setReplyText(e.target.value)} rows={5} />
          <div className="reply-footer">
            <button className="btn btn-ghost" onClick={()=>setShowReply(false)}>Discard</button>
            <button className="btn btn-send" onClick={handleReply} disabled={sendingReply||!replyText.trim()}>
              <Icon d={Icons.send} size={13} />{sendingReply?"Sending…":"Send Reply"}
            </button>
          </div>
        </div>
      )}

      <div className="card-actions">
        <button className="btn btn-ai" onClick={handleSummarize} disabled={loadingSummary}>
          <Icon d={Icons.sparkle} size={13} />
          {loadingSummary ? <><span>Thinking</span><span className="loading-dots"><span/><span/><span/></span></> : summary ? "Re-summarize" : "Summarize"}
        </button>
        <div className="card-actions-spacer" />
        {replySent
          ? <span className="sent-badge"><Icon d={Icons.check} size={13} />Reply sent</span>
          : <button className={`btn btn-reply${showReply?" active":""}`} onClick={toggleReply}><Icon d={Icons.send} size={13}/>{showReply?"Close":"Reply"}</button>
        }
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{fetchEmails();},[]);

  const fetchEmails = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/api/emails`,{credentials:"include"});
      if (!res.ok) throw new Error();
      setEmails((await res.json()).emails);
    } catch { setError("Couldn't load your inbox. Check your connection and try again."); }
    setLoading(false);
  };

  const handleSummarize = async id => {
    try { const r = await fetch(`${API}/api/emails/${id}/summarize`,{credentials:"include"}); return (await r.json()).summary; }
    catch { return "Couldn't summarize this email."; }
  };

  const handleReply = async (id, replyText) => {
    try { await fetch(`${API}/api/emails/${id}/reply`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({replyText})}); }
    catch { alert("Failed to send reply."); }
  };

  const firstName = user.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark"><Icon d={Icons.mail} size={16} strokeWidth={2} /></div>
            <span className="sidebar-brand-name">MailMind</span>
          </div>
          <div className="sidebar-user">
            <img src={user.picture} width={34} height={34} alt={user.name} className="sidebar-avatar" />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-label">Mailbox</div>
          <button className="sidebar-item active">
            <Icon d={Icons.inbox} size={15} />Inbox
            {emails.length > 0 && <span className="sidebar-item-badge">{emails.length}</span>}
          </button>
          <button className="sidebar-item"><Icon d={Icons.sparkle} size={15} />AI Summaries</button>
          <button className="sidebar-item"><Icon d={Icons.send} size={15} />Sent</button>
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={onLogout}><Icon d={Icons.logout} size={15} />Sign out</button>
        </div>
      </aside>

      <div className="main-content">
        <div className="content-header">
          <div className="content-eyebrow">{greeting}, {firstName}</div>
          <h1 className="content-title">Inbox</h1>
          <p className="content-subtitle">Your unread emails, powered by AI.</p>
          <div className="content-tabs">
            <button className="content-tab active">Unread<span className="tab-count">{loading?"…":emails.length}</span></button>
            <button className="content-tab">All mail</button>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-left">
            <button className="refresh-btn" onClick={fetchEmails}><Icon d={Icons.refresh} size={14} />Refresh</button>
            {!loading && !error && <span className="count-label">{emails.length} email{emails.length!==1?"s":""}</span>}
          </div>
        </div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="email-list">
          {loading && [0,1,2,3].map(i=><SkeletonCard key={i} />)}
          {!loading && !error && emails.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✉️</div>
              <div className="empty-title">All caught up!</div>
              <p className="empty-sub">No unread emails right now.<br/>Check back later or hit Refresh.</p>
            </div>
          )}
          {!loading && emails.map((email,i)=>(
            <EmailCard key={email.id} email={email} index={i} onSummarize={handleSummarize} onReply={handleReply} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(()=>{
    fetch(`${API}/auth/me`,{credentials:"include"}).then(r=>r.json()).then(d=>{if(d.user)setUser(d.user);}).catch(()=>{}).finally(()=>setChecking(false));
  },[]);

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`,{method:"POST",credentials:"include"});
    setUser(null);
  };

  if (checking) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#faf7f2"}}>
      <div style={{width:36,height:36,border:"3px solid rgba(200,69,10,0.2)",borderTop:"3px solid #c8450a",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
    </div>
  );

  return user ? <Dashboard user={user} onLogout={handleLogout} /> : <LoginPage />;
}