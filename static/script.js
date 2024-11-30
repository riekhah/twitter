document.addEventListener('DOMContentLoaded', function() {
    const tweetForm = document.querySelector('.tweetBox form');
    const feedContainer = document.getElementById('feed-container');

    tweetForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission

        const tweetInput = document.getElementById('tweetInput');
        const tweetText = tweetInput.value;

        console.log("Tweet input value:", tweetText); // Debug log

        if (!tweetText) {
            console.log("Tweet input is empty."); // Handle empty input
            return;
        }

        // Send tweet text to the server
        fetch('/submitTweet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tweetText })
            })
            .then(response => {
                console.log("Response status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log("Server response:", data);

                // Add the new tweet to the feed
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

                // Append the new tweet at the end of the feed container
                feedContainer.appendChild(newPost);

                // Clear input field
                tweetInput.value = '';
            })
            .catch(error => console.error("Error sending tweet:", error));
    });
});