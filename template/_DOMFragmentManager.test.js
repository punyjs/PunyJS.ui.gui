/**
* @test
*   @title PunyJS.ui.gui.template._DOMFragmentManager: kitchen sink
*/
function domFragmentManagerTest1(
    controller
    , mock_callback
) {
    var domFragmentManager, dom_createElement, dom_createElementNS, dom_mutationObserver, domProxy, fragmentId, eventFn, element, observer, changeHandler, mutationHandler, template_element, fragment, eventOffFn, template_domNodeHandlers;

    arrange(
        async function arrangeFn() {
            eventFn = mock_callback(
                function mockOnEvent(event, handler) {
                    changeHandler = handler
                }
            );
            eventOffFn = mock_callback();
            domProxy = {
                "nodeName": "repeat"
                , "attributes": {
                    "expr": "$f in list"
                }
                , "on": eventFn
                , "off": eventOffFn
                , "children": [
                    {
                        "nodeName": "div"
                        , "on": eventFn
                        , "children": [
                            {
                                "nodeName": "text"
                                , "attributes": {
                                    "text": "test value"
                                }
                            }
                        ]
                    }
                    , {
                        "nodeName": "toolbar"
                        , "attributes": {
                            "id": "toolbarId"
                            , "name": "toolbar"
                        }
                        , "on": eventFn
                        , "children": [
                            {
                                "nodeName": "text"
                                , "attributes": {
                                    "text": "->"
                                }
                            }
                            , {
                                "nodeName": "toolbar-icon"
                                , "attributes": {
                                    "alt-text": "alternate"
                                    , "url": "url://"
                                    , "obj": {}
                                    , "array": []
                                }
                                , "on": eventFn
                            }
                        ]
                    }
                ]
            };
            element = {
                "setAttribute": mock_callback()
                , "appendChild": mock_callback()
                , "parentElement": {
                    "removeChild": mock_callback()
                }
            };
            template_element = mock_callback("template element");
            observer = {
                "observe": mock_callback()
                , "disconnect": mock_callback()
            };
            dom_createElement = mock_callback(element);
            dom_createElementNS = mock_callback(element);
            dom_mutationObserver = mock_callback(
                function mockCallback(handler) {
                    mutationHandler = handler;
                    return observer;
                }
            );
            template_domNodeHandlers = {
                "text": mock_callback(element)
            };
            domFragmentManager = await controller(
                [
                    ":PunyJS.ui.gui.template._DOMFragmentManager"
                    , [
                        dom_createElement
                        , dom_createElementNS
                        , dom_mutationObserver
                        , template_element
                        , template_domNodeHandlers
                    ]
                ]
            );
        }
    );

    act(
        function actFn() {
            fragmentId = domFragmentManager.create(
                domProxy
            );
            fragment = domFragmentManager.get(
                fragmentId
            );
            domFragmentManager.destroy(
                fragmentId
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The createElement callback should be called once for the root")
            .value(dom_createElementNS)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, "http://www.w3.org/1999/xhtml")
            .hasBeenCalledWithArg(0, 1, "repeat")
            ;

            test("The createElement callback should be called 5x with")
            .value(dom_createElement)
            .hasBeenCalled(3)
            .hasBeenCalledWithArg(0, 0, "div")
            .hasBeenCalledWithArg(1, 0, "toolbar")
            .hasBeenCalledWithArg(2, 0, "toolbar-icon")
            ;

            test("The element.setAttribute callback should be called 6x with")
            .value(element, "setAttribute")
            .hasBeenCalled(7)
            .hasBeenCalledWithArg(0, 0, "expr")
            .hasBeenCalledWithArg(0, 1, "$f in list")
            .hasBeenCalledWithArg(1, 0, "id")
            .hasBeenCalledWithArg(1, 1, "toolbarId")
            .hasBeenCalledWithArg(2, 0, "name")
            .hasBeenCalledWithArg(2, 1, "toolbar")
            .hasBeenCalledWithArg(3, 0, "alt-text")
            .hasBeenCalledWithArg(3, 1, "alternate")
            .hasBeenCalledWithArg(4, 0, "url")
            .hasBeenCalledWithArg(4, 1, "url://")
            .hasBeenCalledWithArg(5, 0, "obj")
            .hasBeenCalledWithArg(5, 1, "[object]")
            .hasBeenCalledWithArg(6, 0, "array")
            .hasBeenCalledWithArg(6, 1, "[object]")
            ;

            test("The element.appendChild callback should be called 5x with")
            .value(element, "appendChild")
            .hasBeenCalled(5)
            .hasBeenCalledWithArg(0, 0, element)
            .hasBeenCalledWithArg(1, 0, element)
            .hasBeenCalledWithArg(2, 0, element)
            .hasBeenCalledWithArg(3, 0, element)
            .hasBeenCalledWithArg(4, 0, element)
            ;

            test("The dom_mutationObserver should be called once")
            .value(dom_mutationObserver)
            .hasBeenCalled(1)
            ;

            test("The mutation observe callback should be called once")
            .value(observer, "observe")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, element)
            .getCallbackArg(0, 1)
            .stringify()
            .equals('{"childList":true,"attributes":true,"subtree":true}')
            ;

            test("The on event should only be called twice")
            .value(eventFn)
            .hasBeenCalled(2)
            .getCallbackArg(0, 0)
            .stringify()
            .equals('["children.*","delete children.*","attributes.*","delete attributes.*"]')
            ;

            test("The template_element should be called once with")
            .value(template_element)
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, element)
            ;

            test("The fragment from the get operation should be")
            .value(fragment)
            .equals("template element")
            ;

            test("The observer disconnect should be called once")
            .value(observer, "disconnect")
            .hasBeenCalled(1)
            ;

            test("The parent removeChild should be called once")
            .value(element, "parentElement.removeChild")
            .hasBeenCalled(1)
            .hasBeenCalledWithArg(0, 0, element)
            ;

            test("The off event callback should be called once")
            .value(eventOffFn)
            .hasBeenCalled(1)
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._DOMFragmentManager: mutation
*/
function domFragmentManagerTest2(
    controller
    , mock_callback
) {
    var domFragmentManager, domProxy, fragmentId, eventFn, element, observer, dom_createTextNode, changeHandler, mutationHandler, template_element, fragment, eventOffFn, template_domNodeHandlers, createTextNode;

    arrange(
        async function arrangeFn() {
            eventFn = mock_callback(
                function mockOnEvent(event, handler) {
                    changeHandler = handler
                }
            );
            eventOffFn = mock_callback();
            domProxy = {
                "nodeName": "repeat"
                , "attributes": {
                    "expr": "$f in list"
                }
                , "on": eventFn
                , "off": eventOffFn
                , "children": [
                    {
                        "nodeName": "div"
                        , "on": eventFn
                        , "children": [
                            {
                                "nodeName": "text"
                                , "attributes": {
                                    "text": "test value"
                                }
                            }
                        ]
                    }
                    , {
                        "nodeName": "toolbar"
                        , "attributes": {
                            "id": "toolbarId"
                            , "name": "toolbar"
                        }
                        , "on": eventFn
                        , "children": [
                            {
                                "nodeName": "text"
                                , "attributes": {
                                    "text": "->"
                                }
                            }
                            , {
                                "nodeName": "toolbar-icon"
                                , "attributes": {
                                    "alt-text": "alternate"
                                    , "url": "url://"
                                }
                                , "on": eventFn
                            }
                        ]
                    }
                ]
            };
            template_element = mock_callback(
                function mockTemplateElement(element) {
                    return element;
                }
            );
            createTextNode = await controller(
                [
                    ".dom.createTextNode"
                ]
            );
            template_domNodeHandlers = {
                "text": mock_callback(
                    function mockTextNodeHandler(textProxy) {
                        return createTextNode(
                            textProxy.attributes.text
                        );
                    }
                )
            };
            domFragmentManager = await controller(
                [
                    ":PunyJS.ui.gui.template._DOMFragmentManager"
                    , [
                        ,
                        ,
                        , template_element
                        , template_domNodeHandlers
                    ]
                ]
            );
        }
    );

    act(
        function actFn() {
            fragmentId = domFragmentManager.create(
                domProxy
            );
            element = domFragmentManager.get(
                fragmentId
            );
            element.childNodes[1].childNodes[1]
            .setAttribute(
                "newattrib"
                , "new value"
            );
            element.appendChild(
                element.childNodes[1].childNodes[0]
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The proxy should have a new attribute")
            .value(domProxy, "children.1.children.0.attributes.newattrib")
            .equals("new value")
            ;

            test("The element outerHTML should be")
            .value(element, "outerHTML")
            .equals('<repeat expr="$f in list"><div>test value</div><toolbar id="toolbarId" name="toolbar"><toolbar-icon alt-text="alternate" url="url://" newattrib="new value"></toolbar-icon></toolbar>-&gt;</repeat>')
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._DOMFragmentManager: kitchen sink 2
*/
function domFragmentManagerTest3(
    controller
    , mock_callback
) {
    var domFragmentManager, domProxy, fragmentId, eventFn, changeHandler, fragment, eventOffFn, element, element2, template_domNodeHandlers, createTextNode;

    arrange(
        async function arrangeFn() {
            eventFn = mock_callback(
                function mockOnEvent(event, handler) {
                    if (!changeHandler) {
                        changeHandler = handler
                    }
                }
            );
            eventOffFn = mock_callback();
            domProxy = {
                "nodeName": "repeat"
                , "attributes": {
                    "expr": "$f in list"
                }
                , "on": eventFn
                , "off": eventOffFn
                , "children": [
                    {
                        "nodeName": "div"
                        , "on": eventFn
                        , "children": [
                            {
                                "nodeName": "text"
                                , "attributes": {
                                    "text": "test value"
                                }
                            }
                        ]
                    }
                    , {
                        "nodeName": "toolbar"
                        , "attributes": {
                            "id": "toolbarId"
                            , "name": "toolbar"
                        }
                        , "on": eventFn
                        , "children": [
                            {
                                "nodeName": "text"
                                , "attributes": {
                                    "text": "->"
                                }
                            }
                            , {
                                "nodeName": "toolbar-icon"
                                , "attributes": {
                                    "alt-text": "alternate"
                                    , "url": "url://"
                                }
                                , "on": eventFn
                            }
                        ]
                    }
                ]
            };

            createTextNode = await controller(
                [
                    ".dom.createTextNode"
                ]
            );
            template_domNodeHandlers = {
                "text": mock_callback(
                    function mockTextNodeHandler(textProxy) {
                        return createTextNode(
                            textProxy.attributes.text
                        );
                    }
                )
            };
            domFragmentManager = await controller(
                [
                    ":PunyJS.ui.gui.template._DOMFragmentManager"
                    , [
                        ,
                        ,
                        ,
                        , template_domNodeHandlers
                    ]
                ]
            );
        }
    );

    act(
        function actFn() {
            fragmentId = domFragmentManager.create(
                domProxy
            );

            changeHandler(
                {
                    "action": "append"
                    , "key": "children.0.attributes.newattrib"
                    , "value": "new attrib value"
                    , "miss": true
                }
            );
            changeHandler(
                {
                    "action": "delete"
                    , "key": "children[1].children.1.attributes.alt-text"
                    , "miss": false
                }
            );

            changeHandler(
                {
                    "action": "append"
                    , "key": "children.0.children.2"
                    , "value": {
                        "nodeName": "div-append"
                        , "attributes": {
                            "attrib1": "value1"
                        }
                    }
                    , "miss": true
                }
            );
            changeHandler(
                {
                    "action": "insert"
                    , "key": "children.0.children.0"
                    , "value": {
                        "nodeName": "div-insert"
                        , "attributes": {
                            "attrib1": "value1"
                        }
                    }
                    , "miss": true
                }
            );

            changeHandler(
                {
                    "action": "replace"
                    , "key": "children.1.children.0"
                    , "value": {
                        "nodeName": "div-replace"
                        , "attributes": {
                            "attrib1": "value1"
                        }
                    }
                    , "miss": true
                }
            );

            element = domFragmentManager.get(
                fragmentId
            );

            domFragmentManager.destroy(
                fragmentId
            );

            element2 = domFragmentManager.get(
                fragmentId
            );
        }
    );

    assert(
        function assertFn(test) {
            test("The element should be")
            .value(element, "outerHTML")
            .equals('<repeat expr="$f in list"><div><div-insert attrib1="value1"></div-insert>test value<div-append attrib1="value1"></div-append></div><toolbar id="toolbarId" name="toolbar"><div-replace attrib1="value1"></div-replace><toolbar-icon alt-text="alternate" url="url://"></toolbar-icon></toolbar></repeat>')
            ;

            test("The second element should be undefined")
            .value(element2)
            .isUndef()
            ;
        }
    );
}
/**
* @test
*   @title PunyJS.ui.gui.template._DOMFragmentManager: functional test,adding and  changing children
*/
function domFragmentManagerTest4(
    controller
    , mock_callback
) {
    var domFragmentManager, fragmentId, watcher, domProxy, templateProxy;

    arrange(
        async function arrangeFn() {
            watcher = await controller(
                [
                    ":PunyJS.core.proxy._BiDirectionalWatcher"
                    , []
                ]
            );
            [domProxy, templateProxy] = watcher(
                {
                    "nodeName": "tag1"
                    , "attributes": {
                        "expr": "$f in list"
                    }
                    , "children": [
                        {
                            "nodeName": "div"
                            , "children": [
                                {
                                    "nodeName": "text"
                                    , "text": "test value"
                                }
                            ]
                        }
                        , {
                            "nodeName": "toolbar"
                            , "attributes": {
                                "id": "toolbarId"
                                , "name": "toolbar"
                            }
                            , "children": [
                                {
                                    "nodeName": "text"
                                    , "text": "->"
                                }
                                , {
                                    "nodeName": "toolbar-icon"
                                    , "attributes": {
                                        "alt-text": "alternate"
                                        , "url": "url://"
                                    }
                                }
                            ]
                        }
                    ]
                }
            );
            domFragmentManager = await controller(
                [
                    ":PunyJS.ui.gui.template._DOMFragmentManager"
                    , []
                ]
            );
        }
    );

    act(
        function actFn() {
            fragmentId = domFragmentManager.create(
                domProxy
            );
            //append child
            templateProxy.children.push(
                {
                    "nodeName": "appendTag"
                }
            );
            //insert child
            templateProxy.children[1]
            .children.splice(
                1
                , 0
                , {
                    "nodeName": "insertTag"
                }
            );
            //replace child

            //delete child


            domFragmentManager.destroy(
                fragmentId
            );
        }
    );

    assert(
        function assertFn(test) {

        }
    );
}
