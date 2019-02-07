class Tweet {
    constructor(div) {
        if (!div.classList.contains("tweet")){
            throw "Div is not a class 'tweet'";
        }
        this.div = div;
        this.userID = div.getAttribute('data-user-id')
    };
}