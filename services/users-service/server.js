const { createServer, getJsonUrl, notFound, sendJson } = require("../../packages/shared/http");

const serviceName = "users-service";
const port = Number(process.env.PORT || 4101);

const users = [
  {
    id: "user-1",
    name: "Maya Hassan",
    email: "maya@example.com",
    defaultAddress: "12 Nile Street, Cairo",
    favoriteCuisine: "Burgers"
  },
  {
    id: "user-2",
    name: "Omar Adel",
    email: "omar@example.com",
    defaultAddress: "48 Tahrir Square, Cairo",
    favoriteCuisine: "Pizza"
  }
];

const server = createServer(serviceName, async (req, res) => {
  const url = getJsonUrl(req);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { service: serviceName, status: "ok", users: users.length });
    return;
  }

  if (req.method === "GET" && url.pathname === "/users") {
    sendJson(res, 200, { data: users });
    return;
  }

  const userMatch = url.pathname.match(/^\/users\/([^/]+)$/);
  if (req.method === "GET" && userMatch) {
    const user = users.find((entry) => entry.id === userMatch[1]);
    if (!user) {
      sendJson(res, 404, { error: "User not found" });
      return;
    }

    sendJson(res, 200, user);
    return;
  }

  notFound(res, serviceName);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
