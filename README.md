# FalconFrame Plugin System

Plugin system for FalconFrame with dependency management and built-in middleware.

## Installation

```bash
npm install @wxn0brp/falcon-frame-plugin @wxn0brp/falcon-frame
```

## Quick Start

```typescript
import FalconFrame from "@wxn0brp/falcon-frame";
import { PluginSystem } from "@wxn0brp/falcon-frame-plugin";

const app = new FalconFrame();
const plugins = new PluginSystem();

plugins.register({
  id: "logger",
  process: (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  }
});

app.use(plugins);
app.get("/", () => "Hello World");
app.listen(3000);
```

## API

### PluginSystem

| Property/Method | Type | Description |
|---|---|---|
| `plugins` | `Plugin[]` | Registered plugins array |
| `_sorted` | `boolean` | Sort state flag |
| `register(plugin, opts?)` | `(Plugin, PSOpts?) => void` | Register plugin with optional ordering |
| `getRouteHandler()` | `() => RouteHandler` | Returns middleware handler |
| `_sort()` | `() => void` | Manually trigger re-sort |

## Types

```typescript
interface Plugin {
  id: string;                 // Unique identifier
  process: RouteHandler;      // (req, res, next) => void
  before?: string | string[]; // Run before these plugins
  after?: string | string[];  // Run after these plugins
}

interface PSOpts {
  before?: string | string[]; // Override plugin.before
  after?: string | string[];  // Override plugin.after
}
```

## Built-in Plugins

### IP Filter

```typescript
import { createIPFilterPlugin } from "@wxn0brp/falcon-frame-plugin/plugins/ipFilter";

plugins.register(createIPFilterPlugin({
  allow: ["127.0.0.1", "::1", "10.0.0.0/8"],
  block: ["192.168.1.100"],
  statusCode: 403,
  message: "Forbidden"
}));
```

| Option | Type | Description |
|---|---|---|
| `allow` | `string \| string[]` | IPs/CIDRs to allow |
| `block` | `string \| string[]` | IPs/CIDRs to block |
| `statusCode` | `number` | Default: `403` |
| `message` | `string` | Default: `"Forbidden"` |
| `onBlocked` | `(req, res) => void` | Custom blocked handler |

Supports IPv4, IPv6, and CIDR notation. Allow-list takes priority.

### Rate Limiter

```typescript
import { createRateLimiterPlugin } from "@wxn0brp/falcon-frame-plugin/plugins/rateLimit";

plugins.register(createRateLimiterPlugin({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000,
  id: (req) => req.headers["x-api-key"] || req.socket.remoteAddress
}));
```

| Option | Type | Description |
|---|---|---|
| `maxRequests` | `number` | Max requests per window |
| `windowMs` | `number` | Window duration in ms |
| `id` | `(req) => string \| Promise<string>` | Custom key generator |
| `onLimitReached` | `(req, res, ctx) => void` | Custom limit handler |
| `sharedMap` | `Map<string, RateLimitRecord>` | Shared state between limiters |
| `disableCleanup` | `boolean` | Disable auto-cleanup (default: `false`) |

Default response: `429 Too Many Requests` with `Retry-After` header.

### Security Headers

```typescript
import { createSecurityPlugin } from "@wxn0brp/falcon-frame-plugin/plugins/security";

plugins.register(createSecurityPlugin());
```

Sets the following headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: no-referrer`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

Implicit ordering: `after: "cors"`.

## License

MIT
