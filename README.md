# Welcome to ui-js-tree-wc

A javascript Ui tree view web component, created in vanilla javascript.

## Features:
- Support WCAG specification for accessibility
- Full keyboard navigation and control
- Multi selection
- Extensive css variables for customized styling
- Custom elements with minimal footprint
- No external dependencies
- Modern browser support

## ui-js-tree element
**Attributes:**
- expanded-level (integer value 0..n) : how many node levels to expand initially
- lazy-load (value none) : lazy load nodes when parent node is expanded
- multi-select (value none) : enable multi select nodes

**Methods:**
- load(treeData) : Load nodes from JSON tree structured data
- reload() : Reload/rerender nodes from existing data
- getVisibleNodeList() : Get array of visible tree nodes
