FROM centos:7
LABEL maintainer="ancienlee@live.com"

ENV container docker
# RUN (cd /lib/systemd/system/sysinit.target.wants/; for i in *; do [ $i == \
#     systemd-tmpfiles-setup.service ] || rm -f $i; done) &&\
#     rm -f /lib/systemd/system/multi-user.target.wants/* &&\
#     rm -f /etc/systemd/system/*.wants/* &&\
#     rm -f /lib/systemd/system/local-fs.target.wants/* &&\
#     rm -f /lib/systemd/system/sockets.target.wants/*udev* &&\
#     rm -f /lib/systemd/system/sockets.target.wants/*initctl* &&\
#     rm -f /lib/systemd/system/basic.target.wants/* &&\
#     rm -f /lib/systemd/system/anaconda.target.wants/*;
# VOLUME [ "/sys/fs/cgroup" ]

ENV ORACLE_HOSTNAME=centos-orcl
ENV ORACLE_BASE=/db/app/oracle
ENV ORACLE_HOME=$ORACLE_BASE/product/11.2.0/
ENV ORACLE_SID=ORCL
ENV PATH=.:$ORACLE_HOME/bin:$ORACLE_HOME/OPatch:$ORACLE_HOME/jdk/bin:$PATH
ENV LC_ALL="en_US"
ENV LANG="en_US"
ENV NLS_LANG="AMERICAN_AMERICA.ZHS16GBK"
ENV NLS_DATE_FORMAT="YYYY-MM-DD HH24:MI:SS"

RUN \
    # libs
    yum -y install \
    binutils \
    compat-libstdc++-33 \
    elfutils-libelf \
    elfutils-libelf-devel \
    expat \
    gcc \
    gcc-c++ \
    glibc \
    glibc-common \
    glibc-devel \
    glibc-headers \
    libaio \
    libaio-devel \
    libgcc \
    libstdc++ \
    libstdc++-devel \
    make \
    sysstat \
    unixODBC \
    unixODBC-devel \
    unzip \
    wget \
    net-tools \
    &&\
    # pdksh
    wget -O /tmp/pdksh-5.2.14-37.el5_8.1.x86_64.rpm http://vault.centos.org/5.11/os/x86_64/CentOS/pdksh-5.2.14-37.el5_8.1.x86_64.rpm &&\
    cd /tmp &&\
    rpm -ivh pdksh-5.2.14-37.el5_8.1.x86_64.rpm &&\
    rm -f pdksh-5.2.14-37.el5_8.1.x86_64.rpm

CMD ["/bin/bash"]