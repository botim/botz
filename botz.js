<<<<<<< HEAD
document.body.style.border = "5px solid blue";
$(document).ready(function () {
    console.log(getApiGateway().getScore());
});
=======
//const Tweet = require('./tweet.js');
document.body.style.border = "5px solid red";
// tweets = HTMLcollection of all tweets in a page.
var tweets = document.getElementsByClassName('tweet');
var tweets_arr = Array.prototype.slice.call(tweets);
var i, tweet, id;
var user_ids = [];
console.log("Num Tweets: " + tweets.length);
for (i = 0; i < tweets.length; i++) {
    try {
        tweet = new Tweet(tweets_arr[i]);
        console.log(tweet.userID);
    } catch (e) {
        console.log(e);
    }
}
>>>>>>> master

