const fs = require('fs');

let code = fs.readFileSync('/mnt/c/code/VerticalScout/frontend/app/page.tsx', 'utf8');

// 1. Convert the hero from full-bleed to a floating rounded container (like Softvira)
code = code.replace(
  '<section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", minHeight: "calc(100vh - 64px)", overflow: "hidden" }}>',
  '<section style={{ maxWidth: 1320, margin: "24px auto 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", overflow: "hidden", borderRadius: 24, boxShadow: "0 24px 80px rgba(13, 59, 46, 0.08)", background: T.mossLt }}>'
);

// 2. Change the left moss panel to not have its own background, since the container will handle the split or we can keep it split but rounded
code = code.replace(
  '<div className="hero-panel" style={{ background: T.moss, padding: "clamp(3rem, 5vw, 5rem) clamp(1.5rem, 5vw, 3.5rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>',
  '<div className="hero-panel" style={{ background: T.moss, padding: "clamp(4rem, 6vw, 6rem) clamp(2rem, 6vw, 5rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>'
);

// 3. Make the nav CTA a pill (like Softvira's yellow button)
code = code.replace(
  'padding: "8px 16px", borderRadius: 6, border: "none",',
  'padding: "10px 24px", borderRadius: 9999, border: "none",'
);
code = code.replace(
  'padding: "8px 16px", borderRadius: 6, border: `1px solid ${T.border}`,',
  'padding: "10px 24px", borderRadius: 9999, border: `1px solid ${T.border}`,'
);
code = code.replace(
  'padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer",',
  'padding: "10px 24px", borderRadius: 9999, border: "none", cursor: "pointer",'
);

// Hero main button
code = code.replace(
  'padding: "12px 24px", borderRadius: 6, border: "none", cursor: "pointer",',
  'padding: "14px 28px", borderRadius: 9999, border: "none", cursor: "pointer",'
);
// Hero secondary button
code = code.replace(
  'padding: "12px 22px", borderRadius: 6, cursor: "pointer",',
  'padding: "14px 28px", borderRadius: 9999, cursor: "pointer",'
);

// 4. GSAP letter animation for the heading (simulate Softvira's letter-by-letter reveal)
// We'll wrap the letters in spans in the JSX
code = code.replace(
  'Stop building<br />',
  '{"Stop building".split("").map((c,i)=><span key={i} className="hero-char" style={{display:"inline-block", opacity:0}}>{c===" "?"\\u00A0":c}</span>)}<br />'
);
code = code.replace(
  'commodity<br />',
  '{"commodity".split("").map((c,i)=><span key={i} className="hero-char" style={{display:"inline-block", opacity:0}}>{c===" "?"\\u00A0":c}</span>)}<br />'
);
code = code.replace(
  'software.',
  '{"software.".split("").map((c,i)=><span key={i} className="hero-char" style={{display:"inline-block", opacity:0}}>{c===" "?"\\u00A0":c}</span>)}'
);

code = code.replace(
  'Own a vertical<br />monopoly.',
  '{"Own a vertical".split("").map((c,i)=><span key={i} className="hero-char-2" style={{display:"inline-block", opacity:0}}>{c===" "?"\\u00A0":c}</span>)}<br />{"monopoly.".split("").map((c,i)=><span key={i} className="hero-char-2" style={{display:"inline-block", opacity:0}}>{c===" "?"\\u00A0":c}</span>)}'
);

// Update GSAP logic in useEffect
const newGsap = `
        /* Hero stagger character by character */
        gsap.to(".hero-char", {
          y: 0, opacity: 1, stagger: 0.02, duration: 0.6,
          ease: "power3.out", delay: 0.1,
        });
        gsap.to(".hero-char-2", {
          y: 0, opacity: 1, stagger: 0.02, duration: 0.6,
          ease: "power3.out", delay: 0.5,
        });
        gsap.from(".hero-line-fade", {
          y: 30, opacity: 0, stagger: 0.1, duration: 0.8,
          ease: "power3.out", delay: 0.9,
        });
`;
code = code.replace(
  /\/\* Hero stagger \*\/[\s\S]*?delay: 0\.1,\s*\}\);/,
  newGsap.trim()
);

// Update classes for fading lines
code = code.replace(/className="hero-line"/g, 'className="hero-line-fade"');
// Remove hero-line-fade from the h1s themselves since we're animating their children now
code = code.replace(/<h1([^>]*)className="hero-line-fade"([^>]*)>/g, '<h1$1$2>');

fs.writeFileSync('/mnt/c/code/VerticalScout/frontend/app/page.tsx', code);
console.log('Softvira-inspired modern layout applied');
