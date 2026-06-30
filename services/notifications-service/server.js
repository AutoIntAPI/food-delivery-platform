const { createServer, getJsonUrl, notFound, parseBody, sendJson } = require("../../packages/shared/http");

const serviceName = "notifications-service";
const port = Number(process.env.PORT || 4108);

const notifications = [];

const server = createServer(serviceName, async (req, res) => {
  const url = getJsonUrl(req);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { service: serviceName, status: "ok", notifications: notifications.length });
    return;
  }

  if (req.method === "GET" && url.pathname === "/notifications") {
    sendJson(res, 200, { data: notifications });
    return;
  }

  if (req.method === "POST" && url.pathname === "/notifications") {
    const body = await parseBody(req);
    const payloads = Array.isArray(body.recipients) ? body.recipients : [];
    const created = payloads.map((recipient, index) => ({
      id: `notification-${notifications.length + index + 1}`,
      orderId: body.orderId || null,
      channel: recipient.channel || "push",
      recipient: recipient.recipient,
      message: recipient.message,
      sentAt: new Date().toISOString()
    }));

    notifications.push(...created);
    sendJson(res, 201, { data: created });
    return;
  }

  notFound(res, serviceName);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
