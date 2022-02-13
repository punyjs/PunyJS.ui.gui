/**
* @test
*   @title PunyJS.ui.gui.template.tagHandlers._Text: functional test
*/
function textTagHandlerTest1(
    controller
) {
    var textTagHandler, stateManager, context, state, jsonTemplate, templateProxy, domProxy, watcher, initialText, updatedText, deletedText, addedText;

    arrange(
        async function arrangeFn() {
            textTagHandler = await controller(
                [
                    ":PunyJS.ui.gui.template.tagHandlers._Text"
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
                "tagName": "text"
                , "text": "Message: ${state.messages[state.messageIndex]}"
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
            textTagHandler(
                templateProxy
                , context
            );
            initialText = templateProxy.text;
            state.messageIndex = 1;
            updatedText = templateProxy.text;
            delete domProxy.text;
            deletedText = templateProxy.text;
            domProxy.text = "${state.messages[0]}";
            addedText = templateProxy.text;
        }
    );

    assert(
        function assertFn(test) {
            test("The initial text should be")
            .value(initialText)
            .equals("Message: message1")
            ;

            test("The updated text should be")
            .value(updatedText)
            .equals("Message: message2")
            ;

            test("The deleted text should be")
            .value(deletedText)
            .equals("")
            ;

            test("The added text should be")
            .value(addedText)
            .equals("message1")
            ;
        }
    );
}