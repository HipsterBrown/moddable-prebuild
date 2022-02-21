# Moddable Pre-build

Workflows for pre-buiding Moddable tooling across platforms. Expected to be used in tandem with [`xs-dev`](https://github.com/hipsterbrown/xs-dev) to speed up the setup time for new environments by avoiding build time on users' machines.

## Supported platforms

Based on environment images available for GitHub Actions:

- [X] Linux (Ubuntu x86_64)
- [X] MacOS (Intel x86_64)
- [-] MacOS (Apple Silicon arm64) (currently building locally)
- [ ] Windows

## Releases

Releases are currently tagged using the short SHA for the [Moddable commit](https://github.com/Moddable-OpenSource/moddable) the build is is based on.

Each tarball contains the entire Moddable repo at the release commit with the `build/bin` directory containing the pre-built binaries; making it easy to drop in place of normally cloning the repo to a user's computer.

## License

Using GPL-3.0 to match [the Moddable license for build tools](https://github.com/Moddable-OpenSource/moddable/tree/public/licenses#gpl-30-and-lgpl-30).
