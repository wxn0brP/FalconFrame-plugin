import { FinalHandler } from "@wxn0brp/falcon-frame";
import { Plugin } from "../types.js";
export interface IPFilterOptions {
    allow?: string | string[];
    block?: string | string[];
    statusCode?: number;
    message?: string;
    onBlocked?: FinalHandler;
}
export declare function createIPFilterPlugin(opts: IPFilterOptions): Plugin;
