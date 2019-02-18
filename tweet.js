class Tweet {
    constructor(div) {
        if (!div.classList.contains("tweet")) {
            throw "Div " + div + " is not a class 'tweet'";
        }
        this.div = div;
        this.userID = div.getAttribute('data-user-id')
    };

    markAsBot() {
      this.setBorder("solid 4px red");
    }

    setBorder(border) {
        this.div.style.border = border;
    }
}
