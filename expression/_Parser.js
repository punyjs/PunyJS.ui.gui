/**
* The expression parser intakes a string expression and returns an abstract syntax tree describing the expression along with a list of variables that are used in the expression.

An expression can be either a conditional statement, returning true/false, an interative statement, returning an iterator object, or a value expression returning the resulting value.

A value expression can be a literal, a variable path, a function execution, or a bind operation.

A literal can be a string `"val"`, a number `1.0`, an array `[10,"",1]`, or an object `{"prop1":"va1"}`

A variable path is a string, without quotes, which is intended to point to an external variable; `context.prop1` or `attributes.hidden`.

A function execution is a variable path followed by parenthised arguments; `context.getSomething("string", state.var1)`.

A bind operation is a parenthised list of arguments, followed by a fat arrow(=>), followed by a variable path that points to a function; `(context.var1, state.var2)=>attributes.myFn`

Additionally, and expression can be a chain of expressions, utilizing the logical "AND" `&&` and logical "OR" `||`; `getHidden($element) || false`.

A conditional has three sections, a left and right side, with an operator in the middle; x == y. Conditional operators include, ==, ===, !=, !==, >, >=, <, <=, is, !is, isin, and !isin.

A loop has three required sections, and several optional parts, the resulting variable name, the word "in" or "for", and an expression that results in an iterable; `key in context.list` or `key,val in getList()`. Additionally, filter and sort sections can be added, as well as a step section for controlling the iteration.

"key in getList(root.var1, [10, 2, 3])"
{
    "variables": ["root.var1","getList"]
    , "type": "loop"
    , "sections": [
        {
            "type": "variable"
            , "value": "key"
        }
        , {
            "type": "operator"
            , "value": "in"
        }
        , {
            "type": "execution"
            , "path": "getList"
            , "arguments": [
                {
                    "type": "variable"
                    , "value": "root.var1"
                }
                , {
                    "type": "literal"
                    , "value": [10, 2, 3]
                }
            ]
        }
    ]
}
* @interface
*   @property {array} varaiables A list of the variables used in the expression
*   @property {object} tree The expression
* @factory
*/
function _Parser(
    utils_eval
    , is_numeric
    , is_string
    , errors
) {
    /**
    * A regular expression pattern to match literal expressions
    * @property
    */
    var BIND_FUNC_PATT = /^\(([^)]+)\) ?=> ?([A-Za-z0-9$.,"`'\[\]_]+)$/
    /**
    * A regular expression pattern to match object patterns in expressions
    * @property
    */
    , OBJ_PATT = /^\{.+\}$/
    /**
    * A regular expression pattern to match array patterns in expressions
    * @property
    */
    , ARRAY_PATT = /^\[([A-Za-z0-9$.()_"`'\[\],-. ]+)\]$/
    /**
    * A regular expression pattern to match type patterns in expressions
    * @property
    */
    , TYPE_PATT = /^\[([a-z]+)\]$/
    /**
    * A regular expression pattern to match conditional expressions
    * @property
    */
    , COND_PATT = /^([\-A-Za-z0-9$.,()\[\]_\ '"`]+) (is|!is|isin|!isin|==|>|<|!=|>=|<=|!==|===) ([\-A-Za-z0-9$.,()\[\]_\ '"`]+)$/i
    /**
    * A regular expression pattern to match iterator expressions
    * @property
    */
    , ITER_PATT = /^([A-Za-z0-9$_]+)(?:, ?([A-Za-z0-9$_]+))?(?:, ?([A-Za-z0-9$_]+))? (in|for) ([A-Za-z0-9.()'"`\[\],$_\{\} :]+)(?: sort ([A-z0-9$._\[\]]+)(?: (desc|asc))?)?(?: filter (.+))?$/i
    /**
    * A regular expression pattern to match literal expressions
    * @property
    */
    , LITERAL_PATT = /^(?:('[^']+'|"[^"]+"|`[^`]+`|(?:0x)?[0-9.-]+)|true|false|null|undefined)$/
    /**
    * A regular expression pattern to match function patterns in expressions.
    * @property
    */
    , FUNC_PATT = /^([A-Za-z0-9$.,()'"`\[\]_]+) ?\(([^)]+)?\)$/
    /**
    * A regular expression pattern to match logical 'OR' or "AND" expressions
    * @property
    */
    , HAS_AND_OR_PATT = /\&{2}|\|{2}/
    /**
    * A regular expression pattern to split logical 'OR' or "AND" expressions
    * @property
    */
    , SPLIT_AND_OR_PATT = /(.+?) ?(\&{2} ?|\|{2} ?|$)/g
    /**
    * A regular expression pattern to test for a variable path
    * @property
    */
    , VAR_PATT = /^[A-z0-9._$\[\]"'`]+$/
    /**
    * A regular expression pattern to replace array or oject patterns
    * @property
    */
    , ARRAY_OBJ_PATT = /((?:\[([A-Za-z0-9$.()_'\[\], "`\-\.]+)\])|(?:\{.+\}))/g
    /**
    * A regular expression pattern to replace indexer patterns
    * @property
    */
    , INDXR_PATT = /\[(.+)\]/g
    ;

    return Parser;

    /**
    * @worker
    */
    function Parser(expressionStr) {
        var variables = []
        , exprTree;
        //first step is to split any "||" or "&&"
        if (expressionStr.match(HAS_AND_OR_PATT)) {
            exprTree = splitLogical(
                variables
                , expressionStr
            );
        }
        //otherwise just parse the expression
        else {
            exprTree = parseExpression(
                variables
                , expressionStr
            );
        }
        //add the variables to the expression tree
        exprTree.variables = variables;

        return exprTree;
    }

    /**
    * @function
    */
    function splitLogical(variables, expressionStr) {
        var tree = {
            "type": "chain"
            , "sections": []
        };

        expressionStr.replace(
            SPLIT_AND_OR_PATT
            , function replace(match, expr, logical) {
                tree.sections.push(
                    parseExpression(
                        variables
                        , expr.trim()
                    )
                );
                tree.sections.push(
                    {
                        "type": "logical"
                        , "value": logical.trim()
                    }
                );
            }
        );

        //if the last member is a logical, then remove it
        if (tree.sections[tree.sections.length - 1].type === "logical") {
            tree.sections.pop();
        }

        return tree;
    }
    /**
    * @function
    */
    function parseExpression(variables, expressionStr) {
        var match;
        //see if this is an iterator
        if (!!(match = ITER_PATT.exec(expressionStr))) {
            return parseIterator(
                variables
                , match
            );
        }
        //maybe a conditional statement
        else if (!!(match = COND_PATT.exec(expressionStr))) {
            return parseConditional(
                variables
                , match
            );
        }
        //otherwise its a value expression
        else {
            return parseValueExpression(
                variables
                , expressionStr
            );
        }
    }
    /**
    * @function
    */
    function parseConditional(variables, match) {
        var typeMatch
        , treeNode = {
            "type": "conditional"
            , "sideA": parseExpression(
                variables
                , match[1]
            )
            , "operator": match[2]
        };

        if ((typeMatch = match[3].match(TYPE_PATT))) {
            treeNode.sideB = {
                "type": "type"
                , "value": typeMatch[1]
            };
        }
        else {
            treeNode.sideB = parseExpression(
                variables
                , match[3]
            );
        }

        return treeNode;
    }
    /**
    * @function
    */
    function parseIterator(variables, match) {
        var treeNode = {
            "type": "iterator"
            , "lookup": {
                "key": match[1]
            }
            , "operator": match[4]
            , "collection": parseExpression(
                variables
                , match[5]
            )
        };
        if (!!match[2]) {
            treeNode.lookup.value = match[2];
        }
        if (!!match[3]) {
            treeNode.lookup.index = match[3];
        }
        if (!!match[6]) {
            treeNode.sort = {
                "by": match[6]
                , "direction": match[7] || "asc"
            }
        }
        if (!!match[8]) {
            treeNode.filter = parseExpression(
                match[8]
                , context
            );
        }
        if (!!match[9]) {
            treeNode.step = is_numeric(match[9])
                && parseInt(match[9])
                || 1
            ;
        }

        return treeNode;
    }
    /**
    * @function
    */
    function parseValueExpression(variables, expressionStr) {
        var match, expr, res;

        //remove any leading or trailing whitespace
        expressionStr = expressionStr.trim();
        //see if this is a literal
        if (LITERAL_PATT.test(expressionStr)) {
            return {
                "type": "literal"
                , "value": expressionStr === "undefined"
                    ? undefined
                    : utils_eval(expressionStr) //eval so string delimiters are removed
            };
        }
        //not a literal, should be a data value
        else {
            //see if this is a function
            if (!!(match = FUNC_PATT.exec(expressionStr))) {
                return parsefunc(
                    variables
                    , match
                );
            }
            //or an array literal
            else if (!!(match = ARRAY_PATT.exec(expressionStr))) {
                return parseArray(
                    variables
                    , match[1]
                );
            }
            //or a bind operation
            else if(!!(match = BIND_FUNC_PATT.exec(expressionStr))) {
                return parseBindFunc(
                    variables
                    , match
                );
            }
            //or an object literal
            else if (!!(match = OBJ_PATT.exec(expressionStr))) {
                return parseObject(
                    variables
                    , match[0]
                );
            }
            //or a varaible path
            else if(!!VAR_PATT.exec(expressionStr)) {
                addVariables(
                    variables
                    , expressionStr
                );
                return {
                    "type": "variable"
                    , "path": expressionStr
                };
            }
            else {
                throw new Error(
                    `${errors.ui.gui.expression.invalid_expression} ("${expressionStr}")`
                );
            }
        }
    }
    /**
    * @function
    */
    function parsefunc(variables, match) {
        var treeNode = {
            "type": "execution"
            , "path": match[1]
            , "arguments": []
        }
        , args = extractArguments(
            match[2]
        )
        ;
        //add the function name/path to the variables
        addVariables(
            variables
            , match[1]
        );
        args.forEach(
            function parseEachArg(arg) {
                var expr = parseExpression(
                    variables
                    , arg
                );
                treeNode.arguments.push(
                    expr
                );
            }
        );

        return treeNode;
    }
    /**
    * @function
    */
    function parseBindFunc(variables, match) {
        var treeNode = {
            "type": "bind"
            , "path": match[2]
            , "arguments": []
        }
        , args = extractArguments(
            match[1]
        )
        ;
        addVariables(
            variables
            , treeNode.path
        );
        //parse the arguments
        args.forEach(
            function parseEachArg(arg) {
                var expr = parseExpression(
                    variables
                    , arg
                );
                treeNode.arguments.push(
                    expr
                );
            }
        );

        return treeNode;
    }
    /**
    * @function
    */
    function extractArguments(expression) {
        if (!expression) {
            return [];
        }
        //split out anything with commas in it
        var parts = {}, cnt = 0
        , exprNoObjNoArray = expression.replace(
            ARRAY_OBJ_PATT
            , function replaceArray(match, obj) {
                var name = `<part${++cnt}>`;
                parts[name] = obj;
                return name;
            }
        )
        , args = exprNoObjNoArray.split(",")
        ;
        //loop through the args and update any replaced parts
        return args
        .map(
            function mapArgs(arg) {
                arg = arg.trim();
                if (parts.hasOwnProperty(arg)) {
                    return parts[arg];
                }
                return arg;
            }
        );
    }
    /**
    * @function
    */
    function parseArray(variables, value) {
        var arrayMemebers = value.split(",")
        , treeNode = {
            "type": "array"
            , "members": []
        };

        //loop through the members, parsing each one
        arrayMemebers.forEach(
            function forEachMember(memberStr) {
                var expr = parseExpression(
                    variables
                    , memberStr
                );
                treeNode.members.push(
                    expr
                );
            }
        )

        return treeNode;

    }
    /**
    * @function
    */
    function parseObject(variables, json) {
        var value = JSON.parse(json)
        , treeNode = {
            "type": "object"
            , "properties": {}
        };
        //process the object properties, they could be expressions also
        Object.keys(value)
        .forEach(
            function forEachKey(key) {
                var propValue = value[key]
                , expr = propValue
                ;
                expr = parseExpression(
                    variables
                    , expr
                );
                treeNode.properties[key] = expr;
            }
        );

        return treeNode;
    }
    /**
    * @function
    */
    function addVariables(variables, variableStr) {
        //if there are brackets see if the contents are a varaible
        var mainVar = variableStr.replace(
            INDXR_PATT
            , replaceIndexer.bind(
                null
                , variables
            )
        )
        ;
        //if the result of updating indexers makes a different string, use that
        if (mainVar !== variableStr) {
            variables.push(mainVar);
            //add a variable for each $every segment
            mainVar.split(".")
            .forEach(
                function forEachPart(part, index, parts) {
                    if (part === "$every") {
                        //add the variable with the every
                        addVariable(
                            variables
                            , parts
                            .slice(0, index + 1)
                            .join(".")
                        );
                        //add the variable without the $every
                        addVariable(
                            variables
                            , parts
                            .slice(0, index)
                            .join(".")
                        );
                    }
                }
            );
        }
        else {
            addVariable(
                variables
                , variableStr
            );
        }
    }
    /**
    * @function
    */
    function replaceIndexer(variables, match, indexer) {
        if (`${indexer}`.match(LITERAL_PATT)) {
            return match;
        }
        addVariables(
            variables
            , indexer
        );
        return ".$every";
    }
    /**
    * @function
    */
    function addVariable(variables, value) {
        if (variables.indexOf(value) === -1) {
            variables.push(
                value
            );
        }
    }
}