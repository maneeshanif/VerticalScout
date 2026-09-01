const fs = require('fs');
let code = fs.readFileSync('/mnt/c/code/VerticalScout/frontend/app/page.tsx', 'utf8');

// I also need to make sure the start y-position for the characters is set, 
// since the GSAP animation does a `.to()` on them! 
// Let's add transform: translateY(20px) inline so they can animate to y: 0.

code = code.replace(/style={{display:"inline-block", opacity:0}}/g, 'style={{display:"inline-block", opacity:0, transform:"translateY(15px)"}}');

fs.writeFileSync('/mnt/c/code/VerticalScout/frontend/app/page.tsx', code);
console.log('Fixed GSAP starting positions for softvira animation');
