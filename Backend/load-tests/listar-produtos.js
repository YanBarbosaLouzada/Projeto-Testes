import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users over 30 seconds
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '10s', target: 0 },   // Ramp-down to 0 users over 10 seconds
  ],
  thresholds:{
    http_req_duration: ['p(95)<300'], // 95% of requests should be below 300ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  }
};

export default function () {
    const resposta = http.get('http://localhost:4444/products/');

    check(resposta, {
        'status é 200': (r) => r.status === 200,
        "corpo tem a lista de produtos": (r) => JSON.parse(r.body).products !== undefined,
    });

    sleep(1); // Simulate user think time
}