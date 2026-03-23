import React from "react";

const s = {
  page: {
    height: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#0a0a0a", padding: 32, textAlign: "center",
  },
  icon: { fontSize: 48, marginBottom: 20 },
  title: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: 24,
    color: "#e0e0e0", fontWeight: 300, marginBottom: 12,
  },
  sub: { fontSize: 14, color: "#888888", marginBottom: 24, lineHeight: 1.6 },
  btn: {
    background: "#88888820", border: "1px solid #88888840",
    color: "#aaaaaa", fontSize: 14, padding: "12px 28px",
    borderRadius: 99, cursor: "pointer",
  },
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div style={s.page}>
          <span style={s.icon}>🌿</span>
          <p style={s.title}>Something went quiet.</p>
          <p style={s.sub}>A moment of stillness before we return.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={s.btn}
          >
            Return to Sanctuary
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
