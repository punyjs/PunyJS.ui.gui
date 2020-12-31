/**
* @test
*   @title PunyJS.ui.gui.template._TemplateEvent:
*/
function templateEventTest1(
    controller
    , mock_callback
) {
    var templateEvent, attribute1, attribute2, template_isExpression, callbackFn, nodeContext, event1, event2, is_func;

    arrange(
        async function arrangeFn() {
            is_func = await controller(".is.func");
            template_isExpression = mock_callback(
                function mockIsExpression(value) {
                    if (is_func(value)) {
                        return false;
                    }
                    return true;
                }
            );
            templateEvent = await controller(
                [
                    ":PunyJS.ui.gui.template._TemplateEvent"
                    , [
                        template_isExpression
                    ]
                ]
            );
            attribute1 = mock_callback();
            callbackFn = mock_callback();
            attribute2 = {
                "execute": mock_callback(
                    function mockExecute() {
                        return callbackFn;
                    }
                )
            };
            nodeContext= {};
            event1 = {};
            event2 = {};
        }
    );

    act(
        function actFn() {
            templateEvent(
                "event1 name"
                , attribute1
                , nodeContext
                , event1
            );

            templateEvent(
                "event2 name"
                , attribute2
                , nodeContext
                , event2
            );
        }
    );

    assert(
        function assertFn(test) {
            test("attribute1 should be called once")
            .value(attribute1)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, event1)
            ;

            test("attribute2.execute should be called once")
            .value(attribute2, "execute")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, nodeContext)
            ;

            test("the execute's returned callbackFn should be called once with")
            .value(callbackFn)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, event2)
            ;
        }
    );
}