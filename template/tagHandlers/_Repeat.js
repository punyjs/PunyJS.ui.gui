/**
* @factory
*/
function _Repeat(
    utils_deep
    , template_expression
    , template_hasExpression
    , template_attributeProcessor
    , weakMap
    , is_object
    , errors
) {

    /**
    * @alias
    */
    var hasExpression = template_hasExpression
    /**
    * @alias
    */
    , attributeProcessor = template_attributeProcessor
    /**
    * @property
    */
    , repeatTemplateMap = new weakMap()
    ;

    return Repeat;

    /**
    * @worker
    */
    function Repeat(templateProxy, context) {
        var repeatTemplate, attributeName, updateFn;
        if (templateProxy.nodeName === "repeat") {
            attributeName = "expr";
            repeatTemplate = repeatTag(
                templateProxy
            );
        }
        else {
            attributeName = "repeat";
            repeatTemplate = repeatAttribute(
                templateProxy
            );
        }
        //mark this so it's not rendered in the DOM
        templateProxy.noRender = true;
        templateProxy.skipChildren = true;
        //clear the children array
        templateProxy.children.length = 0;
        //add the template to the map
        repeatTemplateMap.set(
            templateProxy
            , repeatTemplate
        );
        //create an update function bound to the proxy and context
        updateFn = updateRepeat.bind(
            null
            , templateProxy
            , context
        );
        //process the attribute, this should call the update Fn
        attributeProcessor(
            templateProxy
            , context
            , attributeName
            , updateFn
        );
        //add a listener which will fire if the attribute gets changed
        templateProxy.on(
            [
                `attributes.${attributeName}`
                , `delete attributes.${attributeName}`
            ]
            , onAttributeUpdate.bind(
                null
                , templateProxy
                , context
                , updateFn
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
    function repeatTag(templateProxy) {
        ///INPUT VALIDATION
        //we must have an expr for repeat tags
        if (!templateProxy.attributes || !templateProxy.attributes.expr) {
            throw new Error(
                `${errors.ui.gui.template.handlers.missing_expr_attribute}`
            );
        }
        ///END INPUT VALIDATION
        return utils_deep(
            templateProxy.children
        );
    }
    /**
    * @function
    */
    function repeatAttribute(templateProxy) {
        //create a repeat template & convert the template proxy to a repeat tag
        var repeatTemplate = utils_deep(
            templateProxy
        )
        , startDelete = false
        ;
        //remove the repeat attribute from the template
        delete repeatTemplate.attributes.repeat;
        //re-type the template
        templateProxy.nodeName = "repeat";
        //remove the attributes from the template proxy, after the repeat attrib
        Object.keys(templateProxy.attributes)
        .forEach(
            function forEachAttributeName(name) {
                if (name === "repeat") {
                    startDelete = true;
                }
                else if (startDelete) {
                    delete templateProxy.attributes[name];
                }
            }
        );

        return repeatTemplate;
    }
    /**
    * @function
    */
    function updateRepeat(templateProxy, context, attributeName) {
        //get the repeat template
        var repeatTemplate = repeatTemplateMap.get(
            templateProxy
        )
        , iterator = templateProxy.attributes[attributeName]
        ;
        if (!repeatTemplate) {
            throw new Error(
                `${errors.ui.gui.template.handlers.missing_repeat_template}`
            );
        }
        if (!is_object(iterator) || !iterator.hasOwnProperty("next")) {
            throw new Error(
                `${errors.ui.gui.template.handlers.invalid_template_expression}`
            );
        }
        processRepeat(
            templateProxy
            , iterator
            , repeatTemplate
        );
    }
    /**
    * @function
    */
    function processRepeat(templateProxy, repeatIterator, repeatTemplate) {
        var data, childTemplate;
        //make sure the result is an iterator
        if (!repeatIterator.hasOwnProperty("next")) {
            throw new Error(
                `${errors.ui.gui.template.handlers.invalid_iterator}`
            );
        }
        //loop through the iterator
        while((data = repeatIterator.next())) {
            //create a copy of the template which will become a child
            childTemplate = utils_deep(
                repeatTemplate
            )
            //process the child template
            templateProxy.processTemplate(
                childTemplate
                , data
            );
            //add the children to the template proxy
            for(let i = 0, l = childTemplate.length; i < l; i++) {
                templateProxy.children.push(
                    childTemplate[i]
                );
            }
        }
    }
    /**
    * @function
    */
    function onAttributeUpdate(
        templateProxy
        , context
        , updateFn
        , attributeName
        , event
    ) {
        if (event.action === "delete") {
            repeatTemplateMap.delete(
                templateProxy
            );
        }
        else {
            //process the attribute
            attributeProcessor(
                templateProxy
                , context
                , attributeName
                , updateFn
            );
        }
    }
    /**
    * @function
    */
    function onTemplateDestroy(templateProxy) {
        repeatTemplateMap.remove(
            templateProxy
        );
    }
}