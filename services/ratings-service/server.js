const { createServer, getJsonUrl, notFound, parseBody, sendJson } = require("../../packages/shared/http");

const serviceName = "ratings-service";
const port = Number(process.env.PORT || 4107);

const ratings = [];

const server = createServer(serviceName, async (req, res) => {
  const url = getJsonUrl(req);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { service: serviceName, status: "ok", ratings: ratings.length });
    return;
  }

  if (req.method === "GET" && url.pathname === "/ratings") {
    sendJson(res, 200, { data: ratings });
    return;
  }

  if (req.method === "POST" && url.pathname === "/ratings") {
    const body = await parseBody(req);

    if (!body.orderId || !body.targetId || !body.targetType || !body.score) {
      sendJson(res, 400, { error: "orderId, targetId, targetType, and score are required" });
      return;
    }

    const rating = {
      id: `rating-${ratings.length + 1}`,
      orderId: body.orderId,
      targetId: body.targetId,
      targetType: body.targetType,
      score: Number(body.score),
      comment: body.comment || "",
      createdAt: new Date().toISOString()
    };

    ratings.push(rating);
    sendJson(res, 201, rating);
    return;
  }

  notFound(res, serviceName);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
