<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <link rel="stylesheet" href="/reset.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <%- `{{if NODE_ENV === 'development'}}` %>
    <script type="module">
      import RefreshRuntime from '/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => type => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
    <%- `{{/if}}` %>
    <title>{{pageTitle}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/client/pages/{{pageName}}/main.tsx"></script>
  </body>
</html>
