import { template } from './lib/ui-js-lib.js';
import { UiJsTreeNodeContainer } from './ui-js-tree-node-container.js';
export { UiJsTreeNodeContainer } from './ui-js-tree-node-container.js';
export { UiJsTreeNode } from './ui-js-tree-node.js';

const tpl = template`
  <style>
    ui-js-tree-node {
      --tree-prefix-color: var(--tree-node-collapse-icon-color, black);
      --tree-arrow-size: var(--tree-node-collapse-arrow-size, 8px);
    }

    ui-js-tree-node-container {
      display: block;
      width: fit-content;
      padding-left: var(--tree-node-left-margin, --tree-arrow-size);
    }

    ui-js-tree-node.parent[collapsed] > ui-js-tree-node-container {
      display: none;
    }

    ui-js-tree-node.parent[collapsed]::before {
      border-top: var(--tree-arrow-size) solid transparent;
      border-bottom: var(--tree-arrow-size) solid transparent;
      border-left: var(--tree-arrow-size) solid var(--tree-prefix-color);
    }

    ui-js-tree-node.parent::before {
      border-left: var(--tree-arrow-size) solid transparent;
      border-right: var(--tree-arrow-size) solid transparent;
      border-top: var(--tree-arrow-size) solid var(--tree-prefix-color);
    }

    ui-js-tree-node::before {
      content: " ";
      box-sizing: border-box;
      border: var(--tree-arrow-size) solid transparent;
      display: inline-block;
      vertical-align: middle;
    }

    ui-js-tree-node.parent {
      cursor: pointer;
    }

    ui-js-tree-node.selected:not(.parent) > span {
      background-color: var(--tree-node-selected-background-color, #336688);
    }

    ui-js-tree-node.selected > span {
      background-color: var(--tree-node-selected-background-color, #336688);
    }

    ui-js-tree-node {
      display: block;
    }
  </style>
`;

export class UiJsTree extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: 'open'});
    this.setAttribute('tabindex', '0');
    this.classList.add('tree-view');

    this.selected = null;
    this.nodeMap = new WeakMap();
    this.initialLevel = 99;
    this.defaultNodeRenderFn = function(data) {
        if (data.label) return data.label;
        if (data.title) return data.title;
        if (data.name) return data.name;
        return data.toString();
    };

    this.keyMap = {
        nextNode: ['ArrowDown', 'Down'],
        prevNode: ['ArrowUp', 'Up'],
        firstNode: ['Home'],
        lastNode: ['End'],
        collapse: ['ArrowLeft', 'Left', '-'],
        expand: ['ArrowRight', 'Right', '+'],
        toggle: [' ', 'Enter']
    };
  }

  async connectedCallback() {

    this.lazy = this.getAttribute('lazy-load') == 'true';

    this.buildNodeMapFromDescendants();

    this.addEventListener('keydown', ev => {

      if (!this.propagateKeys) {
        this.propagateKeys = Object.keys(this.keyMap)
            .map(key => this.keyMap[key])
            .reduce((acc, cur) => acc.concat(cur), []);
      }

      if (this.propagateKeys.indexOf(ev.key) > -1) {
          ev.stopPropagation();
          ev.preventDefault();
      }

      if (this.keyMap.nextNode.indexOf(ev.key) > -1)
        this.nextNode();
      else if (this.keyMap.prevNode.indexOf(ev.key) > -1)
        this.prevNode();
      else if (this.keyMap.firstNode.indexOf(ev.key) > -1)
        this.firstNode();
      else if (this.keyMap.lastNode.indexOf(ev.key) > -1)
        this.lastNode();
      else if (this.keyMap.collapse.indexOf(ev.key) > -1)
        this.collapseNode();
      else if (this.keyMap.expand.indexOf(ev.key) > -1)
        this.expandNode();
      else if (this.keyMap.toggle.indexOf(ev.key) > -1)
        this.toggleState();
    });
  }

  load(treeData) {
    tpl(this).render(this.shadow);
    // generate tree node elements
    const levelExpand = this.hasAttribute("expanded-level") ? (parseInt(this.getAttribute("expanded-level")) || 2) : 2;
    this.shadow.appendChild(new UiJsTreeNodeContainer(treeData, levelExpand, 0, this.lazy));
    this.buildNodeMapFromDescendants();
  }

  buildNodeMapFromDescendants() {
    var nodes = this.querySelectorAll('ui-js-tree-node');
    this.nodeList = [...nodes];
    this.nodeMap = this.nodeList.reduce((acc, cur) => {
      acc.set(cur.data, cur);
      return acc;
    }, new WeakMap());
  }

  getVisibleNodeList() {
    return [...this.shadow.querySelectorAll('ui-js-tree-node-container:not(.hidden) > ui-js-tree-node')];
  }

  traverseDownTreeData(data, func, parent) {
    var travData = Array.isArray(data) ? data : [data];
    for (let nodeData of travData) {
        if (func.call(this, nodeData, parent) === false)
            return false;
        if (!nodeData.children || !Array.isArray(nodeData.children))
          continue;

        for (let childNodeData of nodeData.children) {
            if (this.traverseDownTreeData(childNodeData, func, nodeData) === false)
                break;
        }
    }
  }

  setSelected(nodeElement) {
    if (!nodeElement)
      return;
    if (this.selected)
        this.selected.classList.remove('selected');
    nodeElement.classList.add('selected');
    this.selected = nodeElement;
    this.selected.focus();
  }

  findNextNode(fromNode) {
    const nodeList = this.getVisibleNodeList();
    let index = nodeList.indexOf(fromNode) + 1;
    return index < nodeList.length ? nodeList[index] : undefined;
  }

  findPrevNode(fromNode) {
    const nodeList = this.getVisibleNodeList();
    const index = Math.max(nodeList.indexOf(fromNode) - 1, 0);
    return index >= 0 ? nodeList[index] : undefined;
  }

  nextNode() {
    const nextNode = this.findNextNode(this.selected || this);
    this.setSelected(nextNode);
  }

  prevNode() {
    const prevNode = this.findPrevNode(this.selected || this);
    this.setSelected(prevNode);
  }

  firstNode() {
    const firstNode = this.nodeList.length > 0 ? this.nodeList[0] : undefined;
    this.setSelected(firstNode);
  }

  lastNode() {
    const lastNode = this.nodeList.length - 1 >= 0 ? this.nodeList[this.nodeList.length - 1] : undefined;
    this.setSelected(lastNode);
  }

  collapseNode() {
    if (this.selected)
      this.selected.collapsed = true;
  }

  expandNode() {
    if (this.selected)
      this.selected.collapsed = false;
  }

  toggleState() {
    if (this.selected)
      this.selected.collapsed = !this.selected.collapsed;
  }

}

customElements.define('ui-js-tree', UiJsTree);