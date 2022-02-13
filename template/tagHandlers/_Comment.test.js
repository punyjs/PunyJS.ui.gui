/**
* @test
*   @title PunyJS.ui.gui.template.tagHandlers._Comment: functional test
*/
function commentagHandlerTest1(
    controller
) {
    var commentTagHandler, stateManager, context, state, jsonTemplate, templateProxy, domProxy, watcher, initialComment, updatedComment, deletedComment, addedComment;

    arrange(
        async function arrangeFn() {
            commentTagHandler = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Comment"
                    , []
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
                "tagName": "comment"
                , "comment": "Message: ${state.messages[state.messageIndex]}"
            };
            state = stateManager(
                null
                , {
                    "messages": [
                        "message1"
                        , "message2"
                    ]
                    , "messageIndex": 0
                }
            );
            context = {
                "state": state
            };
            [templateProxy, domProxy] = watcher(
                jsonTemplate
                , true
            );
        }
    );

    act(
        function actFn() {
            commentTagHandler(
                templateProxy
                , context
            );
            initialComment = templateProxy.comment;
            state.messageIndex = 1;
            updatedComment = templateProxy.comment;
            delete domProxy.comment;
            deletedComment = templateProxy.comment;
            domProxy.comment = "${state.messages[0]}";
            addedComment = templateProxy.comment;
        }
    );

    assert(
        function assertFn(test) {
            test("The initial text should be")
            .value(initialComment)
            .equals("Message: message1")
            ;

            test("The updated text should be")
            .value(updatedComment)
            .equals("Message: message2")
            ;

            test("The deleted text should be")
            .value(deletedComment)
            .equals("")
            ;

            test("The added text should be")
            .value(addedComment)
            .equals("message1")
            ;
        }
    );
}