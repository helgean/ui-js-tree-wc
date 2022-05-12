import { template } from './lib/ui-js-lib.js';
import { UiJsTreeNodeContainer } from './ui-js-tree-node-container.js';
export { UiJsTreeNodeContainer } from './ui-js-tree-node-container.js';
export { UiJsTreeNode } from './ui-js-tree-node.js';

const tpl = template`
  <style>
    ui-js-tree-node {
      --tree-prefix-color: var(--tree-node-collapse-icon-color, black);
      --tree-arrow-size: var(--tree-node-collapse-arrow-size, 8px);
      cursor: var(--tree-node-cursor, pointer);
      outline: none;
    }

    ui-js-tree-node-container {
      display: block;
      width: fit-content;
      padding-left: var(--tree-node-left-margin, --tree-arrow-size);
    }

    ui-js-tree-node.parent[collapsed] > ui-js-tree-node-container {
      display: none;
    }

    ui-js-tree-node > .caret {
      fill: var(--tree-node-collapse-icon-color);
      color: var(--tree-node-collapse-icon-color);
      display: inline-block;
      align-self: center;
      width: var(--tree-node-arrow-size, 20px);
      height: var(--tree-node-arrow-size, 20px);
    }

    ui-js-tree-node.parent[collapsed] > .caret {
      background: var(--tree-node-collapsed-icon-url, url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>'));
    }

    ui-js-tree-node.parent > .caret {
      background: var(--tree-node-expanded-icon-url, url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>'));
    }

    ui-js-tree-node > span {
      display: inline-block;
      white-space: nowrap;
      padding: var(--tree-node-text-padding, 2px);
      margin: var(--tree-node-text-margin, 0);
      border-radius: var(--tree-node-border-radius, 2px);
      font-size: var(--tree-node-text-font-size, inherit);
      font-family: var(--tree-node-text-font-family, inherit)
    }

    ui-js-tree-node > span:hover {
      background-color: var(--tree-node-background-hover);
      color: var(--tree-node-text-color-hover);
    }

    ui-js-tree-node.parent {
      cursor: pointer;
    }

    ui-js-tree-node.selected:not(.parent) > span {
      background-color: var(--tree-node-selected-background-color, #336688);
    }

    ui-js-tree-node.selected > span {
      background-color: var(--tree-node-selected-background-color, #336688);
      color: var(--tree-node-selected-text-color);
    }

    ui-js-tree-node:focus {
      outline: none;
    }

    ui-js-tree-node:focus > span {
      box-shadow: inset 0 0 1px var(--tree-node-focused-border-width, 1px) var(--tree-node-focused-border-contrast-color, #336688), inset 0 0 2px var(--tree-node-focused-border-contrast-width, 2px) var(--tree-node-focused-border-contrast-color, white), 0 0 1px var(--tree-node-focused-border-width, 1px) var(--tree-node-focused-border-color, #336688);
    }

    ui-js-tree-node {
      display: grid;
      grid-template-columns: var(--tree-node-caret-size, 20px) 1fr;
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
    this.focused = null;
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
        expand: ['+'],
        expandOrFirstChild: ['ArrowRight', 'Right'],
        toggle: [' ', 'Enter']
    };
  }

  async connectedCallback() {

    this.setAttribute('role', 'tree');

    this.lazy = this.getAttribute('lazy-load') == 'true';

    this.buildNodeMapFromDescendants();

    this.addEventListener('focusout', ev => {
      this.focused = null;
    });

    this.addEventListener('focusin', ev => {
      if (!this.focused && this.selected)
        this.selected.focus();
    });

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

      if (this.keyMap.expandOrFirstChild.indexOf(ev.key) > -1)
        this.expandOrFirstChild();
      else if (this.keyMap.nextNode.indexOf(ev.key) > -1)
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

    this.shadow.addEventListener('ui-js-tree-node-click', ev => {
      this.setSelected(ev.target);
    });
  }

  load(treeData) {
    tpl(this).render(this.shadow);
    this.data = treeData;
    // generate tree node elements
    const levelExpand = this.hasAttribute("expanded-level") ? (parseInt(this.getAttribute("expanded-level")) || 2) : 2;
    this.shadow.appendChild(new UiJsTreeNodeContainer(treeData, levelExpand, 0, this.lazy));
    this.buildNodeMapFromDescendants();
  }

  reload() {
    if (this.data) {
      tpl(this).render(this.shadow);
      // generate tree node elements
      const levelExpand = this.hasAttribute("expanded-level") ? (parseInt(this.getAttribute("expanded-level")) || 2) : 2;
      this.shadow.appendChild(new UiJsTreeNodeContainer(this.data, levelExpand, 0, this.lazy));
      this.buildNodeMapFromDescendants();
    }
  }

  buildNodeMapFromDescendants() {
    var nodes = this.shadow.querySelectorAll('ui-js-tree-node');
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
    if (this.selected) {
        this.selected.classList.remove('selected');
        nodeElement.removeAttribute('aria-selected');
    }
    nodeElement.classList.add('selected');
    nodeElement.setAttribute('aria-selected', true);
    this.selected = nodeElement;
    this.selected.focus();
    this.dispatchEvent(new CustomEvent('ui-js-tree-node-selected', {
      bubbles: true,
      detail: {
        node: this.selected,
        data: this.selected.data
      }
    }));
  }

  setFocused(nodeElement) {
    if (!nodeElement)
      return;
    this.focused = nodeElement;
    nodeElement.focus();
    this.dispatchEvent(new CustomEvent('ui-js-tree-node-focused', {
      bubbles: true,
      detail: {
        node: this.focused,
        data: this.focused.data
      }
    }));
  }

  /**
   * Find node by predicate
   * @param {*} predicate, example predicate: node => node.data.id === 123
   * @returns first node where predicate returns true, undefined otherwise
   */
  findNodeBy(predicate) {
    return this.nodeList.find(predicate);
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
    const nextNode = this.findNextNode(this.focused || this.selected || this);
    this.setFocused(nextNode);
  }

  prevNode() {
    const prevNode = this.findPrevNode(this.focused || this.selected || this);
    this.setFocused(prevNode);
  }

  firstNode() {
    const firstNode = this.nodeList.length > 0 ? this.nodeList[0] : undefined;
    this.setFocused(firstNode);
  }

  lastNode() {
    const lastNode = this.nodeList.length - 1 >= 0 ? this.nodeList[this.nodeList.length - 1] : undefined;
    this.setFocused(lastNode);
  }

  collapseNode() {
    if (this.focused)
      this.focused.collapsed = true;
  }

  expandNode() {
    if (this.focused)
      this.focused.collapsed = false;
  }

  expandOrFirstChild() {
    if (this.focused) {
      if (this.focused.collapsed)
        this.expandNode();
      else if (this.focused.isParent)
        this.nextNode();
    }
  }

  toggleState() {
    if (this.focused && this.selected != this.focused)
      this.setSelected(this.focused);
  }

}

customElements.define('ui-js-tree', UiJsTree);