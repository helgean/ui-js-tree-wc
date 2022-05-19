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
- lazy-load (no value) : lazy load nodes when parent node is expanded
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
