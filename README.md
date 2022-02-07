## React Native Wheel Spinner

Little project to learn some react native - wheel spinner using WebView to leverage existing wheel spin site to spin, then saving and allowing editing of those

Targets Android and iOS

---

### Notes

* `package.json` - `jest` config:

    `transformIgnorePatterns`

    This was a trip - https://stackoverflow.com/a/59964555

---

### Setup

* Need to run `npm install`, `pod install` in `ios/`... and probably some others too that I didn't keep track of :(


* distributionUrl in android/gradle/wrapper/gradle-wrapper.properties needs updated to fix the AWFUL "General error during semantic analysis: Unsupported class file major version 61" error


* gradle.properties also needs a line added:
`org.gradle.jvmargs=-Xmx1536M --add-exports=java.base/sun.nio.ch=ALL-UNNAMED --add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.lang.reflect=ALL-UNNAMED --add-opens=java.base/java.io=ALL-UNNAMED --add-exports=jdk.unsupported/sun.misc=ALL-UNNAMED`


* although think it's only needed when something new needs built - worked fine without this until added react webview stuff in

### Testing

`npm test` - just jest unit tests for now because E2E tests are a headache to set up
