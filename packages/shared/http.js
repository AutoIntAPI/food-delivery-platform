const http = require("node:http");

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString();
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON payload"));
      }
    });
    req.on("error", reject);
  });
}

function createServer(serviceName, handler) {
  return http.createServer(async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendJson(res, error.statusCode || 500, {
        error: error.message || "Internal Server Error",
        service: serviceName
      });
    }
  });
}

async function fetchJson(baseUrl, path, options = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = new Error(payload.error || `Request failed with status ${response.status}`);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function notFound(res, serviceName) {
  sendJson(res, 404, {
    error: "Not Found",
    service: serviceName
  });
}

function getJsonUrl(req) {
  return new URL(req.url, "http://localhost");
}

module.exports = {
  createServer,
  fetchJson,
  getJsonUrl,
  notFound,
  parseBody,
  sendJson
};
