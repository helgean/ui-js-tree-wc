import { template } from './lib/ui-js-lib.js';
import { UiJsTreeNodeContainer } from './ui-js-tree-node-container.js';
export { UiJsTreeNodeContainer };
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

    this.selection = [];
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

    this.lazy = this.hasAttribute('lazy-load');
    this.multiSelect = this.hasAttribute('multi-select');

    this._buildNodeMapFromDescendants();

    this.addEventListener('focusout', ev => {
      this.focused = null;
    });

    this.addEventListener('focusin', ev => {
      if (!this.focused && this.selected)
        this.setFocused(this.selected);
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
      else if (this.keyMap.nextNode.indexOf(ev.key) > -1) {
        this.nextNode(ev.shiftKey);
      } else if (this.keyMap.prevNode.indexOf(ev.key) > -1) {
        this.prevNode(ev.shiftKey);
      } else if (this.keyMap.firstNode.indexOf(ev.key) > -1) {
        this.firstNode(ev.shiftKey);
      } else if (this.keyMap.lastNode.indexOf(ev.key) > -1) {
        this.lastNode(ev.shiftKey);
      } else if (this.keyMap.collapse.indexOf(ev.key) > -1) {
        this.collapseNode();
      } else if (this.keyMap.expand.indexOf(ev.key) > -1) {
        this.expandNode();
      } else if (this.keyMap.toggle.indexOf(ev.key) > -1) {
        this.toggleState();
      }
    });

    this.shadow.addEventListener('ui-js-tree-node-click', ev => {
      this.toggleSelection(ev.target, this.multiSelect && ev.detail.originalEvent.ctrlKey);
    });

    this.shadow.addEventListener('ui-js-tree-container-load', () => {
      this.updateNodes();
    });
  }

  load(treeData) {
    this.data = treeData;
    this.reload();
  }

  reload() {
    if (this.data) {
      tpl(this).render(this.shadow);
      // generate tree node elements
      const levelExpand = this.hasAttribute("expanded-level") ? (parseInt(this.getAttribute("expanded-level")) || 2) : 2;
      this.shadow.appendChild(new UiJsTreeNodeContainer(this.data, levelExpand, 0, this.lazy));
      this._buildNodeMapFromDescendants();
    }
  }

  updateNodes() {
    this._buildNodeMapFromDescendants();
  }

  _buildNodeMapFromDescendants() {
    const nodes = this.shadow.querySelectorAll('ui-js-tree-node');
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
    const travData = Array.isArray(data) ? data : [data];
    for (let nodeData of travData) {
        if (func(nodeData, parent) === false)
            return false;
        if (!nodeData.children || !Array.isArray(nodeData.children))
          continue;

        for (let childNodeData of nodeData.children) {
            if (this.traverseDownTreeData(childNodeData, func, nodeData) === false)
                break;
        }
    }
  }

  toggleSelection(nodeElement, multiselect) {
    if (!nodeElement)
      return;

    const selectIndex = this.selection.indexOf(nodeElement);
    const wasSelected = selectIndex > -1;

    if (!multiselect)
      this.clearSelection();

    if (wasSelected && multiselect) {
      this._deselect(nodeElement, selectIndex);
    } else {
      this._select(nodeElement);
      nodeElement.focus();
    }

    this.dispatchEvent(new CustomEvent(wasSelected ? 'ui-js-tree-node-deselected' : 'ui-js-tree-node-selected', {
      bubbles: true,
      detail: {
        node: nodeElement
      }
    }));

    this.dispatchEvent(new CustomEvent('ui-js-tree-node-selection-change', {
      bubbles: true,
      detail: {
        node: nodeElement,
        selected: this.isSelected(nodeElement)
      }
    }));

    console.log(this.selection);
  }

  _select(nodeElement) {
    this.selection.push(nodeElement);
    nodeElement.classList.add('selected');
    nodeElement.setAttribute('aria-selected', '');
  }

  _deselect(nodeElement, selectedIndex) {
    this.selection.splice(selectedIndex, 1);
    nodeElement.classList.remove('selected');
    nodeElement.removeAttribute('aria-selected');
  }

  clearSelection() {
    for (let selected of this.selection) {
      selected.classList.remove('selected');
      selected.removeAttribute('aria-selected');
    }
    this.selection = [];
  }

  setFocused(nodeElement) {
    if (!nodeElement)
      return;
    this.focused = nodeElement;
    nodeElement.focus();
    this.dispatchEvent(new CustomEvent('ui-js-tree-node-focused', {
      bubbles: true,
      detail: {
        node: this.focused
      }
    }));
  }

  isSelected(nodeElement) {
    return nodeElement.classList.contains('selected');
  }

  nodeIndex(nodeElement) {
    return this.nodeList.indexOf(nodeElement);
  }

  getNode(index) {
    return this.nodeList[index];
  }

  /**
   * Find node by predicate if node is loaded
   * @param {*} predicate, example predicate: node => node.data.id === 123
   * @returns first node where predicate returns true, undefined otherwise
   */
  findNodeBy(predicate) {
    return this.nodeList.find(predicate);
  }

  findAndLoadNodeByData(predicate, expandTo) {
    let foundNode = undefined;

    this.traverseDownTreeData(this.data, (nodeData, parent) => {
      if (!this.nodeMap.has(nodeData))
        this.nodeMap.get(parent).loadChildren(expandTo);
      if (predicate(nodeData)) {
        foundNode = this.nodeMap.get(nodeData);
        return false;
      }
    });

    return foundNode;
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

  nextNode(select) {
    const nextNode = this.findNextNode(this.focused || this.selected || this);
    this.setFocused(nextNode);
    if (select) this.toggleState();
  }

  prevNode(select) {
    const prevNode = this.findPrevNode(this.focused || this.selected || this);
    this.setFocused(prevNode);
    if (select) this.toggleState();
  }

  firstNode(select) {
    const firstNode = this.nodeList.length > 0 ? this.nodeList[0] : undefined;
    if (select && firstNode) {
      const startIndex = 0;
      const endIndex = this.nodeIndex(this.focused || this.selected);
      for (let i=startIndex; i<=endIndex; i++) {
        const node = this.getNode(i);
        if (this.isSelected(node))
          this._deselect(this.getNode(i), i);
        else
          this._select(this.getNode(i));
      }
    }
    this.setFocused(firstNode);

  }

  lastNode(select) {
    const lastNode = this.nodeList.length - 1 >= 0 ? this.nodeList[this.nodeList.length - 1] : undefined;
    if (select && lastNode) {
      const startIndex = this.nodeIndex(this.focused || this.selected);
      const endIndex = this.nodeList.length - 1;
      for (let i=startIndex; i<=endIndex; i++) {
        const node = this.getNode(i);
        if (this.isSelected(node))
          this._deselect(this.getNode(i), i);
        else
          this._select(this.getNode(i));
      }
    }
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
    this.toggleSelection(this.focused, this.multiSelect);
  }

  get selected() {
    return Array.isArray(this.selection) && this.selection.length > 0 ? this.selection[0] : undefined;
  }

  get selection() {
    return Array.isArray(this.selection) && this.selection.length > 0 ? this.selection : [];
  }

}

customElements.define('ui-js-tree', UiJsTree);