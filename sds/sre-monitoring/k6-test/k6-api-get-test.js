import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://10.10.10.10';
const COMMON_HEADERS = {
  Host: 'www.fullcount.com',
};

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const listRes = http.get(
    `${BASE_URL}/api/games?date=2025-10-16`,
    { headers: COMMON_HEADERS }
  );

  check(listRes, {
    'game list status is 200': (r) => r.status === 200,
  });

  const detailRes = http.get(
    `${BASE_URL}/api/games/cmmvr32ag002h0slhhpj0eaui`,
    { headers: COMMON_HEADERS }
  );

  check(detailRes, {
    'game detail status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
