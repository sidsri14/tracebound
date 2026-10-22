import { createReadStream } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { loadScenario } from "./adapters/sample-data.js";
import { runInvestigation, type RunMode } from "./runtime.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";
const publicRoot = join(process.cwd(), "public");

const server = createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/api/health") {
      return json(response, 200, { status: "ok", service: "tracebound", liveConfigured: liveConfigured() });
    }
    if (request.method === "GET" && request.url === "/api/evidence") {
      const { evidence } = await loadScenario("data/sample/scenario.json");
      return json(response, 200, { synthetic: true, rows: evidence });
    }
    if (request.method === "POST" && request.url === "/api/run") {
      const body = await readJson(request);
      const mode = body.mode === "live" ? "live" : "sample";
      const result = await runInvestigation(mode as RunMode, "data/sample/scenario.json");
      return json(response, 200, result);
    }
    if (request.method === "GET") return serveStatic(request.url ?? "/", response);
    json(response, 404, { error: "not_found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    json(response, 500, { error: "run_failed", message });
  }
});

server.listen(port, host, () => {
  console.log(`Tracebound listening at http://${host}:${port}`);
});

async function serveStatic(url: string, response: ServerResponse): Promise<void> {
  const pathname = new URL(url, "http://localhost").pathname;
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const safe = normalize(requested).replace(/^(\.\.(\\|\/|$))+/, "");
  const path = join(publicRoot, safe);
  try {
    await access(path);
  } catch {
    return json(response, 404, { error: "not_found" });
  }
  const contentTypes: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
  };
  response.writeHead(200, { "content-type": contentTypes[extname(path)] ?? "application/octet-stream" });
  createReadStream(path).pipe(response);
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 16_384) throw new Error("Request body too large");
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function liveConfigured(): boolean {
  return [
    "ZETARIS_BASE_URL",
    "ZETARIS_ORG_ID",
    "ZETARIS_API_KEY",
    "ZETARIS_SQL",
    "NIGHTSHIFT_BASE_URL",
    "NIGHTSHIFT_RUNTIME_TOKEN",
    "NIGHTSHIFT_MODEL",
  ].every((name) => Boolean(process.env[name]));
}
