let blogpost = ({ nextPost, currentPost, sid }) => `<div class="page blog-page">
    ${!currentPost ? `<p class="spinner" data-speed="250" data-replace data-append=" loading" data-typer="⣾⣽⣻⢿⡿⣟⣯⣷"></p>` : ""}
    ${
      currentPost
        ? `<div>
            <img src="https://source.unsplash.com/random?q=${sid}">
            <h1>${currentPost.title}</h1>
            <p>${currentPost.body}</p>
            <div class="author"><button class="button">Author info</button></div>
            ${nextPost ? `<a href="/blog/${nextPost.id}" onclick="$.navigate('/blog/${nextPost.id}');return false">Up next: ${nextPost.title}</a>` : ''}
            <br>
            <a href="/blog" onclick="$.navigate('/blog');return false" data-typer="Back to blog"></a>
            
        </div>`
        : ""
    }
</div>`;
