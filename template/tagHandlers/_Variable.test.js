/**
* @test
*   @title PunyJS.ui.gui.template.tagHandlers._Variable: functional test
*/
function variableTagHandlerTest1(
    controller
) {
    var variableTagHandler, watcher, stateManager, jsonTemplate, templateProxy, domProxy, state, context, initialVars, afterUpdateVars, afterTagHandlerVars, afterDestroyVars;

    arrange(
        async function arrangeFn() {
            variableTagHandler = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Variable"
                    , [

                    ]
                ]
            );
            watcher = await controller(
                [
                    ".utils.proxy.biDirectionalWatcher"
                ]
            );
            stateManager = await controller(
                [
                    ".statenet.common.stateManager"
                ]
            );
            jsonTemplate = {
                "tagName": "variable"
                , "attributes": {
                    "var1": "first variable"
                    , "var2": "${list[index]}"
                    , "var3": "${number}"
                    , "var4": "${_display}"
                }
            };
            [templateProxy, domProxy] = watcher(
                jsonTemplate
                , true
            );
            state = stateManager(
                null
                , {
                    "_display": "none"
                    , "index": 1
                }
            );
            context = Object.create(
                state
                , {
                    "list": {
                        "enumerable": true
                        , "value": [
                            {
                                "_display": "flex"
                            }
                            , {
                                "_display": "table"
                            }
                        ]
                    }
                    , "number": {
                        "enumerable": true
                        , "value": 4000
                    }
                }
            );
        }
    );

    act(
        function actFn() {
            initialVars = JSON.stringify(
                context
            );
            variableTagHandler(
                templateProxy
                , context
            );
            afterTagHandlerVars = JSON.stringify(
                context
            );
            
            state.index = 0;
            afterUpdateVars = JSON.stringify(
                context
            );

            domProxy.destroyed = true;
            afterDestroyVars = JSON.stringify(
                context
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The initialVars should be")
            .value(initialVars)
            .equals('{"list":[{"_display":"flex"},{"_display":"table"}],"number":4000}')
            ;

            test("The afterTagHandlerVars should be")
            .value(afterTagHandlerVars)
            .equals('{"list":[{"_display":"flex"},{"_display":"table"}],"number":4000,"var1":"first variable","var2":{"_display":"table"},"var3":4000,"var4":"none"}')
            ;

            test("The afterUpdateVars should be")
            .value(afterUpdateVars)
            .equals('{"list":[{"_display":"flex"},{"_display":"table"}],"number":4000,"var1":"first variable","var2":{"_display":"flex"},"var3":4000,"var4":"none"}')
            ;

            test("The afterDestroyVars should be")
            .value(afterDestroyVars)
            .equals('{"list":[{"_display":"flex"},{"_display":"table"}],"number":4000}')
            ;
        }
    );
}