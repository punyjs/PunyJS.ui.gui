/**
* @test
*   @title PunyJS.ui.gui.expression._Parser: iterator in
*/
function expressionParserTest1(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.ui.gui.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "k in getList()";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"iterator","lookup":{"key":"k"},"operator":"in","collection":{"type":"execution","path":"getList","arguments":[]},"variables":["getList"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Parser: iterator for
*/
function expressionParserTest2(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.ui.gui.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "k for 10";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"iterator","lookup":{"key":"k"},"operator":"for","collection":{"type":"literal","value":10},"variables":[]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Parser: conditional isin
*/
function expressionParserTest3(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.ui.gui.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.var1 isin [0, 1, 2]";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"conditional","sideA":{"type":"variable","path":"context.var1"},"operator":"isin","sideB":{"type":"array","members":[{"type":"literal","value":0},{"type":"literal","value":1},{"type":"literal","value":2}]},"variables":["context.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Parser: conditional is
*/
function expressionParserTest4(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.ui.gui.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.var1 is [object]";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"conditional","sideA":{"type":"variable","path":"context.var1"},"operator":"is","sideB":{"type":"type","value":"object"},"variables":["context.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Parser: variable
*/
function expressionParserTest5(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.ui.gui.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.var1";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"variable","path":"context.var1","variables":["context.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Parser: bind operation
*/
function expressionParserTest6(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.ui.gui.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "(context.var1, 'string', 90)=>myFunc";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"bind","path":"myFunc","arguments":[{"type":"variable","path":"context.var1"},{"type":"literal","value":"string"},{"type":"literal","value":90}],"variables":["myFunc","context.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Parser: function execution
*/
function expressionParserTest7(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.ui.gui.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.myFunc[0]('arg1', state.var1)";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"execution","path":"context.myFunc[0]","arguments":[{"type":"literal","value":"arg1"},{"type":"variable","path":"state.var1"}],"variables":["context.myFunc[0]","state.var1"]}')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.expression._Parser: chaining
*/
function expressionParserTest8(
    controller
) {
    var expressionParser, expressionTree, expression;

    arrange(
        async function arrangeFn() {
            expressionParser = await controller(
                [
                    ":PunyJS.ui.gui.expression._Parser"
                    , [

                    ]
                ]
            );
            expression = "context.var1 || state.var1 && myFunc('string')";
        }
    );

    act(
        function actFn() {
            expressionTree = expressionParser(
                expression
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The expression tree should be")
            .value(expressionTree)
            .stringify()
            .equals('{"type":"chain","sections":[{"type":"variable","path":"context.var1"},{"type":"logical","value":"||"},{"type":"variable","path":"state.var1"},{"type":"logical","value":"&&"},{"type":"execution","path":"myFunc","arguments":[{"type":"literal","value":"string"}]}],"variables":["context.var1","state.var1","myFunc"]}')
            ;
        }
    );
}