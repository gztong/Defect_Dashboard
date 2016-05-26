@echo off

NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
	echo This setup needs admin permissions. Please run this file as admin.
	pause
	exit
)

set NODE_VER=null
set NODE_EXEC=node-v0.8.11-x86.msi
set SETUP_DIR=%CD%
node -v >tmp.txt
set /p NODE_VER=<tmp1.txt
del tmp1.txt
IF %NODE_VER% NEQ null (
	echo INSTALLING node ...
	mkdir tmp1
	IF NOT EXIST tmp1/%NODE_EXEC% (
		echo Node setup file does not exist. Downloading ...
		cd ../bin
		START /WAIT wget http://nodejs.org/dist/v0.8.11/%NODE_EXEC%
		move %NODE_EXEC% %SETUP_DIR%/tmp1
	)
	cd %SETUP_DIR%/tmp1
	START /WAIT %NODE_EXEC%
	cd %SETUP_DIR%

) ELSE (
	echo Node and http-server is already installed.
)

	cd ../..
	echo INSTALLING http-server ...
	call npm install -g http-server
	cd %SETUP_DIR%
	echo DONE!
