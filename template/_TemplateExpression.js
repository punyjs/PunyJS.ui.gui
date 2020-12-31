/**
* The template expression takes a string value with one ore more expressions, notated with `${expression}` delimeters, and returns an interface that will return the combines result when the execute function is called with a context object
* @factory
*/
function _TemplateExpression(
    expression_interface
    , is_string
    , is_object
) {
    /**
    * A regular expression pattern for matching bind variables in attribute values
    * @property
    */
    var BIND_VAR_PATT = /\$\{(.+)\}/
    /**
    * A regular expression pattern for replacing the expression index pattern in the intermediate expression value
    * @property
    */
    , EXPR_INDEX_PATT = /[<][$]([0-9]+)[$][>]/g
    /**
    * @constants
    */
    , cnsts = {
        "terminators": {
            "string": [
                '"'
                , "'"
                , "`"
            ]
        }
    }
    /**
    * @property
    */
    , self = {}
    ;

    TemplateExpression.isTemplateExpression = isTemplateExpression;

    TemplateExpression.hasTemplateExpression = hasTemplateExpression;

    return TemplateExpression;

    /**
    * @worker
    */
    function TemplateExpression(value) {
        var templateExpr = value, expressions;
        //if there are bind variables in the value
        if (hasTemplateExpression(value)) {
            //extract the expressions from the value
            expressions = extractExpressions(
                value
            );
            //convert the attribute into an expression interface
            templateExpr = Object.create(
                self
                , {
                    "original": {
                        "enumerable": true
                        , "writable": true
                        , "value": value
                    }
                    , "expressions": {
                        "enumerable": true
                        , "writable": true
                        , "value": []
                    }
                    , "variables": {
                        "enumerable": true
                        , "writable": true
                        , "value": []
                    }
                    , "intermediate": {
                        "enumerable": true
                        , "writable": true
                        , "value": value
                    }
                }
            );
            //loop through the expressions and create the intermediate
            expressions
            .forEach(
                function forEachExpression(expr, index) {
                    var indexKey = `<\$${index}\$>`
                    //create the expression interface
                    , expressionInterface = expression_interface(
                        expr
                    );
                    //replace the expression text with the indexkey
                    templateExpr.intermediate =
                        templateExpr.intermediate.replace(
                            `\$\{${expr}\}`
                            , indexKey
                        );
                    templateExpr.expressions.push(
                        expressionInterface
                    );
                    templateExpr.variables = templateExpr.variables
                        .concat(
                            expressionInterface.variables
                        );
                }
            );
            //set the execute function
            templateExpr.execute = executeExpressions.bind(
                null
                , templateExpr
            );
        }
        return templateExpr;
    }
    /**
    * @function
    */
    function executeExpressions(exprInterface, context) {
        //if there is only an expression, return the result of the expression outright
        if (exprInterface.intermediate === "<$0$>") {
            return exprInterface.expressions[0]
                .execute(
                    context
                )
            ;
        }
        //execute each expression index entry on the intermediate
        return exprInterface.intermediate
        .replace(
            EXPR_INDEX_PATT
            , function replaceIndex(match, index) {
                var result = exprInterface.expressions[index]
                    .execute(
                        context
                    )
                ;
                //if the result is an object then find the first property that is truthy and use that key as the result
                if (is_object(result)) {
                    Object.keys(result)
                    .every(
                        function chooseResult(key) {
                            if (!!result[key]) {
                                result = key;
                                return false;
                            }
                            return true;
                        }
                    )
                }

                return result;
            }
        );
    }
    /**
    * @function
    */
    function extractExpressions(value) {
        var expressions = []
        , inStringChar
        , level = 0
        , inExpression = false
        , expression = ""
        ;

        for (let i = 0, l = value.length, cur, last; i < l; i++) {
            cur = value[i];
            last = i > 0 && value[i -1];
            //see if we in a string literal
            if (!!inStringChar) {
                //see if this is the end of that string
                if (cur === inStringChar) {
                    inStringChar = null;
                }
            }
            //see if we are going up a level
            else if (cur === "}") {
                level--;
                //see if this is the end of an expression
                if (level === 0 && inExpression) {
                    inExpression = false;
                    expressions.push(expression);
                    expression = "";
                }
            }
            //see if we are going down a level
            else if (cur === "{") {
                level++;
                //see if this is a start to an expression
                if (level === 1 && last === "$") {
                    inExpression = true;
                    continue;
                }
            }
            //see if we are starting a string literal
            else if (cnsts.terminators.string.indexOf(cur) !== -1) {
                inStringChar = cur;
            }

            if (inExpression) {
                expression+= cur;
            }
        }

        return expressions;
    }
    /**
    * @function
    */
    function hasTemplateExpression(value) {
        return is_string(value) && BIND_VAR_PATT.test(value);
    }
    /**
    * @function
    */
    function isTemplateExpression(value) {
        if (is_object(value)) {
            if (Object.getPrototypeOf(value) === self) {
                return true;
            }
        }
        return false;
    }
}