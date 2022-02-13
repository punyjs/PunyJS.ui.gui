/**
* @test
*   @title PunyJS.ui.gui.template._AttributeProcessor: kitchen sink unit test
*/
function attributeProcessorTest1(
    controller
    , mock_callback
) {
    var attributeProcessor, template_expression, hasExpression, template_event, expression1, expression2, templateProxy, eventDetails, context, isStateful;

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
            isStateful = mock_callback(
                function mockIsStateful(obj) {
                    return !!obj.isStateful;
                }
            );
            attributeProcessor = await controller(
                [
                    ":PunyJS.ui.gui.template._AttributeProcessor"
                    , [
                        template_expression
                        , hasExpression
                        , template_event
                        , isStateful
                    ]
                ]
            );
            eventDetails = {};
            templateProxy = {
                "tagName": "tag"
                , "namespace": "$"
                , "attributes": {
                    "attrib1": "value1"
                    , "attrib2": "${state.prop1 == state.prop2}"
                    , "onevent": "${func}"
                }
                , "on": mock_callback()
            };
            context = {
                "state": {
                    "prop1": "value1"
                    , "isStateful": true
                    , "$addListener": mock_callback(
                        "listener_uuid"
                    )
                }
            };
        }
    );

    act(
        function actFn() {
            attributeProcessor(
                templateProxy
                , context
                , "attrib1"
            );
            attributeProcessor(
                templateProxy
                , context
                , "attrib2"
            );
            attributeProcessor(
                templateProxy
                , context
                , "onevent"
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

            test("expression1 execute should be called")
            .value(expression1, "execute")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, context)
            ;

            test("expression2 execute should be called")
            .value(expression2, "execute")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, context)
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
            .hasBeenCalledWithArg(0, 2, context)
            .hasBeenCalledWithArg(0, 3, eventDetails)
            ;

            test("templateProxy on should be called 6x")
            .value(templateProxy, "on")
            .hasBeenCalled(6)
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
    var attributeProcessor, domProxy, templateProxy, watcher, context, stateManager, jsonTemplate, eventDetails, callback, attrib1Value1, attrib1Value2;

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
            callback = mock_callback();
            jsonTemplate = {
                "tagName": "tag"
                , "namespace": "$"
                , "attributes": {
                    "attrib1": "${state.prop1 == state.prop2}"
                    , "onevent": "${func}"
                }
            };
            context = {
                "func": mock_callback()
                , "state": stateManager(
                    {}
                    , {
                        "prop1": "value1"
                        , "prop2": "value2"
                    }
                )
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
                , context
                , "attrib1"
                , callback
            );
            attributeProcessor(
                templateProxy
                , context
                , "onevent"
            );

            attrib1Value1 = templateProxy.attributes.attrib1;
            context.state.prop2 = "value1";
            attrib1Value2 = templateProxy.attributes.attrib1;
            templateProxy.events["event"](eventDetails);

            domProxy.attributes.attrib1 = "${state.prop2}";
            //delete an attribute
            delete domProxy.attributes.attrib1;
            //update the state, the deleted attribute should not respond
            context.state.prop2 = "newvalue";
            //destroy the template, the attributes should destroy themselves
            templateProxy.destroyed = true;
        }
    );

    assert(
        function assertFn(test) {
            test("The first attrib1 value should be")
            .value(attrib1Value1)
            .isFalse()
            ;

            test("The second attrib1 value should be")
            .value(attrib1Value2)
            .isTrue()
            ;

            test("The attrib1 attribute should be gone")
            .value(templateProxy, "attributes")
            .not
            .hasProperty("attrib1")
            ;

            //it's called once during the first processing and then again when the state poprety is changed
            test("The callback should be called twice with")
            .value(callback)
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, "attrib1")
            .hasBeenCalledWithArg(1, 0, "attrib1")
            ;
        }
    );
}