document.addEventListener('DOMContentLoaded', function() {
    const tweetForm = document.querySelector('.tweetBox form');
    const feedContainer = document.getElementById('feed-container');
    const messageContainer = document.getElementById('messageContainer');
    const tweetInput = document.getElementById('tweetInput');

    tweetForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const tweetText = tweetInput.value.trim();

        if (!tweetText) {
            return;
        }

        fetch('/submitTweet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tweetText })
            })
            .then(response => response.json())
            .then(data => {
                const newPost = document.createElement('div');
                newPost.className = 'post';
                newPost.innerHTML = `
                    <div class="post_avatar">
                        <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" />
                    </div>
                    <div class="post_body">
                        <div class="post_header">
                            <div class="post_headerText">
                                <h3>
                                    User
                                    <span class="post_headerSpecial">@user</span>
                                </h3>
                            </div>
                            <div class="post_headerDescription">
                                <p>${tweetText}</p>
                            </div>
                        </div>
                        <div class="post_footer">
                            <span class="material-symbols-outlined">chat_bubble_outline</span>
                            <span class="material-symbols-outlined">repeat</span>
                            <span class="material-symbols-outlined">favorite_border</span>
                            <span class="material-symbols-outlined">share</span>
                        </div>
                    </div>
                `;
                feedContainer.appendChild(newPost);

                tweetInput.value = '';

                if (data.prediction === 1) {
                    showHelpNotification();
                }
            })
            .catch(error => console.error("Error sending tweet:", error));
    });

    let isSupportMessageShown = false;

    function showHelpNotification() {
        const notification = document.createElement('div');
        notification.className = 'help-notification';
        notification.innerHTML = `
            <h1 style="margin: 0; font-size: 1.5em; color: #333;">Help is available</h1>
            <p style="margin: 5px 0; font-size: 1em; color: #555;">Speak with someone today</p>
            <p style="margin: 5px 0; font-size: 1em; color: #555;"><strong>National Center for Mental Health Crisis Hotline</strong></p>
            <p style="margin: 5px 0; font-size: 1em; color: #555;">Languages: English, Filipino</p>
            <p style="margin: 5px 0; font-size: 1.2em; color: #e74c3c; font-weight: bold;">Call: 0966-351-4518</p>
        `;

        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.backgroundColor = '#ffffff';
        notification.style.padding = '20px';
        notification.style.borderRadius = '10px';
        notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '1000';
        notification.style.width = '300px';

        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);

        if (!isSupportMessageShown) {
            addSupportMessage();
        }
        addNewMessageIndicator()
    }

    function addSupportMessage() {
        const messageContainer = document.getElementById('messageContainer');

        const supportMessage = document.createElement('div');
        supportMessage.className = 'message';

        supportMessage.innerHTML = `
            <div class="message-header">Mental Health Support</div>
            <div class="message-body">We are here to help. Please reach out for support.</div>
        `;

        messageContainer.prepend(supportMessage);

        isSupportMessageShown = true;
    }


    document.getElementById('messagesOption').addEventListener('click', function() {
        const indicator = document.querySelector('.new-message-indicator');
        if (indicator) {
            indicator.remove();
        }
        messageContainer.style.display = 'block';
        homeContent.style.display = 'none';
    });

    const chatSection = document.getElementById('chatSection');
    const chatHeader = document.getElementById('chatHeader');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessage = document.getElementById('sendMessage');
    const backToMessages = document.getElementById('backToMessages');
    const chatUserName = document.getElementById('chatUserName');

    let activeUser = null;

    function openChat(userName) {
        activeUser = userName;
        chatUserName.textContent = userName;
        messageContainer.style.display = 'none';
        chatSection.style.display = 'block';
        chatMessages.innerHTML = '';

        const initialMessages = [
            { sender: userName, message: "Hey, how's it going?" },
            { sender: 'You', message: "All good, you?" }
        ];

        initialMessages.forEach(msg => appendMessage(msg.sender, msg.message));
    }

    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';

        if (sender === 'You') {
            messageDiv.classList.add('you');
        } else {
            messageDiv.classList.add('other');
        }

        messageDiv.textContent = message;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    document.querySelectorAll('.message').forEach(message => {
        message.addEventListener('click', function() {
            const userName = this.getAttribute('data-user');
            openChat(userName);
        });
    });

    sendMessage.addEventListener('click', function() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            appendMessage('You', messageText);
            chatInput.value = '';

            setTimeout(() => {
                appendMessage(activeUser, `Hi`);
            }, 1000);
        }
    });

    backToMessages.addEventListener('click', function() {
        chatSection.style.display = 'none';
        messageContainer.style.display = 'block';
    });
});

function addNewMessageIndicator() {
    const messagesOption = document.getElementById('messagesOption');

    if (!messagesOption.querySelector('.new-message-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'new-message-indicator';
        messagesOption.appendChild(indicator);
    }
}

document.querySelectorAll('.message').forEach(message => {
    message.addEventListener('click', function() {
        const userName = this.getAttribute('data-user');
        openChat(userName);

        const messagesOption = document.getElementById('messagesOption');
        const indicator = messagesOption.querySelector('.new-message-indicator');
        if (indicator) {
            indicator.remove();
        }
    });
});

const homeTab = document.getElementById('homeTab');
const messagesOption = document.getElementById('messagesOption');
const homeContent = document.getElementById('homeContent');
const messageContainer = document.getElementById('messageContainer');
const tweetButton = document.querySelector('.sidebar_tweet');

messagesOption.addEventListener('click', function() {
    homeContent.style.display = 'none';
    messageContainer.style.display = 'block';
});

homeTab.addEventListener('click', function() {
    homeContent.style.display = 'block';
    messageContainer.style.display = 'none';
});

tweetButton.addEventListener('click', function() {
    const newMessage = document.createElement('div');
    newMessage.className = 'message';
    newMessage.innerHTML = `
        <div class="message-header">Twitter</div>
        <div class="message-body">Post Added</div>
    `;
    messageContainer.appendChild(newMessage);
    messageContainer.style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function() {
    const messageContainer = document.getElementById('messageContainer');
    const messagesOption = document.getElementById('messagesOption');

    function flagMessage(messageElement) {
        const supportMessage = document.createElement('div');
        supportMessage.className = 'message';

        supportMessage.innerHTML = `
            <div class="message-header">Mental Health Support</div>
            <div class="message-body">We are here to help. Please reach out for support.</div>
        `;

        messageContainer.insertBefore(supportMessage, messageElement);
    }

    document.querySelectorAll('.message').forEach(message => {
        message.addEventListener('click', function() {
            // Check if the new-message-indicator exists
            if (messagesOption.querySelector('.new-message-indicator')) {
                flagMessage(this);

                // Remove the indicator after flagging the message
                const indicator = messagesOption.querySelector('.new-message-indicator');
                if (indicator) {
                    indicator.remove();
                }
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    function showSupportChat() {
        const chatSection = document.getElementById('chatSection');
        const chatMessages = document.getElementById('chatMessages');
        const chatHeader = document.getElementById('chatHeader');
        const chatUserName = document.getElementById('chatUserName');
        const chatInput = document.getElementById('chatInput');
        const sendMessage = document.getElementById('sendMessage');

        chatHeader.querySelector('h3').textContent = 'Chat with Mental Health Support';

        chatMessages.innerHTML = '';

        const supportMessages = [
            { sender: 'Mental Health Support', message: "If you're feeling overwhelmed, remember that you're not alone." },
            { sender: 'Mental Health Support', message: "Reach out to professionals who can offer support during tough times." },
            { sender: 'Mental Health Support', message: "Call the National Center for Mental Health Crisis: 0966-351-4518." },
            { sender: 'Mental Health Support', message: "Call Hopeline PH: 0917 558 4673." },
            { sender: 'Mental Health Support', message: "Help is available, and taking that first step towards reaching out can make all the difference." }
        ];

        supportMessages.forEach(msg => appendMessage(msg.sender, msg.message));

        document.getElementById('messageContainer').style.display = 'none';
        chatSection.style.display = 'block';

        sendMessage.addEventListener('click', function() {
            const messageText = chatInput.value.trim();
            if (messageText) {
                appendMessage('You', messageText);
                chatInput.value = '';
            }
        });
    }

    function appendMessage(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';

        if (sender === 'You') {
            messageDiv.classList.add('you');
        } else {
            messageDiv.classList.add('other');
        }

        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    document.getElementById('messageContainer').addEventListener('click', function(e) {
        if (e.target.closest('.message') && e.target.closest('.message').querySelector('.message-header').textContent === 'Mental Health Support') {
            showSupportChat();
        }
    });

    document.getElementById('backToMessages').addEventListener('click', function() {
        document.getElementById('chatSection').style.display = 'none';
        document.getElementById('messageContainer').style.display = 'block';
    });
});