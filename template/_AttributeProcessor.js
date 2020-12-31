/**
* The attribute processor loops through each property in the template's attributes object and processes each value.
*   - Checks for template expressions
*       - Processes the expressions
*       - Updates the attribute value with the expression result
*       - Adds listeners for any watched variables
*           - Set to re-execute the expression when a change is detected
*   - Identifies if the attribute is an event
*       - sets the attribute to the template event handler
*   - Otherwise checks for an attribute handler
*       - The handler is executed with the tempalte proxy
* @factory
*/
function _AttributeProcessor(
    template_expression
    , template_hasExpression
    , template_handlers
    , template_event
    , weakMap
    , utils_lookup
    , utils_reference
    , is_object
    , is_empty
    , is_string
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

    return AttributeProcessor;

    /**
    * @worker
    */
    function AttributeProcessor(templateProxy) {
        if (!is_object(templateProxy.attributes)) {
            return;
        }
        //convert any expressions into expression interfaces
        Object.keys(templateProxy.attributes)
        .forEach(
            processAttributeExpressions.bind(
                null
                , templateProxy
            )
        );
        //process each attribute
        Object.keys(templateProxy.attributes)
        .forEach(
            processAttribute.bind(
                null
                , templateProxy
            )
        );
        //add an attribute change listener
        templateProxy.on(
            "attributes.*"
            , attributeChangeHandler.bind(
                null
                , templateProxy
            )
        );
        templateProxy.on(
            "delete attributes.*"
            , attributeChangeHandler.bind(
                null
                , templateProxy
            )
        );
    }

    /**
    * @function
    */
    function processAttributeExpressions(templateProxy, attributeName) {
        var attribute = templateProxy.attributes[attributeName]
        , expression
        ;
        //skip if there aren't any expressions in the attribute value
        if (!hasTemplateExpression(attribute)) {
            return;
        }
        //create the template expression
        expression = template_expression(
            attribute
        );
        //create an update function for the attribute expression
        expression.update = updateAttribute.bind(
            null
            , templateProxy
            , attributeName
        );
        //create a destroy function for the attribute expression
        expression.destroy = destroyAttribute.bind(
            null
            , templateProxy
            , attributeName
        );
        //create a listener for the expression's variables
        createListeners(
            templateProxy
            , attributeName
            , expression
        );
        //add an entry to the map if missing
        if (!expressionsMap.has(templateProxy)) {
            expressionsMap.set(templateProxy, {});
        }
        //add the expression to the collection
        expressionsMap.get(templateProxy)[attributeName] = expression;
    }
    /**
    * @function
    */
    function updateAttribute(templateProxy, attributeName) {
        var attributes = templateProxy.attributes
        , expression = expressionsMap.get(templateProxy)[attributeName]
        , result = expression.execute(
            templateProxy.context
        )
        ;
        attributes[attributeName] = result;
    }
    /**
    * @function
    */
    function destroyAttribute(templateProxy, attributeName) {
        //destroy the listeners
        var expression = expressionsMap.get(templateProxy)[attributeName];
        if (!!expression) {
            destroyListeners(
                expression
            );
            //remove the expression
            delete expressionsMap.get(templateProxy)[attributeName];
        }
        //remove the event
        delete templateProxy.events[attributeName];
    }
    /**
    * @function
    */
    function processAttribute(templateProxy, attributeName) {
        var attribute = templateProxy.attributes[attributeName]
        , expression = expressionsMap.has(templateProxy)
            ? expressionsMap.get(templateProxy)[attributeName]
            : null
        ;
        //fire the update to give the attribute it's real value
        if (!!expression) {
            expression.update(
                templateProxy.context
            );
        }
        //if this is an event then use a different path
        if (attributeName.match(EVENT_PATT)) {
            processEventAttribute(
                templateProxy
                , attributeName
            );
            return;
        }
        //see if there is a handler for this attribute
        var handler = utils_lookup(
            attributeName
            , template_handlers
        );
        if (!!handler) {
            handler(
                templateProxy
                , attributeName
                , "attribute"
            );
        }
    }
    /**
    * @function
    */
    function processEventAttribute(templateProxy, attributeName) {
        var attributes = templateProxy.attributes
        , context = templateProxy.context
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
    function attributeChangeHandler(templateProxy, event) {
        //if the event is a string then that is the attribute that is being deleted
        if (is_string(event)) {
            destroyAttribute(
                templateProxy
                , event
            );
            return;
        }
        var attributeName = event.key.split(".", 2)[1]
        ;
        //this could be a change on an attribute's path, but not the attribute directly
        if (attributeName.indexOf(".") !== -1) {
            return;
        }
        //if there is an existing attribute then destroy it
        if (!event.miss) {
            destroyAttribute(
                templateProxy
                , attributeName
            );
        }
        //process the new attribute value
        processAttributeExpressions(
            templateProxy
            , attributeName
        );
        processAttribute(
            templateProxy
            , attributeName
        );
    }
    /**
    * @function
    */
    function createListeners(templateProxy, attributeName, expression) {
        var attribute = templateProxy.attributes[attributeName]
        , listeners = []
        ;
        //skip this if there aren't any variables
        if (is_empty(expression.variables)) {
            return;
        }
        //loop through each varaible, find it's parent, and check if it's stateful, if so then add it to the listeners list
        expression.variables
        .forEach(
            function forEachVarPath(varPath) {
                var watchedRef = getWatched(
                    templateProxy.context
                    , varPath
                )
                , uuids
                ;
                if (!!watchedRef) {
                    uuids = watchedRef.parent.$addListener(
                        watchedRef.index
                        , expression.update
                        , ["set","delete"]
                    );
                    listeners.push(
                        {
                            "parent": watchedRef.parent
                            , "uuids": uuids
                        }
                    );
                }
            }
        );
        expression.listeners = listeners;
    }
    /**
    * start by checking the full path and if that is not found, start taking segments off of the path until one is found or the end is reached
    * @function
    */
    function getWatched(context, varPath) {
        var ref, segments, path
        ;
        //split the path
        segments = varPath.split(".");
        //start checking each ancestor
        for(let i = segments.length; i >= 0; i--) {
            path = segments.slice(0, i);
            ref = utils_reference(
                varPath
                , context
            );
            if (ref.found) {
                if (ref.parent.isStateful) {
                    return ref;
                }
            }
        }
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
}