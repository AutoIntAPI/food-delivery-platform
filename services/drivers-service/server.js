const { createServer, getJsonUrl, notFound, parseBody, sendJson } = require("../../packages/shared/http");

const serviceName = "drivers-service";
const port = Number(process.env.PORT || 4105);

const drivers = [
  { id: "driver-1", name: "Sara Ali", vehicle: "Scooter", status: "available", currentZone: "central" },
  { id: "driver-2", name: "Youssef Samir", vehicle: "Bike", status: "available", currentZone: "west" },
  { id: "driver-3", name: "Lina Fares", vehicle: "Car", status: "busy", currentZone: "central" }
];

const assignments = [];

const server = createServer(serviceName, async (req, res) => {
  const url = getJsonUrl(req);



  if (req.method === "POST" && url.pathname === "/drivers/assign") {
    const body = await parseBody(req);
    const driver = drivers.find((entry) => entry.status === "available");

    if (!driver) {
      sendJson(res, 409, { error: "No drivers available" });
      return;
    }

    driver.status = "busy";
    const assignment = {
      id: `assignment-${assignments.length + 1}`,
      orderId: body.orderId,
      driverId: driver.id,
      driverName: driver.name,
      vehicle: driver.vehicle,
      assignedAt: new Date().toISOString(),
      etaMinutes: 12
    };
    assignments.push(assignment);

    sendJson(res, 200, assignment);
    return;
  }

  notFound(res, serviceName);
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});
