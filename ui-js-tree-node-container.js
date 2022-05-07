import { UiJsTreeNode } from './ui-js-tree-node.js';

export class UiJsTreeNodeContainer extends HTMLElement {
  constructor(data, expandToLevel, currentLevel, lazy) {
    super();
    this._expandToLevel = expandToLevel;
    this.level = currentLevel;
    this._data = Array.isArray(data) ? data : [data];
    this._loaded = false;
    this.lazy = lazy;
  }

  async connectedCallback() {
    if (!this.lazy || !this.hidden) {
      this.load();
    }

    if (this.parentElement)
      this.parentElement.addEventListener('ui-js-tree-node-collapse-change', ev => {
        if (!this._loaded && ev.detail.collapsed === false)
          this.load();
      });
  }

  load() {
    for (let nodeData of this._data) {
      this.appendChild(new UiJsTreeNode(nodeData, this._expandToLevel, this.level + 1, this.lazy));
    }
    this._loaded = true;
  }

  get hidden() {
    return this.parentElement ? this.parentElement.hasAttribute('collapsed') : false;
  }
}

customElements.define('ui-js-tree-node-container', UiJsTreeNodeContainer);