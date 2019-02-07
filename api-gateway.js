class MockApiGateway {
    /**
     * Gets the probality of a user being a bot.
     * @param {number} id 
     */
    getScore (id) {
        return Math.random() * 100;
    }
}

function getApiGateway() {
    return MockApiGateway();
}