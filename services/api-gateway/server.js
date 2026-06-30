const { createServer, notFound, sendJson } = require("../../packages/shared/http");

const serviceName = "api-gateway";
const port = Number(process.env.PORT || 8080);

const routes = [
  { prefix: "/api/menu/restaurants", target: process.env.MENU_SERVICE_URL, rewriteBase: "/restaurants" },
  { prefix: "/api/menu/quote", target: process.env.MENU_SERVICE_URL, rewriteBase: "/menu/quote" },
  { prefix: "/api/menus", target: process.env.MENU_SERVICE_URL, rewriteBase: "/menus" },
  { prefix: "/api/users", target: process.env.USERS_SERVICE_URL, rewriteBase: "/users" },
  { prefix: "/api/restaurants", target: process.env.RESTAURANTS_SERVICE_URL, rewriteBase: "/restaurants" },
  { prefix: "/api/orders", target: process.env.ORDERS_SERVICE_URL, rewriteBase: "/orders" },
  { prefix: "/api/drivers", target: process.env.DRIVERS_SERVICE_URL, rewriteBase: "/drivers" },
  { prefix: "/api/payments", target: process.env.PAYMENTS_SERVICE_URL, rewriteBase: "/payments" },
  { prefix: "/api/ratings", target: process.env.RATINGS_SERVICE_URL, rewriteBase: "/ratings" },
  { prefix: "/api/notifications", target: process.env.NOTIFICATIONS_SERVICE_URL, rewriteBase: "/notifications" }
];

async function proxyRequest(req, res, route) {
  const url = new URL(req.url, "http://localhost");
  const remainder = url.pathname.slice(route.prefix.length);
  const downstreamPath = `${route.rewriteBase || ""}${remainder}` || "/";
  const downstream = new URL(downstreamPath, route.target);
  downstream.search = url.search;

  let body;
  if (!["GET", "HEAD"].includes(req.method)) {
    body = await new Promise((resolve, reject) => {
      let raw = "";
      req.on("data", (chunk) => {
        raw += chunk.toString();
      });
      req.on("end", () => resolve(raw));
      req.on("error", reject);
    });
  }

  const response = await fetch(downstream, {
    method: req.method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body || undefined
  });

  const payload = await response.text();
  res.writeHead(response.status, {
    "Content-Type": response.headers.get("content-type") || "application/json"
  });
  res.end(payload);
}

const server = createServer(serviceName, async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      service: serviceName,
      status: "ok",
      routes: routes.map((route) => route.prefix)
    });
    return;
  }

  const route = routes.find((candidate) => req.url.startsWith(candidate.prefix));
  if (!route || !route.target) {
    notFound(res, serviceName);
    return;
  }

  await proxyRequest(req, res, route);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
