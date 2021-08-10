FROM electronuserland/builder:wine-chrome
#MITRE only build options
RUN npm config set strict-ssl false -g 
RUN yarn config set strict-ssl false --global 
RUN export NODE_TLS_REJECT_UNAUTHORIZED=0
#
COPY *.json ./
COPY *.lock ./
RUN update-ca-certificates
RUN yarn add global cross-env dotenv-expand electron-builder 
RUN yarn install
copy jssip_custom ./jssip_custom
COPY scripts ./scripts
RUN yarn copy-custom
CMD yarn run build
#CMD tail -f /dev/null
