
## About

[chroco](https://github.com/jhotadhari/chroco#readme) - Simple electron offline time tracker.

## Install

To Install **chroco** on Linux, MacOS or Windows download the installer for our system from the [latest release](https://github.com/jhotadhari/chroco/releases/latest) and install it.

The releases are not signed, your system might complain about that.

No automatic updates yet.

## Development

**chroco** uses a git branching model inspired [by Vincent Driessen's blog post on nvie.com](https://nvie.com/posts/a-successful-git-branching-model/).

- The `main` branch only has tagged releases and files should never be edited manually. Only the `publish` script should commit to the `main` branch.
- The `develop` branch is the main development branch.
- New releases can only be published from branches starting with `release`.

Clone or fork **chroco** and `cd` into its directory.

```bash
# Change into `develop` branch and pull latest commits.
git checkout develop && git pull

# Install dependencies.
npm install

# Start electron.
npm run start
```

The project uses [eslint](https://eslint.org/) to enforce coding standard rules. To apply the rules to all `js|jsx` files run `npm run format`.

### Publishing

- New releases can only be published from branches starting with `release`.
- Environment variable `GITHUB_TOKEN` should be set. The Token should have permissions to upload releases.
- [GitHub CLI](https://cli.github.com) has to be installed.
- All new changes should be documented in the `Unreleased` section of `CHANGELOG.md`. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


```bash
# Checkout new release branch from `develop`. Name has to start with `release`.
git checkout -b release-awesome-new-version develop

# Maybe make some last changes and commit them.

# Run the publish script, with the new version as argument. New version should be higher than latest version.
npm run publish <major>.<minor>.<patch>
```

To make an installer for your system, to test new changes before publishing, run `npm run make`. This can be done from any branch at any time.

## Contribution

Contributions welcome. You can report [issues or suggest features](https://github.com/jhotadhari/chroco/issues). Help me coding, fork the repository and make pull requests. Or [get me a coffee](https://waterproof-webdesign.info/donate).

## Credits

- Build with [Electron Forge](https://www.electronforge.io), [React](reactjs.org/), [Babel](https://babeljs.io/) and [webpack](https://webpack.js.org/).
- The CSS/[SASS](sass-lang.com/) framework is [Bootstrap](https://getbootstrap.com).
- The embedded persistent JSON based database is [NeDB](https://github.com/louischatriot/nedb).
- Dates are processed by [Day.js](https://day.js.org/).
- Drag and drop features are implemented with [dnd kit](dndkit.com).
- Got around some headaches by using utilities by [Lodash](https://lodash.com), [array-move](https://github.com/sindresorhus/array-move) or [classnames](https://github.com/JedWatson/classnames).
- [Keep a Changelog](https://www.npmjs.com/package/keep-a-changelog) helps maintaining a `CHANGELOG.md`.
- [markdown-it](https://github.com/markdown-it/markdown-it#readme) parses markdown.
- Some UI components are based on [react-multi-select-component](https://github.com/hc-oss/react-multi-select-component), [rc-slider](https://github.com/react-component/slider), [react-autosuggest](https://github.com/moroshko/react-autosuggest) or [react-tooltip](https://react-tooltip.com/).

## License

Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

This license lets you remix, adapt, and build upon this project non-commercially, as long as you credit [me](https://waterproof-webdesign.info) and license your new creations under the identical terms.

[View License Deed](https://creativecommons.org/licenses/by-nc-sa/4.0) | [View Legal Code](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)



