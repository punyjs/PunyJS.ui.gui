/**
* @factory
*/
function _TemplateProcessor(
    utils_proxy_biDirectionalWatcher
    , template_handlers
    , template_domFragmentManager
    , template_attributeProcessor
    , utils_lookup
    , is_array
    , is_object
    , is_string
    , errors
) {
    /**
    * @alias
    */
    var biDirWatcher = utils_proxy_biDirectionalWatcher
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
    ;

    return TemplateProcessor;

    /**
    * @worker
    */
    function TemplateProcessor(jsonTemplate) {
        //Create the bi-directional proxy
        var proxies = biDirWatcher(
            jsonTemplate
        )
        , domProxy = proxies[0]
        , templateProxy = proxies[1]
        , fragmentId
        ;
        //set the root namespace
        templateProxy.namespace = "$";
        //process the template tag, attributes and children
        processTemplate(
            templateProxy
        );
        //create dom fragment
        fragmentId = domFragmentManager.create(
            domProxy
        );

        return {
            "templateProxy": templateProxy
            , "domProxy": domProxy
            , "fragmentId": fragmentId
        };
    }
    /**
    * @function
    */
    function processTemplate(templateProxy) {
        //process tag
        processTag(
            templateProxy
        );
        //process attributes
        attributeProcessor(
            templateProxy
        );
        //process children
        processChildren(
            templateProxy
        );
    }
    /**
    * @function
    */
    function processTag(templateProxy) {
        ///INPUT VALIDATION
        if (!templateProxy.hasOwnProperty("tagName")) {
            throw new Error(
                `${errors.ui.gui.template.missing_tag_name}`
            );
        }
        ///END INPUT VALIDATION
        var tagName = templateProxy
            .tagName
            .replace(DASH_PATT, ".")
        //see if there is a handler for this tagName
        , handler = utils_lookup(
            tagName
            , template_handlers
        );
        if (!!handler) {
            handler(
                templateProxy
                , tagName
                , "tag"
            );
        }
    }
    /**
    * @function
    */
    function processChildren(templateProxy) {
        if (!is_array(templateProxy.children)) {
            return;
        }
        var namespace = `${templateProxy.namespace}.children`;
        //loop through the child nodes and process the non-text nodes
        //keep the length lookup in the loop conditional so child additions are included in the loop
        for(let i = 0; i < templateProxy.children.length; i++) {
            //convert text values to a text node
            if (is_string(templateProxy.children[i])) {
                templateProxy.children[i] = {
                    "tagName": "text"
                    , "attributes": {
                        "text": templateProxy.children[i]
                    }
                };
            }
            //set the child's namespace
            templateProxy.children[i].namespace = `${namespace}.${i}`;
            //set the context if missing
            if (!templateProxy.children[i].hasOwnProperty("context")) {
                templateProxy.children[i].context = templateProxy.context;
            }
            processTemplate(
                templateProxy.children[i]
            );
        }
    }
}