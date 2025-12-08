export interface accountPayload {
  oauth: {
    scope: string;
    api_id: string;
    id_token?: string;
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
  };
  user: {
    uid: string;
    preferred_username: string;
    email: string;
  };
  webstore: {
    business_name: string;
    domain: string;
    timezone: string;
    country: string;
    hash: string;
  };
  activeProductTotal: number;
  iat: number;
  exp: number;
}
