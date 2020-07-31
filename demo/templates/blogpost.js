let blogpost = ({ currentPost, sid }) => `<div class="page blog-page">
    ${!currentPost ? `<p>Loading blog post ...</p>` : ""}
    ${
      currentPost
        ? `<div>
            <img src="https://source.unsplash.com/random?q=${sid}">
            <h1>${currentPost.title}</h1><p>${currentPost.body}</p>
            <a href="/blog" onclick="$.navigate('/blog');return false">Back to blog</a>
        </div>`
        : ""
    }
</div>`;
