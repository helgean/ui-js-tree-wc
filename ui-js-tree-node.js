import { template } from './lib/ui-js-lib.js';

const tpl = template`
<style>
    :host {
      --tree-prefix-color: var(--tree-node-collapse-icon-color, black);
    }

    :host(.parent.collapsed) > slot::slotted(ui-js-tree-node-container) {
      display: none;
    }

    :host(.parent.collapsed)::before {
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-left: 8px solid var(--tree-prefix-color);
    }

    :host(.parent)::before {
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid var(--tree-prefix-color);
    }

    :host::before {
      content: " ";
      box-sizing: border-box;
      border: 8px solid transparent;
      display: inline-block;
      vertical-align: middle;
    }

    :host(.parent) {
      cursor: pointer;
    }

    :host(.selected:not(.parent)) {
      background-color: var(--tree-node-selected-background-color, #336688);
    }

    :host(.selected) slot::slotted(span) {
      background-color: var(--tree-node-selected-background-color, #336688);
    }

    :host {
      display: block;
    }
  </style>
  <slot></slot>
`;

export class UiJsTreeNode extends HTMLElement {
  constructor() {
    super();
    this._data = {};
    this.shadow = this.attachShadow({mode: 'open'});
  }

  async connectedCallback() {
    tpl(this).render(this.shadow);
    this._text = this.getAttribute('text') || this.dataset.text || this.innerText;
    this._value = this.getAttribute('value') || this.dataset.value || this.data.text;

    this.setAttribute('tabindex', '-1');

    if (this.isParent)
      this.classList.add('parent');

    if (this.hasAttribute('collapsed'))
      this.classList.add('collapsed');

    this.addEventListener('click', ev => {
      this.collapsed = !this.collapsed;
      ev.stopPropagation();
    });
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

  get isParent() {
    return this.querySelector('ui-js-tree-node-container');
  }

  get hidden() {
    return this.parentElement.parentElement.collapsed;
  }

  get collapsed() {
    return this.isParent ? this.classList.contains('collapsed') : false;
  }

  set collapsed(value) {
    if (!this.isParent)
      return;
    if (value)
      this.classList.add('collapsed');
    else
      this.classList.remove('collapsed');
    this.querySelector('ui-js-tree-node-container').hidden = value;
  }
}

customElements.define('ui-js-tree-node', UiJsTreeNode);