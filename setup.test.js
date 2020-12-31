/**
* @test
*   @type setup
*   @name controller
*/

async function setupGuiTests(
    $entry
    , $client
    , $import
    , $global
    , $reporter
) {
    try {
        var mocks = {
            "fs": {}
            , "path": {}
            , "process": {}
        }
        , controller = await $import(
            "controller"
            , mocks
        )
        , container = await $import(
            "app"
        )
        , dtree = await $import(
            "app1"
        )
        ;

        controller
            .setup
            .setContainer(container)
            .setAbstractTree(dtree)
            .setGlobal($global)
        ;

        controller
            .dependency
            .add(
                ".reporter"
                , $reporter
            )
        ;

        return $global.Promise.resolve(controller);
    }
    catch(ex) {
        return $global.Promise.reject(ex);
    }
}