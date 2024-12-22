const production = false;
let baseURL;
if (production) {
  baseURL = "https://dev-api.verde24health.com";
} else {
  baseURL = "http://192.168.8.103:3000";
}

export const BASE_URL = baseURL;
