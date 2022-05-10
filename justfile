issue-number := `gh issue list -L 1 -l build --json "number,title" -q ".[0].number"`

build-release:
  npm run build
  node dist/index.js
  gh release upload latest moddable-build-tools-mac-arm64.tgz --clobber
  gh issue close {{issue-number}} --comment "Completed"
  npm run clean
