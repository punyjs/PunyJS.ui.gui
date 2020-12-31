/**
* @test
*   @title PunyJS.ui.gui.expression._Interface: functional test, in loop
*/
function expressionInterfaceTest1(
    controller
    , mock_callback
) {
    var expressionInterface, expression, expInterface, result, context, iterator, firstVal, secVal;

    arrange(
        async function arrangeFn() {
            expressionInterface = await controller(
                [
                    ":PunyJS.ui.gui.expression._Interface"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": true
                    , "var2": false
                    , "var3": "var3"
                    , "getList": mock_callback(
                        ["a","b","c"]
                    )
                }
            };
            expression = 'key,val in state.getList(state.var1, [0,state.var2],{"prop1":"\'value1\'","prop2":"state.var3"})';
        }
    );

    act(
        function actFn() {
            expInterface = expressionInterface(
                expression
                , context
            );
            iterator = expInterface.execute(
                context
            );
            firstVal = iterator.next();
            secVal = iterator.next();
        }
    );

    assert(
        function assertFn(test) {
            test("The result variables should be")
            .value(expInterface, "variables")
            .stringify()
            .equals('["state.getList","state.var1","state.var2","state.var3"]')
            ;

            test("The iterator should be")
            .value(iterator)
            .stringify()
            .equals('{"lookup":{"key":"key","value":"val"},"keys":["0","1","2"],"index":2,"length":3,"collection":["a","b","c"]}')
            ;

            test("The getList function should be called with")
            .value(context, "state.getList")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, true)
            .getCallbackArg(0, 1)
            .stringify()
            .equals("[0,false]")
            ;

            test("The getList function last arg should be")
            .value(context, "state.getList")
            .getCallbackArg(0, 2)
            .stringify()
            .equals('{"prop1":"value1","prop2":"var3"}')
            ;

            test("The firstVal should be")
            .value(firstVal)
            .stringify()
            .equals('{"key":"0","val":"a"}')
            ;

            test("The secVal should be")
            .value(secVal)
            .stringify()
            .equals('{"key":"1","val":"b"}')
            ;

        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Interface: functional test, conditional
*/
function expressionInterfaceTest2(
    controller
    , mock_callback
) {
    var expressionInterface, expression, expInterface, result, context;

    arrange(
        async function arrangeFn() {
            expressionInterface = await controller(
                [
                    ":PunyJS.ui.gui.expression._Interface"
                    , []
                ]
            );
            context = {
                "state": {
                    "var1": true
                    , "var2": false
                    , "var3": "var3"
                    , "getList": mock_callback(
                        ["a","b","c"]
                    )
                }
            };
            expression = 'state.var1 isin state.getList()';
        }
    );

    act(
        function actFn() {
            expInterface = expressionInterface(
                expression
                , context
            );
            result = expInterface.execute(
                context
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The result variables should be")
            .value(expInterface, "variables")
            .stringify()
            .equals('["state.var1","state.getList"]')
            ;

            test("The result should be")
            .value(result)
            .equals(false)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Interface: functional test, conditional
*/
function expressionInterfaceTest3(
    controller
    , mock_callback
) {
    var expressionInterface, expression, expInterface, result, context, output;

    arrange(
        async function arrangeFn() {
            expressionInterface = await controller(
                [
                    ":PunyJS.ui.gui.expression._Interface"
                    , []
                ]
            );
            context = {
                "state": {
                    "var1": true
                    , "var2": false
                    , "var3": "var3"
                    , "getList": mock_callback()
                }
            };
            expression = '(state.var1,{"prop1":"\'value1\'"},["string",-1])=>state.getList';
        }
    );

    act(
        function actFn() {
            expInterface = expressionInterface(
                expression
                , context
            );
            result = expInterface.execute(
                context
            );
            output = result("arg");
        }
    );

    assert(
        function assertFn(test) {
            test("The result variables should be")
            .value(expInterface, "variables")
            .stringify()
            .equals('["state.getList","state.var1"]')
            ;

            test("The callback should be called with")
            .value(context, "state.getList")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, true)
            .hasBeenCalledWithArg(0, 3, "arg")
            ;

            test("The callback should be called with")
            .value(context, "state.getList")
            .getCallbackArg(0, 1)
            .stringify()
            .equals('{"prop1":"value1"}')
            ;

            test("The callback should be called with")
            .value(context, "state.getList")
            .getCallbackArg(0, 2)
            .stringify()
            .equals('["string",-1]')
            ;
        }
    );
}