// Neto v1 OAuth Token Response
export interface oauthV1Payload {
  version: 1;
  scope: string;
  store_id: string;
  store_domain: string;
  store_name: number;
  store_timezone: string;
  access_token: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  billing_address: {
    street1: string;
    street2: string;
    city: string;
    post_code: string;
    state: string;
    country_name: string;
    country_code: string;
  };
}

// Neto v2 OAuth Token Response
export interface oauthV2Payload {
  version: 2;
  scope: string;
  api_id: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
  refresh_expires_in: number;
}

// Account Cookie 
export interface oauthResponse {
  oauth: oauthV1Payload | oauthV2Payload;
  webstore: webstoreResponse;
  user: userResponse;
  activeProductTotal: string;
}

// Webstore data for Account Cookie
export interface webstoreResponse {
  domain: string;
  business_name: string;
  timezone: string;
  country: string;
  hash: string;
}

// User data for Account Cookie
export interface userResponse {
  uid: string;
  preferred_username: string;
  email: string;
}

// Neto Account
export interface accountPayload {
  oauth: oauthV1Payload | oauthV2Payload;
  user: userResponse;
  webstore: webstoreResponse;
  activeProductTotal: number;
  iat?: number;
  exp?: number;
}
