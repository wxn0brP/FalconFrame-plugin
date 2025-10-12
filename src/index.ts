import { FFRequest, FFResponse, RouteHandler } from "@wxn0brp/falcon-frame";
import { sortPlugins } from "./sort";
import { Plugin, PSOpts } from "./types";

export class PluginSystem {
    public plugins: Plugin[] = [];
    public _sorted = false;

    /**
     * Registers a plugin with the system.
     * If the opts.after or opts.before properties are provided, they will be used to set the after and before properties of the plugin respectively.
     * If the plugins have already been sorted, the plugins will be re-sorted after registration.
     * @param plugin The plugin to register
     * @param opts Options for registering the plugin
     */
    public register(plugin: Plugin, opts: PSOpts = {}) {
        if (opts.after) plugin.after = opts.after;
        if (opts.before) plugin.before = opts.before;

        this.plugins.push(plugin);
        if (this._sorted) this._sort();
    }

    /**
     * Sorts the plugins using the sortPlugins function and marks them as sorted
     */
    public _sort() {
        this.plugins = sortPlugins(this.plugins);
        this._sorted = true;
    }

    /**
     * Returns a RouteHandler function that executes all registered plugins in the correct order
     * When called, it will first sort the plugins if they haven't been sorted yet
     * Then it will return a function that takes a request, response, and next function as arguments
     * This returned function will recursively execute all plugins in the correct order
     * @returns A RouteHandler function
     */
    public getRouteHandler(): RouteHandler {
        this._sort();
        return (req, res, next) => {
            return this.executePlugins(req, res, next, 0);
        };
    }

    /**
     * Recursively executes plugins in the correct order
     * @param req - Request object
     * @param res - Response object
     * @param next - Next function
     * @param index - Current index in the execution order
     */
    private executePlugins(
        req: FFRequest,
        res: FFResponse,
        next: () => void,
        index: number,
    ): void {
        if (index >= this.plugins.length) return next();

        this.plugins[index].process(req, res, () => {
            this.executePlugins(req, res, next, index + 1);
        });
    }
}