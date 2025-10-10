let accessTokenInMemory: string | null = null;

export function setAccessToken(token: string | null) {
  accessTokenInMemory = token;
}

export function getAccessToken() {
  return accessTokenInMemory;
}

export function clearAccessToken() {
  accessTokenInMemory = null;
}
