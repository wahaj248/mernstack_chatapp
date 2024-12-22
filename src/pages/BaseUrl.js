const production = false;
let baseURL;
if (production) {
  baseURL = "https://dev-api.verde24health.com";
} else {
  baseURL = "http://localhost:3001";
}

export const BASE_URL = baseURL;
