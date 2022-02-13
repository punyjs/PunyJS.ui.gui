/**
* @test
*   @title PunyJS.ui.gui.template._Template: basic test
*/
function templateProcessorTest1(
    controller
    , mock_callback
) {
    var templateWorker, jsonTemplate, template, template_handlers, template_domFragmentManager, context, template_attributeProcessor;

    arrange(
        async function arrangeFn() {
            jsonTemplate = {
                "nodeName": "repeat"
                , "attributes": {
                    "expr": "$f in list"
                }
                , "children": [
                    "text node ${state.prop1}"
                    , {
                        "nodeName": "tag1"
                        , "attributes": {
                            "id": "${parent.tagId}.tag1"
                        }
                    }
                    , {
                        "nodeName": "tag2"
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
            };
            template_domFragmentManager = {
                "create": mock_callback()
            };
            template_attributeProcessor = mock_callback();
            templateWorker = await controller(
                [
                    ":PunyJS.ui.gui.template._TemplateProcessor"
                    , [
                        //bi-directional proxy
                        , template_handlers
                        , template_handlers
                        , //has expression
                        , template_domFragmentManager
                        , template_attributeProcessor
                    ]
                ]
            );
            context = {};
        }
    );

    act(
        function actFn() {
            template = templateWorker(
                jsonTemplate
                , context
            );
            //add a child
            template.domProxy.children.push(
                {
                    "nodeName": "div"
                    , "attributes": {
                        "addedChild": true
                    }
                }
            );
            //replace a child
            template.domProxy.children[2] = {
                "nodeName": "div"
                , "attributes": {
                    "replaceChild": true
                }
            };
            //remove a child
            template.domProxy.children.splice(0, 1);
        }
    );

    assert(
        function assertFn(test) {
            test("The template Proxy should be an object")
            .value(template)
            .isOfType("object")
            ;

            test("The repeat handler should be called once")
            .value(template_handlers, "repeat")
            .hasBeenCalled(1)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"nodeName":"repeat","attributes":{"expr":"$f in list"},"children":[{"nodeName":"tag1","attributes":{"id":"${parent.tagId}.tag1"},"namespace":"$.children.0"},{"nodeName":"div","attributes":{"replaceChild":true},"namespace":"$.children.1"},{"nodeName":"div","attributes":{"addedChild":true},"namespace":"$.children.2"}],"namespace":"$"}')
            ;

            test("The tag2 handler should be called once")
            .value(template_handlers, "tag2")
            .hasBeenCalled(1)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"nodeName":"tag2","attributes":{"attrib1":"value1","attrib2":"value2"},"namespace":"$.children.2"}')
            ;

            test("template_attributeProcessor should be called")
            .value(template_attributeProcessor)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 2, "id")
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"nodeName":"tag1","attributes":{"id":"${parent.tagId}.tag1"},"namespace":"$.children.0"}')
            ;

            test("The DOM fragment manager create method should be called")
            .value(template_domFragmentManager, "create")
            .hasBeenCalled(1)
            .getCallbackArg(0, 0)
            .isOfType("object")
            .not
            .equals(template)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._Template: destroy
*/
function templateProcessorTest2(
    controller
    , mock_callback
) {
    var templateProcessor, jsonTemplate, template, stateManager, context;

    arrange(
        async function arrangeFn() {
            templateProcessor = await controller(
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
                "nodeName": "div"
                , "attributes": {
                    "expr": "${$f in list}"
                }
                , "children": [
                    "text node ${state.prop1}"
                    , {
                        "nodeName": "tag1"
                        , "attributes": {
                            "id": "${parent.tagId}.tag1"
                        }
                    }
                    , {
                        "nodeName": "tag2"
                        , "attributes": {
                            "attrib1": "value1"
                            , "attrib2": "value2"
                        }
                    }
                ]
            };
            context = {
                "state": stateManager(
                    {}
                    , {
                        "prop1": "value1"
                    }
                )
                , "list": [

                ]
                , "parent": {
                    "tagId": "parentTagId"
                }
            };
        }
    );

    act(
        function actFn() {
            template = templateProcessor(
                jsonTemplate
                , context
            );

            template.destroy();
        }
    );

    assert(
        function assertFn(test) {

        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._Template: functional test; children: insert, append, replace, delete
*/
function templateProcessorTest3(
    controller
    , mock_callback
) {
    var templateProcessor, jsonTemplate, template, stateManager, context, afterInsertJHtml, afterAppendJHtml, afterReplaceJHtml, afterDeleteJHtml, afterSecondDeleteJHtml;

    arrange(
        async function arrangeFn() {
            templateProcessor = await controller(
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
                "nodeName": "div"
                , "attributes": {
                    "expr": "${$f in list}"
                }
                , "children": [
                    "text node ${state.prop1}"
                    , {
                        "nodeName": "tag1"
                        , "attributes": {
                            "id": "${parent.tagId}.tag1"
                        }
                    }
                    , {
                        "nodeName": "tag2"
                        , "attributes": {
                            "attrib1": "value1"
                            , "attrib2": "value2"
                        }
                    }
                ]
            };
            context = {
                "state": stateManager(
                    {}
                    , {
                        "prop1": "value1"
                        , "prop2": "value2"
                    }
                )
                , "list": [

                ]
                , "parent": {
                    "tagId": "parentTagId"
                }
            };
        }
    );

    act(
        function actFn() {
            template = templateProcessor(
                jsonTemplate
                , context
            );
            //insert child
            template.domProxy.children.splice(1, 0
                , {
                    "nodeName": "insertTag"
                    , "attributes": {
                        "attrib1": "${state.prop1}"
                    }
                }
            );
            afterInsertJHtml = JSON.stringify(
                template.templateProxy.children
            );
            //append child
            template.domProxy.children.push(
                {
                    "nodeName": "appendTag"
                    , "attributes": {
                        "attrib1": "${state.prop1}"
                    }
                }
            );
            afterAppendJHtml = JSON.stringify(
                template.templateProxy.children
            );
            //replace child
            template.domProxy.children[1] = {
                "nodeName": "replaceTag"
                , "attributes": {
                    "attrib1": "${state.prop2}"
                }
            };

            afterReplaceJHtml = JSON.stringify(
                template.templateProxy.children
            );
            //delete child
            template.domProxy.children.splice(1, 1);

            afterDeleteJHtml = JSON.stringify(
                template.templateProxy.children
            );

            //delete child
            delete template.domProxy.children[1];

            afterSecondDeleteJHtml = JSON.stringify(
                template.templateProxy.children
            );
        }
    );

    assert(
        function assertFn(test) {
            test("afterInsertJHtml should be")
            .value(afterInsertJHtml)
            .equals('[{"nodeName":"text","text":"text node value1","namespace":"$.children.0"},{"nodeName":"insertTag","attributes":{"attrib1":"value1"},"namespace":"$.children.1"},{"nodeName":"tag1","attributes":{"id":"parentTagId.tag1"},"namespace":"$.children.2"},{"nodeName":"tag2","attributes":{"attrib1":"value1","attrib2":"value2"},"namespace":"$.children.3"}]')
            ;

            test("afterAppendJHtml should be")
            .value(afterAppendJHtml)
            .equals('[{"nodeName":"text","text":"text node value1","namespace":"$.children.0"},{"nodeName":"insertTag","attributes":{"attrib1":"value1"},"namespace":"$.children.1"},{"nodeName":"tag1","attributes":{"id":"parentTagId.tag1"},"namespace":"$.children.2"},{"nodeName":"tag2","attributes":{"attrib1":"value1","attrib2":"value2"},"namespace":"$.children.3"},{"nodeName":"appendTag","attributes":{"attrib1":"value1"},"namespace":"$.children.4"}]')
            ;

            test("afterReplaceJHtml should be")
            .value(afterReplaceJHtml)
            .equals('[{"nodeName":"text","text":"text node value1","namespace":"$.children.0"},{"nodeName":"replaceTag","attributes":{"attrib1":"value2"},"namespace":"$.children.1"},{"nodeName":"tag1","attributes":{"id":"parentTagId.tag1"},"namespace":"$.children.2"},{"nodeName":"tag2","attributes":{"attrib1":"value1","attrib2":"value2"},"namespace":"$.children.3"},{"nodeName":"appendTag","attributes":{"attrib1":"value1"},"namespace":"$.children.4"}]')
            ;

            test("afterDeleteJHtml should be")
            .value(afterDeleteJHtml)
            .equals('[{"nodeName":"text","text":"text node value1","namespace":"$.children.0"},{"nodeName":"tag1","attributes":{"id":"parentTagId.tag1"},"namespace":"$.children.1"},{"nodeName":"tag2","attributes":{"attrib1":"value1","attrib2":"value2"},"namespace":"$.children.2"},{"nodeName":"appendTag","attributes":{"attrib1":"value1"},"namespace":"$.children.3"}]')
            ;

            test("afterSecondDeleteJHtml should be")
            .value(afterSecondDeleteJHtml)
            .equals('[{"nodeName":"text","text":"text node value1","namespace":"$.children.0"},{"nodeName":"tag2","attributes":{"attrib1":"value1","attrib2":"value2"},"namespace":"$.children.1"},{"nodeName":"appendTag","attributes":{"attrib1":"value1"},"namespace":"$.children.2"}]')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._Template: next and previous sibling w/ selector
*/
function templateProcessorTest4(
    controller
    , mock_callback
) {
    var templateProcessor, jsonTemplate, template, stateManager, context, nextChild1, previousChild1;

    arrange(
        async function arrangeFn() {
            templateProcessor = await controller(
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
                "nodeName": "div"
                , "attributes": {
                    "expr": "${$f in list}"
                }
                , "children": [
                    "text node ${state.prop1}"
                    , {
                        "nodeName": "tag1"
                        , "render": false
                        , "attributes": {
                            "id": "${parent.tagId}.tag1"
                            , "name": "tag1name"
                        }
                    }
                    , {
                        "nodeName": "tag2"
                        , "render": false
                        , "attributes": {
                            "attrib1": "value1"
                            , "attrib2": "value2"
                        }
                    }
                    , {
                        "nodeName": "tag3"
                        , "render": true
                        , "attributes": {
                            "attrib1": "value1"
                            , "attrib2": "value2"
                        }
                    }
                    , {
                        "nodeName": "tag4"
                        , "render": true
                        , "attributes": {
                            "attrib1": "value1"
                            , "attrib2": "value2"
                        }
                    }
                ]
            };
            context = {
                "state": stateManager(
                    {}
                    , {
                        "prop1": "value1"
                    }
                )
                , "list": [

                ]
                , "parent": {
                    "tagId": "parentTagId"
                }
            };
        }
    );

    act(
        function actFn() {
            template = templateProcessor(
                jsonTemplate
                , context
            );
            nextChild1 = template.templateProxy.children[0].getNextSibling(
                {
                    "render": true
                }
            );
            previousChild1 = template.templateProxy.children[0].getNextSibling(
                {
                    "render": false
                    , "attributes.name": "tag1name"
                }
            );
        }
    );

    assert(
        function assertFn(test) {
            test("nextChild1 should be tag3")
            .value(nextChild1, "nodeName")
            .equals("tag3")
            ;

            test("previousChild1 should be tag3")
            .value(previousChild1, "nodeName")
            .equals("tag1")
            ;
        }
    );
}
