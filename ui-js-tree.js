import { template } from './lib/ui-js-lib.js';
import { UiJsTreeNode } from './ui-js-tree-node.js';
export { UiJsTreeNodeContainer } from './ui-js-tree-node-container.js';
export { UiJsTreeNode } from './ui-js-tree-node.js';

const tpl = template`
  <slot></slot>
`;

const nodeContainerTpl = template`
  <ui-js-tree-node-container tabindex="-1"></ui-js-tree-node-container>
`;

const nodeTpl = template`
  <ui-js-tree-node tabindex="-1" text=""></ui-js-tree-node>
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
    tpl(this).render(this.shadow);

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

  load(treedata) {
    this.shadow.innerHTML = '';
    // TODO: generate tree nodes

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
    return [...this.querySelectorAll('ui-js-tree-node-container:not(.hidden) > ui-js-tree-node')];
  }

  traverseDownTree(fromNode) {
    if (fromNode.isParent && !fromNode.collapsed)
      return fromNode.querySelector('ui-js-tree-node-container:not(.hidden) > ui-js-tree-node');
    const sibling = fromNode.nextElementSibling;
    if (sibling && sibling instanceof UiJsTreeNode)
      return sibling;
    return fromNode.querySelector('ui-js-tree-node-container:not(.hidden) > ui-js-tree-node');
  }

  traverseUpTree(fromNode) {
    const sibling = fromNode.previousElementSibling;
    if (sibling && sibling instanceof UiJsTreeNode)
      return sibling;
    return fromNode.closest('ui-js-tree-node');
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