/**
* @test
*   @title PunyJS.ui.gui.template.handlers._Repeat: repeat tag
*/
function repeatTagHandlerTest1(
    controller
    , mock_callback
) {
    var repeat, template_expression, template_hasExpression, template_attributeProcessor, templateProxy, context, mockIterator, count, data;

    arrange(
        async function arrangeFn() {
            template_expression = mock_callback();
            template_hasExpression = mock_callback();
            template_attributeProcessor = mock_callback(
                function mockAttributeProcessor(proxy, cntxt, name, fn) {
                    proxy.attributes[name] = mockIterator;
                    fn(
                        name
                    );
                }
            );
            count = 0;
            data = {};
            mockIterator = {
                "next": mock_callback(
                    function mockIteratorNext() {
                        count++;
                        if (count < 4) {
                            return data;
                        }
                    }
                )
            };
            repeat = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Repeat"
                    , [
                        , template_expression
                        , template_hasExpression
                        , template_attributeProcessor
                    ]
                ]
            );
            templateProxy = {
                "nodeName": "repeat"
                , "attributes": {
                    "expr": "$f in list"
                }
                , "children": [
                    "first child"
                    , {
                        "nodeName": "div"
                        , "attributes": {
                            "attrib1": "second child"
                        }
                        , "children": [
                            {
                                "nodeName": "span"
                                , "attributes": {
                                    "attrib1": "nested child"
                                }
                            }
                        ]
                    }
                ]
                , "on": mock_callback()
                , "off": mock_callback()
                , "processTemplate": mock_callback()
            };
            context = {
                "list": [1,2,3,4]
            };
        }
    );

    act(
        function actFn() {
            repeat(
                templateProxy
                , context
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The attribute processor should be called once with")
            .value(template_attributeProcessor)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, templateProxy)
            .hasBeenCalledWithArg(0, 1, context)
            .hasBeenCalledWithArg(0, 2, "expr")
            ;

            test("The on function should be called twice")
            .value(templateProxy, "on")
            .hasBeenCalled(2)
            ;

            test("The first call to the on function should be")
            .value(templateProxy, "on")
            .getCallbackArg(0, 0)
            .stringify()
            .equals('["attributes.expr","delete attributes.expr"]')
            ;

            test("The second call to the on function should be")
            .value(templateProxy, "on")
            .hasBeenCalledWithArg(1, 0, "destroyed")
            ;

            test("The iterator next function should be called 3 times with")
            .value(mockIterator, "next")
            .hasBeenCalled(4)
            ;

            test("The template proxy children should be")
            .value(templateProxy, "children")
            .stringify()
            .equals('["first child",{"nodeName":"div","attributes":{"attrib1":"second child"},"children":[{"nodeName":"span","attributes":{"attrib1":"nested child"}}]},"first child",{"nodeName":"div","attributes":{"attrib1":"second child"},"children":[{"nodeName":"span","attributes":{"attrib1":"nested child"}}]},"first child",{"nodeName":"div","attributes":{"attrib1":"second child"},"children":[{"nodeName":"span","attributes":{"attrib1":"nested child"}}]}]')
            ;
        }
    );
}