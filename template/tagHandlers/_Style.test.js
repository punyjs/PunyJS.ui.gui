/**
* @test
*   @title PunyJS.ui.gui.template.tagHandlers._Style: basic test
*/
function styleTagHandlerTest1(
    controller
    , mock_callback
) {
    var styleHandler, template_expression, template_hasExpression, template_isExpression, template_createExpressionListeners, templateProxy, context, execute;

    arrange(
        async function arrangeFn() {
            execute = mock_callback();
            template_isExpression = mock_callback(
                function mockIsExpression(value) {
                    if (value.hasOwnProperty("$$expression$$")) {
                        return true;
                    }
                    return false;
                }
            );
            template_expression = mock_callback(
                function mockTemplateExpression(value) {
                    if (value === "${width}px") {
                        return {
                            "original": value
                            , "expressions": [
                                {

                                }
                            ]
                            , "variables": [
                                "width"
                            ]
                            , "intermediate": "<$0$>px"
                            , "execute": execute
                            , "$$expression$$": true
                        };
                    }
                    else if (value === "${k,i in state\\.list}&:nth-child(${i})") {
                        return {
                            "original": value
                            , "expressions": [{}]
                            , "variables": [
                                "state.list"
                            ]
                            , "intermediate": "<$0$>&:nth-child(<$1$>)"
                            , "execute": execute
                            , "$$expression$$": true
                        };
                    }
                    else if (value === "${list[k].height}px") {
                        return {
                            "original": value
                            , "expressions": [{}]
                            , "variables": [
                                "list[k].height"
                            ]
                            , "intermediate": "<$0$>px"
                            , "execute": execute
                            , "$$expression$$": true
                        };
                    }
                    else if (value === "toolbar ${toolbar._class}") {
                        return {
                            "original": value
                            , "expressions": [{}]
                            , "variables": [
                                "toolbar._class"
                            ]
                            , "intermediate": "toolbar <$0$>"
                            , "execute": execute
                            , "$$expression$$": true
                        };
                    }
                    else if (value === "${textColor}") {
                        return {
                            "original": value
                            , "expressions": [{}]
                            , "variables": [
                                "textColor"
                            ]
                            , "intermediate": "<$0$>"
                            , "execute": execute
                            , "$$expression$$": true
                        };
                    }
                }
            );
            template_hasExpression = mock_callback(
                function mockHasExpression(value) {
                    return value.indexOf('${') !== -1;
                }
            );
            template_createExpressionListeners = mock_callback(
                function mockCreateExpressionListeners(sel, context, callback) {
                    return [];
                }
            );
            styleHandler = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Style"
                    , [
                        template_expression
                        , template_hasExpression
                        , template_isExpression
                        , template_createExpressionListeners
                    ]
                ]
            );
            templateProxy = {
                "nodeName": "style"
                , "selectors": {
                    "div > .childclass": {
                        "height": "192px"
                        , "width": "${width}px"
                        , "${k,i in state\\.list}&:nth-child(${i})": {
                            "height": "${list[k].height}px"
                        }
                    }
                    , "div:last-child": {
                        "display": "flex"
                        , "overflow": "auto"
                        , "&:not(:first-child)": {
                            "display": "none"
                            , "class": "toolbar ${toolbar._class}"
                        }
                        , "color": "${textColor}"
                    }
                }
                , "on": mock_callback()
                , "off": mock_callback()
            };
            context = {
                "width": 500
                , "textColor": "#777777"
                , "toolbar": {
                    "_class": "myclass"
                }
            };
        }
    );

    act(
        function actFn() {
            styleHandler(
                templateProxy
                , context
            );
        }
    );

    assert(
        function assertFn(test) {

        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template.tagHandlers._Style: functional test, state
*/
function styleTagHandlerTest2(
    controller
    , mock_callback
) {
    var styleHandler, template_expression, template_hasExpression, template_isExpression, templateProxy, context, execute, stateManager, state, initialCss, stateUpdatedCss, stateDeleteCss, stateListDeleteCss, stateListAddedCss;

    arrange(
        async function arrangeFn() {
            styleHandler = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Style"
                    , [

                    ]
                ]
            );
            stateManager = await controller(
                [
                    ".statenet.common.stateManager"
                ]
            );
            templateProxy = {
                "nodeName": "style"
                , "selectors": {
                    "div > .childclass": {
                        "height": "192px"
                        , "width": "${width}px"
                        , "${k,v,i in state\\.list}&:nth-child(${k})": {
                            "height": "${state\\.list[k].height}px"
                            , "display": "${state\\.list[k]._display}"
                        }
                    }
                    , "div:last-child": {
                        "display": "flex"
                        , "overflow": "auto"
                        , "&:not(:first-child).${state._class}": {
                            "display": "none"
                            , "class": "toolbar-${toolbar._class}"
                        }
                        , "color": "${textColor}"
                    }
                }
                , "on": mock_callback()
                , "off": mock_callback()
            };
            state = stateManager(
                null
                , {
                    "_class": "startclass"
                    , "list": [
                        {
                            "height": "200"
                            , "_display": "none"
                        }
                        , {
                            "height": "400"
                            , "_display": "flex"
                        }
                    ]
                }
            );
            context = {
                "width": "500"
                , "textColor": "#777777"
                , "toolbar": {
                    "_class": "myclass"
                }
                , "state": state
            };
        }
    );

    act(
        function actFn() {
            styleHandler(
                templateProxy
                , context
            );
            initialCss = extractCss(
                templateProxy.children
            );
            state._class = "newclass";
            state.list[0]._display = "block";
            state.list[1]._display = "table";
            state.list[0].height = "300";
            stateUpdatedCss = extractCss(
                templateProxy.children
            );
            delete state.list[1];
            stateDeleteCss = extractCss(
                templateProxy.children
            );
            delete state.list;
            stateListDeleteCss = extractCss(
                templateProxy.children
            );
            state.list = [
                {
                    "height": "200"
                    , "_display": "none"
                }
            ];
            stateListAddedCss = extractCss(
                templateProxy.children
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The template proxy children should be")
            .value(initialCss)
            .stringify()
            .equals('"div > .childclass:nth-child(0) {\\n    height:200px;\\n    display:none;\\n}\\ndiv > .childclass:nth-child(1) {\\n    height:400px;\\n    display:flex;\\n}\\ndiv > .childclass {\\n    height:192px;\\n    width:500px;\\n}\\ndiv:last-child:not(:first-child).startclass {\\n    display:none;\\n    class:toolbar-myclass;\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n}"')
            ;

            test("The template proxy children should be")
            .value(stateUpdatedCss)
            .stringify()
            .equals('"div > .childclass:nth-child(0) {\\n    height:300px;\\n    display:block;\\n}\\ndiv > .childclass:nth-child(1) {\\n    height:400px;\\n    display:table;\\n}\\ndiv > .childclass {\\n    height:192px;\\n    width:500px;\\n}\\ndiv:last-child:not(:first-child).newclass {\\n    display:none;\\n    class:toolbar-myclass;\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n}"')
            ;

            test("The template proxy children should be")
            .value(stateDeleteCss)
            .stringify()
            .equals('"div > .childclass:nth-child(0) {\\n    height:300px;\\n    display:block;\\n}\\ndiv > .childclass {\\n    height:192px;\\n    width:500px;\\n}\\ndiv:last-child:not(:first-child).newclass {\\n    display:none;\\n    class:toolbar-myclass;\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n}"')
            ;

            test("The template proxy children should be")
            .value(stateListDeleteCss)
            .stringify()
            .equals('"\\ndiv > .childclass {\\n    height:192px;\\n    width:500px;\\n}\\ndiv:last-child:not(:first-child).newclass {\\n    display:none;\\n    class:toolbar-myclass;\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n}"')
            ;

            test("The template proxy children should be")
            .value(stateListAddedCss)
            .stringify()
            .equals('"div > .childclass:nth-child(0) {\\n    height:200px;\\n    display:none;\\n}\\ndiv > .childclass {\\n    height:192px;\\n    width:500px;\\n}\\ndiv:last-child:not(:first-child).newclass {\\n    display:none;\\n    class:toolbar-myclass;\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n}"')
            ;
        }
    );


    /*
    * @function
    */
    function extractCss(children) {
        return children
            .map(
                function mapEntryText(entry) {
                    return entry.text;
                }
            )
            .join("\n")
        ;
    }
}
/**
* @test
*   @title PunyJS.ui.gui.template.tagHandlers._Style: functional test, proxy
*/
function styleTagHandlerTest3(
    controller
    , mock_callback
) {
    var styleHandler, templateProxy, domProxy, context, stateManager, state, watcher, jsonTemplate, afterAddCss, afterUpdateCss, afterDeleteCss, afterAddStyleCss, afterUpdateStyleCss, afterDeleteStyleCss, afterDestroyCss;

    arrange(
        async function arrangeFn() {
            styleHandler = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Style"
                    , [

                    ]
                ]
            );
            stateManager = await controller(
                [
                    ".statenet.common.stateManager"
                ]
            );
            watcher = await controller(
                [
                    ".utils.proxy.biDirectionalWatcher"
                ]
            );
            jsonTemplate = {
                "nodeName": "style"
                , "selectors": {
                    "div > .childclass": {
                        "height": "192px"
                        , "width": "${width}px"
                        , "${k,v,i in state\\.list}&:nth-child(${k})": {
                            "height": "${state\\.list[k].height}px"
                            , "display": "${state\\.list[k]._display}"
                        }
                    }
                    , "div:last-child": {
                        "display": "flex"
                        , "overflow": "auto"
                        , "&:not(:first-child).${state._class}": {
                            "display": "none"
                            , "class": "toolbar-${toolbar._class}"
                        }
                        , "color": "${textColor}"
                    }
                }
            };
            [templateProxy, domProxy] = watcher(
                jsonTemplate
                , true
            );
            state = stateManager(
                null
                , {
                    "_class": "startclass"
                    , "width": 199
                    , "list": [
                        {
                            "height": "200"
                            , "_display": "none"
                        }
                        , {
                            "height": "400"
                            , "_display": "flex"
                        }
                    ]
                }
            );
            context = {
                "width": "500"
                , "textColor": "#777777"
                , "toolbar": {
                    "_class": "myclass"
                }
                , "state": state
            };
        }
    );

    act(
        function actFn() {
            styleHandler(
                templateProxy
                , context
            );
            //add a style
            domProxy.selectors
                ["div:last-child"]
                ["flex-direction"] =
                    "column"
            ;
            afterAddStyleCss = extractCss(
                templateProxy.children
            );
            //update a style
            domProxy.selectors
                ["div:last-child"]
                ["&:not(:first-child).${state._class}"]
                .class =
                    "toolbar2-${toolbar._class}"
            ;
            afterUpdateStyleCss = extractCss(
                templateProxy.children
            );
            //delete style
            delete domProxy.selectors
                ["div:last-child"]
                ["&:not(:first-child).${state._class}"]
                .class
            ;
            afterDeleteStyleCss = extractCss(
                templateProxy.children
            );
            //add a new selector
            domProxy.selectors
                ["div > .childclass"]
                [".newEntry"] = {
                    "color": "${textColor}"
                }
            ;
            afterAddCss = extractCss(
                templateProxy.children
            );
            //update selector
            domProxy.selectors
                ["div > .childclass"] = {
                    "width": "${state.width}"
                }
            ;
            afterUpdateCss = extractCss(
                templateProxy.children
            );
            //delete a selector
            delete domProxy.selectors
                ["div:last-child"]
                ["&:not(:first-child).${state._class}"]
            ;
            afterDeleteCss = extractCss(
                templateProxy.children
            );

            domProxy.destroyed = true;
            afterDestroyCss = extractCss(
                templateProxy.children
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The afterAddStyleCss should be")
            .value(afterAddStyleCss)
            .stringify()
            .equals('"div > .childclass:nth-child(0) {\\n    height:200px;\\n    display:none;\\n}\\ndiv > .childclass:nth-child(1) {\\n    height:400px;\\n    display:flex;\\n}\\ndiv > .childclass {\\n    height:192px;\\n    width:500px;\\n}\\ndiv:last-child:not(:first-child).startclass {\\n    display:none;\\n    class:toolbar-myclass;\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n    flex-direction:column;\\n}"')
            ;

            test("The afterUpdateStyleCss should be")
            .value(afterUpdateStyleCss)
            .stringify()
            .equals('"div > .childclass:nth-child(0) {\\n    height:200px;\\n    display:none;\\n}\\ndiv > .childclass:nth-child(1) {\\n    height:400px;\\n    display:flex;\\n}\\ndiv > .childclass {\\n    height:192px;\\n    width:500px;\\n}\\ndiv:last-child:not(:first-child).startclass {\\n    display:none;\\n    class:toolbar2-${toolbar._class};\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n    flex-direction:column;\\n}"')
            ;

            test("The afterDeleteStyleCss should be")
            .value(afterDeleteStyleCss)
            .stringify()
            .equals('"div > .childclass:nth-child(0) {\\n    height:200px;\\n    display:none;\\n}\\ndiv > .childclass:nth-child(1) {\\n    height:400px;\\n    display:flex;\\n}\\ndiv > .childclass {\\n    height:192px;\\n    width:500px;\\n}\\ndiv:last-child:not(:first-child).startclass {\\n    display:none;\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n    flex-direction:column;\\n}"')
            ;


            test("The afterAddCss should be")
            .value(afterAddCss)
            .stringify()
            .equals('"div > .childclass:nth-child(0) {\\n    height:200px;\\n    display:none;\\n}\\ndiv > .childclass:nth-child(1) {\\n    height:400px;\\n    display:flex;\\n}\\ndiv > .childclass {\\n    height:192px;\\n    width:500px;\\n}\\ndiv:last-child:not(:first-child).startclass {\\n    display:none;\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n    flex-direction:column;\\n}\\ndiv > .childclass .newEntry {\\n    color:#777777;\\n}"')
            ;

            test("The afterUpdateCss should be")
            .value(afterUpdateCss)
            .stringify()
            .equals('"div:last-child:not(:first-child).startclass {\\n    display:none;\\n}\\ndiv:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n    flex-direction:column;\\n}\\ndiv > .childclass {\\n    width:199;\\n}"')
            ;

            test("The afterDeleteCss should be")
            .value(afterDeleteCss)
            .stringify()
            .equals('"div:last-child {\\n    display:flex;\\n    overflow:auto;\\n    color:#777777;\\n    flex-direction:column;\\n}\\ndiv > .childclass {\\n    width:199;\\n}"')
            ;

            test("The afterDestroyCss should be")
            .value(afterDestroyCss)
            .stringify()
            .equals('')
            ;

        }
    );


    /*
    * @function
    */
    function extractCss(children) {
        return children
            .map(
                function mapEntryText(entry) {
                    return entry.text;
                }
            )
            .join("\n")
        ;
    }
}
