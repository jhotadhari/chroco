
# GITHUB_TOKEN env should be existing.
if [[ -z "${GITHUB_TOKEN}" ]]; then
    echo '`GITHUB_TOKEN` environment variable is unset'
    exit 1
fi

# git status should be clean.
if [[ ! -z $( git status --short ) ]]; then
    echo "Unable to publish. Uncommited changes."
    git status --short
    exit 1
fi

# version should be specified as first arg.
if [[ -z $1 ]]; then
    echo 'No version specified. Run `npm run publish <version>`'
    exit 1
fi

# version should be semver.
next_version=$1
pat="[0-9]+\.[0-9]+\.[0-9]+"
if ! [[ "$next_version" =~ $pat ]]; then
    echo 'Version should be SemVer. Run `npm run publish <major>.<minor>.<path>`'
    exit 1
fi

# new version should be higher then current version.
newest_version=$( git tag -l --sort=-version:refname 'v*' | head -n 1 |  sed -r 's/v//g' )
verlte() {
    [  "$1" = "`echo -e "$1\n$2" | sort -V | head -n1`" ]
}
verlt() {
    [ "$1" = "$2" ] && return 1 || verlte $1 $2

}
if ! [ -z $( verlt $newest_version $next_version || echo "1") ]; then
    echo "New version should be higher then current version ${newest_version}"
    exit 1
fi

# current branch should start with release-*.
release_branch=$( git rev-parse --abbrev-ref HEAD )
if ! [[ $release_branch == release-* ]]; then
    echo 'Current branch name should start with `release-`'
    exit 1
fi

# bump package version and commit changes.
npm version $next_version --no-git-tag-version
git add .
git commit -m "Bump version ${next_version}"

# checkout main, merge release, tag and push.
git checkout main
git merge $release_branch --no-ff --commit --no-edit
git tag "v${next_version}"
git push
git push origin "v${next_version}"

# publish, this should trigger gh actions to build for other os
electron-forge publish --auth-token="${GITHUB_TOKEN}"

# checkout develop, merge main and push.
git checkout develop
git merge $release_branch --no-ff --commit --no-edit
git push
