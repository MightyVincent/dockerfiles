cls
:ks
@echo off
CLS
Title █████ CMD Util █████
@ECHO OFF&PUSHD %~DP0 &TITLE CMD Util
REM Md "%WinDir%\System32\test_permissions" 2>NUL||(Echo.&Echo 请使用右键“以管理员身份运行”&&Pause >NUL&&Exit)
REM Rd "%WinDir%\System32\test_permissions" 2>NUL
REM SetLocal EnableDelayedExpansion

:Menu
Echo.&Echo  1. Start in dev mode
Echo.&Echo  2. Build docker image
Echo.&Echo  3. Run docker image
Echo.&Echo  4. Save docker image to file
Echo.&Echo  5. Exit
Echo.&Echo.
set /p a=输入数字按回车：
If Not "%a%"=="" Set a=%a:~0,1%
If "%a%"=="1" Goto dev
If "%a%"=="2" Goto build
If "%a%"=="3" Goto run
If "%a%"=="4" Goto save
If "%a%"=="5" Goto MenuExt
Echo.&Echo 输入无效，请重新输入！
PAUSE >NUL & CLS & GOTO Menu

:dev
npm run start
Echo.&Echo 按任意键返回！&PAUSE >NUL 2>NUL & CLS & GOTO MENU
PAUSE >NUL & CLS & GOTO Menu

:build
REM delete old image
docker stop shenwan-wx-server
docker rm shenwan-wx-server
docker rmi shenwan-wx-server
REM build new image
docker build --rm -t shenwan-wx-server .
Echo.&Echo 按任意键返回！&PAUSE >NUL 2>NUL & CLS & GOTO MENU
PAUSE >NUL & CLS & GOTO Menu

:run
docker stop shenwan-redis
docker rm shenwan-redis
docker run --name shenwan-redis -d --restart=always -p 6379:6379 redis
docker stop shenwan-wx-server
docker rm shenwan-wx-server
docker run --name shenwan-wx-server --link shenwan-redis:redis -itd --rm -p 55552:55552 shenwan-wx-server
Echo.&Echo 按任意键返回！&PAUSE >NUL 2>NUL & CLS & GOTO MENU
PAUSE >NUL & CLS & GOTO Menu

:save
REM export image
docker save -o shenwan-wx-server-%date:~0,4%%date:~5,2%%date:~8,2%%time:~0,2%%time:~3,2%%time:~6,2%.tar redis shenwan-wx-server
Echo.&Echo 按任意键返回！&PAUSE >NUL 2>NUL & CLS & GOTO MENU
PAUSE >NUL & CLS & GOTO Menu

:MenuExt
Exit