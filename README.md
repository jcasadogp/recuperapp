# RecuperApp

## Environment setup
```
npm --version
# sudo npm install -g npm@latest
node --version

# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
# source ~/.zshrc
# nvm install node
# node -v

xcode-select --install
xcode-select -p
# /Applications/Xcode.app/Contents/Developer
```

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
