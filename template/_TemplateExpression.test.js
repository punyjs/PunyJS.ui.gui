/**
* @test
*   @title PunyJS.ui.gui.template._TemplateExpression: basic test
*/
function templateExpressionTest1(
    controller
    , mock_callback
) {
    var templateExpression, expression_interface, expression, templateExpressionInterface;

    arrange(
        async function arrange() {
            expression_interface = mock_callback(
                {
                    "variables": ["state.varx"]
                    , "execute": null
                }
            );
            templateExpression = await controller(
                [
                    ":PunyJS.ui.gui.template._TemplateExpression"
                    , [
                        expression_interface
                    ]
                ]
            );
            expression = "${state.var1}-${state.var2}";
        }
    );

    act(
        function act() {
            templateExpressionInterface = templateExpression(
                expression
            );
        }
    );

    assert(
        function assert(test) {
            test("The interface should be an object with properties ")
            .value(templateExpressionInterface)
            .isOfType("object")
            .hasOwnProperty("variables")
            .hasOwnProperty("execute")
            ;

            test("The interface's variables property should be")
            .value(templateExpressionInterface, "variables")
            .stringify()
            .equals('["state.varx","state.varx"]')
            ;

            test("The expression_interface should be called twice with ")
            .value(expression_interface)
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, 'state.var1')
            .hasBeenCalledWithArg(1, 0, 'state.var2')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._TemplateExpression: complex expressions and execute
*/
function templateExpressionTest2(
    controller
    , mock_callback
) {
    var templateExpression, expression_interface, expression, templateExpressionInterface, execute;

    arrange(
        async function arrange() {
            execute = mock_callback();
            expression_interface = mock_callback(
                {
                    "variables": ["state.varx"]
                    , "execute": execute
                }
            );
            templateExpression = await controller(
                [
                    ":PunyJS.ui.gui.template._TemplateExpression"
                    , [
                        expression_interface
                    ]
                ]
            );
            expression = '${{"value1":"state.var1 == 1","value2":"default"}}-${state.getList(state.sub1._val3)}';
        }
    );

    act(
        function act() {
            templateExpressionInterface = templateExpression(
                expression
            );
        }
    );

    assert(
        function assert(test) {
            test("The interface should be an object with properties ")
            .value(templateExpressionInterface)
            .isOfType("object")
            .hasOwnProperty("variables")
            .hasOwnProperty("execute")
            ;

            test("The interface's variables property should be")
            .value(templateExpressionInterface, "variables")
            .stringify()
            .equals('["state.varx","state.varx"]')
            ;

            test("The expression_interface should be called twice with ")
            .value(expression_interface)
            .hasBeenCalled(2)
            .hasBeenCalledWithArg(0, 0, '{"value1":"state.var1 == 1","value2":"default"}')
            .hasBeenCalledWithArg(1, 0, 'state.getList(state.sub1._val3)')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._TemplateExpression: functional test
*/
function templateExpressionTest3(
    controller
    , mock_callback
) {
    var templateExpression, expression, templateExpressionInterface, context, result;

    arrange(
        async function arrange() {
            templateExpression = await controller(
                [
                    ":PunyJS.ui.gui.template._TemplateExpression"
                    , []
                ]
            );
            expression = '${{"value1":"state.var1 == 1","value2":"`default`"}}-${state.getValue(state.sub1._val3)}';
            context = {
                "state": {
                    "var1": "2"
                    , "getValue": function(arg) {
                        return `gotten value ${arg}`;
                    }
                    , "sub1": {
                        "_val3": "value3"
                    }
                }
            };
        }
    );

    act(
        function act() {
            templateExpressionInterface = templateExpression(
                expression
            );
            result = templateExpressionInterface.execute(
                context
            );
        }
    );

    assert(
        function assert(test) {
            test("The result should be ")
            .value(result)
            .equals("value2-gotten value value3")
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._TemplateExpression: has expression
*/
function templateExpressionTest4(
    controller
    , mock_callback
) {
    var hasExpression, test1, test2, test3, test4;

    arrange(
        async function arrange() {
            hasExpression = await controller(
                [
                    ".template.hasExpression"
                ]
            );
        }
    );

    act(
        function act() {
            test1 = hasExpression("class ${other.class}-nm");
            test2 = hasExpression('${func({"prop":"value"}, [0, 2, 3, 4])}');
            test3 = hasExpression("[0, 2, 3, 4]");
            test4 = hasExpression("");
        }
    );

    assert(
        function assert(test) {
            test("test 1 should be true")
            .value(test1)
            .isTrue()
            ;

            test("test 2 should be true")
            .value(test2)
            .isTrue()
            ;

            test("test 3 should be false")
            .value(test3)
            .isFalse()
            ;

            test("test 4 should be false")
            .value(test4)
            .isFalse()
            ;
        }
    );
}