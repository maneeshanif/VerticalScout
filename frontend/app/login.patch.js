const fs = require('fs');
let code = fs.readFileSync('/mnt/c/code/VerticalScout/frontend/app/(auth)/login/page.tsx', 'utf8');

// The login page uses lg:grid-cols-2 which is already responsive via Tailwind,
// but the padding and some spacing can be improved.
code = code.replace(
  'p-12',
  'p-8 sm:p-12 lg:p-16' // For brand panel
);

fs.writeFileSync('/mnt/c/code/VerticalScout/frontend/app/(auth)/login/page.tsx', code);
console.log('login page patched');
