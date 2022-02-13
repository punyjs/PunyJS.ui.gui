/**
* @factory
*/
function _Text(
    template_expression
    , template_hasExpression
    , template_createExpressionListeners
    , weakMap
    , is_array
    , errors
    , reporter
) {
    /**
    * @alias
    */
    var hasExpression = template_hasExpression
    /**
    * @alias
    */
    , createExpressionListeners = template_createExpressionListeners
    /**
    * A weak map to store expressions
    * @property
    */
    , expressionMap = new weakMap()
    ;

    return Text;

    /**
    * @worker
    */
    function Text(templateProxy, context) {
        //check for and process any expressions
        processText(
            templateProxy
            , context
        );
        //add a listener which will fire text property gets changes
        templateProxy.on(
            [
                "text"
                , "delete text"
            ]
            , onTextUpdate.bind(
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
            )
        );
    }

    /**
    * @function
    */
    function processText(templateProxy, context) {
        var expression;
        //we must have a text property
        if (!templateProxy.hasOwnProperty("text")) {
            throw new Error(
                `${errors.ui.gui.template.handlers.missing_text}`
            );
        }
        //destroy the current expression if there is one
        destroyExpression(
            templateProxy
        );
        //process the expression if there is one
        if (hasExpression(templateProxy.text)) {
            //create the expression
            expression = template_expression(
                templateProxy.text
            );
            //add the expression to the map
            expressionMap.set(
                templateProxy
                , expression
            );
            //create the listeners
            expression.listeners = createExpressionListeners(
                expression
                , context
                , updateText.bind(
                    null
                    , templateProxy
                    , context
                )
            );
            templateProxy.text = expression.execute(
                context
            );
        }
    }
    /**
    * @function
    */
    function updateText(templateProxy, context) {
        var expression = expressionMap.get(
            templateProxy
        );
        templateProxy.text = expression.execute(
            context
        );
    }
    /**
    * @function
    */
    function destroyExpression(templateProxy) {
        //get the expression from the map
        var expression = expressionMap.get(
            templateProxy
        );
        //nothing to do if there isn't an expression
        if (!expression) {
            return;
        }
        //delete from the map
        expressionMap.delete(
            templateProxy
        );
        //remove the listeners
        if (is_array(expression.listeners)) {
            expression.listeners
            .forEach(
                function forEachListener(listener) {
                    listener.parent
                        .$removeListener(
                            listener.uuids
                        )
                    ;
                }
            );
        }
    }


    /**
    * @function
    */
    function onTextUpdate(templateProxy, context, event) {
        try {
            processText(
                templateProxy
                , context
            );
        }
        catch(ex) {
            templateProxy.text = "";
            reporter.error(
                ex
            );
        }
    }
    /**
    * @function
    */
    function onTemplateDestroy(templateProxy, context, event) {
        destroyExpression(
            templateProxy
        );
    }
}