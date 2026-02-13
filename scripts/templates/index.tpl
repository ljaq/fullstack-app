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
    <div id="root">
      <style>
        .ant-spin {
          color: #1677ff;
          box-sizing: border-box;
          font-size: 32px;
          display: inline-block;
          position: relative;
        }
        .ant-spin-dot {
          position: relative;
          display: inline-block;
          font-size: 32px;
          width: 1em;
          height: 1em;
        }
        .ant-spin-dot-spin {
          animation: antRotate 1.2s linear infinite;
        }
        .ant-spin-dot-item {
          position: absolute;
          display: block;
          width: 0.35em;
          height: 0.35em;
          background-color: #1677ff;
          border-radius: 100%;
          transform: scale(0.75);
          transform-origin: 50% 50%;
          opacity: 0.3;
          animation: antSpinMove 1s infinite alternate;
        }
        .ant-spin-dot-item:nth-child(1) {
          top: 0;
          left: 50%;
          margin-left: -0.175em;
          animation-delay: -0.45s;
          opacity: 1;
        }
        .ant-spin-dot-item:nth-child(2) {
          top: 50%;
          right: 0;
          margin-top: -0.175em;
          animation-delay: -0.3s;
        }
        .ant-spin-dot-item:nth-child(3) {
          bottom: 0;
          left: 50%;
          margin-left: -0.175em;
          animation-delay: -0.15s;
        }
        .ant-spin-dot-item:nth-child(4) {
          top: 50%;
          left: 0;
          margin-top: -0.175em;
          animation-delay: 0s;
        }
        @keyframes antRotate {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes antSpinMove {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
      </style>
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh">
        <span class="ant-spin ant-spin-spinning">
          <span class="ant-spin-dot ant-spin-dot-spin">
            <i class="ant-spin-dot-item"></i>
            <i class="ant-spin-dot-item"></i>
            <i class="ant-spin-dot-item"></i>
            <i class="ant-spin-dot-item"></i>
          </span>
        </span>
      </div>
    </div>
    <script type="module" src="/client/pages/{{pageName}}/main.tsx"></script>
  </body>
</html>
