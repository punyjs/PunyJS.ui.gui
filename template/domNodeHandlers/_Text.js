/**
* @factory
*/
function _Text(
    dom_createTextNode
    , errors
) {

    return Text;

    /**
    * @worker
    */
    function Text(domProxy) {
        if (
            !domProxy.hasOwnProperty("text")
        ) {
            throw new Error(
                `${errors.ui.gui.template.handlers.missing_text_property}`
            );
        }
        //create the element
        var element = dom_createTextNode(
            domProxy.text
        );
        //add change listeners for the text attribute
        domProxy.on(
            "text"
            , updateElement.bind(
                null
                , domProxy
                , element
            )
        );

        return element;
    }

    /**
    * @function
    */
    function updateElement(domProxy, element) {
        element.innerText = domProxy.text;
    }
}
