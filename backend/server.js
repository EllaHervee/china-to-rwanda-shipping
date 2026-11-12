const http = require("node:http");

const port = Number(process.env.PORT) || 4000;
const rates = {
  air: { perKg: 9.5, minimum: 20, delivery: "5–8 days" },
  sea: { perKg: 3.2, minimum: 30, delivery: "30–45 days" },
};


function send(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 10_000) throw new Error("Request body is too large");
  }
  return JSON.parse(raw || "{}");
}

const server = http.createServer(async (request, response) => {
  const url = new URL(
    request.url,
    `http://${request.headers.host || "localhost"}`,
  );
  if (request.method === "GET" && url.pathname === "/api/health") {
    return send(response, 200, { status: "ok", service: "chi-rwa-backend" });
  }
  if (request.method === "POST" && url.pathname === "/api/quote") {
    try {
      const { weight, method } = await readJson(request);
      const kg = Number(weight);
      const rate = rates[method];
      if (!Number.isFinite(kg) || kg <= 0 || kg > 100_000 || !rate) {
        return send(response, 400, {
          error: "Enter a valid weight and shipping method.",
        });
      }
      return send(response, 200, {
        amount: Math.max(rate.minimum, kg * rate.perKg),
        currency: "USD",
        method,
        delivery: rate.delivery,
        estimateOnly: true,
      });
    } catch {
      return send(response, 400, { error: "Invalid request body." });
    }
  }
  return send(response, 404, { error: "Not found" });
});

server.listen(port, () =>
  console.log(`CHI-RWA backend listening on http://localhost:${port}`),
);
