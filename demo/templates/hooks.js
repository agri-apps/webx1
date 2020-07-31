let hooks = ({ab = {}}) =>
  `<div class="page hooks-page"><h1>Hook Example: A / B Testing</h1>
    <div class="split-pane">
    <div class="pane-a${ab.a > ab.b ? " popular" : ""}">
        <h2>Page A</h2>
        <p>${ab.a ? ab.a : '0'} visitor(s)</p>
        <a href="/pagea/" onclick="$.navigate('/pagea/'); return false;">Visit</a>
        </div>
    <div class="pane-b${ab.b > ab.a ? " popular" : ""}">
        <h2>Page B</h2>
        <p>${ab.b ? ab.b : '0'} visitor(s)</p>
        <a href="/pageb/" onclick="$.navigate('/pageb/'); return false;">Visit</a>
    </div>
    </div>
    <p><strong>preRender</strong> hook counts the page visits.</p>
    
    <p><strong>preState</strong> hook saves visits to localStorage.</p>

    <code><pre><code>
    ...
    
    window.webxHooks(app, {        
        preRender: ({ view, state }) => {
            const { ab, path } = state;

            if (path.indexOf('pagea') !== -1) {
                app.setState('ab', { a: ab.a + 1, b: ab.b });
            } else if (path.indexOf('pageb') !== -1) {
                app.setState('ab', { a: ab.a, b: ab.b + 1});
            }

            return { view, state: {...state, ab: app.getState()['ab']} }
        },
        preState: ({key, value}) => {
            if (key === 'ab') {
                localStorage.setItem('ab-testing', JSON.stringify(value));
            }
            return { key, value }
        },
        install: () => {
            if (localStorage.getItem('ab-testing')) {
                app.setState('ab', JSON.parse(localStorage.getItem('ab-testing')))
                app.refresh();
            } else {
                app.setState('ab', { a: 0, b: 0 });
            }
        }
    });
    </code></pre></code>

    </div>`;
