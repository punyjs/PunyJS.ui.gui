/**
* @test
*   @title PunyJS.ui.gui.template.tagHandlers._Conditional: basic test
*/
function conditionalHandlerTest1(
    controller
) {
    var conditionalHandler;

    arrange(
        async function arrangeFn() {
            conditionalHandler = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Conditional"
                    , [

                    ]
                ]
            );
        }
    );

    act(
        function actFn() {

        }
    );

    assert(
        function assertFn(test) {

        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template.tagHandlers._Conditional: functional test w/ state
*/
function conditionalHandlerTest2(
    controller
    , mock_callback
) {
    var conditionalHandler, stateManager, jsonTemplate, templateProxy, domProxy, getNextSibling, getPreviousSibling, watcher, state, templateProcessor, template, initialJhtml, afterStateChangeJHtml, afterSecondStateChangeJHtml;

    arrange(
        async function arrangeFn() {
            conditionalHandler = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Conditional"
                    , []
                ]
            );
            stateManager = await controller(
                [
                    ".statenet.common.stateManager"
                ]
            );
            getNextSibling = mock_callback(
                function mockGetNextSibling(selector) {

                }
            );
            getPreviousSibling = mock_callback(
                function mockGetPreviousSibling(selector) {

                }
            );
            watcher = await controller(
                [
                    ".utils.proxy.biDirectionalWatcher"
                ]
            );
            jsonTemplate = {
                "nodeName": "tag1"
                , "children": [
                    {
                        "nodeName": "if"
                        , "attributes": {
                            "expr": "prop1 === prop2"
                        }
                    }
                    , {
                        "nodeName": "tag2"
                        , "attributes": {
                            "elseif": "prop1 === prop3"
                        }
                    }
                    , {
                        "nodeName": "tag3"
                    }
                    , {
                        "nodeName": "else"
                    }
                ]
            };
            [templateProxy, domProxy] = watcher(
                jsonTemplate
                , true
            );
            state = stateManager(
                null
                , {
                    "prop1": "value1"
                    , "prop2": "value2"
                    , "prop3": "value1"
                }
            );
            templateProcessor = await controller(
                [
                    ":PunyJS.ui.gui.template._TemplateProcessor"
                    , []
                ]
            );
        }
    );

    act(
        function actFn() {
            template = templateProcessor(
                jsonTemplate
                , state
            );

            //state changes
            initialJhtml = JSON.stringify(template.templateProxy);
            state.prop2 = "value1";
            afterStateChangeJHtml = JSON.stringify(template.templateProxy);
            state.prop1 = "value3";
            afterSecondStateChangeJHtml =
                JSON.stringify(template.templateProxy);
        }
    );

    assert(
        function assertFn(test) {
            test("The initial jhtml should be")
            .value(initialJhtml)
            .equals('{"nodeName":"tag1","children":[{"nodeName":"if","attributes":{"expr":"prop1 === prop2"},"namespace":"$.children.0","renderAs":"comment","render":false},{"nodeName":"tag2","attributes":{"elseif":"prop1 === prop3"},"namespace":"$.children.1","renderAs":"comment","render":true},{"nodeName":"tag3","namespace":"$.children.2"},{"nodeName":"else","namespace":"$.children.3","render":false}],"namespace":"$"}')
            ;

            test("The afterStateChange jhtml should be")
            .value(afterStateChangeJHtml)
            .equals('{"nodeName":"tag1","children":[{"nodeName":"if","attributes":{"expr":"prop1 === prop2"},"namespace":"$.children.0","renderAs":"comment","render":true},{"nodeName":"tag2","attributes":{"elseif":"prop1 === prop3"},"namespace":"$.children.1","renderAs":"comment","render":false},{"nodeName":"tag3","namespace":"$.children.2"},{"nodeName":"else","namespace":"$.children.3","render":false}],"namespace":"$"}')
            ;

            test("The afterSecondStateChange jhtml should be")
            .value(afterSecondStateChangeJHtml)
            .equals('{"nodeName":"tag1","children":[{"nodeName":"if","attributes":{"expr":"prop1 === prop2"},"namespace":"$.children.0","renderAs":"comment","render":false},{"nodeName":"tag2","attributes":{"elseif":"prop1 === prop3"},"namespace":"$.children.1","renderAs":"comment","render":false},{"nodeName":"tag3","namespace":"$.children.2"},{"nodeName":"else","namespace":"$.children.3","render":true}],"namespace":"$"}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template.tagHandlers._Conditional: functional test w/ attribute update
*/
function conditionalHandlerTest3(
    controller
    , mock_callback
) {
    var conditionalHandler, stateManager, jsonTemplate, templateProxy, domProxy, getNextSibling, getPreviousSibling, watcher, state, templateProcessor, template, afterAttributeDelete, afterAttribUpdate;

    arrange(
        async function arrangeFn() {
            conditionalHandler = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Conditional"
                    , []
                ]
            );
            stateManager = await controller(
                [
                    ".statenet.common.stateManager"
                ]
            );
            getNextSibling = mock_callback(
                function mockGetNextSibling(selector) {

                }
            );
            getPreviousSibling = mock_callback(
                function mockGetPreviousSibling(selector) {

                }
            );
            watcher = await controller(
                [
                    ".utils.proxy.biDirectionalWatcher"
                ]
            );
            jsonTemplate = {
                "nodeName": "tag1"
                , "children": [
                    {
                        "nodeName": "if"
                        , "attributes": {
                            "expr": "prop1 === prop2"
                        }
                    }
                    , {
                        "nodeName": "tag2"
                        , "attributes": {
                            "elseif": "prop1 === prop3"
                        }
                    }
                    , {
                        "nodeName": "tag3"
                        , "attributes": {
                            "elseif": "prop2 === prop3"
                        }
                    }
                    , {
                        "nodeName": "else"
                    }
                ]
            };
            [templateProxy, domProxy] = watcher(
                jsonTemplate
                , true
            );
            state = stateManager(
                null
                , {
                    "prop1": "value1"
                    , "prop2": "value2"
                    , "prop3": "value1"
                }
            );
            templateProcessor = await controller(
                [
                    ":PunyJS.ui.gui.template._TemplateProcessor"
                    , []
                ]
            );
        }
    );

    act(
        function actFn() {
            template = templateProcessor(
                jsonTemplate
                , state
            );
            //delete the true conditional
            delete template.domProxy
                .children[1]
                .attributes
                .elseif
            ;
            afterAttributeDelete = JSON.stringify(
                template.templateProxy.children
            );
            //update the if statement
            template.domProxy
                .children[0]
                .attributes
                .expr = "prop1 === prop3"
            ;
            afterAttribUpdate = JSON.stringify(
                template.templateProxy.children
            );
        }
    );

    assert(
        function assertFn(test) {
            test("afterAttributeDelete should be")
            .value(afterAttributeDelete)
            .equals('[{"nodeName":"if","attributes":{"expr":"prop1 === prop2"},"namespace":"$.children.0","renderAs":"comment","render":false},{"nodeName":"tag2","attributes":{},"namespace":"$.children.1","renderAs":"comment","render":true},{"nodeName":"tag3","attributes":{"elseif":"prop2 === prop3"},"namespace":"$.children.2","renderAs":"comment","render":false},{"nodeName":"else","namespace":"$.children.3","render":true}]')
            ;

            test("afterAttribUpdate should be")
            .value(afterAttribUpdate)
            .equals('[{"nodeName":"if","attributes":{"expr":"prop1 === prop3"},"namespace":"$.children.0","renderAs":"comment","render":true},{"nodeName":"tag2","attributes":{},"namespace":"$.children.1","renderAs":"comment","render":true},{"nodeName":"tag3","attributes":{"elseif":"prop2 === prop3"},"namespace":"$.children.2","renderAs":"comment","render":false},{"nodeName":"else","namespace":"$.children.3","render":false}]')
            ;
        }
    );
}