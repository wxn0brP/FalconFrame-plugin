import { Plugin } from "../types.js";
export interface RateLimitRecord {
    count: number;
    lastRequest: number;
}
export declare function createRateLimiterPlugin(maxRequests: number, windowMs: number): Plugin;
