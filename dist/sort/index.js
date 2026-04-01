import { sort } from "./lib.js";
export function sortPlugins(plugins) {
    const edges = [];
    const ids = new Set();
    for (const plugin of plugins) {
        if (ids.has(plugin.id)) {
            throw new Error(`Duplicate plugin id: "${plugin.id}"`);
        }
        ids.add(plugin.id);
    }
    for (const plugin of plugins) {
        const { id, before, after } = plugin;
        const addEdge = (from, to) => {
            if (from !== to && ids.has(from) && ids.has(to)) {
                edges.push([from, to]);
            }
        };
        if (before) {
            const beforeList = Array.isArray(before) ? before : [before];
            for (const b of beforeList)
                addEdge(id, b);
        }
        if (after) {
            const afterList = Array.isArray(after) ? after : [after];
            for (const a of afterList)
                addEdge(a, id);
        }
    }
    const sortedIds = sort([...ids], edges);
    const byId = new Map(plugins.map(p => [p.id, p]));
    return sortedIds.map(id => byId.get(id));
}
