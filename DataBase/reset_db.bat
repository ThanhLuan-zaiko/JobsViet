@echo off
setlocal enabledelayedexpansion

REM --- CẤU HÌNH ---
set "CONTAINER_NAME=competent_meitner"
set "ADMIN_USER=SYSTEM"
set "ADMIN_PASS=123456"
set "TARGET_USER=JOBVIET"
set "TARGET_PASS=123456"
set "SQL_FILE=JobApplication.sql"
set "DB_SERVICE=FREEPDB1"
set "TABLE_CHECK=ROLES"

REM Đường dẫn tạm trong container
set "CONTAINER_SQL_PATH=/tmp/run_script.sql"
set "CONTAINER_DROP_SCRIPT=/tmp/drop_user.sql"
set "CONTAINER_RUN_SCRIPT=/tmp/run_wrapper.sql"

echo ==========================================
echo [INFO] BAT DAU QUA TRINH RESET DATABASE (WSL MODE)...
echo ==========================================

REM 0. KIỂM TRA DOCKER TRONG WSL CÓ ĐANG CHẠY KHÔNG
wsl docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker trong Ubuntu chua duoc bat!
    echo [TIP] Vui long mo Ubuntu va go: sudo service docker start
    pause
    exit /b 1
)

REM 1. KIỂM TRA FILE SQL TRÊN WINDOWS
if not exist "%SQL_FILE%" (
    echo [ERROR] Khong tim thay file %SQL_FILE% tai thu muc hien tai!
    pause
    exit /b 1
)

REM 2. XÓA VÀ TẠO LẠI USER
echo [INFO] Dang xoa va tao lai user %TARGET_USER%...

REM Tạo file SQL tạm thời trên Windows
(
echo SET SERVEROUTPUT ON
echo DECLARE
echo    v_count NUMBER;
echo BEGIN
echo    FOR s IN ^(SELECT sid, serial# FROM v$session WHERE username = UPPER^('%TARGET_USER%'^)^) LOOP
echo        EXECUTE IMMEDIATE 'ALTER SYSTEM KILL SESSION ''' ^|^| s.sid ^|^| ',' ^|^| s.serial# ^|^| ''' IMMEDIATE';
echo    END LOOP;
echo END;
echo /
echo BEGIN
echo    EXECUTE IMMEDIATE 'DROP USER %TARGET_USER% CASCADE';
echo EXCEPTION
echo    WHEN OTHERS THEN
echo        IF SQLCODE != -1918 THEN RAISE; END IF;
echo END;
echo /
echo CREATE USER %TARGET_USER% IDENTIFIED BY "%TARGET_PASS%";
echo GRANT CONNECT, RESOURCE, DBA TO %TARGET_USER%;
echo GRANT UNLIMITED TABLESPACE TO %TARGET_USER%;
echo EXIT
) > _temp_drop_user.sql

REM Copy file script drop user vào container (Dùng wsl docker)
wsl docker cp _temp_drop_user.sql %CONTAINER_NAME%:%CONTAINER_DROP_SCRIPT%

REM Thực thi script drop user
wsl docker exec -i %CONTAINER_NAME% sqlplus -S %ADMIN_USER%/%ADMIN_PASS%@//localhost:1521/%DB_SERVICE% @%CONTAINER_DROP_SCRIPT%

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Loi khi reset user.
    del _temp_drop_user.sql
    pause
    exit /b 1
)

echo [OK] Da tao user %TARGET_USER%.
echo ------------------------------------------

REM 3. CHẠY FILE SQL CHÍNH
echo [INFO] Dang copy file vao container...

REM Copy file dữ liệu gốc vào (Lưu ý: WSL tự động hiểu đường dẫn hiện tại)
wsl docker cp "%SQL_FILE%" "%CONTAINER_NAME%:%CONTAINER_SQL_PATH%"

REM --- DEBUG ---
echo [DEBUG] Kiem tra noi dung file ben trong container (10 dong cuoi):
echo ---------------------------------------------------------------
wsl docker exec %CONTAINER_NAME% tail -n 10 %CONTAINER_SQL_PATH%
echo ---------------------------------------------------------------

REM Tạo file wrapper chạy SQL
(
echo WHENEVER SQLERROR EXIT SQL.SQLCODE
echo SET ECHO OFF
echo SET FEEDBACK ON
echo @%CONTAINER_SQL_PATH%
echo COMMIT;
echo EXIT
) > _temp_run_wrapper.sql

REM Copy wrapper vào container
wsl docker cp _temp_run_wrapper.sql %CONTAINER_NAME%:%CONTAINER_RUN_SCRIPT%

echo [INFO] Dang thuc thi file SQL...
wsl docker exec -i %CONTAINER_NAME% sqlplus -S %TARGET_USER%/%TARGET_PASS%@//localhost:1521/%DB_SERVICE% @%CONTAINER_RUN_SCRIPT%

REM Kiểm tra kết quả
if %ERRORLEVEL% EQU 0 (
    echo [OK] Thuc thi SQL thanh cong.
) else (
    echo [ERROR] CO LOI XAY RA KHI CHAY SQL.
)

REM Dọn dẹp
if exist _temp_drop_user.sql del _temp_drop_user.sql
if exist _temp_run_wrapper.sql del _temp_run_wrapper.sql

REM Dọn dẹp trong container (Dùng wsl docker)
wsl docker exec -u 0 %CONTAINER_NAME% rm -f %CONTAINER_SQL_PATH% %CONTAINER_DROP_SCRIPT% %CONTAINER_RUN_SCRIPT%

echo ------------------------------------------
echo [INFO] KIEM TRA DU LIEU:

REM Chạy lệnh kiểm tra nhanh
(
echo SET PAGESIZE 0 FEEDBACK OFF VERIFY OFF HEADING OFF ECHO OFF
echo SELECT 'So dong trong bang %TABLE_CHECK% hien tai la: ' ^|^| count^(*^) FROM %TABLE_CHECK%;
echo EXIT
) > _temp_check.sql
wsl docker cp _temp_check.sql %CONTAINER_NAME%:/tmp/_check.sql

wsl docker exec -i %CONTAINER_NAME% sqlplus -S %TARGET_USER%/%TARGET_PASS%@//localhost:1521/%DB_SERVICE% @/tmp/_check.sql

del _temp_check.sql
wsl docker exec -u 0 %CONTAINER_NAME% rm -f /tmp/_check.sql

echo ==========================================
echo [DONE] HOAN TAT.
echo ==========================================
pause