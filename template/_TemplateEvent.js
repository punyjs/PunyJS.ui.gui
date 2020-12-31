/**
* The template event wraps DOM events and executes the external handler with a protected event API; so event handlers don't gain access to the DOM directly.
* @factory
*/
function _TemplateEvent(
    template_isExpression
    , is_func
    , errors
) {
    /**
    * @alias
    */
    var isTemplateExpression = template_isExpression;

    return TemplateEvent;

    /**
    * @worker
    */
    function TemplateEvent(eventName, attribute, context, event) {
        var callbackFn = attribute
        , protectedEvent
        ;
        //if the attribute is an expression then execute it
        if (isTemplateExpression(attribute)) {
            callbackFn = attribute.execute(
                context
            );
        }
        //the callback should be a function
        if (!is_func(callbackFn)) {
            throw new Error(
                `${errors.ui.gui.template.invalid_event_callback} (${typeof callbackFn})`
            );
        }
        //create the protected event
        protectedEvent = createProtectedEvent(
            event
        );
        //execute the callback function
        callbackFn(
            protectedEvent
        );
    }

    /**
    * @function
    */
    function createProtectedEvent(event) {
        ///TODO: create a protected event
        return event;
    }
}