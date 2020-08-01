let blog = ({ posts }) => `<div class="page blog-page">
    <h1>Blog</h1>
    <p class="blog-info">${posts.length} posts.</p>
    ${
      posts &&
      `<div class="blog-posts">
        ${posts
          .map(
            (post) => `<div class="card">
        <h2>${post.title}</h2><p>${post.body}</p><a data-route="post" href="/blog/${post.id}">Read more</a></div>`
          )
          .join("")}</div>`
    }
</div>`;