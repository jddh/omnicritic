# Load nvm
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18.15.0

# now node works
# node -e "console.log('hello')"
# node --version

# npm works too!
# npm --version

node /Users/jhorvath/Documents/dev/web/colonel/colonel.js action=ratings