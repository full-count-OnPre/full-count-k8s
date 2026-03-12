import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "1m",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<800"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://PLACEHOLDER_BASE_URL";

export default function () {
  const response = http.get(`${BASE_URL}/api/schedules`);

  check(response, {
    "schedule list status is 200": (r) => r.status === 200,
    "schedule list responds within 800ms": (r) => r.timings.duration < 800
  });

  sleep(1);
}
