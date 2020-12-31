/**
*
* @factory
*/
function _Executor(
    utils_getType
    , utils_reference
    , is_func
    , is_object
    , is_array
    , is_numeric
    , errors
) {

    return Executor;

    /**
    * @worker
    */
    function Executor(expressionTree, context) {
        return handleType(
            expressionTree
            , context
        );
    }

    /**
    * @function
    */
    function handleType(treeNode, context) {
        switch(treeNode.type) {
            case "chain":
                return handleChain(
                    treeNode
                    , context
                );
                break;
            case "conditional":
                return handleConditional(
                    treeNode
                    , context
                );
                break;
            case "iterator":
                return handleIterator(
                    treeNode
                    , context
                );
                break;
            case "literal":
                return treeNode.value;
                break;
            case "variable":
                return handleVariable(
                    treeNode
                    , context
                );
                break;
            case "execution":
                return handleExecution(
                    treeNode
                    , context
                );
                break;
            case "bind":
                return handleBind(
                    treeNode
                    , context
                );
                break;
            case "array":
                return handleArray(
                    treeNode
                    , context
                );
                break;
            case "object":
                return handleObject(
                    treeNode
                    , context
                );
                break;
            case "type":
                return treeNode.value;
                break;
            default:
                throw new Error(
                    `${errors.ui.gui.expression.invalid_expression_type} (${treeNode.type})`
                );
                break;
        }
    }
    /**
    * @function
    */
    function handleChain(treeNode, context) {
        var lastResult, hasResult = false, operator;
        //loop through the sections
        treeNode.sections
        .every(
            function forEachSection(section) {
                var result;
                if (section.type === "logical") {
                    operator = section.value;
                    return true;
                }
                //if there is an OR operator, check the result
                if (hasResult && !!lastResult && operator === "||") {
                    //if the result is truthy then stop the loop
                    return false;
                }
                else {
                    result = handleType(
                        section
                        , context
                    );
                    hasResult = true;
                }
                if (!!operator) {
                    if (operator === "&&") {
                        lastResult = lastResult && result;
                    }
                    else {
                        lastResult = result;
                    }
                }
                else {
                    lastResult = result;
                }
                return true;
            }
        );

        return lastResult;
    }
    /**
    * @function
    */
    function handleConditional(treeNode, context) {
        var sideA = handleType(
            treeNode.sideA
            , context
        )
        , sideB = handleType(
            treeNode.sideB
            , context
        )
        , op = treeNode.operator
        ;
        switch(op) {
            case "==":
                return sideA == sideB;
                break;
            case "===":
                return sideA === sideB;
                break;
            case "!=":
                return sideA != sideB;
                break;
            case "!==":
                return sideA !== sideB;
                break;
            case ">":
                return sideA > sideB;
                break;
            case ">=":
                return sideA >= sideB;
                break;
            case "<":
                return sideA < sideB;
                break;
            case "<=":
                return sideA <= sideB;
                break;
            case "is":
                return sideA === utils_getType(sideB);
                break;
            case "!is":
                return sideA !== utils_getType(sideB);
                break;
            case "isin":
                if (is_object(sideB)) {
                    return sideA in sideB;
                }
                else {
                    return sideB.indexOf(sideA) !== -1
                }
                break;
            case "!isin":
                if (is_object(sideB)) {
                    return !(sideA in sideB);
                }
                else {
                    return sideB.indexOf(sideA) === -1
                }
                break;
            default:
                throw new Error(
                    `${errors.ui.gui.exception.invalid_operator} (${op})`
                );
                break;
        }
    }
    /**
    * @function
    */
    function handleIterator(treeNode, context) {
        var result = handleType(
            treeNode.collection
            , context
        )
        , set = treeNode.operator === "in"
            ? result
            : createCollection(
                result
            )
        , sort = !!treeNode.sort
            && treeNode.sort.by
        , dir = !!treeNode.sort
            && treeNode.sort.direction
        , filter = treeNode.filter
        , step = is_numeric(treeNode.step)
            ? parseInt(treeNode.step)
            : 1
        , coll = filterCollection(
            set
            , filter
            , treeNode.lookup
            , context
        )
        , keys = Object.keys(coll)
        , indx = 0
        ;
        //sort if we have a sort
        if (!!sort) {
            keys.sort(
                function sortKeys(k1, k2) {
                    var k1Val = sort === treeNode.lookup.key && k1
                        || sort === treeNode.lookup.index && keys.indexOf(k1)
                        || sort === treeNode.lookup.value && coll[k1]
                        || utils_reference(sort, coll[k1]).value
                    , k2Val = sort === treeNode.lookup.key && k2
                        || sort === treeNode.lookup.index && keys.indexOf(k2)
                        || sort === treeNode.lookup.value && coll[k2]
                        || utils_reference(sort, coll[k2]).value
                    ;
                    if (k1Val < k2Val) {
                        return dir === "asc" && -1 || 1;
                    }
                    if (k1Val > k2Val) {
                        return dir === "asc" && 1 || -1;
                    }
                    return 1;
                }
            );
        }
        //if the step is negative then reverse the order
        if (step < 0) {
            indx = keys.length - 1;
        }
        //create the iterator
        return Object.create(null, {
            "lookup": {
                "enumerable": true
                , "get": function () { return treeNode.lookup; }
            }
            , "keys": {
                "enumerable": true
                , "get": function () { return keys; }
            }
            , "index": {
                "enumerable": true
                , "get": function () { return indx; }
            }
            , "length": {
                "enumerable": true
                , "get" : function () { return keys.length; }
            }
            , "collection": {
                "enumerable": true
                , "get": function () { return coll; }
            }
            , "next": {
                "enumerable": true
                , "value": function next() {
                    if (indx < keys.length && indx >= 0) {
                        var key = keys[indx]
                        , data = Object.create(context)
                        ;
                        data[treeNode.lookup.key] = key;
                        !!treeNode.lookup.index
                            && (data[treeNode.lookup.index] = indx)
                        ;
                        !!treeNode.lookup.value
                            && (data[treeNode.lookup.value] = coll[key])
                        ;
                        indx+=step;
                        return data;
                    }
                }
            }
        });
    }
    /**
    * Filters the collection or array
    * @function
    */
    function createCollection(count) {
        var coll = new Array(count).fill("");
        return coll.map(
            function mapColl(val, indx) {
                return `${indx}`;
            }
        );
    }
    /**
    * Filters the collection or array
    * @function
    */
    function filterCollection(coll, filter, vars, context) {
        if (!!coll && !!filter) {
            var keys = Object.keys(coll)
            , isAr = is_array(coll)
            , filtered = isAr && [] || {}
            ;

            keys.forEach(
                function forEachKey(key, indx) {
                    //create a new object with context as the proto
                    var data = Object.create(context)
                    , result
                    ;
                    //add the vars anvalues to the new object
                    data[vars.key] = key;
                    !!vars.index
                        && (data[vars.index] = indx)
                    ;
                    !!vars.value
                        && (data[vars.value] = coll[key])
                    ;
                    //resolve the
                    result = handleType(
                        filter
                        , data
                    );

                    if (!!result) {
                        isAr && filtered.push(coll[key]) ||
                            (filtered[key] = coll[key]);
                    }
                }
            );

            return filtered;
        }
        return coll;
    }
    /**
    * @function
    */
    function handleVariable(treeNode, context) {
        var ref = utils_reference(
            treeNode.path
            , context
        );
        if (!ref.found) {debugger;
            throw new Error(
                `${errors.ui.gui.expression.variable_not_found} ("${treeNode.path}")`
            );
        }
        return ref.value;
    }
    /**
    * @function
    */
    function handleExecution(treeNode, context) {
        var fnRef = utils_reference(
            treeNode.path
            , context
        )
        , fn = fnRef.found
            && fnRef.value
        , args = treeNode.arguments
        .map(function mapArg(arg) {
            return handleType(
                arg
                , context
            );
        });
        if (!fnRef.found) {
            throw new Error(
                `${errors.ui.gui.expression.function_not_found} (${treeNode.path})`
            );
        }
        if(!is_func(fn)) {
            throw new Error(
                `${errors.ui.gui.expression.function_invalid} (${treeNode.path} ${typeof fn})`
            );
        }
        //execute the function
        return fn.apply(null, args);
    }
    /**
    * @function
    */
    function handleBind(treeNode, context) {
        var fnRef = utils_reference(
            treeNode.path
            , context
        )
        , fn = fnRef.found
            && fnRef.value
        , args = treeNode.arguments
        .map(
            function mapArg(arg) {
                return handleType(
                    arg
                    , context
                );
            }
        );
        if (!fnRef.found) {
            throw new Error(
                `${errors.ui.gui.expression.function_not_found} (${treeNode.path})`
            );
        }
        if(!is_func(fn)) {
            throw new Error(
                `${errors.ui.gui.expression.function_invalid} (${treeNode.path} ${typeof fn})`
            );
        }
        return fn.bind.apply(fn, [null].concat(args));
    }
    /**
    * @function
    */
    function handleArray(treeNode, context) {
        return treeNode.members
        .map(
            function mapMember(member) {
                return handleType(
                    member
                    , context
                );
            }
        );
    }
    /**
    * @function
    */
    function handleObject(treeNode, context) {
        var obj = {};

        Object.keys(treeNode.properties)
        .forEach(
            function forEachProperty(key) {
                var property = treeNode.properties[key]
                , result = handleType(
                    property
                    , context
                );
                obj[key] = result;
            }
        );

        return obj;
    }
}