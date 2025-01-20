# RecuperApp

## After cloning the repository:

Add BODYEXPORT and BODYIMPORT with the Redcap token. Then:
```
npm uninstall -g ionic
npm install -g @ionic/cli

npm install

ionic build
npx cap sync

ionic cap add android
ionic cap copy android

ionic cap add ios
ionic cap copy ios
```
