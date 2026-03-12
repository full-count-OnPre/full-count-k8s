import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    game_day_ramp_up: {
      executor: "ramping-vus",
      startVUs: 5,
      stages: [
        { duration: "2m", target: 20 },
        { duration: "3m", target: 50 },
        { duration: "5m", target: 100 },
        { duration: "3m", target: 150 },
        { duration: "2m", target: 0 }
      ],
      gracefulRampDown: "30s"
    }
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1500"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://PLACEHOLDER_BASE_URL";
const GAME_ID = __ENV.GAME_ID || "PLACEHOLDER_GAME_ID";

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/api/schedules`],
    ["GET", `${BASE_URL}/api/live/${GAME_ID}`],
    [
      "POST",
      `${BASE_URL}/api/comments`,
      JSON.stringify({
        gameId: GAME_ID,
        userId: "PLACEHOLDER_USER_ID",
        nickname: "PLACEHOLDER_NICKNAME",
        message: "Stress test comment from k6"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${__ENV.API_TOKEN || "PLACEHOLDER_API_TOKEN"}`
        }
      }
    ]
  ]);

  check(responses[0], {
    "schedule status is 200": (r) => r.status === 200
  });
  check(responses[1], {
    "live status is 200": (r) => r.status === 200
  });
  check(responses[2], {
    "comment write status is 200 or 201": (r) => r.status === 200 || r.status === 201
  });

  sleep(1);
}
