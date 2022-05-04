import { template } from './lib/ui-js-lib.js';

const tpl = template`
  <style>
    :host {
      display: block;
      width: fit-content;
      padding-left: var(--tree-node-left-margin, 8px);
    }
  </style>
  <slot></slot>
`;

export class UiJsTreeNodeContainer extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: 'open'});
  }

  async connectedCallback() {
    tpl(this).render(this.shadow);

    this.hidden = this.parentElement.isParent && this.parentElement.collapsed;
    this.setAttribute('tabindex', '-1');
  }

  get hidden() {
    return this.classList.contains('hidden');
  }

  set hidden(value) {
    if (value)
      this.classList.add('hidden');
    else
      this.classList.remove('hidden');
  }
}

customElements.define('ui-js-tree-node-container', UiJsTreeNodeContainer);