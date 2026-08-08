import { Plugin } from "../types.js";
export interface IPFilterOptions {
    allow?: string | string[];
    block?: string | string[];
    statusCode?: number;
    message?: string;
    onBlocked?: (req: any, res: any) => void;
}
export declare function createIPFilterPlugin(opts: IPFilterOptions): Plugin;
