/**
* The expression interface parses a string expression and returns an interface that provides an execute function to run the expression with context data.
* @factory
*/
function _Interface(
    expression_parser
    , expression_executor
) {


    return Interface;

    /**
    * @worker
    */
    function Interface(expression) {
        var tree = expression_parser(
            expression
        );
        return {
            "variables": tree.variables
            , "type": tree.type
            , "execute": function execute(context) {
                return expression_executor(
                    tree
                    , context
                );
            }
        };
    }
}