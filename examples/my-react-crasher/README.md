# my-react-crasher

This is an example of how to use BugSplat's
[npm package](https://www.npmjs.com/package/@bugsplat/react)
in a React application.

## Prerequisites

In order to properly utilize the symbol upload features of this package, you
will need to create an OAuth2 ClientId/ClientSecret pair as shown
[here](https://docs.bugsplat.com/introduction/development/web-services/oauth2).

Once you've generated OAuth2 credentials, create a file with the name `.env`
at the root of the project and populate with the correct values substituted
for `{{clientId}}` and `{{clientSecret}}`. Also include the name of your
BugSplat database in place of `{{database}}`.

```text
SYMBOL_UPLOAD_CLIENT_ID={{clientId}}
SYMBOL_UPLOAD_CLIENT_SECRET={{clientSecret}}
BUGSPLAT_DATABASE={{database}}
```

## Install

1. Clone this repository and run `npm install`
2. Ensure `.env` created from the prerequisites section above
   is placed in the project root.
3. Run `npm run start:build` to build and start the app outside
   of React's debugger, this is important because otherwise React
   will intercept crashes. This script will also trigger uploading
   of source maps via
   [@bugsplat/symbol-upload](https://www.npmjs.com/package/@bugsplat/symbol-upload).
4. Navigate to [127.0.0.1:8080](http://127.0.0.1:8080)
   and click one of the buttons to trigger a crash
5. Click on the link that appears after the crash was posted
   to BugSplat to go to the crash in the BugSplat app. You will
   be prompted to login if you aren't already.

For additional help, check out the
[documentation](http://www.bugsplat.com/docs/) on our website
or email support@bugsplat.com if you have any questions.

Good luck!
© BugSplat Software
[Web](https://www.bugsplat.com)
| [Twitter](https://twitter.com/BugSplatCo)
| [Facebook](https://www.facebook.com/bugsplatsoftware/)
