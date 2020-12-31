/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: chain, execution, literal and array
*/
function expressionExecutorTest1(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": true
                    , "myFunc": mock_callback(
                        function fn(){return "executed";}
                    )
                }
            };
            expressionTree = {
                "type": "chain"
                , "sections": [
                    {
                        "type": "variable"
                        , "path": "state.var1"
                    }
                    , {
                        "type": "logical"
                        , "value": "&&"
                    }
                    , {
                        "type": "execution"
                        , "path": "state.myFunc"
                        , "arguments": [
                            {
                                "type": "literal"
                                , "value": 10.1
                            }
                            , {
                                "type": "array"
                                , "members": [
                                    {
                                        "type": "literal"
                                        , "value": "string"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be")
            .value(result)
            .equals('executed')
            ;

            test("The function should be called with")
            .value(context, "state.myFunc")
            .hasBeenCalledWithArg(0, 0, 10.1)
            .getCallbackArg(0, 1)
            .stringify()
            .equals('["string"]')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: chain, bind, object
*/
function expressionExecutorTest2(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": false
                    , "myFunc": mock_callback(
                        function fn(){return "executed";}
                    )
                }
            };
            expressionTree = {
                "type": "chain"
                , "sections": [
                    {
                        "type": "variable"
                        , "path": "state.var1"
                    }
                    , {
                        "type": "logical"
                        , "value": "||"
                    }
                    , {
                        "type": "bind"
                        , "path": "state.myFunc"
                        , "arguments": [
                            {
                                "type": "object"
                                , "properties": {
                                    "prop1": {
                                        "type": "literal"
                                        , "value": "value1"
                                    }
                                    , "prop2": {
                                        "type": "literal"
                                        , "value": "value2"
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );
            result("arg2");
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be a function")
            .value(result)
            .isOfType("function")
            ;

            test("The callback should be called with")
            .value(context, "state.myFunc")
            .hasBeenCalledWithArg(0, 1, "arg2")
            .getCallbackArg(0, 0)
            .stringify()
            .equals('{"prop1":"value1","prop2":"value2"}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: conditional coercive equals, execution
*/
function expressionExecutorTest3(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": false
                    , "myFunc": mock_callback(
                        function fn(...args){return args[0];}
                    )
                }
            };
            expressionTree = {
                "type": "conditional"
                , "sideA": {
                    "type": "execution"
                    , "path": "state.myFunc"
                    , "arguments": [
                        {
                            "type": "literal"
                            , "value": "10"
                        }
                    ]
                }
                , "operator": "=="
                , "sideB": {
                    "type": "literal"
                    , "value": 10
                }
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be true")
            .value(result)
            .equals(true)
            ;

            test("The callback should be called")
            .value(context, "state.myFunc")
            .hasBeenCalled()
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: conditional isin, literal
*/
function expressionExecutorTest4(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": 10
                    , "list": [
                        9, 3, 10, "1"
                    ]
                }
            };
            expressionTree = {
                "type": "conditional"
                , "sideA": {
                    "type": "variable"
                    , "path": "state.var1"
                }
                , "operator": "isin"
                , "sideB": {
                    "type": "variable"
                    , "path": "state.list"
                }
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be true")
            .value(result)
            .equals(true)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: conditional !isin, literal
*/
function expressionExecutorTest5(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": "value1"
                    , "list": {
                        "prop1": "value1"
                    }
                }
            };
            expressionTree = {
                "type": "conditional"
                , "sideA": {
                    "type": "variable"
                    , "path": "state.var1"
                }
                , "operator": "!isin"
                , "sideB": {
                    "type": "variable"
                    , "path": "state.list"
                }
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be true")
            .value(result)
            .equals(true)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: conditional is
*/
function expressionExecutorTest6(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": "value1"
                    , "list": {
                        "prop1": "value1"
                    }
                }
            };
            expressionTree = {
                "type": "conditional"
                , "sideA": {
                    "type": "literal"
                    , "value": "string"
                }
                , "operator": "is"
                , "sideB": {
                    "type": "type"
                    , "value": "string"
                }
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be true")
            .value(result)
            .equals(true)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: conditional !is
*/
function expressionExecutorTest7(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": "value1"
                    , "list": {
                        "prop1": "value1"
                    }
                }
            };
            expressionTree = {
                "type": "conditional"
                , "sideA": {
                    "type": "literal"
                    , "value": "string"
                }
                , "operator": "!is"
                , "sideB": {
                    "type": "type"
                    , "value": "string"
                }
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be false")
            .value(result)
            .equals(false)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: basic iterator, in
*/
function expressionExecutorTest8(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context, firstVal, secVal, lastVal;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": "value1"
                    , "list": {
                        "prop1": "value1"
                        , "prop2": "value2"
                    }
                }
            };
            expressionTree = {
                "type": "iterator"
                , "lookup": {
                    "key": "k"
                    , "value": "val"
                }
                , "operator": "in"
                , "collection": {
                    "type": "variable"
                    , "path": "state.list"
                }
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );
            //iterate the result
            firstVal = result.next();
            secVal = result.next();
            lastVal = result.next();
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be an object")
            .value(result)
            .isOfType("object")
            .stringify()
            .equals('{"lookup":{"key":"k","value":"val"},"keys":["prop1","prop2"],"index":2,"length":2,"collection":{"prop1":"value1","prop2":"value2"}}')
            ;

            test("The first iteration should result in")
            .value(firstVal)
            .stringify()
            .equals('{"k":"prop1","val":"value1"}')
            ;

            test("The second iteration should result in")
            .value(secVal)
            .stringify()
            .equals('{"k":"prop2","val":"value2"}')
            ;

            test("The last iteration should result in")
            .value(lastVal)
            .isUndef()
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: iterator, in, sort, filter
*/
function expressionExecutorTest9(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context, firstVal, secVal;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": "value1"
                    , "list": {
                        "prop1": "value1"
                        , "prop4": "value4"
                        , "prop3": "value3"
                        , "prop2": "value2"
                        , "prop6": "value6"
                        , "prop0": "value0"
                    }
                }
            };
            expressionTree = {
                "type": "iterator"
                , "lookup": {
                    "key": "$key"
                    , "index": "$i"
                    , "value": "val"
                }
                , "operator": "in"
                , "collection": {
                    "type": "variable"
                    , "path": "state.list"
                }
                , "filter": {
                    "type": "conditional"
                    , "sideA": {
                        "type": "variable"
                        , "path": "$i"
                    }
                    , "operator": ">"
                    , "sideB": {
                        "type": "literal"
                        , "value": 2
                    }
                }
                , "sort": {
                    "by": "val"
                    , "direction": "desc"
                }
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );

            firstVal = result.next();
            secVal = result.next();
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be an object")
            .value(result)
            .isOfType("object")
            .stringify()
            .equals('{"lookup":{"key":"$key","index":"$i","value":"val"},"keys":["prop6","prop2","prop0"],"index":2,"length":3,"collection":{"prop2":"value2","prop6":"value6","prop0":"value0"}}')
            ;

            test("The first val should be")
            .value(firstVal)
            .stringify()
            .equals('{"$key":"prop6","$i":0,"val":"value6"}')
            ;

            test("The second val should be")
            .value(secVal)
            .stringify()
            .equals('{"$key":"prop2","$i":1,"val":"value2"}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Executor: iterator, for, step
*/
function expressionExecutorTest10(
    controller
    , mock_callback
) {
    var expressionExecutor, expressionTree, result, context, firstVal, secVal;

    arrange(
        async function arrangeFn() {
            expressionExecutor = await controller(
                [
                    ":PunyJS.ui.gui.expression._Executor"
                    , [

                    ]
                ]
            );
            context = {
                "state": {
                    "var1": "value1"
                    , "list": {
                        "prop1": "value1"
                        , "prop4": "value4"
                        , "prop3": "value3"
                        , "prop2": "value2"
                        , "prop6": "value6"
                        , "prop0": "value0"
                    }
                }
            };
            expressionTree = {
                "type": "iterator"
                , "lookup": {
                    "key": "$key"
                    , "index": "$i"
                    , "value": "val"
                }
                , "operator": "for"
                , "collection": {
                    "type": "literal"
                    , "value": 10
                }
                , "step": 2
            };
        }
    );

    act(
        function actFn() {
            result = expressionExecutor(
                expressionTree
                , context
            );

            firstVal = result.next();
            secVal = result.next();
        }
    );

    assert(
        function assertFn(test) {
            test("The result should be an object")
            .value(result)
            .isOfType("object")
            .stringify()
            .equals('{"lookup":{"key":"$key","index":"$i","value":"val"},"keys":["0","1","2","3","4","5","6","7","8","9"],"index":4,"length":10,"collection":["0","1","2","3","4","5","6","7","8","9"]}')
            ;

            test("The first val should be")
            .value(firstVal)
            .stringify()
            .equals('{"$key":"0","$i":0,"val":"0"}')
            ;

            test("The second val should be")
            .value(secVal)
            .stringify()
            .equals('{"$key":"2","$i":2,"val":"2"}')
            ;
        }
    );
}