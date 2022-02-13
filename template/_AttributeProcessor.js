/**
* @factory
*/
function _AttributeProcessor(
    template_expression
    , template_hasExpression
    , template_event
    , statenet_common_isStateful
    , template_createExpressionListeners
    , utils_lookup
    , utils_reference
    , is_empty
    , is_func
    , weakMap
    , reporter
    , infos
) {
    /**
    * @alias
    */
    var hasTemplateExpression = template_hasExpression
    /**
    * @alias
    */
    , templateEvent = template_event
    /**
    * @alias
    */
    , isStateful = statenet_common_isStateful
    /**
    * @alias
    */
    , createExpressionListeners = template_createExpressionListeners
    /**
    * A regular expression pattern for matching event attribute names
    * @property
    */
    , EVENT_PATT = /^on/i
    /**
    * A weak map to hold the template's expressions
    * @property
    */
    , expressionsMap = new weakMap()
    ;

    /**
    * @worker
    */
    return AttributeProcessor;

    /**
    * @function
    */
    function AttributeProcessor(
        templateProxy
        , context
        , attributeName
        , callback
    ) {
        reporter.extended(
            `${infos.ui.gui.template.attribute_processing} (${templateProxy.namespace}.attributes.${attributeName})`
        );
        //create the attribute expression
        var expression = processAttributeExpressions(
            templateProxy
            , attributeName
            , context
            , callback
        )
        ;
        //run the expression to update the attribute value
        if (!!expression) {
            expression.update(
                context
            );
        }
        //if this is an event then use the template event
        if (attributeName.match(EVENT_PATT)) {
            processEventAttribute(
                templateProxy
                , attributeName
                , context
            );
        }
        //add listeners to destroy the attribute if there is a delete or update
        templateProxy.on(
            [
                `attributes.${attributeName}`
                , `delete attributes.${attributeName}`
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
                , attributeName
            )
        );

        reporter.extended(
            `${infos.ui.gui.template.attribute_processed} (${templateProxy.namespace}.attributes.${attributeName})`
        );
    }
    /**
    * @function
    */
    function processEventAttribute(templateProxy, attributeName, context) {
        var attributes = templateProxy.attributes
        , name = attributeName.replace(EVENT_PATT, "")
        , externalEventFn = attributes[attributeName]
        , eventFn
        ;
        //set the attribute to a template event
        eventFn = attributes[attributeName] = templateEvent.bind(
            null
            , name
            , externalEventFn
            , context
        );
        //add an entry to the map if missing
        if (!templateProxy.hasOwnProperty("events")) {
            templateProxy.events = {};
        }
        //add a manual fire to the events interface
        templateProxy.events[name] = eventFn;
    }
    /**
    * @function
    */
    function processAttributeExpressions(
        templateProxy
        , attributeName
        , context
        , callback
    ) {
        var attribute = templateProxy.attributes[attributeName]
        , expression, map
        ;
        //skip if there aren't any expressions in the attribute value
        if (!hasTemplateExpression(attribute)) {
            return;
        }
        //create the template expression
        expression = template_expression(
            attribute
        );
        expression.update = updateAttribute.bind(
            null
            , templateProxy
            , attributeName
            , context
        );
        //create a listener for the expression's variables
        expression.listeners = createExpressionListeners(
            expression
            , context
            , expression.update
        );
        //add the callback function that will be called when the expression is updated
        if (!!callback) {
            expression.callback = callback;
        }

        ///EXPRESSION MAPPING
        //add an entry to the map if missing
        if (!expressionsMap.has(templateProxy)) {
            expressionsMap.set(templateProxy, {});
        }
        //add the expression to the collection
        map = expressionsMap.get(templateProxy);
        map[attributeName] = expression;
        ///END EXPRESSION MAPPING
        ///REPORTING
        reporter.extended(
            `${infos.ui.gui.template.template_expression_processed} (${templateProxy.namespace}.attributes.${attributeName})`
        );
        ///END REPORTING
        return expression;
    }
    /**
    * @function
    */
    function updateAttribute(templateProxy, attributeName, context) {
        ///LOGGING
        reporter.extended(
            `${infos.ui.gui.template.attribute_updating} (${templateProxy.namespace}.attributes.${attributeName})`
        );
        ///END LOGGING
        var attributes = templateProxy.attributes
        , map = expressionsMap.get(templateProxy)
        , expression = map[attributeName]
        , result = expression.execute(
            context
        )
        ;
        attributes[attributeName] = result;
        //if there is an expression callback then call it
        executeExpressionCallback(
            expression
            , attributeName
        );

        ///LOGGING
        reporter.extended(
            `${infos.ui.gui.template.attribute_updated} (${templateProxy.namespace}.attributes.${attributeName})`
        );
        ///END LOGGING
    }
    /**
    * @function
    */
    function executeExpressionCallback(expression, attributeName) {
        if (is_func(expression.callback)) {
            expression.callback(
                attributeName
            );
        }
    }
    /**
    * @function
    */
    function destroyAttribute(templateProxy, attributeName) {
        ///LOGGING
        reporter.extended(
            `${infos.ui.gui.template.attribute_destroying} (${templateProxy.namespace}.attributes.${attributeName})`
        );
        ///END LOGGING
        //destroy the listeners
        var expressions = expressionsMap.get(templateProxy);
        if (!!expressions[attributeName]) {
            destroyListeners(
                expressions[attributeName]
            );
            //remove the expression
            delete expressions[attributeName];
        }
        //remove the event
        delete templateProxy.events[attributeName];
        //remove the change listeners
        templateProxy.off(
            `attributes.${attributeName}`
        );
        ///LOGGING
        reporter.extended(
            `${infos.ui.gui.template.attribute_destroyed} (${templateProxy.namespace}.attributes.${attributeName})`
        );
        ///END LOGGING
    }
    /**
    * @function
    */
    function destroyListeners(expression) {
        var listener;
        if (!!expression.listeners) {
            for(let i = 0, l = expression.listeners.length; i < l; i++) {
                listener = expression.listeners[i];
                listener.parent.$removeListener(
                    listener.uuids
                );
            }
        }
    }
    /**
    * @function
    */
    function hasAttributeExpression(templateProxy, attributeName) {
        var expressions =  expressionsMap.get(templateProxy);
        return !!expressions[attributeName];
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
        //an updated value is re-processed in the template processor
        destroyAttribute(
            templateProxy
            , attributeName
        );
    }
    /**
    * @function
    */
    function onTemplateDestroy(templateProxy, attributeName) {
        destroyAttribute(
            templateProxy
            , attributeName
        );
    }
}