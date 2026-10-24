# Suprakron Portfolio

Static, four-page developer portfolio. Keeps the original navy and blue palette with a shared visual system in `css/studio.css` and lightweight CSS 3D animations and pointer interactions in `js/studio.js`.

## Local preview

Run `python3 -m http.server 8000` from this directory, then open http://localhost:8000.

## Pages

- `index.html`: introduction, experience, skills, selected work, education, and contact.
- `projectmy.html`: project showcase and image previews.
- `certificate.html`: certificates and image previews.
- `personal.html`: personal gallery and image previews.

Use the motion button to pause animations. The site also respects the operating system's reduced-motion setting. Interactive image cards support Enter and Space. The homepage retains its language and light/dark controls.

No build step is required. Google Fonts, Bootstrap, and Font Awesome load from their existing public CDNs and require internet access.

Existing deployments:
- https://suprakron.netlify.app/
- https://suprakron.github.io/Webpage-portfolio/
