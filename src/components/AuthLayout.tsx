import React from 'react';
import { Shield, Lock, Activity, FileCheck2, BarChart2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top left, #0d1e38 0%, #07101f 60%, #040812 100%)',
      position: 'relative',
      overflowX: 'hidden',
      padding: '24px 16px',
      color: 'var(--text-primary)',
    }}>
      {/* Background Ambient Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74, 143, 217, 0.12) 0%, rgba(74, 143, 217, 0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '15%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52, 199, 123, 0.08) 0%, rgba(52, 199, 123, 0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Main Container */}
      <div className="auth-layout-container" style={{
        width: '100%',
        maxWidth: 1100,
        display: 'grid',
        gridTemplateColumns: '1fr 1.1fr',
        gap: 40,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* ── Left Side: Enterprise Branding Panel (Desktop) ─────────────── */}
        <div className="auth-branding-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '24px 28px',
        }}>
          {/* Logo Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(74, 143, 217, 0.9) 0%, rgba(30, 80, 160, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(74, 143, 217, 0.35)',
            }}>
              <Shield size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                lineHeight: 1.1,
              }}>
                PharmaGuard AI
              </div>
              <div style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-accent)',
                marginTop: 3,
              }}>
                Pharmaceutical Safety Intelligence
              </div>
            </div>
          </div>

          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.3,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: 14,
          }}>
            AI-assisted pharmaceutical safety and regulatory intelligence.
          </h1>

          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: 32,
            maxWidth: 440,
          }}>
            Analyze adverse-event data, identify statistical disproportionality signals, and evaluate Common Technical Document (CTD) submission readiness.
          </p>

          {/* Feature Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
            {[
              {
                icon: <Activity size={16} color="var(--text-accent)" />,
                title: 'Safety Signal Detection',
                desc: 'Continuous disproportionality evaluation with ROR and PRR metrics.',
              },
              {
                icon: <FileCheck2 size={16} color="var(--success)" />,
                title: 'Regulatory Submission Checking',
                desc: 'Automated ICH M4 CTD dossier structure and gap validation.',
              },
              {
                icon: <BarChart2 size={16} color="var(--info)" />,
                title: 'AI-Assisted Reports',
                desc: 'Structured 7-section clinical evaluation reports with sign-off workflows.',
              },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Banner */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--glass-border)',
            fontSize: 11.5,
            color: 'var(--text-tertiary)',
            width: 'fit-content',
          }}>
            <Lock size={13} style={{ color: 'var(--text-secondary)' }} />
            <span>Client-side isolated workspace · Zero external data transmission</span>
          </div>
        </div>

        {/* ── Right Side: Authentication Glass Card & Security Footer ──── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* Mobile-only Branding Header */}
          <div className="auth-mobile-header" style={{
            display: 'none',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            marginBottom: 20,
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(74, 143, 217, 0.9) 0%, rgba(30, 80, 160, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}>
              <Shield size={22} color="#ffffff" />
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#ffffff' }}>
              PharmaGuard AI
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-accent)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              Pharmaceutical Safety Intelligence
            </div>
          </div>

          {/* Form Children (The Glass Card) */}
          <div style={{ width: '100%', maxWidth: 480 }}>
            {children}
          </div>

          {/* Security & Regulatory UX Footer */}
          <div style={{
            marginTop: 20,
            fontSize: 11.5,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            lineHeight: 1.55,
            maxWidth: 460,
            padding: '0 8px',
          }}>
            Your data should be handled securely and according to your organization&apos;s privacy and regulatory requirements.
          </div>
        </div>
      </div>

      {/* Responsive Styles via Inline Style Tag */}
      <style>{`
        @media (max-width: 900px) {
          .auth-layout-container {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .auth-branding-panel {
            display: none !important;
          }
          .auth-mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
