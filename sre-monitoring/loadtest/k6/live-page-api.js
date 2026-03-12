import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "2m",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1000"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://PLACEHOLDER_BASE_URL";
const GAME_ID = __ENV.GAME_ID || "PLACEHOLDER_GAME_ID";

export default function () {
  const response = http.get(`${BASE_URL}/api/live/${GAME_ID}`);

  check(response, {
    "live api status is 200": (r) => r.status === 200,
    "live api has game id": (r) => r.body.includes(GAME_ID),
    "live api responds within 1s": (r) => r.timings.duration < 1000
  });

  sleep(1);
}
