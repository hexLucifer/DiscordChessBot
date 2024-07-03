// InteractionManager.js

let messageId = null;

module.exports = {
    set messageId(value) {
        messageId = value;
    },

    get messageId() {
        return messageId;
    }
};
