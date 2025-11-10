/**
 * Creates a rate limiter plugin for HTTP requests based on IP.
 *
 * Uses a simple "fixed window counter" algorithm and can optionally
 * share the internal Map or disable cleanup interval.
 *
 * @example
 * const sharedMap = new Map();
 * const rateLimiter = createRateLimiterPlugin({
 *   maxRequests: 5,
 *   windowMs: 60_000,
 *   sharedMap,
 *   onLimitReached: (req, res, ctx) => {
 *     res.statusCode = 429;
 *     res.json({
 *       message: "Sorry, too many requests!",
 *       retryAfter: ctx.retryAfter,
 *       remaining: ctx.remainingRequests,
 *       ip: ctx.ip,
 *     });
 *   },
 * });
 *
 * @param {RateLimiterOptions} options - Rate limiter configuration.
 * @returns {Plugin} Middleware plugin compatible with your system.
 */
export function createRateLimiterPlugin(opts) {
    const { maxRequests, windowMs, onLimitReached, disableCleanup = false, sharedMap, } = opts;
    const rateLimitMap = sharedMap ?? new Map();
    // Optional automatic cleanup
    if (!disableCleanup) {
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [id, record] of rateLimitMap.entries()) {
                if (now - record.windowStart > windowMs) {
                    rateLimitMap.delete(id);
                }
            }
        }, windowMs * 2);
        cleanupInterval.unref?.();
    }
    return {
        id: "rateLimiter",
        process: async (req, res, next) => {
            let id;
            if (opts.id) {
                id = await opts.id(req);
            }
            else {
                id = req.socket.remoteAddress ?? "unknown";
            }
            const now = Date.now();
            const record = rateLimitMap.get(id);
            if (!record) {
                rateLimitMap.set(id, { count: 1, windowStart: now });
                return next();
            }
            const elapsed = now - record.windowStart;
            // Reset window if it expired
            if (elapsed > windowMs) {
                rateLimitMap.set(id, { count: 1, windowStart: now });
                return next();
            }
            // Rate limit exceeded
            if (record.count >= maxRequests) {
                const retryAfter = Math.ceil((windowMs - elapsed) / 1000);
                const remainingRequests = Math.max(0, maxRequests - record.count);
                res.statusCode = 429;
                res.setHeader("Retry-After", retryAfter);
                const ctx = {
                    id,
                    retryAfter,
                    remainingRequests,
                    record,
                };
                if (onLimitReached)
                    return onLimitReached(req, res, ctx);
                // Default plain text response
                res.setHeader("Content-Type", "text/plain; charset=utf-8");
                return res.end("Too Many Requests");
            }
            // Increment count
            record.count++;
            rateLimitMap.set(id, record);
            next();
        },
    };
}
