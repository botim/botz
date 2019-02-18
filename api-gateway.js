class MockApiGateway {
    constructor() {
        this.cache = {};
    }

    async checkIfBot(twitterUserId) {
      if (twitterUserId in this.cache) {
        return this.cache[twitterUserId];
      }
      var url = 'https://reqres.in/api/user/1';
      var score = await fetch(url);
      var isBot = this.isScoreAboveThreshold(score);
      this.cache[twitterUserId] = isBot;
      return isBot;
    }

    markIfBot(tweet) {
        var id = tweet.userID;
        var isBot = this.checkIfBot(id);
        tweet.markAsBot();
    }

    // todo: use the actual response
    isScoreAboveThreshold(response) {
      return true;
    }

}

gateway = new MockApiGateway();
function getApiGateway() {
    return gateway;
}
