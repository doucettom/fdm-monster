FROM node:16.18-bullseye-slim

# Update Local Repository Index
RUN apt-get update
# Upgrade packages in the base image and apply security updates
RUN DEBIAN_FRONTEND=noninteractive apt-get dist-upgrade -yq
# Install package utils
RUN DEBIAN_FRONT=noninteractive apt-get install -yq apt-utils
# Install MongoDB
RUN DEBIAN_FRONTEND=noninteractive apt-get install -yq mongodb
# Remove package files fetched for install
RUN apt-get clean
# Remove unwanted files
RUN rm -rf /var/lib/apt/lists/

COPY . /app
WORKDIR /app

RUN yarn global add pm2

RUN yarn install --production

EXPOSE 4000

COPY docker/monolithic-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["bash", "/usr/local/bin/entrypoint.sh"]
