/**
* @factory
*/
function _DOMFragmentManager(
    dom_createElement
    , dom_createElementNS
    , dom_mutationObserver
    , template_element
    , template_domNodeHandlers
    , template_xmlNamespaceMap
    , is_nill
    , is_objectValue
    , utils_uuid
    , utils_reference
    , utils_lookup
    , defaults
    , errors
    , reporter
) {

    /**
    * A map of fragmentIds and their observer and element
    * @property
    */
    var fragments = {}
    /**
    * A regular expression pattern to replace instances of children in a path
    * @property
    */
    , CHILDREN_PATT = /children/g
    /**
    * A regular expression pattern to check a path for ends with children.{num}
    * @property
    */
    , CHILD_INDEX_PATT = /children[.]([0-9]+)$/
    /**
    * A regular expression pattern to check a path for ends with attributes.{name}
    * @property
    */
    , ATTRIB_PROP_PATT = /attributes[.]()$/
    /**
    * A regular expression pattern for trimming trailing dot
    * @property
    */
    , TRAIL_DOT = /[.]$/
    ;

    /**
    * @worker
    */
    return Object.create(
        null
        , {
            "create": {
                "enumerable": true
                , "value": createFragment
            }
            , "get": {
                "enumerable": true
                , "value": getFragment
            }
            , "destroy": {
                "enumerable": true
                , "value": destroyFragment
            }
        }
    );

    /**
    * @function
    */
    function createFragment(domProxy) {
        //create a uuid to keep track of the fragment
        var fragmentId = utils_uuid(
            { "version": 4 }
        )
        //get the namespace for this template
        , xmlns = getXmlNamespace(
            domProxy
        )
        //crawl the domProxy and create the element and all the children
        , element = createElement(
            domProxy
            , xmlns
        )
        //create a mutation observer so we can keep the proxy up to date
        , observer = new dom_mutationObserver(
            onDOMMutation.bind(
                null
                , fragmentId //the fragmentId is needed to update the proxy
            )
        )
        , fragment = {
            "fragmentId": fragmentId
            , "observer": observer
            , "element": element
            , "proxy": domProxy
            , "observerOptions": {
                "childList": true
                , "attributes": true
                , "subtree": true
            }
            , "changeHandler": onDOMChange.bind(
                null
                , fragmentId //the fragment id is required to lookup fragment
            )
        }
        ;
        //add the fragment to the map
        fragments[fragmentId] = fragment;
        //add change proxy listener
        domProxy.on(
            [
              "children.*"
              , "delete children.*"
              , "attributes.*"
              , "delete attributes.*"
            ]
            , fragment.changeHandler
        );
        //add a listener for the destroyed property
        domProxy.on(
            "destroyed"
            , onTemplateDestroy.bind(
                null
                , fragmentId
            )
        );
        //start observing mutations
        observer.observe(
            element
            , fragment.observerOptions
        );

        return fragmentId;
    }
    /**
    * @function
    */
    function getXmlNamespace(domProxy) {
        var tagType = domProxy.type || defaults.ui.gui.template.tagType
        , tagNs = !!domProxy.attributes && !!domProxy.attributes.xmlns
            ? domProxy.attributes.xmlns
            : template_xmlNamespaceMap[tagType]
        ;

        return tagNs;
    }
    /**
    * Creates an element, adds attributes, and adds children using the DOM functions.
    * @function
    */
    function createElement(domProxy, xmlns) {
        //see if there is a custom node handler
        var handler = utils_lookup(
            domProxy.nodeName
            , template_domNodeHandlers
        );
        if (!!handler) {
            return handler(
                domProxy
                , xmlns
            );
        }
        //create the root element
        var element = !!xmlns
            ? dom_createElementNS(xmlns, domProxy.nodeName)
            : dom_createElement(domProxy.nodeName)
        ;
        //add the attributes
        setAttributes(
            domProxy
            , element
        );
        //create and append the children
        appendChildren(
            domProxy
            , element
        );

        return element;
    }
    /**
    * @function
    */
    function setAttributes(domProxy, element) {
        if (!domProxy.attributes) {
            return;
        }
        Object.keys(domProxy.attributes)
        .forEach(
            function addEachAttribute(key) {
                var value = domProxy.attributes[key];
                //null or undefined do not get added
                if (is_nill(value)) {
                    element.removeAttribute(
                        key
                    );
                    return;
                }
                if (is_objectValue(value)) {
                    value = "[object]";
                }
                element.setAttribute(
                    key
                    , value
                );
            }
        );
    }
    /**
    * @function
    */
    function appendChildren(domProxy, element) {
        if (!domProxy.children) {
            return;
        }
        domProxy.children
        .forEach(
            function createEachChild(childTag) {
                //create the child element
                var child = createElement(
                    childTag
                );
                //append it to the element's children
                element.appendChild(child);
            }
        );
    }

    /**
    * @function
    */
    function getFragment(fragmentId) {
        var fragment = fragments[fragmentId];
        if (!fragment) {
            return;
        }
        return template_element(
            fragment.element
        );
    }
    /**
    * @function
    */
    function destroyFragment(fragmentId) {
        var fragment = fragments[fragmentId];
        if (!fragment) {
            return;
        }
        //remove the fragment meta from the collection
        delete fragments[fragmentId];
        //disconnect the observer
        fragment.observer.disconnect();
        //remove the element from it's parent to ensure it's gc'd
        if (!!fragment.element.parentElement) {
            fragment.element.parentElement.removeChild(
                fragment.element
            );
        }
        //remove all the listener
        fragment.proxy.off();
        //the destruction of the proxy is outside of this scope
    }


    /**
    * Handles direct changes to the DOM and updates the proxy
    * @function
    */
    function onDOMMutation(fragmentId, mutationList) {
        var fragment = fragments[fragmentId];
        if (!fragment) {
            throw new Error(
                `${errors.ui.gui.template.mutation_missing_dom_fragment}`
            );
        }
        //loop through the mutations
        for (let i = 0, l = mutationList.length; i < l; i++) {
            if (mutationList[i].type === "attributes") {
                handleAttributeMutation(
                    fragment
                    , mutationList[i]
                );
            }
            else if (mutationList[i].type === "childList") {
                handleChildMutation(
                    fragment
                    , mutationList[i]
                );
            }
        }
    }
    /**
    * @function
    */
    function handleAttributeMutation(fragment, mutation) {
        //get the path of the mutation based on the root element
        var path = determinePath(
            fragment
            , mutation
        )
        , ref = utils_reference(
            path
            , fragment.proxy
        )
        , attributes
        ;
        if (!ref.found) {
            ///TODO: what to do if there isn't a reference?
        }
        //get the attributes for the proxy
        attributes = ref.parent[ref.index].attributes;
        attributes[mutation.attributeName] =
            mutation.target.getAttribute(mutation.attributeName)
        ;
    }
    /**
    * @function
    */
    function handleChildMutation(fragment, mutation) {
        //get the path of the mutation based on the root element
        var path = determinePath(
            fragment
            , mutation
        )
        , ref = !!path
            && utils_reference(
                path
                , fragment.proxy
            )
        , proxyTarget = !!path
            ? ref.value
            : fragment.proxy
        ;
        if (!!ref.exception) {
            throw ref.exception;
        }
        if (!ref.found) {
            ///TODO: what to do if there isn't a reference?
        }
        if (mutation.removedNodes.length > 0) {
            removeNodes(
                proxyTarget
                , mutation
            );
        }
        if (mutation.addedNodes.length > 0) {
            addNodes(
                proxyTarget
                , mutation
            );
        }
    }
    /**
    * @function
    */
    function determinePath(fragment, mutation) {
        //the scope starts with the target since it could be the root
        var scope = mutation.target
        , path
        , childIndex
        ;
        //loop up through the mutation's target's parents until the root element is found
        while(scope !== fragment.element) {
            //if there are no more parent elements
            if (!scope.parentElement) {
                path = null; //identify that something went wrong
                break;
            }
            //determine the index for the path
            childIndex = getNodeIndex(
                scope
                , scope.parentElement
            );

            if (!path) {
                path = `children[${childIndex}]`;
            }
            else {
                path = `children[${childIndex}].${path}`;
            }
            scope = scope.parentElement || scope.parentNode;
        }

        return path;
    }
    /**
    * @function
    */
    function getNodeIndex(node, parent) {
        var childIndex = -1;

        parent
        .childNodes
        .forEach(
            function forEachChild(child, index) {
                if (child === node) {
                    childIndex = index;
                }
            }
        );

        return childIndex;
    }
    /**
    * @function
    */
    function removeNodes(proxyTarget, mutation) {
        //loop through the remove nodes
        mutation.removedNodes
        .forEach(
            function forEachRemoveNode(node) {
                var childIndex = getNodeIndex(
                    node
                    , mutation.target
                );
                proxyTarget.children.splice(childIndex, 1);
            }
        );
    }
    /**
    * @function
    */
    function addNodes(proxyTarget, mutation) {
        //loop through the add nodes
        mutation.addedNodes
        .forEach(
            function forEachRemoveNode(node) {
                var isPrevious = !!mutation.previousSibling
                    ? true
                    : false
                , childIndex = getNodeIndex(
                    mutation.previousSibling || mutation.nextSibling
                    , mutation.target
                );
                if (isPrevious) {
                    childIndex++;
                }
                else {
                    childIndex--;
                }
                proxyTarget.children.splice(childIndex, 0, node);
            }
        );
    }


    /**
    * Handles changes from the template proxy on the other side
    * @function
    */
    function onDOMChange(fragmentId, event) {
        var fragment = fragments[fragmentId];
        if (!fragment) {
            throw new Error(
                `${errors.ui.gui.template.change_missing_dom_fragment}`
            );
        }
        //stop the observer
        fragment.observer.disconnect();
        //see if the update was for an attribute or children
        if (event.key.match(ATTRIB_PROP_PATT)) {
            handleAttributeChange(
                fragment
                , event
            );
        }
        else if (event.key.match(CHILD_INDEX_PATT)) {
            handleChildChange(
                fragment
                , event
            );
        }
        //restart the observer
        fragment.observer.observe(
            fragment.element
            , fragment.observerOptions
        );
    }
    /**
    * @function
    */
    function handleAttributeChange(fragment, event) {
        var attribIndex = event.key.indexOf(".attributes.")
        , elementKey = attribIndex !== -1
            ? event.key.substring(0, attribIndex)
            : event.key
        , element = getElement(
            elementKey
            , fragment.element
        )
        , attribName = event.key.substring(attribIndex + 12)
        ;
        if (event.action === "append" || event.action === "update") {
            element.setAttribute(
                attribName
                , event.value
            );
        }
        else if (event.action === "delete") {
            if (!!element.removeAttribute) {
                element.removeAttribute(
                    attribName
                );
            }
        }
        else {
            throw new Error(
                `${errors.ui.gui.template.invalid_fragment_change_action} (${event.action})`
            );
        }
    }
    /**
    * @function
    */
    function handleChildChange(fragment, event) {
        //get n using the last children.n segment
        var childrenIndex = event.key
            .lastIndexOf("children.")
        , parentElementKey = event.key
            .substring(0, childrenIndex)
            .replace(TRAIL_DOT, "")
        , elementIndex = parseInt(
            event.key
            .substring(childrenIndex + 9)
            .replace(TRAIL_DOT, "")
        )
        , parentElement = !parentElementKey
            ? fragment.element
            : getElement(
                parentElementKey
                , fragment.element
            )
        , childElement
        , siblingElement
        ;
        if (event.action === "delete") {
            childElement = parentElement
                .childNodes[elementIndex]
            ;
            parentElement.removeChild(
                childElement
            );
        }
        else {
            childElement = createElement(
                event.value
            );
            if (event.action === "append") {
                parentElement.appendChild(
                    childElement
                );
            }
            else if (event.action === "replace") {
                siblingElement = parentElement
                    .childNodes[elementIndex]
                ;
                siblingElement.replaceWith(
                    childElement
                );
            }
            else {
                siblingElement = parentElement
                    .childNodes[elementIndex]
                ;
                parentElement.insertBefore(
                    childElement
                    , siblingElement
                );
            }
        }
    }
    /**
    * @function
    */
    function getElement(path, element) {
        //start the element path, using childNodes rather than children
        var elementPath = path.replace(CHILDREN_PATT, "childNodes")
        //lookup the reference to the element
        , ref = utils_reference(
            elementPath
            , element
        );
        if (!ref.found) {
            throw new Error(
                `${errors.ui.gui.template.element_path_missing} (${path})`
            );
        }
        return ref.value;
    }

    /**
    * @function
    */
    function onTemplateDestroy(fragmentId) {
        destroyFragment(
            fragmentId
        );
    }
}
