import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  scenarios: {
    eficiencia: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<250'],
  },
};

export default function () {
  const url = 'http://localhost:8080/api/v1/ventas';
  const payload = JSON.stringify({
    producto_id: Math.floor(Math.random() * 5) + 1,
    cantidad: 1,
  });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(url, payload, params);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 250ms': (r) => r.timings.duration < 250,
  });
}

export function handleSummary(data) {
  return {
    "qa-artifacts/k6-eficiencia-vps.html": htmlReport(data),
  };
}
