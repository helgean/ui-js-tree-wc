ui-js-tree-wc

# Welcome to ui-js-tree-wc

A javascript Ui tree view web component, created in vanilla javascript.

## features

* Fast render
* Custom node render
* Select callback function
* Render nodes from supplied JSON object or array
* Customize with css variables
* Modern custom element with shadow dom
* Keyboard mapping for navigation, expand, collapse etc.
* Focusable

## plunckr demo TODO:
[Plunker demo](https://embed.plnkr.co/).


## getting started

1. Get the latest version with yarn, bower or npm:
```yarn add ui-js-tree-wc```
or
```npm install ui-js-tree-wc```

2. Add the following to your html:
```html
<link rel="stylesheet" href="[the relative path to ui-js-tree]/css/ui-js-tree.css">
<script type="module src="[the relative path to ui-js-tree]/ui-js-tree.js"></script>
```

3. Add the following to a .js file and include it in your web page at the end of your body tag:
```javascript
var treeData = {
  title: 'root',
  children: [{
    title: 'child',
    children: [{
      title: 'grandchild'
    }]
  },{
    title: 'collapsedchild',
    collapsed: true,
    children: [{
      title: 'collapsedgrandchild'
    }]
  }]
};

//Optional options
var treeOptions = {
  initialLevel: 2,
  lazyRender: true,
  nodeRenderFn: function(data, el) {
    return data.title;
  },
  onSelect: function(data, el) {
    //Do something when a node is selected
    console.log(data);
  },
  onBeforeSelect: function(data, el) {
    //Do something before a node is selected
    console.log(data);
  },
  onExpand: function(data, el) {
    //Do something when a node is expanded
    console.log(data);
  },
  onBeforeExpand: function(data, el) {
    //Do something before a node is expanded
    console.log(data);
  },
  onCollapse: function(data, el) {
    //Do something when a node is collapsed
    console.log(data);
  },
  onBeforeCollapse: function(data, el) {
    //Do something before a node is collapsed
    console.log(data);
  }
};

var uitree = new UiJsTree(treeData, document.body, treeOptions);
uitree.render();
```

4. Use with javascript frameworks:
Look at the samples for several frameworks available at:
https://bitbucket.org/helgeander/ui-js-tree/src

## tree data options
* **collapsed** - Node is initial collapsed
* **children** - Nodes children array

## tree options

* **initialLevel** - Initial expand level (default = 99)
* **cloneData**    - If false the tree data is not cloned (be careful if multiple tree instances share the same data)
* **lazyRender**   - Do not render or create elements beyond initialLevel on render or load (default = false)
* **nodeRenderFn** - Node render function (optional custom render function for node)
* **onSelect**     - Select callback function (Supplied function is called each time a node is selected)
* **onBeforeSelect** - Before select callback function (Supplied function is called each time before a node is selected)
* **onExpand**     - Expand callback function (Supplied function is called each time a node is expanded)
* **onBeforeExpand** - Before expand callback function (Supplied function is called each time before a node is expanded)
* **onCollapse**     - Collapse callback function (Supplied function is called each time a node is collapsed)
* **onBeforeCollapse** - Before collapse callback function (Supplied function is called each time before a node is collapsed)
* **onClick**      - Node click callback function (Supplied function is called each time a node is clicked)
* **onKeyPress**   - Tree key press callback function (Supplied function is called each time a key is pressed while tree is focused)

Example:
```javascript
{
  initialLevel: 2,
  lazyRender: true,
  nodeRenderFn: function(data, el) {
    return data.title;
  },
  onSelect: function(data, el) {
    console.log(data.title);
  }
}
```

Example with element as return value from nodeRenderFn (demonstrated in vue js example):
```javascript
{
  initialLevel: 2,
  lazyRender: true,
  nodeRenderFn: function(data, el) {
    let span = document.createElement('span')
    let icon = document.createElement('i')
    icon.setAttribute('class', 'material-icons')
    icon.appendChild(document.createTextNode('face'))
    span.appendChild(icon)
    span.appendChild(document.createTextNode(node.title))
    return span
  },
  onSelect: function(data, el) {
    console.log(data.title);
  }
}
```

## tree constructor
```javascript
var treeView = new new UiJsTree(
// Tree data
[{
  title: 'root',
  children: [{
    title: 'child1'
  }, {
    title: 'child2'
  }]
}],

// Element to render to
document.getElementById('treeview'),

//Tree options
{
  onSelect: function(data, el) {
    console.log(data);
  }
});

// Render tree
treeView.render();
```

## Requirements to get selected node scrolled into view

The parent element should have `overflow: auto` and `position: relative` or `position: absolute` and a height, to be able to scroll a node into view when it is selected by key navigation or by code.


## tree api

* **methods**

  * ```load(data)``` : Load new tree data
    * Arguments:
      * `data : Element`  A hierarcical data structure

  * ```filter(predicate, limit)``` : Filter the nodes in the tree with a supplied predicate function which receives the node data as an argument, and must return true or false. Limit can be used to limit the amount of returned nodes. The result will be displayed as a flat list.
    * Arguments:
      * `predicate : function(data)`
      * `limit: integer` [1..n]

  * ```render()``` : Render the tree and reset any filter

  * ```selectBy(predicate, scrollIntoFocus, supressEvents)``` : Select a node in the tree with a supplied predicate function which receives the node (object with the data and el as properties) as an argument, and must return true or false. The first true result will abort the search and select the current node.
    * Arguments:
      * `predicate: function(node)`
      * `scrollIntoFocus : boolean`
      * `supressEvents: boolean`

  * `getNodeData(el)` : Get a node data object from a tree node element
    * Arguments:
      * `el: Element`  The node element to get the node data by

  * ```getEl(nodeData)``` : Get a node element from a tree node data object
    * Arguments:
      * `nodeData: Object`  The node data to get the element by

  * ```getNodeObj(nodeData)``` : Get a node object from a tree node data object
    * Arguments:
      * `nodeData: Object`  The node data to get the mapped node by

  * ```expandAll(supressEvents)``` : Expand all nodes
    * Arguments:
      * `supressEvents: boolean`

  * ```collapseAll(supressEvents)``` : Collapse all nodes
    * Arguments:
      * `supressEvents: boolean`

  * ```expandNode(nodeData, recursive, supressEvents)``` : Expand the optional node argument or the selected node
    * Arguments:
      * `nodeData: Object`  The optional node to expand
      * `recursive : boolean`  Expand recursive if true
      * `supressEvents: boolean`

  * ```collapseNode(nodeData, supressEvents)``` : Collapse the optional node argument or the selected node
    * Arguments:
      * `nodeData: Object`  The optional node to collapse
      * `supressEvents: boolean`

  * ```firstNode()``` : Select and scroll to the first node

  * ```lastNode()``` : Select and scroll to the last node

  * ```nextNode()``` : Select the scroll to next node

  * ```prevNode()``` : Select the scroll to prev node

  * ```addToNode(newData, nodeData)``` : Add new child nodes to existing node data
    * Arguments:
        * `newData: Object or Array`
        * `nodeData: Object` existing nodeData object

  * ```traverse(func, fromNode)``` : Traverse the tree data
    * Arguments:
        * `func: Object or Array` the callback function for each data node
        * `fromNode: Object` the node to traverse down from

* **properties**

  * ```selected``` : The selected node data object

  * ```focusEl``` : The focus element of the tree

  * ```treeData``` : The tree data

  * ```nodeMap``` : The tree data as a mapped keyed node objects in indexed order from top to bottom

  * ```initialLevel``` : The initial node levels to expand/show

  * ```keyMap``` : An object with key event mapping, can be used to customize the key navigation mapping

  * ```selectOnKeyEvent``` : If false, key navigation does not trigger the onSelect callback
