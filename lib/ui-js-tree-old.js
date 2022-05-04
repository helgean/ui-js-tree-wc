(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
      // Browser globals (root is window)
      root.UiJsTree = factory();
    }
  }(this, function () {

    var instanceCounter = 0;

    function createEl(tagName, parentEl, classes, construct) {
        var el = document.createElement(tagName);
        if (classes && typeof classes == 'string')
            el.className = classes;
        if (typeof construct == 'function')
            construct(el);
        parentEl.appendChild(el);
        return el;
    }

    function createNodeContainer(nodeEl) {
        return createEl.call(this, "ul", nodeEl, 'tree-node-container');
    }

    function createNodeId(idIndex, treeId) {
        return treeId + '_' + idIndex + '';
    }

    function getNodeIndex(id, treeId) {
        return parseInt(id.toString().replace(treeId + '_', ''));
    }

    function nextId(id) {
        var idnumber = parseInt(id.toString().replace(this.id + '_', ''));
        if (idnumber < this.idCounter) idnumber++;
        return this.id + '_' + idnumber;
    }

    function prevId(id) {
        var idnumber = parseInt(id.toString().replace(this.id + '_', ''));
        if (idnumber > 1) idnumber--;
        return this.id + '_' + idnumber;
    }

    function lastId() {
        return this.id + '_' + this.idCounter;
    }

    function isVisible(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    function isNodeVisible(node) {
        if (!node) return false;
        return isVisible(this.nodeMap[node.nodeId].el);
    }

    function hasChildren(nodeData) {
        return Array.isArray(nodeData.children) && nodeData.children.length > 0;
    }

    function setNodeId(nodeData, id) {
        if (!nodeData.nodeId)
            Object.defineProperty(nodeData, 'nodeId', {
                value: id,
                writable: true,
                configurable: false,
                enumerable: false
            });
        else
            nodeData.nodeId = id;
    }

    function addToNodeMap(nodeData, id, el) {
        this.nodeMap[id] = {
            el: el,
            data: nodeData
        };
    }

    function createNodeElement(nodeData, parentEl, level, flatList, fromIndexObj, collapsedChildren) {
        var currentlevel = level + 1;
        var idCounter = fromIndexObj ? ++fromIndexObj.index : ++this.idCounter;
        var id = createNodeId(idCounter, this.id);
        var renderChildren = hasChildren(nodeData) && flatList !== true;
        var collapsed = collapsedChildren || (this.initialLevel <= currentlevel && renderChildren) || nodeData.collapsed === true;

        // Add to node map before processing children
        setNodeId.call(this, nodeData, id);

        // Create node element
        var li = createLiElement.call(this, nodeData, parentEl, id, 'tree-node', currentlevel, collapsed);
        addToNodeMap.call(this, nodeData, id, li);

        // render children
        if (renderChildren) {
            li.classList.add('tree-node-parent');
            if (!collapsed || !this.lazyRender)
                createElementChildren.call(this, nodeData, li, currentlevel, fromIndexObj);
        }

        parentEl.appendChild(li);
    }

    function createElementChildren(nodeData, li, level, fromIndexObj) {
        var ul = createNodeContainer.call(this, li);
        nodeData.children.forEach(function(childData) {
            createNodeElement.call(this, childData, ul, level, false, fromIndexObj);
        }, this);
    }

    function createLiElement(nodeData, parentEl, id, classes, level, collapsed) {
        var that = this;
        return createEl.call(this, "li", parentEl, classes, function(el) {
            var span = document.createElement('span');
            var nodeContent = that.nodeRenderFn(nodeData, el);
            if (typeof nodeContent == 'object' && nodeContent.tagName)
                span.appendChild(nodeContent);
            else
                span.appendChild(document.createTextNode(nodeContent));
            span.setAttribute('draggable', true);
            el.appendChild(span);
            el.setAttribute('data-level', level);
            el.setAttribute('id', id);
            if (collapsed)
                el.classList.add('collapsed');
        });
    }

    function isVisibleInContainer(el) {
        var offsetEl = el.offsetParent;
        return offsetEl ?
            (offsetEl.clientHeight + offsetEl.scrollTop > (el.offsetTop + el.firstChild.clientHeight) &&
            (offsetEl.scrollTop < (el.offsetTop + el.firstChild.clientHeight))) : true;
    }

    function findFirstNode() {
        for (var key in this.nodeMap)
            return this.nodeMap[key];
    }

    function findNextNode(getIdFunc) {
        var selectedNode = this.selected && this.nodeMap[this.selected.nodeId] ? this.nodeMap[this.selected.nodeId].data : null;
        if (!selectedNode) {
            var firstNode = findFirstNode.call(this);
            return firstNode ? firstNode.data : null;
        }

        var prevNextNodeId,
            nextNodeObj = this.nodeMap[getIdFunc.call(this, selectedNode.nodeId)],
            nextNode = (nextNodeObj || selectedNode).data;
        while (!isNodeVisible.call(this, nextNode) && nextNode && nextNode.nodeId != prevNextNodeId) {
            prevNextNodeId = nextNode.nodeId;
            nextNode = this.nodeMap[getIdFunc.call(this, prevNextNodeId)].data;
        }
        if (nextNode && isNodeVisible.call(this, nextNode))
            return nextNode;
        return selectedNode;
    }

    function navigateToNode(getIdFunc, scrollUp) {
        var nextNode = findNextNode.call(this, getIdFunc);
        if (nextNode)
            this.selectByData(nextNode, true, scrollUp, !this.selectOnKeyEvent);
    }

    function traverseDownTree(data, func, parent) {
        var travData = Array.isArray(data) ? data : [data];
        for (var i=0; i<travData.length; i++) {
            var nodeData = travData[i];
            if (func.call(this, nodeData, parent) === false)
                return false;
            if (nodeData.children && Array.isArray(nodeData.children)) {
                for (var j=0; j<nodeData.children.length; j++) {
                    if (traverseDownTree.call(this, nodeData.children[j], func, nodeData) === false)
                        break;
                }
            }
        }
    }

    function traverseUpTreeEl(el, func) {
        if (typeof func == 'function' && func(el))
            return el;
        if (el.parentElement)
            return traverseUpTreeEl(el.parentElement, func);
        else
            return el;
    };

    function getFilteredNodes(data, filter, limit) {
        var filteredData = [];
        if (typeof filter == 'function') {
            traverseDownTree.call(this, data, function(itemData) {
                if (filter.call(this, itemData)) {
                    if (--limit <= 0)
                        return false;
                    else
                    filteredData.push(itemData);
                }
            });
            return filteredData;
        } else
            return data;
    }

    function flattenNodes(nodes) {
        var flattened = [];
        var nodeArray = Array.isArray(nodes) ? nodes : [nodes];
        nodeArray.forEach(function(node) {
            flattened.push(node);
            if (node.children && Array.isArray(node.children))
                flattened = flattened.concat(flattenNodes(node.children));
        });
        return flattened;
    }

    function debounce(func, wait, immediate) {
    	var timeout;
    	return function() {
    		var context = this, args = arguments;
    		var later = function() {
    			timeout = null;
    			if (!immediate) func.apply(context, args);
    		};
    		var callNow = immediate && !timeout;
    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait);
    		if (callNow) func.apply(context, args);
    	};
    }

    function reRenderChildren(node, fromIndex, collapsedChildren) {
        var el = node.el;
        var ul = el.getElementsByTagName("UL")[0];
        if (ul) el.removeChild(ul);
        //Work with document fragment: the need for speed..
        var frag = document.createDocumentFragment();
        ul = createNodeContainer.call(this, frag);

        var fromIndexObj = { index: fromIndex };

        if (hasChildren(node.data)) {
            if (!el.classList.contains('tree-node-parent'))
                el.classList.add('tree-node-parent');
            var level = parseInt(el.getAttribute("data-level"));

            node.data.children.forEach(function(childData) {
                createNodeElement.call(this, childData, ul, level, false, fromIndexObj, collapsedChildren);
            }, this);
        }

        el.appendChild(frag);
    }

    function shiftNodeMap(node, fromIndex, count, reversed) {
        var mapKeys = Object.keys(this.nodeMap);
        var treeId = this.id;
        mapKeys.sort(function(a, b) { return getNodeIndex(a, treeId) - getNodeIndex(b, treeId);});
        var newIds = [];
        function swapId(newId, oldId) {
            this.nodeMap[newId] = this.nodeMap[oldId];
            this.nodeMap[newId].data.nodeId = newId;
            this.nodeMap[newId].el.id = newId;
            delete this.nodeMap[oldId];
        }
        for (var i=fromIndex+1; i<=mapKeys.length; i++) {
            var oldId = mapKeys[i-1];
            var newId = this.id + '_' + (i+count) + '.';
            swapId.call(this, newId, oldId);
            newIds.push(newId);
        }
        for (var i=0; i<newIds.length; i++) {
            var oldId = newIds[i];
            var newId = oldId.slice(0, -1);
            swapId.call(this, newId, oldId);
        }
        this.idCounter += count;
    }

    function lazyRenderChildren(el, node) {
        if (this.lazyRender && el.getElementsByTagName("UL").length == 0) {
            var fromIndex = getNodeIndex(el.id, this.id);
            shiftNodeMap.call(this, node, fromIndex, node.data.children.length);
            reRenderChildren.call(this, node, fromIndex, true);
        }
    }

    function expandToNode(nodeData) {
        var nodesToExpand = [];
        var current = nodeData;
        do {
            current = this.parentMap[current._internalTreeId];
            if (current) nodesToExpand.push(current);
        } while (current);
        do {
            current = nodesToExpand.pop();
            if (current) this.expandNode(current);
        } while (current);
    }

    function getTreeNodeParent(el) {
        if (el.classList.contains('tree-node'))
            return el;
        else if (el.parentElement)
            return getTreeNodeParent(el.parentElement);
        else
            return null;
    }

    function cloneNode(obj) {
        var clone = Object.assign({}, obj);
        if (clone.children)
            clone.children = cloneChildren(clone.children);
        return clone;
    }

    function cloneChildren(array) {
        var clone = [];
        for (var i=0; i<array.length; i++)
            clone[i] = cloneNode(array[i]);
        return clone;
    }

    function cloneTree(treeData) {
        return Array.isArray(treeData) ? cloneChildren(treeData) : cloneNode(treeData);
    }

    /**
     * Create a ui tree control
     * @param {Object|Array} treeData Hierarchical data representing the tree, can be an array or an object
     * @param {Element} containerEl The container element to render to
     * @param {Object} treeOptions Tree configuration options
     */
    function UiJsTree(treeData, containerEl, treeOptions) {
        instanceCounter++;

        this.id = 'ui-js-tree-'+instanceCounter;
        this.treeData = (treeOptions && treeOptions.cloneData === false) ? treeData : cloneTree(treeData);
        this.selected = null;
        this.nodeMap = {};
        this.containerEl = containerEl;
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

        this.initialLevel = treeOptions && parseInt(treeOptions.initialLevel) || this.initialLevel;
        this.lazyRender = treeOptions && treeOptions.lazyRender || false;
        this.selectOnKeyEvent = treeOptions && treeOptions.selectOnKeyEvent === false ? false : true;
        this.nodeRenderFn = treeOptions && typeof treeOptions.nodeRenderFn == 'function' ? treeOptions.nodeRenderFn : this.defaultNodeRenderFn;
        this.onSelect = treeOptions && typeof treeOptions.onSelect == 'function' ? treeOptions.onSelect : this.onSelect;
        this.onExpand = treeOptions && typeof treeOptions.onExpand == 'function' ? treeOptions.onExpand : this.onExpand;
        this.onCollapse = treeOptions && typeof treeOptions.onCollapse == 'function' ? treeOptions.onCollapse : this.onCollapse;
        this.onBeforeSelect = treeOptions && typeof treeOptions.onBeforeSelect == 'function' ? treeOptions.onBeforeSelect : this.onBeforeSelect;
        this.onBeforeExpand = treeOptions && typeof treeOptions.onBeforeExpand == 'function' ? treeOptions.onBeforeExpand : this.onBeforeExpand;
        this.onBeforeCollapse = treeOptions && typeof treeOptions.onBeforeCollapse == 'function' ? treeOptions.onBeforeCollapse : this.onBeforeCollapse;
        this.onClick = treeOptions && typeof treeOptions.onClick == 'function' ? treeOptions.onClick : this.onClick;
        this.onKeyPress = treeOptions && typeof treeOptions.onKeyPress == 'function' ? treeOptions.onKeyPress : this.onKeyPress;

        Object.defineProperty(this, 'idCounter', {
            value: 0,
            writable: true,
            configurable: false,
            enumerable: false
        });

        this.focusEl = treeOptions && treeOptions.focusEl ? treeOptions.focusEl : createEl.call(this, 'a', containerEl, 'tree-focus-el', function(el) {
            el.setAttribute("tabindex", "0");
            el.setAttribute("name", "tree-view");
        });

        var that = this;
        this.focusEl.addEventListener('click', function(ev) {
            that.lastEvent = 'click';
            var targetEl = ev.target;
            var parentEl = getTreeNodeParent(targetEl);
            if (targetEl && targetEl.tagName.toLowerCase() !== 'span' && targetEl.classList.contains('tree-node-parent')) {
                that.toggleState(targetEl);
            } else if (targetEl && parentEl) {
                that.selectByEl(parentEl);
                if (typeof that.onClick == 'function' )
                    that.onClick(that.getNodeData(parentEl), parentEl, that);
            }
            that.focusEl.focus();
        });

        this.focusEl.addEventListener('keydown', function(ev) {
            that.lastEvent = 'keydown';
            if (!that.propagateKeys) {
                that.propagateKeys = Object.keys(that.keyMap)
                    .map(function(key) {
                        return that.keyMap[key];
                    })
                    .reduce(function(acc, cur) {
                        return acc.concat(cur);
                    }, []);
            }

            if (that.propagateKeys.indexOf(ev.key) > -1) {
                ev.stopPropagation();
                ev.preventDefault();
            }

            if (that.keyMap.nextNode.indexOf(ev.key) > -1)
                that.nextNode();
            else if (that.keyMap.prevNode.indexOf(ev.key) > -1)
                that.prevNode();
            else if (that.keyMap.firstNode.indexOf(ev.key) > -1)
                that.firstNode();
            else if (that.keyMap.lastNode.indexOf(ev.key) > -1)
                that.lastNode();
            else if (that.keyMap.collapse.indexOf(ev.key) > -1)
                that.collapseNode();
            else if (that.keyMap.expand.indexOf(ev.key) > -1)
                that.expandNode();
            else if (that.keyMap.toggle.indexOf(ev.key) > -1)
                that.toggleState();

            if (typeof that.onKeyPress == 'function')
                that.onKeyPress(that.selected, that.getEl(that.selected), that, ev);
        });
    }

    /**
     * Get a node object from node data object
     * @param {Object} nodeData Node data object
     * @returns {Object} The node object
     */
    UiJsTree.prototype.getNodeObj = function(nodeData) {
        if (!nodeData) return null;
        return this.nodeMap[nodeData.nodeId];
    };

    /**
     * Get an element from node data object
     * @param {Object} nodeData Node data object
     * @returns {Element} The node element
     */
    UiJsTree.prototype.getEl = function(nodeData) {
        if (!nodeData) return null;
        var node = this.nodeMap[nodeData.nodeId];
        return node ? node.el : null;
    };

    /**
     * Get a node data object from an node element
     * @param {Element} el Node element
     * @returns {Object} The node data
     */
    UiJsTree.prototype.getNodeData = function(el) {
        if (!el) return null;
        return this.nodeMap[el.id].data;
    };

    /**
     * Load new data into the tree, replacing the existing tree nodes
     * @param {Object|Array} newData The new data to load
     */
    UiJsTree.prototype.load = function(newData) {
        this.idCounter = 0;
        this.treeData = newData;
        this.render();
    };

    /**
     * Add new data nodes to an existing tree node and render it
     * @param {Object|Array} newData The new data to load
     * @param {*} nodeData
     */
    UiJsTree.prototype.addToNode = function(newData, nodeData) {
        this.node = this.nodeMap[nodeData.nodeId];
        if (this.node && this.node.data) {
            if (!this.node.data.children)
                this.node.data.children = [];
            this.node.data.children = this.node.data.children.concat(newData);
            var newFlattenedNodes = flattenNodes(newData);
            var fromIndex = getNodeIndex(this.node.data.nodeId, this.id);
            shiftNodeMap.call(this, this.node, fromIndex, newFlattenedNodes.length);
            reRenderChildren.call(this, this.node, fromIndex);
        }
    };

    /**
     * Clear tree, remove all nodes and data
     */
    UiJsTree.prototype.clear = function() {
        var el = this.focusEl;
        delete this.selected;
        this.nodeMap = {};
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    /**
     * Render the tree from the loaded data
     * @param {function} filter Filter predicate
     * @param {integer} limit Limit filter result by max count returned
     */
    UiJsTree.prototype.render = function(filter, limit) {
        this.clear();
        this.idCounter = 0;
        var el = this.containerEl;
        //Work with document fragment: the need for speed..
        var frag = document.createDocumentFragment();
        var ul = createNodeContainer.call(this, frag);

        this.parentMap = {};
        // Create node parent map
        var idCounter = 0;
        traverseDownTree.call(this, this.treeData, function(nodeData, parent) {
            nodeData._internalTreeId = ++idCounter;
            this.parentMap[nodeData._internalTreeId] = parent;
        });

        //Filter nodes and return list
        var treeData = getFilteredNodes(this.treeData, filter, limit);
        var flat = this.treeData !== treeData;

        //Recursive method to build tree elements
        if (Array.isArray(treeData))
            treeData.forEach(function(dataItem) {
                createNodeElement.call(this, dataItem, ul, 0, flat);
            }, this);
        else
            createNodeElement.call(this, treeData, ul, 0, flat);
        //Add all node elements (as document fragment) to the DOM
        this.focusEl.appendChild(frag);

        this.el = el;
    }

    /**
     * Select node by node data object
     * @param {Object|Array} nodeData The node data to find and select
     * @param {Boolean} scrollIntoFocus Make sure the node is inside the visible part of the container
     * @param {Boolean} alignTop Align selected node at top
     * @param {Boolean} suppressEvent Suppress events when selecting the node
     */
    UiJsTree.prototype.selectByData = function(nodeData, scrollIntoFocus, alignTop, suppressEvent) {
        if (!nodeData) return;
        var el = this.getEl(nodeData);
        if (typeof this.onBeforeSelect == 'function' && suppressEvent !== true) {
            var abort = this.onBeforeSelect.call(this, nodeData, el) === false;
            if (abort) return;
        }
        if (!nodeData.nodeId || !this.nodeMap[nodeData.nodeId]) {
            expandToNode.call(this, nodeData);
            el = this.getEl(nodeData);
        }
        if (this.selected && this.getNodeObj(this.selected)) {
            var selectedEl = this.getEl(this.selected);
            if (selectedEl)
              selectedEl.classList.remove('selected');
        }
        this.selected = nodeData;
        if (!el) return;
        this.makeNodeElVisible(el);
        el.classList.add('selected');
        if (scrollIntoFocus && !isVisibleInContainer(el)) {
            el.scrollIntoView(!!alignTop);
        }
        if (typeof this.onSelect == 'function' && suppressEvent !== true)
            this.onSelect.call(this, this.selected, el);
    };

    /**
     * Select node by element
     * @param {Element} el The node element to find and select
     * @param {Boolean} scrollIntoFocus Make sure the node is inside the visible part of the container
     * @param {Boolean} alignTop Align selected node at top
     * @param {Boolean} suppressEvent Suppress events when selecting the node
     */
    UiJsTree.prototype.selectByEl = function(el, scrollIntoFocus, alignTop, suppressEvent) {
        if (!el) return;
        var nodeData = this.getNodeData(el);
        if (nodeData) {
            this.makeNodeElVisible(el);
            this.selectByData(nodeData, scrollIntoFocus, alignTop, suppressEvent);
        }
    };

    /**
     * Select node by predicate function
     * @param {function} predicate Predicate to find and select node
     * @param {Boolean} scrollIntoFocus Make sure the node is inside the visible part of the container
     * @param {Boolean} suppressEvent Suppress events when selecting the node
     */
    UiJsTree.prototype.selectBy = function(predicate, scrollIntoFocus, suppressEvent) {
        if (typeof predicate != 'function') return;
        var nodeId = Object.keys(this.nodeMap).find(function(nodeId) {
            return predicate(this.nodeMap[nodeId]);
        }, this);
        var node = this.nodeMap[nodeId];
        if (node) {
            this.makeNodeElVisible(node.el);
            this.selectByData(node.data, scrollIntoFocus, this.selected ? getNodeIndex(this.selected.nodeId, this.id) > getNodeIndex(node.data.nodeId, this.id) : false, suppressEvent);
        }
    };

    /**
     * Make node visible by expanding parent nodes
     * @param {Element} el The node element to make visible
     */
    UiJsTree.prototype.makeNodeElVisible = function(el) {
        if (!isVisible(el))
            traverseUpTreeEl(el, function(el) {
                if (el.classList.contains('collapsed'))
                    el.classList.remove('collapsed');
                return isVisible(el);
            });
    };

    /**
     * Toggle between collapse and expanded
     * @param {Element} elem The element to toggle between collapse and expanded
     */
    UiJsTree.prototype.toggleState = function(elem) {
        var el = elem || (this.selected && this.nodeMap[this.selected.nodeId] ? this.nodeMap[this.selected.nodeId].el : null);
        var node = el ? this.nodeMap[el.id] : null;
        if (el.classList.contains('collapsed') && el.classList.contains('tree-node-parent')) {
            this.expandNode(node.data);
        } else
            this.collapseNode(node.data);
    };

    /**
     * Expand selected node
     * @param {Object} nodeData Optional node(data) to expand, if not supplied the selected node is expanded
     * @param {boolean} recursive Expand recursive all descendants
     * @param {Boolean} suppressEvent Suppress events when expanding the node
     */
    UiJsTree.prototype.expandNode = function(nodeData, recursive, suppressEvent) {
        var data = nodeData || this.selected;
        var node = data ? this.nodeMap[data.nodeId] : null;
        var el = node ? node.el : null;
        if (data.children && el && el.classList.contains('collapsed')) {
            if (typeof this.onBeforeExpand == 'function' && suppressEvent !== true)
                this.onBeforeExpand.call(this, data, el);

            el.classList.remove('collapsed');
            lazyRenderChildren.call(this, el, node);

            if (recursive && Array.isArray(data.children)) {
                data.children.forEach(function(childNodeData) {
                    this.expandNode(childNodeData, true);
                }, this);
            }

            if (typeof this.onExpand == 'function' && suppressEvent !== true)
                this.onExpand.call(this, data, el);
        }
    };

    /**
     * Collapse selected node
     * @param {Object} nodeData Optional node(data) to collapse, if not supplied the selected node is collapsed
     * @param {Boolean} suppressEvent Suppress events when collapsing the node
     */
    UiJsTree.prototype.collapseNode = function(nodeData, suppressEvent) {
        var data = nodeData || this.selected;
        var node = data ? this.nodeMap[data.nodeId] : null;
        var el = node ? node.el : null;
        if (el && !el.classList.contains('collapsed')) {
            if (typeof this.onBeforeCollapse == 'function' && suppressEvent !== true)
                this.onBeforeCollapse.call(this, data, el);

            el.classList.add('collapsed');

            if (typeof this.onCollapse == 'function' && suppressEvent !== true)
                this.onCollapse.call(this, data, el);
        }
    };

    /**
     * Expand all nodes
     * @param {Boolean} suppressEvent Suppress events when expanding the individual node
     */
    UiJsTree.prototype.expandAll = function(suppressEvent) {
        var elements = this.focusEl.getElementsByClassName('collapsed');
        [].slice.call(elements).forEach(function(el) {
            if (el.classList.contains('collapsed')) {
                var nodeData = this.getNodeData(el);
                this.expandNode(nodeData, true, suppressEvent);
            }
        }, this);
        if (this.selected)
            this.makeNodeElVisible(this.nodeMap[this.selected.nodeId].el);
    };

    /**
     * Collapse all nodes
     * @param {Boolean} suppressEvent Suppress events when collapsing the individual node
     */
    UiJsTree.prototype.collapseAll = function(suppressEvent) {
        var elements = this.focusEl.getElementsByClassName('tree-node-parent');
        [].slice.call(elements).forEach(function(el) {
            if (!el.classList.contains('collapsed')) {
                var nodeData = this.getNodeData(el);
                this.collapseNode(nodeData, suppressEvent);
            }
        }, this);
        this.firstNode();
    };

    /**
     * Select next node
     */
    UiJsTree.prototype.nextNode = function() {
        return navigateToNode.call(this, nextId, false);
    };

    /**
     * Select previous node
     */
    UiJsTree.prototype.prevNode = function() {
        return navigateToNode.call(this, prevId, true);
    };

    /**
     * Select first node
     */
    UiJsTree.prototype.firstNode = function() {
        var nodeIds = Object.keys(this.nodeMap);
        var nextNodeId = (Array.isArray(nodeIds) && nodeIds.length > 0) ? nodeIds[0] : this.id + '_1';
        var nextNode = this.nodeMap[nextNodeId] ? this.nodeMap[nextNodeId].data : undefined;
        if (nextNode)
            this.selectByData(nextNode, true, true, !this.selectOnKeyEvent);
    };

    /**
     * Select last node
     */
    UiJsTree.prototype.lastNode = function() {
        var nextNode = this.nodeMap[lastId.call(this)] ? this.nodeMap[lastId.call(this)].data : undefined;
        if (nextNode)
            this.selectByData(nextNode, true, false, !this.selectOnKeyEvent);
        if (!isNodeVisible.call(this, nextNode))
            this.prevNode();
    };

    /**
     * Filter tree nodes, display flat list of nodes
     * @param {Function} filter Predicate to filter nodes
     * @param {Integer} limit Limit the displayed nodes
     */
    UiJsTree.prototype.filter = function(filter, limit) {
        this.render(filter, limit || 200);
    };

    /**
     * Traverse down the descendant nodes
     * @param {Function} func The function to be called for each node in the tree
     * @param {Object} fromNode The initial node to traverse down from
     */
    UiJsTree.prototype.traverse = function(func, fromNode) {
        traverseDownTree.call(this, fromNode || this.treeData, func);
    };

    return UiJsTree;
  }));
