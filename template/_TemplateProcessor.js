/**
* @factory
*/
function _TemplateProcessor(
    utils_proxy_biDirectionalWatcher
    , template_tagHandlers
    , template_attributeHandlers
    , template_hasExpression
    , template_domFragmentManager
    , template_attributeProcessor
    , utils_lookup
    , utils_reference
    , is_array
    , is_object
    , is_string
    , is_empty
    , reporter
    , errors
    , infos
) {
    /**
    * @alias
    */
    var hasTemplateExpression = template_hasExpression
    /**
    * @alias
    */
    , biDirWatcher = utils_proxy_biDirectionalWatcher
    /**
    * @alias
    */
    , domFragmentManager = template_domFragmentManager
    /**
    * @alias
    */
    , attributeProcessor = template_attributeProcessor
    /**
    * A regular expression pattern for replacing dashes in tag names
    * @property
    */
    , DASH_PATT = /[-]/g
    /**
    * A regular expression pattern for matching direct child paths and parse the index
    * @property
    */
    , CHILD_INDEX_PATT = /children.([0-9]+)$/
    ;

    return TemplateProcessor;

    /**
    * @worker
    */
    function TemplateProcessor(jsonTemplate, context) {
        //Create the bi-directional proxy
        var [domProxy, templateProxy] = biDirWatcher(
            jsonTemplate
        )
        , fragmentId
        ;
        //set the root namespace
        templateProxy.namespace = templateProxy.namespace || "$";
        //process the template tag, attributes and children
        processTemplate(
            templateProxy
            , context
        );
        //create dom fragment for the template, must be done after the tempalte is processed
        fragmentId = domFragmentManager.create(
            domProxy
        );
        //add a final destroy function
        templateProxy.destroy = function templateDestroy() {
            //destroy the entire fragment
            domFragmentManager.destroy(
                fragmentId
            );
            destroyTemplate(
                templateProxy
            );
            //remove all the listeners for this template
            templateProxy.off();
        };
        //return the template interface
        return {
            "fragmentId": fragmentId
            , "templateProxy": templateProxy
            , "domProxy": domProxy
            , "destroy": templateProxy.destroy
        };
    }
    /**
    * @function
    */
    function processTemplate(templateProxy, context) {
        //skip processing if marked
        if (templateProxy.skip === true) {
            return;
        }
        //add a reference to this function so handlers can call it
        templateProxy.processTemplate = processTemplate;
        //add a destroy function
        templateProxy.destroy = destroyTemplate.bind(
            null
            , templateProxy
        );
        //process tag
        processTag(
            templateProxy
            , context
        );
        //a handler might have already processed the attributes
        if (templateProxy.skipAttributes !== true) {
            //process attributes
            processAttributes(
                templateProxy
                , context
            );
        }
        //skip processing children if marked
        if (templateProxy.skipChildren !== true) {
            //process children
            processChildren(
                templateProxy
                , context
            );
        }
        reporter.extended(
            `${infos.ui.gui.template.template_processed} (${templateProxy.nodeName}:${templateProxy.namespace})`
        );
    }
    /**
    * @function
    */
    function processTag(templateProxy, context) {
        ///INPUT VALIDATION
        if (!templateProxy.hasOwnProperty("nodeName")) {
            throw new Error(
                `${errors.ui.gui.template.missing_node_name}`
            );
        }
        ///END INPUT VALIDATION
        var nodeName = templateProxy
            .nodeName
            .replace(DASH_PATT, ".")
        //see if there is a handler for this nodeName
        , handler = utils_lookup(
            nodeName
            , template_tagHandlers
        );
        if (!!handler) {
            handler(
                templateProxy
                , context
                , templateProxy.nodeName
            );
        }
    }
    /**
    * @function
    */
    function processAttributes(templateProxy, context) {
        if (is_object(templateProxy.attributes)) {
            var attribs = templateProxy.attributes
            , attribKeys = Object.keys(templateProxy.attributes)
            , index = 0
            ;
            //process each attribute. Properties can be added to the end of the attribs object
            do {
                processAttribute(
                    templateProxy
                    , context
                    , attribKeys[index]
                );
                index++;
                attribKeys = Object.keys(templateProxy.attributes);
            }
            while(attribKeys.length < index)
            ;
        }
        //add an attribute handler for new and changed attributes
        templateProxy.on(
            [
                "attributes.*"
                , "delete attributes.*"
            ]
            , onAttributeChange.bind(
                null
                , templateProxy
                , context
            )
        );
    }
    /**
    * @function
    */
    function processAttribute(templateProxy, context, attributeName) {
        //see if we are skipping this attribute
        if (
            is_array(templateProxy.skipAttributes)
            && templateProxy.skipAttributes.indexOf(attributeName) !== -1
        ) {
            return;
        }
        //see if there is a handler for this attribute
        var attribute = templateProxy.attributes[attributeName]
        , handler = utils_lookup(
            attributeName
            , template_attributeHandlers
        );
        //if so, use it
        if (!!handler) {
            handler(
                templateProxy
                , context
                , attributeName
            );
        }
        //otherwise, process string attributes this with the attributeProcessor
        else if (is_string(attribute)) {
            //skip if there aren't any expressions in the attribute value
            if (hasTemplateExpression(attribute)) {
                //process the attribute
                attributeProcessor(
                    templateProxy
                    , context
                    , attributeName
                );
            }
        }

    }
    /**
    * @function
    */
    function processChildren(templateProxy, context) {
        if (is_array(templateProxy.children)) {
            //loop through the child nodes and setup each node
            //keep the length lookup in the loop conditional so any live child appends are included in the loop
            for(let i = 0; i < templateProxy.children.length; i++) {
                setupChild(
                    templateProxy
                    , context
                    , `${templateProxy.namespace}.children`
                    , i
                );
                processTemplate(
                    templateProxy.children[i]
                    , context
                );
            }
        }

        //add a listener for the children array
        templateProxy.on(
            [
                "children.*"
                , "children"
                , "delete children.*"
                , "delete children"
            ]
            , onChildChange.bind(
                null
                , templateProxy
                , context
            )
        );
    }
    /**
    * @function
    */
    function setupChild(templateProxy, context, namespace, index) {
        var child = templateProxy.children[index];
        //convert text values to a text node
        if (is_string(child)) {
            templateProxy.children[index] = {
                "nodeName": "text"
                , "text": child
            };
            child = templateProxy.children[index];
        }
        //set the child's namespace
        child.namespace = `${namespace}.${index}`;
        //add the sibling and parent lookups
        child.getNextSibling = getNextSibling.bind(
            null
            , templateProxy.children
            , child
        );
        child.getPreviousSibling = getPreviousSibling.bind(
            null
            , templateProxy.children
            , child
        );
        child.getParent = getParent.bind(
            null
            , templateProxy
        );
    }

    /**
    * @function
    */
    function getParent(parent) {
        return parent;
    }
    /**
    * @function
    */
    function getNextSibling(children, currentChild, selector) {
        var index = children.indexOf(currentChild);
        //if there aren't any next siblings
        if (index >= children.length) {
            return;
        }
        //if there isn't a selector then return the next sibling
        if (!selector) {
            return children[index + 1];
        }
        //if there is a selector loop until the first is found
        for(let i = index + 1, l = children.length; i < l; i++) {
            if (testSelector(children[i], selector)) {
                return children[i];
            }
        }
    }
    /**
    * @function
    */
    function getPreviousSibling(children, currentChild, selector) {
        var index = children.indexOf(currentChild);
        //if there isn't a previous
        if (index <= 0) {
            return;
        }
        if (!selector) {
            return children[index - 1];
        }
        //if there is a selector loop until the first is found
        for(let i = index - 1; i >= 0; i--) {
            if (testSelector(children[i], selector)) {
                return children[i];
            }
        }
    }
    /**
    * @function
    */
    function testSelector(childProxy, selector) {
        return Object.keys(selector)
        .every(
            function everySelectorKey(selectorKey) {
                var ref = utils_reference(
                    selectorKey
                    , childProxy
                );
                if (ref.found) {
                    if (ref.value === selector[selectorKey]) {
                        return true;
                    }
                }
            }
        );
    }

    /**
    * @function
    */
    function destroyTemplate(templateProxy) {
        //destroy any child templates
        if (!!templateProxy.children) {
            templateProxy.children
            .forEach(
                function forEachChild(child) {
                    if (!!child.destroy) {
                        child.destroy();
                    }
                }
            );
        }
        //mark the template as destroyed so any external tag and attributes handlers can destroy any hooks created for the template
        templateProxy.destroyed = true;

        reporter.extended(
            `${infos.ui.gui.template.template_destroyed} (${templateProxy.nodeName}:${templateProxy.namespace})`
        );
    }

    /**
    * Handles a change to the attribute value itself, destroying the attribute if a delete and processing the attribute if it's an update.
    * @function
    */
    function onAttributeChange(templateProxy, context, event) {
        var attributeName = event.key.split(".", 2)[1];
        //this could be a change on an attribute's path, but not the attribute directly
        if (attributeName.indexOf(".") !== -1) {
            return;
        }
        //process/reprocess the attribute
        processAttribute(
            templateProxy
            , context
            , attributeName
        );
    }
    /**
    * @function
    */
    function onChildChange(templateProxy, context, event) {
        var match = event.key.match(CHILD_INDEX_PATT)
        , childIndex
        , childProxy
        ;
        //return if this is a change to a childs property, not the child itself
        if (!match) {
            return;
        }
        //get the childIndex from the key
        childIndex = parseInt(match[1]);
        //if the event is a replace with the new value being null it's a delete
        if (event.action === "replace" && event.value === null) {
            templateProxy.children.splice(childIndex, 1);
            resetChildNamespace(
                templateProxy
            );
            return;
        }
        //fix the children's namespaces for inserts, deletes
        if (["delete","insert"].indexOf(event.action) !== -1) {
            resetChildNamespace(
                templateProxy
            );
        }
        else {
            templateProxy.children[childIndex].namespace =
                `${templateProxy.namespace}.children.${childIndex}`
            ;
        }
        //deletes and replaces require and old value to be destroyed
        if (["delete","replace"].indexOf(event.action) !== -1) {
            childProxy = event.oldValue;
            destroyTemplate(
                childProxy
            );
        }
        //an add needs to be setup
        if (event.action === "append" || event.action === "insert") {
            setupChild(
                templateProxy
                , context
                , `${templateProxy.namespace}.children`
                , childIndex
            );
        }
        //anything other than delete should be processed
        if (event.action !== "delete") {
            childProxy = templateProxy.children[childIndex];
            processTemplate(
                templateProxy.children[childIndex]
                , context
            );
        }
    }
    /**
    * @function
    */
    function resetChildNamespace(templateProxy) {
        templateProxy.children
        .forEach(
            function forEachChild(child, index) {
                child.namespace =
                    `${templateProxy.namespace}.children.${index}`
                ;
            }
        );
    }
}
