## How to release

* Increment the version number in package.json (see https://semver.org/ for choosing the version number)
* Add changes in history.md
* Make a "Release <version>" commit
* git tag <version>
* git push && git push --tags
* npm publish
