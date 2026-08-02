import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:3000";

export const options = {
  vus: Number(__ENV.LOAD_VUS || 10),
  duration: __ENV.LOAD_DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: [
      `p(95)<${Number(__ENV.SLO_HEALTH_P95_MS || 200)}`,
    ],
  },
};

export default function healthLoad() {
  const res = http.get(`${baseUrl}/api/health`);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "database connected": (r) =>
      r.json("data.database") === "connected",
  });
  sleep(0.1);
}
