import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    stages: [
        { duration: "30s", target: 20 }, // sobre gradualmente 20 user simultaneos
        { duration: "1m", target: 20 },  // matem 20 usuarios por 1 min
        { duration: "10s", target: 0 }   // desce a carga
    ],
    thresholds:{
        http_req_duration:["p(95)<300"], // 95% das respostas devem vir em menos de 300ms
        http_req_failed: ["rate<0.01"], // menos de 1% de erro
    },
};

export default function(){
    const resposta = http.get("http://localhost:4444/products/");

    check(resposta,{
        "status é 200": (r) => r.status === 200,
        "corpo tem a lista de produtos": (r) => JSON.parse(r.body).products !== undefined,
    });

    sleep(1)
}