FROM centos-oracledb-rt:latest
LABEL maintainer="ancienlee@live.com"

COPY ./conf /tmp

RUN \
    # change root pw
    echo "root" | passwd --stdin root &&\
    # add oracle user
    groupadd oinstall &&\
    groupadd dba &&\
    groupadd asmadmin &&\
    groupadd asmdba &&\
    useradd -g oinstall -G dba,asmdba oracle -d /home/oracle &&\
    echo "oracle" | passwd --stdin oracle &&\
    # oracle bash env
    cat /tmp/.bash_profile >> /home/oracle/.bash_profile &&\
    # prepare oracle dirs
    mkdir -p /db/app/oracle/product/11.2.0 &&\
    mkdir /db/app/oracle/oradata &&\
    mkdir /db/app/oracle/inventory &&\
    mkdir /db/app/oracle/fast_recovery_area &&\
    chown -R oracle:oinstall /db/app/oracle &&\
    chmod -R 775 /db/app/oracle
    # sysconf
    # cat /tmp/sysctl.conf >> /etc/sysctl.conf &&\
    # sysctl -p &&\
    # sysctl --system &&\

EXPOSE 1521
# CMD ["/usr/sbin/init"]
CMD ["/bin/bash"]