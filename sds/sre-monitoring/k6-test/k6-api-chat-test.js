import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://10.10.10.10';
const COMMON_HEADERS = {
  Host: 'www.fullcount.com',
  'Content-Type': 'application/json',
};

export const options = {
  stages: [
    { duration: '30s', target: 3 },
    { duration: '1m', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const listRes = http.get(
    `${BASE_URL}/api/games?date=2025-10-16`,
    { headers: { Host: 'www.fullcount.com' } }
  );

  check(listRes, {
    'game list status is 200': (r) => r.status === 200,
  });

  const detailRes = http.get(
    `${BASE_URL}/api/games/cmmvr32ag002h0slhhpj0eaui`,
    { headers: { Host: 'www.fullcount.com' } }
  );

  check(detailRes, {
    'game detail status is 200': (r) => r.status === 200,
  });

  const payload = JSON.stringify({
    user: 'k6-test',
    message: 'load test message',
  });

  const chatRes = http.post(
    `${BASE_URL}/api/games/cmmvr2u3i001z0slhu4drzea3/chat`,
    payload,
    { headers: COMMON_HEADERS }
  );

  check(chatRes, {
    'chat post status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
      