/**
* @test
*   @title PunyJS.ui.gui.template._Template: basic test
*/
function templateTest1(
    controller
    , mock_callback
) {
    var templateWorker, jsonTemplate, templateProxy, template_handlers, template_domFragmentManager, template_attributeProcessor;

    arrange(
        async function arrangeFn() {
            jsonTemplate = {
                "tagName": "repeat"
                , "attributes": {
                    "expr": "$f in list"
                }
                , "context": {}
                , "children": [
                    "text node ${state.prop1}"
                    , {
                        "tagName": "tag1"
                        , "attributes": {
                            "id": "${parent.tagId}.tag1"
                        }
                        , "context": {}
                    }
                    , {
                        "tagName": "tag2"
                        , "attributes": {
                            "attrib1": "value1"
                            , "attrib2": "value2"
                        }
                    }
                ]
            };
            template_handlers = {
                "repeat": mock_callback()
                , "tag2": mock_callback()
                , "text": mock_callback()
            };
            template_domFragmentManager = {
                "create": mock_callback()
            };
            template_attributeProcessor = mock_callback();
            templateWorker = await controller(
                [
                    ":PunyJS.ui.gui.template._TemplateProcessor"
                    , [

                        , template_handlers
                        , template_domFragmentManager
                        , template_attributeProcessor
                    ]
                ]
            );
        }
    );

    act(
        function actFn() {
            templateProxy = templateWorker(
                jsonTemplate
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The template Proxy should be an object")
            .value(templateProxy)
            .isOfType("object")
            ;

            test("The repeat handler should be called once")
            .value(template_handlers, "repeat")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 1, "repeat")
            .hasBeenCalledWithArg(0, 2, "tag")
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"tagName":"repeat","attributes":{"expr":"$f in list"},"context":{},"children":[{"tagName":"text","attributes":{"text":"text node ${state.prop1}"},"namespace":"$.children.0","context":{}},{"tagName":"tag1","attributes":{"id":"${parent.tagId}.tag1"},"context":{},"namespace":"$.children.1"},{"tagName":"tag2","attributes":{"attrib1":"value1","attrib2":"value2"},"namespace":"$.children.2","context":{}}],"namespace":"$"}')
            ;

            test("The tag2 handler should be called once")
            .value(template_handlers, "tag2")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 1, "tag2")
            .hasBeenCalledWithArg(0, 2, "tag")
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"tagName":"tag2","attributes":{"attrib1":"value1","attrib2":"value2"},"namespace":"$.children.2","context":{}}')
            ;

            test("The text handler should be called once")
            .value(template_handlers, "text")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 1, "text")
            .hasBeenCalledWithArg(0, 2, "tag")
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"tagName":"text","attributes":{"text":"text node ${state.prop1}"},"namespace":"$.children.0","context":{}}')
            ;

            test("template_attributeProcessor should be called")
            .value(template_attributeProcessor)
            .hasBeenCalled(4)
            .getCallbackArg(2, 0)
            .stringify()
            .equals('{"tagName":"tag1","attributes":{"id":"${parent.tagId}.tag1"},"context":{},"namespace":"$.children.1"}')
            ;

            test("The DOM fragment manager create method should be called")
            .value(template_domFragmentManager, "create")
            .hasBeenCalled(1)
            .getCallbackArg(0, 0)
            .isOfType("object")
            .not
            .equals(templateProxy)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._Template: functional test
*/
function templateTest2(
    controller
    , mock_callback
) {
    var templateWorker, jsonTemplate, templateProxy, stateManager;

    arrange(
        async function arrangeFn() {
            templateWorker = await controller(
                [
                    ":PunyJS.ui.gui.template._TemplateProcessor"
                    , []
                ]
            );
            stateManager = await controller(
                [
                    ".statenet.common.stateManager"
                ]
            );
            jsonTemplate = {
                "tagName": "repeat"
                , "attributes": {
                    "expr": "$f in list"
                }
                , "context": {
                    "state": stateManager(
                        {}
                        , {
                            "prop1": "value1"
                        }
                    )
                    , "parent": {
                        "tagId": "parentTagId"
                    }
                }
                , "children": [
                    "text node ${state.prop1}"
                    , {
                        "tagName": "tag1"
                        , "attributes": {
                            "id": "${parent.tagId}.tag1"
                        }
                        , "context": {
                            "parent": {
                                "tagId": "parent2TagId"
                            }
                        }
                    }
                    , {
                        "tagName": "tag2"
                        , "attributes": {
                            "attrib1": "value1"
                            , "attrib2": "value2"
                        }
                    }
                ]
            };
        }
    );

    act(
        function actFn() {
            templateProxy = templateWorker(
                jsonTemplate
            );
        }
    );

    assert(
        function assertFn(test) {

        }
    );
}