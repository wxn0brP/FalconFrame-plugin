# FalconFrame Plugin System

A flexible plugin system for the **FalconFrame** framework, allowing developers to register, sort, and execute plugins in a specific order based on dependencies.

## Overview

The **FalconFrame Plugin System** provides a robust way to manage plugins for FalconFrame applications. It supports dependency management using `before` and `after` constraints, ensuring that plugins are executed in the correct order. The system uses a **topological sort** algorithm to handle complex dependency chains and detect circular dependencies.

## Installation

```bash
npm install @wxn0brp/falcon-frame-plugin
# and FalconFrame if not already installed
npm install @wxn0brp/falcon-frame 
```

## Features

* **Plugin Registration** – Register plugins with optional dependency constraints.
* **Dependency Management** – Specify `before` and `after` relationships between plugins.
* **Automatic Sorting** – Plugins are automatically ordered based on dependencies.
* **Circular Dependency Detection** – Throws errors when circular dependencies are detected.
* **Route Handler Integration** – Seamless integration with FalconFrame's routing system.

## Usage

### Basic Example

```typescript
import { PluginSystem } from "@wxn0brp/falcon-frame-plugin";
import { FalconFrame } from "@wxn0brp/falcon-frame";

const app = new FalconFrame();
const pluginSystem = new PluginSystem();

// Register a plugin
pluginSystem.register({
  	id: "my-plugin",
  	process: (req, res, next) => {
  	  	console.log("Executing my plugin");
  	  	next();
  	}
});

// Register multiple plugins
app.use(pluginSystem);
```

### Plugin with Dependencies

```typescript
pluginSystem.register({
  	id: "auth-plugin",
  	process: (req, res, next) => {
  	  	// Authentication logic
  	  	next();
  	},
  	before: "data-plugin"  // Runs before "data-plugin"
});

pluginSystem.register({
  id: "data-plugin",
  	process: (req, res, next) => {
  	  	// Data processing logic
  	  	next();
  	},
  	after: "auth-plugin"   // Runs after "auth-plugin"
});
```

## Plugin Interface

```typescript
interface Plugin {
  	id: string;                 // Unique identifier for the plugin
  	process: RouteHandler;      // Function executed when the plugin runs
  	before?: string | string[]; // Plugin(s) that should run after this one
  	after?: string | string[];  // Plugin(s) that should run before this one
}
```

## API

### `PluginSystem.register(plugin: Plugin, opts?: PSOpts)`

Registers a plugin with the system. If `opts.after` or `opts.before` are provided, they will define the execution order. Plugins are re-sorted automatically after registration.

### `PluginSystem.getRouteHandler(): RouteHandler`

Returns a **RouteHandler** that executes all registered plugins in the correct order. It will sort the plugins if they haven’t been sorted yet, then execute them recursively.

## Sorting Algorithm

The system uses a **topological sort** to:

* Detect circular dependencies and throw errors
* Ensure correct execution order based on dependencies
* Prevent duplicate plugin IDs

## Contributing

Contributions are welcome! Please open an issue or pull request for bug reports, feature requests, or improvements.

## License

MIT License – see the [LICENSE](LICENSE) file for details.