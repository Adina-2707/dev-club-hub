const fetch = require('node-fetch');
(async () => {
  const base = 'https://dev-club-hub-production-6bd7.up.railway.app';
  const body = {
    name: 'Postman Unique User',
    email: `postman-unique-${Date.now()}@example.com`,
    role: 'student',
  };

  const res = await fetch(`${base}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  console.log('STATUS', res.status);
  console.log(await res.text());
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
