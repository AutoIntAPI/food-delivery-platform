const { createServer, getJsonUrl, notFound, parseBody, sendJson } = require("../../packages/shared/http");

const serviceName = "menu-service";
const port = Number(process.env.PORT || 4103);

const menuItems = [
  { id: "item-1", restaurantId: "rest-1", name: "Classic Burger", price: 8.5 },
  { id: "item-2", restaurantId: "rest-1", name: "Loaded Fries", price: 4.25 },
  { id: "item-3", restaurantId: "rest-2", name: "Margherita Pizza", price: 11.0 },
  { id: "item-4", restaurantId: "rest-2", name: "Tiramisu", price: 5.5 }
];

const server = createServer(serviceName, async (req, res) => {
  const url = getJsonUrl(req);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { service: serviceName, status: "ok", items: menuItems.length });
    return;
  }

  if (req.method === "GET" && url.pathname === "/menus") {
    sendJson(res, 200, { data: menuItems });
    return;
  }

  const restaurantMenuMatch = url.pathname.match(/^\/restaurants\/([^/]+)\/menu$/);
  if (req.method === "GET" && restaurantMenuMatch) {
    sendJson(res, 200, {
      restaurantId: restaurantMenuMatch[1],
      items: menuItems.filter((item) => item.restaurantId === restaurantMenuMatch[1])
    });
    return;
  }

  // if (req.method === "POST" && url.pathname === "/menu/quote") {
  //   const body = await parseBody(req);
  //   const requestedItems = Array.isArray(body.items) ? body.items : [];

  //   if (!body.restaurantId || requestedItems.length === 0) {
  //     sendJson(res, 400, { error: "restaurantId and items are required" });
  //     return;
  //   }

  //   const lineItems = [];
  //   for (const entry of requestedItems) {
  //     const item = menuItems.find(
  //       (candidate) => candidate.id === entry.itemId && candidate.restaurantId === body.restaurantId
  //     );

  //     if (!item) {
  //       sendJson(res, 404, { error: `Menu item ${entry.itemId} is unavailable for restaurant ${body.restaurantId}` });
  //       return;
  //     }

  //     const quantity = Number(entry.quantity || 1);
  //     lineItems.push({
  //       itemId: item.id,
  //       name: item.name,
  //       quantity,
  //       unitPrice: item.price,
  //       lineTotal: Number((item.price * quantity).toFixed(2))
  //     });
  //   }

  //   const subtotal = Number(lineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  //   const serviceFee = Number((subtotal * 0.08).toFixed(2));
  //   const deliveryFee = subtotal >= 20 ? 1.5 : 3.0;
  //   const total = Number((subtotal + serviceFee + deliveryFee).toFixed(2));

  //   sendJson(res, 200, {
  //     restaurantId: body.restaurantId,
  //     lineItems,
  //     pricing: {
  //       subtotal,
  //       serviceFee,
  //       deliveryFee,
  //       total
  //     }
  //   });
  //   return;
  // }

  notFound(res, serviceName);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
