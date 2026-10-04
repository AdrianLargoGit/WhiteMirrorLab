export const AD_MESSAGE_TYPE = 'wml-adsterra-status'
const AD_CONTAINER_ID = 'container-54237a243e6e5ead86fd96dfae1f4fe7'
const AD_SCRIPT_SRC = 'https://pl31053382.profitableratecpmnetwork.com/54237a243e6e5ead86fd96dfae1f4fe7/invoke.js'

export function adsterraFrameHtml(slotId: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      html, body { width: 100%; height: 100%; margin: 0; background: transparent; overflow: hidden; }
      body { position: relative; font-family: Arial, Helvetica, sans-serif; }
      #${AD_CONTAINER_ID} { position: absolute; inset: 0; width: 100%; min-height: 100%; display: grid; place-items: center; background: transparent; }
    </style>
  </head>
  <body>
    <script async="async" data-cfasync="false" src="${AD_SCRIPT_SRC}"></script>
    <div id="${AD_CONTAINER_ID}"></div>
    <script>
      (function () {
        var container = document.getElementById('${AD_CONTAINER_ID}');
        function hasAdContent() {
          return Boolean(container && (container.children.length > 0 || container.textContent.trim().length > 0));
        }
        function update() {
          window.parent.postMessage({
            type: '${AD_MESSAGE_TYPE}',
            slotId: '${slotId}',
            loaded: hasAdContent()
          }, '*');
        }
        if (container && 'MutationObserver' in window) {
          new MutationObserver(update).observe(container, { childList: true, subtree: true, characterData: true });
        }
        window.addEventListener('load', update);
        window.setTimeout(update, 1200);
        window.setTimeout(update, 2200);
        window.setTimeout(update, 5200);
      })();
    </script>
  </body>
</html>`
}
