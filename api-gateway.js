class MockApiGateway {
    constructor() {
        this.cache = {};
    }

    /**
     * Gets the probality of a user being a bot.
     * @param {number} id 
     */
    getScore (id) {
        if (!this.cache.hasOwnProperty(id)) {
            var score = Math.random() * 100;
            this.cache[id] = score;
        }
        return this.cache[id];
    }
}

gateway = new MockApiGateway();
function getApiGateway() {
    return gateway;
}