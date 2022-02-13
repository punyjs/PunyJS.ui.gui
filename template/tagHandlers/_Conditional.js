/**
*
* for if or elseif
*     execute the expression
*         if true
*             mark as render true
*             mark conditional next siblings as render false
*         if false
*             mark as render false
* for else
*     if all other conditional siblings are render false
*     mark as render true
* @factory
*/
function _Conditional(
    template_expression
    , template_isExpression
    , template_createExpressionListeners
    , expression_interface
    , is_object
    , weakMap
    , reporter
    , errors
) {
    /**
    * @alias
    */
    var createExpressionListeners = template_createExpressionListeners
    /**
    * @alias
    */
    , expression = expression_interface
    /**
    * A collection of conditional expressions
    * @property
    */
    , conditionalMap = new weakMap()
    /**
    * @constants
    */
    , cnsts = {
        "conditionalNames" : [
            "if"
            , "elseif"
            , "else"
        ]
    }
    ;

    return Conditional;

    /**
    * @worker
    */
    function Conditional(templateProxy, context, conditionalName) {
        //if this is an else then nothing to setup
        if (conditionalName === "else") {
            //process the conditional for the first time
            processConditional(
                templateProxy
                , context
                , conditionalName
            );
            return;
        }
        //determine the attribute to listen to
        var attributeListeners = [
            "attributes.expr"
            , "delete attributes.expr"
        ];
        //if the tag name is not the conditional name then use the conditional
        if (templateProxy.nodeName !== conditionalName) {
            attributeListeners = [
                `attributes.${conditionalName}`
                , `delete attributes.${conditionalName}`
            ];
        }
        //hydrate conditional expression and setup state listeners
        setupConditional(
            templateProxy
            , context
            , conditionalName
        );
        //process the conditional for the first time
        processConditional(
            templateProxy
            , context
            , conditionalName
        );
        //add listeners for the template proxy
        templateProxy.on(
            attributeListeners
            , onConditionalChange.bind(
                null
                , templateProxy
                , context
                , conditionalName
            )
        );
        //add a listener for the destroyed property
        templateProxy.on(
            "destroyed"
            , onTemplateDestroy.bind(
                null
                , templateProxy
            )
        );
    }

    /**
    * @function
    */
    function setupConditional(templateProxy, context, conditionalName) {
        //no attributes, how are we going to get the expression
        if (!is_object(templateProxy.attributes)) {
            throw new Error(
                `${errors.ui.gui.template.handlers.missing_attributes} (${missing_attributes})`
            );
        }
        //mark the render as if not set
        if (!templateProxy.hasOwnProperty("renderAs")) {
            templateProxy.renderAs = "comment";
        }
        //we need the expression string
        var expressionString =
            templateProxy.attributes.hasOwnProperty(conditionalName)
                //if an attribute
                ? templateProxy.attributes[conditionalName]
                //if a tag
                : templateProxy.attributes.expr
        //evaluate the expression
        , conditionalExpr = expression(
            expressionString
        )
        //add listeners for the expression
        , listeners = !!conditionalExpr
            && createExpressionListeners(
                conditionalExpr
                , context
                , onStateUpdate.bind(
                    null
                    , templateProxy
                    , context
                )
            )
        ;
        //if we didn't have an expression
        if (!conditionalExpr) {
            new Error(
                `${errors.ui.gui.template.handlers.invalid_conditional_expression} (${conditionalName})`
            );
        }
        //add the map for lookup
        conditionalMap.set(
            templateProxy
            , {
                "expression": conditionalExpr
                , "listeners": listeners
            }
        );
    }
    /**
    * @function
    */
    function processConditional(templateProxy, context, conditionalName) {
        //see if there are previous siblings with render true, mark this false
        if (previousSiblingsTrue(templateProxy)) {
            templateProxy.render = false;
            return;
        }
        //if this is an else then nothing else passed
        else if (conditionalName === "else") {
            templateProxy.render = true;
            return;
        }
        //retrieve and execute the expression (if and else if only)
        var entry = conditionalMap.get(
            templateProxy
        )
        , expression = entry.expression
        , result = expression.execute(
            context
        )
        ;
        //if it is true, then set render to true, and mark subsequent siblings as render false
        if (!!result) {
            templateProxy.render = true;
        }
        //if not true set render to false
        else {
            templateProxy.render = false;
        }
    }
    /**
    * @function
    */
    function previousSiblingsTrue(templateProxy) {
        //get the next sibling with a conditional tag
        var sibling = templateProxy
        , conditionalName
        ;
        //mark siblings
        while((sibling = sibling.getPreviousSibling())) {
            conditionalName = getConditionalName(
                sibling
            );
            if (!!conditionalName) {
                if (sibling.render === true) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
    * @function
    */
    function getNextSibling(templateProxy) {
        //get the next sibling with a conditional tag
        var sibling = templateProxy
        , conditionalName
        ;
        //mark siblings
        while((sibling = sibling.getNextSibling())) {
            conditionalName = getConditionalName(
                sibling
            );
            if (!!conditionalName) {
                break;
            }
        }
        //see if we found one, process it
        if (!!sibling && sibling !== templateProxy) {
            return [
                conditionalName
                , sibling
            ];
        }
    }
    /**
    * @function
    */
    function setSiblingsNoRender(templateProxy) {
        var sibling = templateProxy
        , conditionalName
        ;
        //mark siblings as no render
        while((sibling = sibling.getNextSibling())) {
            conditionalName = getConditionalName(
                sibling
            );
            if (!!conditionalName) {
                sibling.render = false;
            }
        }
    }
    /**
    * @function
    */
    function processNextSibling(templateProxy, context) {
        //get the next sibling with a conditional tag
        var [conditionalName, sibling] = getNextSibling(
            templateProxy
        );
        if (!sibling) {
            return;
        }
        if (conditionalName === "else") {
            sibling.render = true;
            return;
        }
        //process the conditional and see if it's render true
        processConditional(
            sibling
            , context
            , conditionalName
        );
        if (!sibling.render) {
            processNextSibling(
                sibling
                , context
            );
        }
    }
    /**
    * @function
    */
    function getConditionalName(templateProxy) {
        //tag name
        if (cnsts.conditionalNames.indexOf(templateProxy.nodeName) !== -1) {
            return templateProxy.nodeName;
        }
        //no attributes, nothing else to check
        if (!templateProxy.attributes) {
            return;
        }
        //get the list of attribute names
        var attributeKeys = Object.keys(templateProxy.attributes);
        //find one that is in the conditional names list
        return attributeKeys
            .find(
                function findConditionalAttribute(name) {
                    return cnsts.conditionalNames.indexOf(name) !== -1;
                }
            )
        ;
    }
    /**
    * Handles a change in statate data that
    * @function
    */
    function onStateUpdate(templateProxy, context, conditionalName, event) {
        //otherwise process the conditional
        processConditional(
            templateProxy
            , context
            , conditionalName
        );
        //if this is render true then update the siblings to render false
        if (templateProxy.render) {
            setSiblingsNoRender(
                templateProxy
            );
            return;
        }
        //if this was marked as render false, then find the next sibling
        processNextSibling(
            templateProxy
            , context
        );
    }
    /**
    * @function
    */
    function onConditionalChange(
        templateProxy
        , context
        , conditionalName
        , event
    ) {
        //on delete of the conditional attribute
        if (event.action === "delete") {
            //if this is render true, we need to process the next sibling
            if (templateProxy.render) {
                processNextSibling(
                    templateProxy
                    , context
                );
            }
            //destroy listeners and map entry
            destroyMapEntry(
                templateProxy
            );
        }
        //on update: adding attributes will be handled by the template processor
        else {
            //hydrate conditional expression and setup state listeners
            setupConditional(
                templateProxy
                , context
                , conditionalName
            );
            //process the conditional for the first time
            processConditional(
                templateProxy
                , context
                , conditionalName
            );
            //if this is true then mark the others
            if (templateProxy.render) {
                setSiblingsNoRender(
                    templateProxy
                );
            }
            else {
                processNextSibling(
                    templateProxy
                    , context
                );
            }
        }
    }
    /**
    * @function
    */
    function onTemplateDestroy(templateProxy) {
        //destroy entry
        destroyMapEntry(
            templateProxy
        );
    }
    /**
    * @function
    */
    function destroyMapEntry(templateProxy) {
        var entry = conditionalMap.get(templateProxy);
        if (!!entry) {
            destroyListeners(
                entry.listeners
            );
            conditionalMap.delete(templateProxy);
        }
    }
    /**
    * @function
    */
    function destroyListeners(listeners) {
        if (!listeners) {
            return;
        }
        //loopthrough
        listeners.forEach(
            function destroyListener(listener) {
                try {
                    listener.parent
                        .$removeListener(
                            listener.uuids
                        )
                    ;
                }
                catch(ex) {
                    reporter.error(
                        ex
                    );
                }
            }
        );
    }
}