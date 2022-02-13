/**
* @factory
*/
function _Variable(
    template_expression
    , template_hasExpression
    , template_isExpression
    , template_createExpressionListeners
    , weakMap
    , reporter
) {
    /**
    * @alias
    */
    var createExpressionListeners = template_createExpressionListeners
    /**
    * @alias
    */
    , hasExpression = template_hasExpression
    /**
    * @alias
    */
    , isExpression = template_isExpression
    /**
    * A weak map for storing variable expressions and listeners
    * @property
    */
    , variableMap = new weakMap()
    ;

    return Variable;

    /**
    * @worker
    */
    function Variable(templateProxy, context) {
        //get or create the map for this template proxy
        var variableExpressions = variableMap.get(
            templateProxy
        )
        ;
        if (!variableExpressions) {
            variableExpressions = {};
            variableMap.set(
                templateProxy
                , variableExpressions
            );
        }
        //loop through the attributes
        Object.keys(templateProxy.attributes)
        .forEach(
            function forEachAttrib(attribName) {
                processAttribute(
                    templateProxy
                    , context
                    , attribName
                );
            }
        );
        //add listeners for the template proxy
        templateProxy.on(
            [
                "attribute"
                , "attribute.*"
                , "delete attribute"
                , "delete attribute.*"
            ]
            , onAttributeChange.bind(
                null
                , templateProxy
                , context
            )
        );
        //add a listener for the destroyed property
        templateProxy.on(
            "destroyed"
            , onTemplateDestroy.bind(
                null
                , templateProxy
                , context
            )
        );
    }

    /**
    * @function
    */
    function processAttribute(templateProxy, context, attribName) {
        var variableExpressions = variableMap.get(
            templateProxy
        )
        , attrib = templateProxy.attributes[attribName]
        , expression
        , listeners
        ;
        //if expression wire up
        if (hasExpression(attrib)) {
            expression = template_expression(
                attrib
            );
            listeners = createExpressionListeners(
                expression
                , context
                , updateVariableFromExpression.bind(
                    null
                    , templateProxy
                    , context
                    , attribName
                )
            );
            //add the expression and listeners to the map
            expression.listeners = listeners;
            variableExpressions[attribName] = expression;
            //update the attribute value
            templateProxy.attributes[attribName] =
                expression.execute(
                    context
                )
            ;
        }
        //add attribute variable to the context
        context[attribName] =
            templateProxy.attributes[attribName]
        ;
    }
    /**
    * @function
    */
    function updateVariableFromExpression(
        templateProxy
        , context
        , attribName
        , event
    ) {
        var variableExpressions = variableMap.get(
            templateProxy
        )
        , expression = variableExpressions[attribName]
        ;
        //update the attribute value
        templateProxy.attributes[attribName] =
            expression.execute(
                context
            )
        ;
        //add attribute variable to the context
        context[attribName] =
            templateProxy.attributes[attribName]
        ;
    }
    /**
    * @function
    */
    function onAttributeChange(templateProxy, context, event) {
        //skip if the change isn't the attribute itself
        if (!templateProxy.attributes[event.name]) {
            return;
        }
        var attribName = event.name
        , variableExpressions = variableMap.get(
            templateProxy
        )
        , expression
        ;
        //add or update
        if (event.action === "append" || event.action === "update") {
            processAttribute(
                templateProxy
                , context
                , attribName
            );
        }
        //delete
        else if (event.action === "delete"){
            //delete the expression if one exists
            variableExpressions = variableMap.get(
                templateProxy
            );
            if (!!variableExpressions) {
                expression = variableExpressions[attribName];
                delete variableExpressions[attribName];
                destroyListeners(
                    expression.listeners
                );
            }
            //delete the variable from the context
            delete context[attribName];
        }
    }
    /**
    * @function
    */
    function onTemplateDestroy(templateProxy, context, event) {
        var variableExpressions = variableMap.get(
            templateProxy
        );
        //destroy expressions
        if (!!variableExpressions) {
            Object.keys(variableExpressions)
            .forEach(
                function forEachAttribExpression(attribName) {
                    destroyListeners(
                        variableExpressions[attribName].listeners
                    );
                }
            );
        }
        //remove the variables from the context
        //loop through the attributes
        Object.keys(templateProxy.attributes)
        .forEach(
            function forEachAttrib(attribName) {
                context[attribName] = undefined;
                delete context[attribName];
            }
        );
    }
    /**
    * @function
    */
    function destroyListeners(listeners) {
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
