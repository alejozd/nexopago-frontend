// Decodificador minimo de JWT: solo necesitamos el claim "exp" del payload,
// no vale la pena una dependencia (jwt-decode) para esto.
export function getJwtExpirationMs(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    // base64url -> base64 (reemplaza el alfabeto y repone el padding "=").
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };

    if (typeof payload.exp !== 'number') {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}
