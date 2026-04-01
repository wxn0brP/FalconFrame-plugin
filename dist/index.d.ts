import { RouteHandler } from "@wxn0brp/falcon-frame";
import { Plugin, PSOpts } from "./types.js";
export declare class PluginSystem {
    plugins: Plugin[];
    _sorted: boolean;
    /**
     * Registers a plugin with the system.
     * If the opts.after or opts.before properties are provided, they will be used to set the after and before properties of the plugin respectively.
     * If the plugins have already been sorted, the plugins will be re-sorted after registration.
     * @param plugin The plugin to register
     * @param opts Options for registering the plugin
     */
    register(plugin: Plugin, opts?: PSOpts): void;
    /**
     * Sorts the plugins using the sortPlugins function and marks them as sorted
     */
    _sort(): void;
    /**
     * Returns a RouteHandler function that executes all registered plugins in the correct order
     * When called, it will first sort the plugins if they haven't been sorted yet
     * Then it will return a function that takes a request, response, and next function as arguments
     * This returned function will recursively execute all plugins in the correct order
     * @returns A RouteHandler function
     */
    getRouteHandler(): RouteHandler;
    /**
     * Recursively executes plugins in the correct order
     * @param req - Request object
     * @param res - Response object
     * @param next - Next function
     * @param index - Current index in the execution order
     */
    private executePlugins;
}
