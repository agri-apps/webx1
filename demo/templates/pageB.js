let pageB = ({ ab }) => `<div class="page ab-page">
<h1>Page B</h1>
<p>${ab.b} visitor(s)!</p>
<a href="/hooks" onclick="$.navigate('/hooks/'); return false;">Finish</a>
<div class="waves">${Array.from(Array(ab.b).keys())
  .map((n) => `<span class="wave"><i>${n + 1}</i>☻</span>`)
  .join("&nbsp;")}</div>
</div>`;
