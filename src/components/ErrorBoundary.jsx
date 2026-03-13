import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null, info: null }; 
  }
  
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }
  
  componentDidCatch(error, info) { 
    this.setState({ info });
    console.error("JSukoon Error:", error, info); 
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0a0a0a", padding:32, textAlign:"center" }}>
          <span style={{ fontSize:48, marginBottom:20 }}>🌿</span>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:"#e0e0e0", fontWeight:300, marginBottom:12 }}>
            Something went quiet.
          </p>
          
          <button onClick={() => { this.setState({ hasError:false, error:null }); window.location.reload(); }}
            style={{ background:`#88888820`, border:`1px solid #88888840`, color:"#aaaaaa", fontSize:14, padding:"12px 28px", borderRadius:99, marginBottom: 24, cursor:"pointer" }}>
            Return to Sanctuary
          </button>

          {/* 🚨 X-RAY VISION: This box will print the exact bug! 🚨 */}
          <div style={{ background: "#1a0505", border: "1px solid #ff4444", padding: 16, borderRadius: 12, maxWidth: "100%", width: "100%", overflow: "auto", textAlign: "left" }}>
            <p style={{ color: "#ff8888", fontSize: 13, fontFamily: "monospace", margin: 0, fontWeight: "bold" }}>
              {this.state.error?.toString()}
            </p>
            <p style={{ color: "#ff8888", fontSize: 10, fontFamily: "monospace", margin: "8px 0 0", opacity: 0.7, whiteSpace: "pre-wrap" }}>
              {this.state.info?.componentStack}
            </p>
          </div>
          
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;