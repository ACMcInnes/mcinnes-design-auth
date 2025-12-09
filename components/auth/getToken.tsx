type authData = {
  code: string; 
  grantType: string; 
  netoEnvironment: string;
}

export async function getToken(url: string, params: authData) {

  let fetchURL;
  if (process.env.NODE_ENV === "development") {
    fetchURL = `http://localhost:3000${url}`;
    // e.g: http://localhost:3000/auth/callback/neto/v2
  } else {
    fetchURL = `https://mcinnes-design-auth.vercel.app${url}`;
  }

  const response = await fetch(fetchURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  return response
}
