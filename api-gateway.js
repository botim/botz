class MockApiGateway {
    constructor() {
        window.localStorage.botz = window.localStorage.botz || JSON.stringify({});
    }


    getCache() {
      return JSON.parse(window.localStorage.botz);
    }

    storeInCache(twitterUserId, isBot) {
      var oldcache = this.getCache();
      oldcache[twitterUserId] = isBot;
      window.localStorage.setItem('botz', JSON.stringify(oldcache));
    }

    isInCache(twitterUserId) {
      return twitterUserId in this.getCache();
    }

    getFromCache(twitterUserId) {
      return this.getCache()[twitterUserId];
    }

    async checkIfBot(twitterUserId) {
      if (this.isInCache(twitterUserId)) {
        return this.getFromCache(twitterUserId);
      }
      var url = 'https://reqres.in/api/user/1';
      var score = await fetch(url);
      var isBot = await this.isScoreAboveThreshold(score);
      this.storeInCache(twitterUserId, isBot);
      return isBot;
    }

    markIfBot(tweet) {
        var id = tweet.userID;
        var isBot = this.checkIfBot(id);
        tweet.markAsBot();
    }


    async isScoreAboveThreshold(response) {
      var data = await response.json()
      // todo: use the actual response
      return true;
    }

}

gateway = new MockApiGateway();
function getApiGateway() {
    return gateway;
}
