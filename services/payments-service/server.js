const { createServer, getJsonUrl, notFound, parseBody, sendJson } = require("../../packages/shared/http");

const serviceName = "payments-service";
const port = Number(process.env.PORT || 4106);

const payments = [];

const server = createServer(serviceName, async (req, res) => {
  const url = getJsonUrl(req);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { service: serviceName, status: "ok", payments: payments.length });
    return;
  }

  if (req.method === "GET" && url.pathname === "/payments") {
    sendJson(res, 200, { data: payments });
    return;
  }

  if (req.method === "POST" && url.pathname === "/payments/authorize") {
    const body = await parseBody(req);
    const amount = Number(body.amount || 0);
    const approved = amount > 0 && amount <= 120;

    const payment = {
      id: `pay-${payments.length + 1}`,
      orderId: body.orderId,
      amount,
      currency: body.currency || "USD",
      method: body.paymentMethod || "card",
      status: approved ? "authorized" : "declined",
      authorizedAt: new Date().toISOString()
    };

    payments.push(payment);

    if (!approved) {
      sendJson(res, 402, {
        error: "Payment authorization failed",
        payment
      });
      return;
    }

    sendJson(res, 200, payment);
    return;
  }

  notFound(res, serviceName);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
