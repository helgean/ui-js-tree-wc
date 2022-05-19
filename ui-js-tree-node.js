import { template } from './lib/ui-js-lib.js';
import { UiJsTreeNodeContainer } from './ui-js-tree-node-container.js';

const tpl = template`
  <i class="caret"></i>
  <span class="ui-js-tree-node-text">${'text'}</span>
`;

export class UiJsTreeNode extends HTMLElement {
  constructor(data, expandToLevel, currentLevel, lazy) {
    super();
    this._expandToLevel = expandToLevel;
    this.level = currentLevel;
    this.lazy = lazy;
    this._data = data || {};
  }

  async connectedCallback() {
    this._text = this.data.text || this.getAttribute('text') || this.dataset.text || this.innerText;
    this._value = this.data.value || this.getAttribute('value') || this.dataset.value || this._text;
    this._title = this.data.title || this.getAttribute('title') || this.dataset.title;

    tpl(this).render(this);

    this.setAttribute('tabindex', '-1');
    this.setAttribute('role', 'treeitem');
    this.setAttribute('aria-label', this._text);
    if (this._title) {
      this.querySelector('.ui-js-tree-node-text').setAttribute('title', this._title);
    }

    if (this.isParent && !this.hasAttribute('collapsed') && this.level > this._expandToLevel)
      this.setAttribute('collapsed', '');

    if (this.isParent) {
      this.classList.add('parent');
      this.appendChild(new UiJsTreeNodeContainer(this.data.children, this._expandToLevel, this.level, this.lazy));
    }

    this.addEventListener('click', ev => {
      ev.stopPropagation();
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if (ev.target === this.querySelector('i.caret'))
        this.collapsed = !this.collapsed;
      else
        this.dispatchEvent(new CustomEvent('ui-js-tree-node-click', {
          bubbles: true,
          detail: {
            data: this.data,
            originalEvent: ev
          }
        }));
    });
  }

  loadChildren(expandTo) {
    if (!this.container.loaded)
      this.container.load(true);
    if (expandTo && this.collapsed)
      this.collapsed = false;
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
  }

  get text() {
    return this._text;
  }

  set text(value) {
    this._text = value;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  get container() {
    return this.querySelector('ui-js-tree-node-container');
  }

  get isParent() {
    return this.data.children && Array.isArray(this.data.children);
  }

  get hidden() {
    return this.parentElement.parentElement.collapsed;
  }

  get collapsed() {
    return this.isParent ? this.hasAttribute('collapsed') : false;
  }

  set collapsed(value) {
    if (!this.isParent)
      return;

    if (value) {
      this.setAttribute('collapsed', '');
    } else {
      this.removeAttribute('collapsed');
    }

    this.dispatchEvent(new CustomEvent('ui-js-tree-node-collapse-change', {
      detail: {
        collapsed: value
      }
    }));

    this.dispatchEvent(new CustomEvent(value ? 'ui-js-tree-node-collapse' : 'ui-js-tree-node-expand', {
      bubbles: true,
      detail: {
        data: this.data
      }
    }));
  }
}

customElements.define('ui-js-tree-node', UiJsTreeNode);