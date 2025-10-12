/*
 * Copyright (c) 2012 by Marcel Klehr <mklehr@gmx.net>
 * Modified and rewritten by wxn0brP (2025)
 * Licensed under the MIT License
 */

type Edge<T> = [T, T];

function makeOutgoingEdges<T>(edges: Edge<T>[]): Map<T, Set<T>> {
    const outgoingEdges = new Map<T, Set<T>>();

    for (const [from, to] of edges) {
        if (!outgoingEdges.has(from)) {
            outgoingEdges.set(from, new Set());
        }
        if (!outgoingEdges.has(to)) {
            outgoingEdges.set(to, new Set());
        }
        outgoingEdges.get(from)!.add(to);
    }

    return outgoingEdges;
}

function makeNodesHash<T>(nodes: T[]): Map<T, number> {
    const hash = new Map<T, number>();
    nodes.forEach((node, index) => {
        hash.set(node, index);
    });
    return hash;
}

export function sort<T>(nodes: T[], edges: Edge<T>[]): T[] {
    const cursor = { value: nodes.length };
    const sorted: T[] = new Array(cursor.value);
    const visited = new Set<number>();
    const outgoingEdges = makeOutgoingEdges(edges);
    const nodesHash = makeNodesHash(nodes);

    for (const [from, to] of edges) {
        if (!nodesHash.has(from) || !nodesHash.has(to)) {
            throw new Error("Unknown node. There is an unknown node in the supplied edges.");
        }
    }

    for (let i = nodes.length - 1; i >= 0; i--) {
        if (!visited.has(i)) {
            visit(nodes[i], i, new Set<T>());
        }
    }

    return sorted;

    function visit(node: T, index: number, predecessors: Set<T>): void {
        if (predecessors.has(node)) {
            let nodeRep = "";
            try {
                nodeRep = `, node was: ${JSON.stringify(node)}`;
            } catch (e) {
                nodeRep = "";
            }
            throw new Error(`Cyclic dependency ${nodeRep}`);
        }

        if (!nodesHash.has(node)) {
            throw new Error(`Found unknown node. Make sure to provide all involved nodes. Unknown node: ${JSON.stringify(node)}`);
        }

        if (visited.has(index)) return;
        visited.add(index);

        const outgoing = outgoingEdges.get(node) || new Set<T>();
        const outgoingArray = Array.from(outgoing);

        if (outgoingArray.length > 0) {
            predecessors.add(node);
            for (const child of outgoingArray) {
                const childIndex = nodesHash.get(child)!;
                visit(child, childIndex, predecessors);
            }
            predecessors.delete(node);
        }

        sorted[--cursor.value] = node;
    }
}