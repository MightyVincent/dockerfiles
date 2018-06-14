# parent image
FROM node:8.11.2-slim
LABEL maintainer="ancienlee@live.com"

# sys libs
RUN cd /etc/apt \
    && echo "" > sources.list \
    && echo "deb http://mirrors.163.com/debian/ jessie main non-free contrib" >> sources.list \
    && echo "deb http://mirrors.163.com/debian/ jessie-updates main non-free contrib" >> sources.list \
    && echo "deb http://mirrors.163.com/debian/ jessie-backports main non-free contrib" >> sources.list \
    && echo "deb-src http://mirrors.163.com/debian/ jessie main non-free contrib" >> sources.list \
    && echo "deb-src http://mirrors.163.com/debian/ jessie-updates main non-free contrib" >> sources.list \
    && echo "deb-src http://mirrors.163.com/debian/ jessie-backports main non-free contrib" >> sources.list \
    && echo "deb http://mirrors.163.com/debian-security/ jessie/updates main non-free contrib" >> sources.list \
    && echo "deb-src http://mirrors.163.com/debian-security/ jessie/updates main non-free contrib" >> sources.list \
    && apt-get update \
    && apt-get install -y libaio1 \
    # && apt-get install -y build-essential \
    && apt-get install -y unzip

# prepare dir
RUN mkdir -p /opt/oracle

# add lib
ADD ./lib/instantclient-basiclite-linux.x64-12.2.0.1.0.zip /opt/oracle

RUN pwd \
    # oracle instant client
    && cd /opt/oracle \
    && unzip instantclient-basiclite-linux.x64-12.2.0.1.0.zip && rm instantclient-basiclite-linux.x64-12.2.0.1.0.zip \
    && mv instantclient_12_2 instantclient \
    && cd /opt/oracle/instantclient \
    && ln -s libclntsh.so.12.1 libclntsh.so \
    && ln -s libocci.so.12.1 libocci.so \
    && echo /opt/oracle/instantclient > /etc/ld.so.conf.d/oracle-instantclient.conf && ldconfig

# env
ENV LD_LIBRARY_PATH="/opt/oracle/instantclient"
