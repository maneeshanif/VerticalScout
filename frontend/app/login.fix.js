const fs = require('fs');

let code = fs.readFileSync('/mnt/c/code/VerticalScout/frontend/app/(auth)/login/page.tsx', 'utf8');

const replacement = `
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid credentials");
      }
      const data = await res.json();
      await login({ access_token: data.access_token, refresh_token: data.refresh_token });
      
      // User data will be loaded by context, we just redirect.
      // We need to fetch the user to know the role for redirect.
      const meRes = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/me", {
        headers: { Authorization: \`Bearer \${data.access_token}\` }
      });
      const user = await meRes.json();
      
      if (user.role === "super_admin") router.push("/admin");
      else if (user.role === "super_teacher") router.push("/super-teacher");
      else if (user.role === "lead_teacher") {
        if (!user.batch) router.push("/select-batch");
        else router.push("/lead-teacher");
      } else {
        if (!user.batch) router.push("/select-batch");
        else router.push("/elite");
      }
`;

code = code.replace(
  /try \{\s*const user = await login\(email, password\);\s*if \(user\.role === "super_admin"\) router\.push\("\/admin"\);\s*else if \(user\.role === "super_teacher"\) router\.push\("\/super-teacher"\);\s*else if \(user\.role === "lead_teacher"\) \{\s*if \(!user\.batch\) router\.push\("\/select-batch"\);\s*else router\.push\("\/lead-teacher"\);\s*\} else \{\s*if \(!user\.batch\) router\.push\("\/select-batch"\);\s*else router\.push\("\/elite"\);\s*\}/,
  replacement.trim()
);

fs.writeFileSync('/mnt/c/code/VerticalScout/frontend/app/(auth)/login/page.tsx', code);
console.log('Login API fixed');
