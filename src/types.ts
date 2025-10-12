import { RouteHandler } from "@wxn0brp/falcon-frame";

export interface Plugin {
    id: string;
    process: RouteHandler;
    before?: string | string[];
    after?: string | string[];
}

export interface PSOpts {
    before?: string | string[];
    after?: string | string[];
}