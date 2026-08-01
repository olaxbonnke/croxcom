import fs from "node:fs";
import path from "node:path";

const publicDir = path.resolve(process.cwd(), ".output/public");
const assetsDir = path.join(publicDir, "assets");

if (!fs.existsSync(publicDir)) {
  console.error(".output/public directory does not exist!");
  process.exit(1);
}

const files = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
const mainJs = files.find((f) => f.startsWith("index-") && f.endsWith(".js")) || files.find((f) => f.endsWith(".js"));
const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css")) || files.find((f) => f.endsWith(".css"));

console.log("Detected Main JS asset:", mainJs);
console.log("Detected CSS asset:", cssFile);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CroxCom — Community for AI Developers</title>
    <link rel="icon" type="image/svg+xml" href="logo.svg" />
    ${cssFile ? `<link rel="stylesheet" href="assets/${cssFile}" />` : ""}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" />
    <script type="text/javascript">
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
              l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>
  </head>
  <body class="bg-background text-foreground">
    <div id="root"></div>
    ${mainJs ? `<script type="module" src="assets/${mainJs}"></script>` : ""}
  </body>
</html>`;

fs.writeFileSync(path.join(publicDir, "index.html"), htmlContent);
fs.writeFileSync(path.join(publicDir, "404.html"), htmlContent);
fs.writeFileSync(path.join(publicDir, ".nojekyll"), "");

console.log("Successfully generated index.html, 404.html, and .nojekyll in .output/public!");
