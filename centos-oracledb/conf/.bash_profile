umask 022
export ORACLE_HOSTNAME=centos-orcl
export ORACLE_BASE=/db/app/oracle
export ORACLE_HOME=$ORACLE_BASE/product/11.2.0/
export ORACLE_SID=ORCL
export PATH=.:$ORACLE_HOME/bin:$ORACLE_HOME/OPatch:$ORACLE_HOME/jdk/bin:$PATH
export LC_ALL="en_US"
export LANG="en_US"
export NLS_LANG="AMERICAN_AMERICA.ZHS16GBK"
export NLS_DATE_FORMAT="YYYY-MM-DD HH24:MI:SS"
