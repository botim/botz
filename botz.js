$(document).ready(function () {
    // Select the node that will be observed for mutations
    var targetNode = document.documentElement;

    // Options for the observer (which mutations to observe)
    var config = { attributes: false, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    var callback = function (mutationsList, observer) {
        for (var mutation of mutationsList) {
            if (mutation.type == 'childList') {
                if (mutation.addedNodes.length > 0) {
                    var nodes = $("div.tweet").filter( function (i) { return !!i; });
                    for (node of nodes) {
                          try {
                            tweet = new Tweet(node);
                            getApiGateway().markIfBot(tweet);
                          }
                          catch (e) {
                            console.error(e);
                          }
                    }
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

});
