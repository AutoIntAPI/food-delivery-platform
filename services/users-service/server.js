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

  notFound(res, serviceName);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
