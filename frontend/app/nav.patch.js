const fs = require('fs');

let code = fs.readFileSync('/mnt/c/code/VerticalScout/frontend/app/page.tsx', 'utf8');

// Apply desktop-nav-links class to the nav links container
code = code.replace(
  '<div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 28px)", flexWrap: "wrap", justifyContent: "flex-end" }}>',
  '<div className="desktop-nav-links" style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 28px)", flexWrap: "wrap", justifyContent: "flex-end" }}>'
);

// Apply hero-panel class to the left moss panel
code = code.replace(
  '<div style={{ background: T.moss, padding: "clamp(3rem, 5vw, 5rem) clamp(1.5rem, 5vw, 3.5rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>',
  '<div className="hero-panel" style={{ background: T.moss, padding: "clamp(3rem, 5vw, 5rem) clamp(1.5rem, 5vw, 3.5rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>'
);

fs.writeFileSync('/mnt/c/code/VerticalScout/frontend/app/page.tsx', code);
console.log('page.tsx classes patched');
