document.addEventListener('DOMContentLoaded', function() {
    try {
        const tweetForm = document.querySelector('.tweetBox form');
        const feedContainer = document.getElementById('feed-container');

        tweetForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const tweetInput = document.getElementById('tweetInput');
            if (!tweetInput || !tweetInput.value.trim()) return;

            const tweetText = tweetInput.value
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');

            const newPost = document.createElement('div');
            newPost.className = 'post';
            newPost.innerHTML = `
                <div class="post_avatar">
                    <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" alt="User avatar"/>
                </div>
                <div class="post_body">
                    <div class="post_header">
                        <div class="post_headerText">
                            <h3>
                                User
                                <span class="post_headerSpecial">
                                    <span class="material-symbols-outlined" id="verified">verified</span>
                                    @user
                                </span>
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
                </div>`;

            const firstPost = feedContainer.querySelector('.post');
            if (firstPost) {
                feedContainer.insertBefore(newPost, firstPost);
            } else {
                feedContainer.appendChild(newPost);
            }

            tweetInput.value = '';
        });
    } catch (error) {
        console.error('Error initializing tweet functionality:', error);
    }
});