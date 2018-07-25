# parent image
FROM mightyvincent/node-oracle-pm2
LABEL maintainer="vincentlee@dengtacj.com"

# add app sources
COPY . /opt/wxapp

# npm
RUN npm set registry https://registry.npmjs.org/ && \
    npm cache verify

# prepare app
RUN cd /opt/wxapp && \
    mkdir -p ./node_modules/oracledb && \
    tar -xzf ./lib/oracledb-2.3.0.tgz -C ./node_modules/oracledb && \
    npm install oracledb --unsafe-perm=true --allow-root && \
    npm install

# run app
WORKDIR /opt/wxapp
EXPOSE 55552
CMD ["pm2", "start", "pm2.json", "--no-daemon"]
# CMD ["npm", "run", "prod"]