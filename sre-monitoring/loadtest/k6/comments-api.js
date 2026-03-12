import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 15,
  duration: "2m",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1200"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://PLACEHOLDER_BASE_URL";
const GAME_ID = __ENV.GAME_ID || "PLACEHOLDER_GAME_ID";

export default function () {
  const payload = JSON.stringify({
    gameId: GAME_ID,
    userId: "PLACEHOLDER_USER_ID",
    nickname: "PLACEHOLDER_NICKNAME",
    message: "Go Full Count!"
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${__ENV.API_TOKEN || "PLACEHOLDER_API_TOKEN"}`
    }
  };

  const response = http.post(`${BASE_URL}/api/comments`, payload, params);

  check(response, {
    "comment api status is 200 or 201": (r) => r.status === 200 || r.status === 201,
    "comment api responds within 1.2s": (r) => r.timings.duration < 1200
  });

  sleep(1);
}
