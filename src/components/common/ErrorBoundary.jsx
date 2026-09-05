import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('active_exam');
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#060c1a',
          color: '#f1f5f9',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            padding: '28px 24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontSize: '42px', marginBottom: '14px' }}>⚡</div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', color: '#fff' }}>
              UPSC/BPSC Mains AI
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              एक अस्थायी स्क्रीन लोड त्रुटि आई है। कृपया पेज रीलोड करें।
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '12px 22px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                रीलोड करें (Reload)
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '14px',
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                होम पेज (Home)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
