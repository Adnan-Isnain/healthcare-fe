interface JWTPayload {
  exp?: number;
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  [key: string]: any;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload: JWTPayload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp ? payload.exp * 1000 : 0) < Date.now();
  } catch {
    return true;
  }
};

export const getTokenExpirationTime = (token: string): number => {
  try {
    const payload: JWTPayload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
};

export const decodeToken = (token: string): JWTPayload => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}; 