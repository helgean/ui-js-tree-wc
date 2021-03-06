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

    if (this.parentElement) {
      this.hidden = this.parentElement.collapsed === true;

      this.parentElement.addEventListener('ui-js-tree-node-collapse-change', ev => {
        if (!this._loaded && ev.detail.collapsed === false)
          this.load(true);
        this.hidden = ev.detail.collapsed;
        const descendContainers = this.querySelectorAll('ui-js-tree-node-container');
        if (this.hidden) {
          for (let cont of descendContainers)
            cont.hidden = true;
        } else {
          for (let cont of descendContainers) {
            if (!cont.hidden)
              cont.hidden = false;
          }
        }
      });
    }
  }

  load(fireEvent) {
    for (let nodeData of this._data) {
      this.appendChild(new UiJsTreeNode(nodeData, this._expandToLevel, this.level + 1, this.lazy));
    }
    this._loaded = true;
    this.setAttribute('role', 'group');
    if (fireEvent)
      this.dispatchEvent(new CustomEvent('ui-js-tree-container-load', {
        bubbles: true
      }));
  }

  set hidden(value) {
    if (value)
      this.classList.add('hidden');
    else
      this.classList.remove('hidden');
  }

  get hidden() {
    return this.parentElement ? this.parentElement.hasAttribute('collapsed') : false;
  }

  get loaded() {
    return this._loaded;
  }
}

customElements.define('ui-js-tree-node-container', UiJsTreeNodeContainer);