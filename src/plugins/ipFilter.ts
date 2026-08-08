import { Plugin } from "../types";

export interface IPFilterOptions {
	allow?: string | string[];
	block?: string | string[];
	statusCode?: number;
	message?: string;
	onBlocked?: (req: any, res: any) => void;
}

function parseIPv4(ip: string): bigint | null {
	const parts = ip.split(".");
	if (parts.length !== 4) return null;
	let result = 0n;

	for (const part of parts) {
		const num = parseInt(part, 10);
		if (Number.isNaN(num) || num < 0 || num > 255) return null;
		result = (result << 8n) | BigInt(num);
	}

	return result;
}

function parseIPv6(ip: string): bigint | null {
	let ipStr = ip;
	if (ipStr.startsWith("[")) ipStr = ipStr.slice(1, -1);
	const parts = ipStr.split(":");

	if (parts.length < 3 || parts.length > 8) return null;
	let result = 0n;
	let emptyIndex = -1;

	for (let i = 0; i < parts.length; i++) {
		if (parts[i] === "") {
			if (emptyIndex !== -1) return null;
			emptyIndex = i;
			continue;
		}
		const num = parseInt(parts[i], 16);
		if (Number.isNaN(num)) return null;
		result = (result << 16n) | BigInt(num);
	}
	if (emptyIndex !== -1) {
		const missing = 8 - (parts.length - 1);
		result = result << BigInt(missing * 16);
	}
	return result;
}

function parseIP(ip: string): bigint | null {
	if (ip.includes(":")) return parseIPv6(ip);
	return parseIPv4(ip);
}

function ipMatchesCidr(ip: string, cidr: string): boolean {
	const [network, prefixStr] = cidr.split("/");
	const ipBigInt = parseIP(ip);
	const networkBigInt = parseIP(network);

	if (ipBigInt === null || networkBigInt === null) return false;

	if (!prefixStr) return ipBigInt === networkBigInt;

	const prefix = parseInt(prefixStr, 10);
	if (Number.isNaN(prefix)) return false;

	const isIPv6 = ip.includes(":");
	const totalBits = isIPv6 ? 128n : 32n;
	if (prefix < 0 || BigInt(prefix) > totalBits) return false;

	const mask = (1n << totalBits) - (1n << (totalBits - BigInt(prefix)));
	return (ipBigInt & mask) === (networkBigInt & mask);
}

function ipMatchesList(ip: string, list: string[]): boolean {
	for (const entry of list) {
		if (entry.includes("/")) {
			if (ipMatchesCidr(ip, entry)) return true;
		} else if (ip === entry) {
			return true;
		}
	}
	return false;
}

function getRequestIP(req: any): string {
	const forwarded = req.headers["x-forwarded-for"];
	if (forwarded) {
		return (typeof forwarded === "string" ? forwarded : forwarded[0])
			.split(",")[0]
			.trim();
	}
	return req.socket?.remoteAddress || "";
}

export function createIPFilterPlugin(opts: IPFilterOptions): Plugin {
	const allowList = opts.allow
		? Array.isArray(opts.allow)
			? opts.allow
			: [
					opts.allow,
				]
		: [];
	const blockList = opts.block
		? Array.isArray(opts.block)
			? opts.block
			: [
					opts.block,
				]
		: [];
	const statusCode = opts.statusCode ?? 403;
	const message = opts.message ?? "Forbidden";
	const onBlocked = opts.onBlocked;

	return {
		id: "ipFilter",
		process: (req, res, next) => {
			const ip = getRequestIP(req);
			if (allowList.length > 0 && ipMatchesList(ip, allowList)) {
				return next();
			}

			if (blockList.length > 0 && ipMatchesList(ip, blockList)) {
				if (onBlocked) return onBlocked(req, res);
				res.statusCode = statusCode;
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				return res.end(message);
			}

			if (allowList.length > 0 && blockList.length === 0) {
				if (onBlocked) return onBlocked(req, res);
				res.statusCode = statusCode;
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				return res.end(message);
			}

			next();
		},
		before: "rateLimiter",
	};
}
