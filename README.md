# RecuperApp

## Environment setup
```bash
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

To keep your REDCap token out of version control and protect sensitive data, create a separate file, called `env.local.ts`, in your root directoy (next to `src/`):
```ts
export const REDCAP_TOKEN = '###';
```
```bash
npm uninstall -g ionic
npm install -g @ionic/cli

npm install

ionic build

ionic cap add android
ionic cap copy android
ionic cap sync android

ionic cap add ios
ionic cap copy ios
ionic cap sync ios
```
