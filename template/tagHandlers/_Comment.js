/**
* @factory
*/
function _Comment(
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

    return Comment;

    /**
    * @worker
    */
    function Comment(templateProxy, context) {
        //check for and process any expressions
        processComment(
            templateProxy
            , context
        );
        //add a listener which will fire text property gets changes
        templateProxy.on(
            [
                "comment"
                , "delete comment"
            ]
            , onCommentUpdate.bind(
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
    function processComment(templateProxy, context) {
        var expression;
        //we must have a text property
        if (!templateProxy.hasOwnProperty("comment")) {
            throw new Error(
                `${errors.ui.gui.template.handlers.missing_comment}`
            );
        }
        //destroy the current expression if there is one
        destroyExpression(
            templateProxy
        );
        //process the expression if there is one
        if (hasExpression(templateProxy.comment)) {
            //create the expression
            expression = template_expression(
                templateProxy.comment
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
                , updateComment.bind(
                    null
                    , templateProxy
                    , context
                )
            );
            templateProxy.comment = expression.execute(
                context
            );
        }
    }
    /**
    * @function
    */
    function updateComment(templateProxy, context) {
        var expression = expressionMap.get(
            templateProxy
        );
        templateProxy.comment = expression.execute(
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
    function onCommentUpdate(templateProxy, context, event) {
        try {
            processComment(
                templateProxy
                , context
            );
        }
        catch(ex) {
            templateProxy.comment = "";
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