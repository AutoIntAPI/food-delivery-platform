const {
  createServer,
  fetchJson,
  getJsonUrl,
  notFound,
  parseBody,
  sendJson
} = require("../../packages/shared/http");

const serviceName = "orders-service";
const port = Number(process.env.PORT || 4104);

const dependencies = {
  users: process.env.USERS_SERVICE_URL || "http://localhost:4101",
  restaurants: process.env.RESTAURANTS_SERVICE_URL || "http://localhost:4102",
  menu: process.env.MENU_SERVICE_URL || "http://localhost:4103",
  drivers: process.env.DRIVERS_SERVICE_URL || "http://localhost:4105",
  payments: process.env.PAYMENTS_SERVICE_URL || "http://localhost:4106",
  notifications: process.env.NOTIFICATIONS_SERVICE_URL || "http://localhost:4108"
};

const orders = [];

async function createOrder(body) {
  if (!body.userId || !body.restaurantId || !Array.isArray(body.items) || body.items.length === 0) {
    const error = new Error("userId, restaurantId, and at least one item are required");
    error.statusCode = 400;
    throw error;
  }

  const draftOrderId = `order-${orders.length + 1}`;
  const user = await fetchJson(dependencies.users, `/users/${body.userId}`);
  const quote = await fetchJson(dependencies.menu, "/menu/quote", {
    method: "POST",
    body: {
      restaurantId: body.restaurantId,
      items: body.items
    }
  });

  const restaurantDecision = await fetchJson(
    dependencies.restaurants,
    `/restaurants/${body.restaurantId}/accept-order`,
    {
      method: "POST",
      body: {
        orderDraftId: draftOrderId,
        customerId: body.userId,
        total: quote.pricing.total
      }
    }
  );

  const payment = await fetchJson(dependencies.payments, "/payments/authorize", {
    method: "POST",
    body: {
      orderId: draftOrderId,
      amount: quote.pricing.total,
      paymentMethod: body.paymentMethod || "card",
      currency: body.currency || "USD"
    }
  });

  const assignment = await fetchJson(dependencies.drivers, "/drivers/assign", {
    method: "POST",
    body: {
      orderId: draftOrderId,
      restaurantId: body.restaurantId,
      deliveryAddress: user.defaultAddress
    }
  });

  await fetchJson(dependencies.notifications, "/notifications", {
    method: "POST",
    body: {
      orderId: draftOrderId,
      recipients: [
        {
          recipient: user.email,
          channel: "email",
          message: `Your order ${draftOrderId} has been confirmed and a driver is on the way.`
        },
        {
          recipient: body.restaurantId,
          channel: "webhook",
          message: `Prepare order ${draftOrderId}.`
        },
        {
          recipient: assignment.driverId,
          channel: "push",
          message: `You have been assigned to order ${draftOrderId}.`
        }
      ]
    }
  });

  const order = {
    id: draftOrderId,
    userId: user.id,
    restaurantId: body.restaurantId,
    items: quote.lineItems,
    pricing: quote.pricing,
    payment,
    driverAssignment: assignment,
    deliveryAddress: user.defaultAddress,
    status: "driver_assigned",
    timeline: [
      { stage: "order_created", at: new Date().toISOString() },
      { stage: "restaurant_accepted", at: restaurantDecision.acceptedAt },
      { stage: "payment_authorized", at: payment.authorizedAt },
      { stage: "driver_assigned", at: assignment.assignedAt }
    ]
  };

  orders.push(order);
  return order;
}

const server = createServer(serviceName, async (req, res) => {
  const url = getJsonUrl(req);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, {
      service: serviceName,
      status: "ok",
      orders: orders.length,
      dependencies
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/orders") {
    sendJson(res, 200, { data: orders });
    return;
  }

  const orderMatch = url.pathname.match(/^\/orders\/([^/]+)$/);
  if (req.method === "GET" && orderMatch) {
    const order = orders.find((entry) => entry.id === orderMatch[1]);
    if (!order) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }

    sendJson(res, 200, order);
    return;
  }

  if (req.method === "POST" && url.pathname === "/orders") {
    const body = await parseBody(req);
    const order = await createOrder(body);
    sendJson(res, 201, order);
    return;
  }

  notFound(res, serviceName);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
