# Welcome to ui-js-tree-wc

A javascript Ui tree view web component, created in vanilla javascript.

## Features:
- Support WCAG specification for accessibility
- Full keyboard navigation and control (according to WCAG recommendation)
- Multi selection
- Extensive css variables for customized styling
- Custom elements with minimal footprint
- No external dependencies
- Modern browser support

## ui-js-tree element
**Attributes:**
- expanded-level (integer value 0..n) : how many node levels to expand initially
- lazy-load (no value) : lazy load child nodes when parent node is expanded
- multi-select (no value) : enable multi select nodes

**Properties:**
- selected : first/only selected node
- selection : all selected nodes

**Methods:**
- load(treeData) : Load nodes from JSON tree structured data
- reload() : Reload/rerender nodes from existing data
- getVisibleNodeList() : Get array of visible tree nodes
- toggleSelection(nodeElement, multiselect) : Toggle node selection
- clearSelection() : Clear selections
- setFocused(nodeElement) : Focus node
- isSelected(nodeElement) : Return true if node is selected
- nodeIndex(nodeElement) : Index of node
- getNode(index) : Get node by index
- findNodeBy(predicate) : Find a node by predicate, example: tree.findNodeBy(node => node.data.text == 'test')
- findAndLoadNodeByData(predicate, expandTo) : Find a node by predicate (if expandTo == true, expand children to ensure node is visible), example: tree.findAndLoadNodeByData(nodeData => nodeData.value == 'test', true)
- findNextNode(fromNode) : Find next node from a node
- findPrevNode(fromNode) : Find previous node from a node
- collapseNode() : Collapse focused node
- expandNode() : Expand focused node
- toggleState() : Toggle focused node between selected and not selected
- nextNode(select) : Focus next node (select node if select is true)
- prevNode(select) : Focus previous node (select node if select is true)
- firstNode(select) : Focus first node (select node if select is true)
- lastNode(select) : Focus last node (select node if select is true)

**css variables**
--tree-node-left-margin:
--tree-node-arrow-size:
--tree-node-selected-background-color:
--tree-node-selected-text-color:
--tree-node-background-hover:
--tree-node-text-color:
--tree-node-text-color-hover:
--tree-node-text-padding:
--tree-node-text-margin:
--tree-node-text-font-family:
--tree-node-text-font-size:
--tree-node-border-radius:
--tree-node-collapsed-icon-url:
--tree-node-expanded-icon-url:
