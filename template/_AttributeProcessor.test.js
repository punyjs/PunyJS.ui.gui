/**
* @test
*   @title PunyJS.ui.gui.template._AttributeProcessor: kitchen sink unit test
*/
function attributeProcessorTest1(
    controller
    , mock_callback
) {
    var attributeProcessor, template_expression, hasExpression, template_event, expression1, expression2, templateProxy, handlers, eventDetails;

    arrange(
        async function arrangeFn() {
            expression1 = {
                "variables": ["state.prop1", "state.prop2"]
                , "execute": mock_callback()
            };
            expression2 = {
                "variables": []
                , "execute": mock_callback("execute result")
            };
            template_expression = mock_callback(
                function mockTemplateExpression(value) {
                    if (value === "${state.prop1 == state.prop2}") {
                        return expression1;
                    }
                    return expression2;
                }
            );
            hasExpression = mock_callback(
                function mockHasExpression(value) {
                    return value.indexOf("${") !== -1;
                }
            );
            template_event = mock_callback();
            handlers = {
                "attrib1": mock_callback()
            };
            attributeProcessor = await controller(
                [
                    ":PunyJS.ui.gui.template._AttributeProcessor"
                    , [
                        template_expression
                        , hasExpression
                        , handlers
                        , template_event
                    ]
                ]
            );
            eventDetails = {};
            templateProxy = {
                "tagName": "tag"
                , "attributes": {
                    "attrib1": "value1"
                    , "attrib2": "${state.prop1 == state.prop2}"
                    , "onevent": "${func}"
                }
                , "context": {
                    "state": {
                        "prop1": "value1"
                        , "isStateful": true
                        , "$addListener": mock_callback(
                            "listener_uuid"
                        )
                    }
                }
                , "on": mock_callback()
            };
        }
    );

    act(
        function actFn() {
            attributeProcessor(
                templateProxy
            );
            //manual fire the event
            if (!!templateProxy.events.event) {
                templateProxy.events.event(eventDetails);
            }
        }
    );

    assert(
        function assertFn(test) {
            test("hasExpression should be called 3 times")
            .value(hasExpression)
            .hasBeenCalled(3)
            ;

            test("template_expression should be called twice with")
            .value(template_expression)
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, "${state.prop1 == state.prop2}")
            .hasBeenCalledWithArg(1, 0, "${func}")
            ;

            test("state add listener should be called once, with")
            .value(templateProxy, "context.state.$addListener")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, "prop1")
            .hasBeenCalledWithArg(0, 1, expression1.update)
            ;

            test("expression1 execute should be called")
            .value(expression1, "execute")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, templateProxy.context)
            ;

            test("expression2 execute should be called")
            .value(expression2, "execute")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, templateProxy.context)
            ;

            test("the attribute proxy events should have one property")
            .value(templateProxy, "events")
            .hasOwnPropertyCountOf(1)
            .hasOwnProperty("event")
            ;

            test("the templateEvent should be called once with")
            .value(template_event)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, "event")
            .hasBeenCalledWithArg(0, 1, "execute result")
            .hasBeenCalledWithArg(0, 2, templateProxy.context)
            .hasBeenCalledWithArg(0, 3, eventDetails)
            ;

            test("the attrib1 handler should be called once with")
            .value(handlers, "attrib1")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, templateProxy)
            .hasBeenCalledWithArg(0, 1, "attrib1")
            .hasBeenCalledWithArg(0, 2, "attribute")
            ;

            test("templateProxy on should be called twice")
            .value(templateProxy, "on")
            .hasBeenCalled(2)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._AttributeProcessor: functional test, attribute update, watched variable update
*/
function attributeProcessorTest2(
    controller
    , mock_callback
) {
    var attributeProcessor, domProxy, templateProxy, watcher, stateManager, jsonTemplate, eventDetails;

    arrange(
        async function arrangeFn() {
            attributeProcessor = await controller(
                [
                    ":PunyJS.ui.gui.template._AttributeProcessor"
                    , []
                ]
            );
            watcher = await controller(
                [
                    ".utils.proxy.biDirectionalWatcher"
                ]
            );
            stateManager = await controller(
                [
                    ".statenet.common.stateManager"
                ]
            );
            eventDetails = {};
            jsonTemplate = {
                "tagName": "tag"
                , "attributes": {
                    "attrib1": {
                        "attribProp1": "attribeValue1"
                    }
                    , "attrib2": "${state.prop1 == state.prop2}"
                    , "onevent": "${func}"
                }
                , "context": {
                    "func": mock_callback()
                    , "state": stateManager(
                        {}
                        , {
                            "prop1": "value1"
                            , "prop2": "value2"
                        }
                    )
                }
                , "expressions": {}
                , "events": {}
            };
            [templateProxy, domProxy] = watcher(
                jsonTemplate
                , true
            );
        }
    );

    act(
        function actFn() {
            attributeProcessor(
                templateProxy
            );
            domProxy.attributes.attrib1 = "new value ${state.prop1}";
            delete domProxy.attributes.attrib2;
            templateProxy.context.state.prop1 = "new prop1 value";
            templateProxy.events["event"](eventDetails);
        }
    );

    assert(
        function assertFn(test) {
            test("templateProxy attributes.attrib1 should be")
            .value(templateProxy, "attributes.attrib1")
            .equals("new value new prop1 value")
            ;

            test("domProxy attributes.attrib1 should be")
            .value(domProxy, "attributes.attrib1")
            .equals("new value new prop1 value")
            ;

            test("attributes.attrib2 should not exists")
            .value(templateProxy)
            .not
            .hasProperty("attrib2")
            ;

            test("the event callback should be called once with")
            .value(jsonTemplate, "context.func")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, eventDetails)
            ;
        }
    );
}