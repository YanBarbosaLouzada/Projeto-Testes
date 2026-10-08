import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10, // Number of virtual users
    duration: '30s', // Duration of the test
}

export default function () {
    // Simulate user registration
    const playload = JSON.stringify({ email: "carga@mynds.com", password: "123456" });
    const headers = { headers: { 'Content-Type': 'application/json' } };

    const login = http.post('http://localhost:4444/auth/login', playload, headers);

    check(login,{
        'login respondeu': (r) => r.status === 200 || r.status === 401 || r.status === 404
    })

    sleep(1); // Simulate user think time
}