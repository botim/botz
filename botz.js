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
                    var nodes = $("div.tweet");
                    for (i = 0; i < nodes.length; i++) {
                        if (nodes[i] != null) {
                            tweet = new Tweet(nodes[i]);
                            if (getApiGateway().getScore(tweet.userID) > 60) {
                                tweet.setBorder("solid 1px red");
                            }
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


