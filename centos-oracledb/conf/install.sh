# docker run -itd -v D:\Downloads:/tmp/lib -p 1521:1521 centos-oracledb

# unzip
unzip /tmp/lib/linux.x64_11gR2_database_1of2.zip -d /db && \
unzip /tmp/lib/linux.x64_11gR2_database_2of2.zip -d /db && \
# conf
mkdir -p /db/etc/response && \
cp /db/database/response/*.rsp /db/etc/response && \
# remove comments and blanks
sed -i 's/^#.*$//g' /db/etc/response/*.rsp && \
sed -i '/^$/d' /db/etc/response/*.rsp && \
cp -f /tmp/db_install.rsp /db/etc/response/db_install.rsp && \
echo "127.0.0.1 centos-orcl" >> /etc/hosts

localedef -v -c -i en_US -f UTF-8 en_US.UTF-8

df -h
mount -o size=1G -o nr_inodes=1000000 -o noatime,nodiratime -o remount /dev/shm

# install
su oracle
/db/database/runInstaller -silent -ignorePrereq -responseFile /db/etc/response/db_install.rsp
su root
/db/app/oracle/inventory/orainstRoot.sh
/db/app/oracle/product/11.2.0/root.sh
rm -rf /db/database

# docker commit -m "install oracle" -a "vincentlee" ff589bec8c14 centos-oracledb
# docker run --privileged -itd -p 1521:1521 centos-oracle

# listener
su oracle
netca /silent /responsefile /db/etc/response/netca.rsp
netstat -tnulp | grep 1521

export DISPLAY=:0.0
dbca -silent -responseFile /db/etc/response/dbca.rsp
ps -ef | grep ora_ | grep -v grep
# dbca -silent -deleteDatabase -sourceDB jingyu -sysDBAUserName sys -sysDBAPassword oracle
# vi /etc/oratab

lsnrctl status

create spfile from pfile;
show parameter db_recovery
show parameter control
shutdown immediate

/db/app/oracle/product/11.2.0/bin/emca