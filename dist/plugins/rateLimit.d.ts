import { FFRequest } from "@wxn0brp/falcon-frame";
import { Plugin } from "../types.js";
export interface RateLimitRecord {
    count: number;
    windowStart: number;
}
export interface RateLimiterContext {
    id: string;
    retryAfter: number;
    remainingRequests: number;
    record: RateLimitRecord;
}
export interface RateLimiterOptions {
    /**
     * Maximum number of requests allowed per window.
     */
    maxRequests: number;
    /**
     * Window duration in milliseconds.
     */
    windowMs: number;
    /**
     * Callback triggered when the rate limit is exceeded.
     * Gives full control over the response.
     *
     * @param req - HTTP request object.
     * @param res - HTTP response object.
     * @param ctx - Context object containing limit info (IP, retryAfter, remainingRequests, etc.).
     */
    onLimitReached?: (req: any, res: any, ctx: RateLimiterContext) => void;
    /**
     * Disable the automatic cleanup interval.
     * Default: false.
     */
    disableCleanup?: boolean;
    /**
     * Shared Map instance to use instead of a private one.
     * Useful if multiple limiters need to share state.
     */
    sharedMap?: Map<string, RateLimitRecord>;
    /**
     * Function to generate a unique key for each request.
     * Default: uses the IP address of the request.
     */
    id?: (req: FFRequest) => string | Promise<string>;
}
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
export declare function createRateLimiterPlugin(opts: RateLimiterOptions): Plugin;
