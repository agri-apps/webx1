let blog = ({ posts, translations = { posts: "posts"} }) => `<div class="page blog-page">
    <h1 data-i18n="Blog">Blog</h1>
    <p class="blog-info">${posts.length} ${translations.posts}.</p>
    ${
      posts &&
      `<div class="blog-posts">
        ${posts
          .map(
            (post) => `<div class="card">
        <h2>${post.title}</h2><p>${post.body}</p><a data-route="post" href="/blog/${post.id}" data-i18n="read-more">Read more</a></div>`
          )
          .join("")}</div>`
    }
</div>`;