/**
* @factory
*/
function _Style(
    template_expression
    , template_hasExpression
    , template_isExpression
    , template_createExpressionListeners
    , weakMap
    , utils_uuid
    , utils_lookup
    , is_array
    , is_string
    , is_object
    , is_empty
    , is_func
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
    * @property
    */
    , entryMap = new weakMap()
    /**
    * An object to act in place of an iterator expression, returning a blank string when execute is called
    * @property
    */
    , blankExpression = {
        "execute": function blankExecute() {
            return "";
        }
    }
    /**
    * A regular expression pattern for replacing dots with escaped dots
    * @property
    */
    , DOT_PATT = /(?:(?<![\\])|(?<=[\\]{2}))[.]/g
    /**
    * A regular expression pattern for replacing escaped dots "\."
    * @property
    */
    , ESC_DOT_PATT = /(?<![\\])[\\][.]/g
    ;

    return Style;

    /**
    * @worker
    */
    function Style(templateProxy, context) {
        //there must be a selectors property
        if (!templateProxy.hasOwnProperty("selectors")) {
            throw new Error(
                `${errors.ui.gui.template.handlers.missing_selectors}`
            );
        }
        //process the selectors, add listeners for espressions, create array of css children
        templateProxy.children = createSelectorEntries(
            templateProxy
            , context
        )
        ;
        //add a listener for the selectors
        templateProxy.on(
            [
                "selectors"
                , "selectors.*"
                , "delete selectors"
                , "delete selectors.*"
            ]
            , onSelectorChange.bind(
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
    function createSelectorEntries(templateProxy, context) {
        var children = []
        , entries = {}
        ;

        Object.keys(templateProxy.selectors)
        .forEach(
            function forEachSelector(selector) {
                entries[selector] = createSelectorEntry(
                    templateProxy.selectors[selector]
                    , selector
                    , context
                    , children
                );
            }
        );

        entryMap.set(
            templateProxy
            , entries
        );

        return children;
    }
    /**
    * @function
    */
    function createSelectorEntry(selectorProxy, selector, context, children) {
        //create the selector entry interface
        var entry = {
            "selectors": is_array(selector)
                ? selector
                : [selector]
            , "styles": {}
            , "childEntries": {}
        };

        //loop through and analyze the selectorProxy keys
        Object.keys(selectorProxy)
        .forEach(
            function forEachProp(propName) {
                var value = selectorProxy[propName]
                , childSelector = propName
                , childEntry
                ;
                //if the value is an object then this is a selector branch
                if (is_object(value)) {
                    //see if the propName has an expression in it
                    if (hasExpression(childSelector)) {
                        childSelector = template_expression(
                            propName
                        );
                        //if this is an iterator expression then update for processing
                        if (childSelector.type === "iterator") {
                            //get the iterator expression
                            childSelector.iteratorExpression =
                                childSelector.expressions[0]
                            ;
                            //replace the first expressions member, so the execute can be called without re-calling the iterator
                            childSelector.expressions[0] = blankExpression;
                        }
                    }
                    //append the child selector to the entry's selector
                    childSelector = entry.selectors.concat(
                        childSelector
                    );
                    //call self recursively to the child entry
                    childEntry = createSelectorEntry(
                        selectorProxy[propName]
                        , childSelector
                        , context
                        , children
                    );
                    entry.childEntries[propName] = childEntry;
                }
                //otherwise this is a property on the entry
                else {
                    if (is_array(value)) {
                        value = value.join("\n");
                    }
                    //add the property to the styles
                    if (hasExpression(value)) {
                        entry.styles[propName] = template_expression(
                           value
                       );
                    }
                    else {
                        entry.styles[propName] = value;
                    }
                }
            }
        );
        //if there are styles for this entry then add a child for this entry
        if (!is_empty(entry.styles)) {
            //create listeners for any expressionsMap
            entry.listeners = createEntryListeners(
                context
                , entry
                , children
            );
            //create a tracking id
            entry.uuid = utils_uuid({"version":4});
            //process the entry and add it to the children
            children.push(
                {
                    "tagName": "text"
                    , "uuid": entry.uuid
                    , "text": createCss(
                        context
                        , entry
                    )
                }
            );
        }

        return entry;
    }
    /**
    * @function
    */
    function createEntryListeners(context, entry, children) {
        //start a listeners list
        var listeners = [];
        //add listeners for any expression selectors
        entry.selectors
        .forEach(
            function forEachSelector(selector) {
                if (isExpression(selector)) {
                    var selectorListeners = createExpressionListeners(
                        selector
                        , context
                        , updateCss.bind(
                            null
                            , context
                            , children
                            , entry
                        )
                    );
                    if (!is_empty(selectorListeners)) {
                        listeners = listeners.concat(
                            selectorListeners
                        );
                    }
                }
            }
        );
        //add listeners for any styles
        Object.keys(entry.styles)
        .forEach(
            function forEachStyle(styleName) {
                var style = entry.styles[styleName]
                , styleListeners
                ;
                if (isExpression(style)) {
                    styleListeners = createExpressionListeners(
                        style
                        , context
                        , updateCss.bind(
                            null
                            , context
                            , children
                            , entry
                        )
                    );
                    if (!is_empty(styleListeners)) {
                        listeners = listeners.concat(
                            styleListeners
                        );
                    }
                }
            }
        );

        return listeners;
    }


    /**
    * @function
    */
    function updateCss(context, children, entry) {
        try {
            //find the child associated to this entry
            var childIndex = findChildIndex(
                children
                , entry
            )
            //create the CSS text
            , cssText = createCss(
                context
                , entry
            )
            ;
            //update the child
            children[childIndex].text = cssText;
        }
        catch(ex) {
            //if there is a childIndex then clear the css
            if (childIndex !== undefined) {
                children[childIndex].text = "";
            }
            ///LOGGING
            reporter.error(
                ex
            );
            ///END LOGGING
        }
    }
    /**
    * @function
    */
    function createCss(context, entry) {
        //process the selectors and determine the end context
        var processed = processSelectorNode(
            context
            , entry.selectors
        )
        ;
        var cssEntries = processed
            .map(
                function createCssEntry(selectorContext) {
                    var body = createCssBody(
                        selectorContext.context
                        , entry.styles
                    );
                    //combine the selector and the body
                    return `${selectorContext.selector.trim()} {${body}\n}`;
                }
            )
        ;

        return cssEntries.join("\n");
    }
    /**
    * @function
    */
    function processSelectorNode(context, selectors, index = 0) {
        var selector = selectors[index]
        , selectorText = selector
        , nextIndex = index + 1
        , nextSelector
        ;
        //if the selector is an expression, process it
        if (isExpression(selector)) {
            //see if the first expression is an iterator
            if (selector.type === "iterator") {
                //if so delegate to the iterator function
                return processSelectorIterator(
                    context
                    , selectors
                    , index
                );
            }
            //otherwise the selector text is the result of the expression
            selectorText = selector.execute(
                context
            );
        }
        if (is_string(selectorText)) {
            //if ther eis a leading ampersand there is no space
            if (selectorText.indexOf("&") === 0) {
                selectorText = selectorText.substring(1);
            }
            //otherwise we'll add a laeding space
            else {
                selectorText = ` ${selectorText}`;
            }
        }
        //if this isn't the last selector node then call recursively and append
        if (nextIndex < selectors.length) {
            //process the next selector
            nextSelector = processSelectorNode(
                context
                , selectors
                , nextIndex
            );
            //nextSelector is an array of 1..n selector/contexts
            //combine the selector text with the sub selectors
            nextSelector
            .forEach(
                function combineSubSelectors(selectorContext) {
                    selectorContext.selector =
                        `${selectorText}${selectorContext.selector}`
                    ;
                }
            )
            ;

            return nextSelector;
        }
        //this is a simple text selector with no next selector
        return [
            {
                "selector": selectorText
                , "context": context
            }
        ];
    }
    /**
    * @function
    */
    function processSelectorIterator(context, selectors, index) {
        //get the iterator
        var selector = selectors[index]
        , iterator = selector.iteratorExpression
            .execute(
                context
            )
        , data
        , childSelectors = []
        , iterationSelectors
        , intermediatText
        , nextIndex = index + 1
        ;
        //loop through the iterator and create a selector for each
        // each loop could result in 1..n selectors w/ independent
        while((data = iterator.next())) {
            //call the process selector for the next selector with the new data context, which will return an object with the selectors and the updated context
            if (nextIndex < selectors.length) {
                iterationSelectors = processSelectorNode(
                    data
                    , selectors
                    , nextIndex
                );
            }
            //if there is intermediate text add it to the resulting selectors
            if (selector.intermediate !== "<$0$>") {
                //execute the template expression
                intermediatText = selector.execute(
                    data
                );
                if (!!iterationSelectors) {
                    //add the intermediate text to each selector
                    iterationSelectors
                    .map(
                        function insertIntermediateText(selector) {
                            selector.selector =
                                `${intermediatText}${selector.selector}`
                            ;
                        }
                    )
                    ;
                }
            }
            if (!!iterationSelectors) {
                //add this set of selectors to the rest
                childSelectors = childSelectors.concat(
                    iterationSelectors
                );
            }
            else if (!!intermediatText) {
                if (intermediatText.indexOf("&") === 0) {
                    intermediatText = intermediatText.substring(1);
                }
                else {
                    intermediatText = ` ${intermediatText}`;
                }
                childSelectors.push(
                    {
                        "selector": intermediatText
                        , "context": data
                    }
                );
            }
        }

        return childSelectors;
    }
    /**
    * @function
    */
    function createCssBody(context, styles) {
        var bodyEntries = [];

        Object.keys(styles)
        .forEach(
            function addEachStyle(styleName) {
                var styleValue = styles[styleName];
                if (isExpression(styleValue)) {
                    styleValue = styleValue.execute(
                        context
                    );
                }
                bodyEntries.push(
                    `\n    ${styleName}:${styleValue};`
                );
            }
        );

        return bodyEntries.join("");
    }


    /**
    * @function
    */
    function onSelectorChange(templateProxy, context, event) {
        try {
            var entries = entryMap.get(templateProxy)
            , entryKey = event.key.substring(10) //take off selector.
            , entryRef = getEntry(
                entryKey
                , entries
            )
            , isStyleUpdate = !!entryRef.name
                && (
                    is_string(event.value)
                    || (
                            event.action === "delete"
                            && is_string(event.oldValue)
                    )
                )
            ;
            //style update
            if (isStyleUpdate) {
                handleStyleChange(
                    templateProxy
                    , context
                    , entryRef.entry
                    , event
                );
            }
            //entry update
            else {
                handleSelectorChange(
                    templateProxy
                    , context
                    , entryRef.entry
                    , event
                );
                //remove the entry from the entries collection if it's a root selector
                if (
                    event.action === "delete"
                    && entryKey.split(DOT_PATT).length === 1
                ) {
                    delete entries[
                        entryKey.replace(
                            ESC_DOT_PATT
                            , "."
                        )
                    ];
                }
            }
        }
        catch(ex) {
            reporter.error(
                ex
            );
        }
    }
    /**
    * @function
    */
    function getEntry(key, entries) {
        var scope = {
            "childEntries": entries
        }
        //split the key
        , parts = key.split(DOT_PATT)
        //get the name off the top
        , name = parts.pop()
            .replace(ESC_DOT_PATT, ".")
        ;
        //if there aren't any parts then this is directly on the entries object
        if (parts.length === 0) {
            return {
                "entry": entries[name]
            }
        }
        //loop through the parts and crawl down the entries
        parts.every(
            function everyPart(part) {
                part = part.replace(ESC_DOT_PATT, ".");
                if (part in scope.childEntries) {
                    scope = scope.childEntries[part];
                    return true;
                }
                return false;
            }
        );
        //if we didn't find anything, return
        if (!scope) {
            return;
        }
        //see if the value at name is an entry
        if (is_object(scope.childEntries[name])) {
            return {
                "entry": scope.childEntries[name]
            };
        }

        return {
            "name": name
            , "entry": scope
        };
    }
    /**
    * @function
    */
    function handleStyleChange(templateProxy, context, entry, event) {
        //determine the action, add and update
        if (event.action === "append" || event.action === "update") {
            entry.styles[event.name] = event.value;
        }
        //delete style
        else if (event.action === "delete") {
            delete entry.styles[event.name];
        }
        //update the css
        updateCss(
            context
            , templateProxy.children
            , entry
        );
    }
    /**
    * @function
    */
    function handleSelectorChange(templateProxy, context, entry, event) {
        var selectors, childEntry;
        //determine the action
        if (event.action === "append" || event.action === "update") {
            selectors = entry.selectors;
            //update selector
            if (!event.miss) {
                //destroy the old entry
                destroyEntry(
                    templateProxy
                    , entry
                );
            }
            else {
                selectors = selectors.concat(
                    event.name
                );
            }
            childEntry = createSelectorEntry(
                event.value //as selectorProxy
                , selectors
                , context
                , templateProxy.children
            );

        }
        //delete selector
        else if (event.action === "delete") {
            destroyEntry(
                templateProxy
                , entry
            );
        }
        //add the child entry if there is one
        if (!!childEntry) {
            entry.childEntries[event.name] = childEntry;
        }
    }
    /**
    * @function
    */
    function findChildIndex(children, entry) {
        return children
            .findIndex(
                function findChildIndex(child) {
                    return child.uuid === entry.uuid;
                }
            )
        ;
    }


    /**
    * @function
    */
    function onTemplateDestroy(templateProxy) {
        //get the root level entries
        var entries = entryMap.get(templateProxy);
        //destroy each entry
        Object.keys(entries)
        .forEach(
            function forEachSelector(key) {
                destroyEntry(
                    templateProxy
                    , entries[key]
                );
            }
        );

        entryMap.delete(templateProxy);
    }
    /**
    * @function
    */
    function destroyEntry(templateProxy, entry) {
        //if there are listeners, destory them
        if (!is_empty(entry.listeners)) {
            destroyListeners(
                entry.listeners
            );
        }
        //destroy child entries
        if (!!entry.childEntries) {
            Object.keys(entry.childEntries)
            .forEach(
                function forEachChildEntry(childEntryKey) {
                    destroyEntry(
                        templateProxy
                        , entry.childEntries[childEntryKey]
                    );
                }
            );
        }
        //remove the child from the template's children array
        var childIndex = findChildIndex(
            templateProxy.children
            , entry
        )
        , entries
        , entryIndex
        if (childIndex !== -1) {
            templateProxy.children
                .splice(childIndex, 1)
            ;
        }
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
