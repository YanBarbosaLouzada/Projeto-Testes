import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 10, //10 usarios simultaneos
    duration: "30s",
}

export default function () {
    const payload = JSON.stringify({ email: "carga@mynds.com", password: "SenhaForte1234" });
    const headers = { headers: { "Content-Type": "application/json" } };

    const login = http.post("http://localhost:4444/auth/login",payload,headers);

    check(login,{
        "login respondeu": (r) => [200, 401, 404, 429].includes(r.status)
    })

    sleep(1);
}