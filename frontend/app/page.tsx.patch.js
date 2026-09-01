const fs = require('fs');

let code = fs.readFileSync('/mnt/c/code/VerticalScout/frontend/app/page.tsx', 'utf8');

// The issue is all the hardcoded gridTemplateColumns: "1fr 1fr" and similar fixed-width layouts in inline styles
// Let's replace the inline style layouts with Tailwind responsive classes where appropriate
// OR we can add a <style> block for our specific component classes if that's cleaner

// 1. Hero section
code = code.replace(
  'gridTemplateColumns: "1fr 1fr"',
  'gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"'
);

// 2. Padding in hero moss panel
code = code.replace(
  'padding: "5rem 3.5rem"',
  'padding: "clamp(3rem, 5vw, 5rem) clamp(1.5rem, 5vw, 3.5rem)"'
);

// 3. Stats strip (flex gap: 40)
code = code.replace(
  'gap: 40, paddingTop: 24',
  'gap: "clamp(20px, 4vw, 40px)", paddingTop: 24, flexWrap: "wrap"'
);

// 4. Comparison Matrix Grid
code = code.replace(
  '<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>',
  '<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>'
);

// 5. 8 Fatal Tests Grid
code = code.replace(
  '<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>',
  '<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 20 }}>'
);

// 6. Roles Grid
code = code.replace(
  '<div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>',
  '<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>'
);

// 7. Right tilt card container padding
code = code.replace(
  'padding: "3rem 2.5rem"',
  'padding: "clamp(2rem, 5vw, 3rem) clamp(1rem, 5vw, 2.5rem)"'
);

// 8. Nav Links
code = code.replace(
  '<div style={{ display: "flex", alignItems: "center", gap: 28 }}>',
  '<div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 28px)", flexWrap: "wrap", justifyContent: "flex-end" }}>'
);

// 9. CTA Padding
code = code.replace(
  'padding: "64px 48px"',
  'padding: "clamp(32px, 6vw, 64px) clamp(24px, 5vw, 48px)"'
);

fs.writeFileSync('/mnt/c/code/VerticalScout/frontend/app/page.tsx', code);
console.log('page.tsx patched for responsive layouts');
