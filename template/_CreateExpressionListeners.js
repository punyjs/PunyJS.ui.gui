/**
* @factory
*/
function _CreateExpressionListeners(
    statenet_common_findStateful
    , utils_reference
    , is_empty
) {
    /**
    * @alias
    */
    var findStateful = statenet_common_findStateful
    ;

    return CreateExpressionListeners;


    /**
    * @function
    */
    function CreateExpressionListeners(expression, context, callback) {
        var listeners = []
        ;
        //skip this if there aren't any variables
        if (is_empty(expression.variables)) {
            return;
        }
        //loop through each varaible, find it's parent, and check if it's stateful, if so then add it to the listeners list
        expression.variables
        .forEach(
            function forEachVarPath(varPath) {
                var watchedRef = getWatched(
                    context
                    , varPath
                )
                , pathSuffix
                , path
                , uuids
                ;
                if (!!watchedRef) {
                    pathSuffix = varPath.replace(watchedRef.jpath, "");
                    path = `${watchedRef.index}${pathSuffix}`;
                    uuids = watchedRef.parent.$addListener(
                        path
                        , callback
                        , ["set","delete"]
                    );
                    listeners.push(
                        {
                            "parent": watchedRef.parent
                            , "path": `$.${path}`
                            , "uuids": uuids
                        }
                    );
                }
            }
        );

        return listeners;
    }
    /**
    * start by checking the full path and if that is not found, start taking segments off of the path until one is found or the end is reached
    * @function
    */
    function getWatched(context, varPath) {
        var ref, segments, path, stateful
        ;
        //split the path
        segments = varPath.split(".");
        //start checking each ancestor
        for (let i = segments.length; i >= 0; i--) {
            path = segments.slice(0, i);
            ref = utils_reference(
                path.join(".")
                , context
            );
            if (ref.found) {
                stateful = findStateful(
                    ref.parent
                    , ref.index
                );
                if (!!stateful) {
                    ref.parent = stateful;
                    return ref;
                }
            }
        }
    }
}