const { createServer, getJsonUrl, notFound, parseBody, sendJson } = require("../../packages/shared/http");

const serviceName = "restaurants-service";
const port = Number(process.env.PORT || 4102);

const restaurants = [
  { id: "rest-1", name: "Burger District", cuisine: "American", open: true, prepTimeMinutes: 18 },
  { id: "rest-2", name: "Napoli Slice", cuisine: "Italian", open: true, prepTimeMinutes: 24 },
  { id: "rest-3", name: "Cairo Bowls", cuisine: "Healthy", open: false, prepTimeMinutes: 15 }
];

const server = createServer(serviceName, async (req, res) => {
  const url = getJsonUrl(req);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { service: serviceName, status: "ok", restaurants: restaurants.length });
    return;
  }

  if (req.method === "GET" && url.pathname === "/restaurants") {
    sendJson(res, 200, { data: restaurants });
    return;
  }

  const detailsMatch = url.pathname.match(/^\/restaurants\/([^/]+)$/);
  if (req.method === "GET" && detailsMatch) {
    const restaurant = restaurants.find((entry) => entry.id === detailsMatch[1]);
    if (!restaurant) {
      sendJson(res, 404, { error: "Restaurant not found" });
      return;
    }

    sendJson(res, 200, restaurant);
    return;
  }

  const acceptanceMatch = url.pathname.match(/^\/restaurants\/([^/]+)\/accept-order$/);
  if (req.method === "POST" && acceptanceMatch) {
    const restaurant = restaurants.find((entry) => entry.id === acceptanceMatch[1]);
    if (!restaurant) {
      sendJson(res, 404, { error: "Restaurant not found" });
      return;
    }

    const body = await parseBody(req);
    if (!restaurant.open) {
      sendJson(res, 409, { error: "Restaurant is currently closed", restaurantId: restaurant.id });
      return;
    }

    sendJson(res, 200, {
      restaurantId: restaurant.id,
      accepted: true,
      estimatedPrepTimeMinutes: restaurant.prepTimeMinutes,
      acceptedAt: new Date().toISOString(),
      orderReference: body.orderDraftId || null
    });
    return;
  }

  notFound(res, serviceName);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
