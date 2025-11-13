-- ==========================================================
--  SCRIPT TẠO + QUẢN LÝ + XÓA SCHEMA (USER) TRONG ORACLE 23ai
--  Chạy bằng user SYSTEM hoặc SYS AS SYSDBA
-- ==========================================================

-- ==== CONFIG: Đổi tên user & password ở đây nếu cần ====
DEFINE schema_name = 'JOBVIET';
DEFINE schema_password = '123456';
-- =======================================================

PROMPT === 1. TẠO USER (SCHEMA) ===
BEGIN
    EXECUTE IMMEDIATE '
        CREATE USER &schema_name IDENTIFIED BY "&schema_password"
        DEFAULT TABLESPACE users
        TEMPORARY TABLESPACE temp
        QUOTA 100M ON users
    ';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -01920 THEN
        DBMS_OUTPUT.PUT_LINE('User đã tồn tại, bỏ qua bước tạo USER.');
    ELSE
        RAISE;
    END IF;
END;
/

PROMPT === 2. CẤP QUYỀN CHO USER ===
BEGIN
    EXECUTE IMMEDIATE 'GRANT CREATE SESSION TO &schema_name';
    EXECUTE IMMEDIATE 'GRANT CREATE TABLE TO &schema_name';
    EXECUTE IMMEDIATE 'GRANT CREATE SEQUENCE TO &schema_name';
    EXECUTE IMMEDIATE 'GRANT CREATE VIEW TO &schema_name';
    EXECUTE IMMEDIATE 'GRANT CREATE PROCEDURE TO &schema_name';
EXCEPTION WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Có thể quyền đã được cấp trước đó, bỏ qua.');
END;
/

PROMPT === 3. TẠO ROLE (TÙY CHỌN) ===
BEGIN
    EXECUTE IMMEDIATE 'CREATE ROLE app_role';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -01921 THEN
        DBMS_OUTPUT.PUT_LINE('Role app_role đã tồn tại, bỏ qua.');
    ELSE
        RAISE;
    END IF;
END;
/ 
BEGIN
    EXECUTE IMMEDIATE 'GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE VIEW, CREATE PROCEDURE TO app_role';
    EXECUTE IMMEDIATE 'GRANT app_role TO &schema_name';
END;
/

PROMPT === 4. HIỂN THỊ SESSION CỦA USER (&schema_name) ===
SELECT sid, serial#, status, username, machine
FROM v$session
WHERE username = UPPER('JOBVIET');

PROMPT === 5. KILL TẤT CẢ SESSION CỦA USER TRƯỚC KHI XÓA ===
BEGIN
    FOR s IN (SELECT sid, serial# FROM v$session WHERE username = UPPER('JOBVIET')) LOOP
        EXECUTE IMMEDIATE 'ALTER SYSTEM KILL SESSION '''||s.sid||','||s.serial#||''' IMMEDIATE';
    END LOOP;
END;
/  
PROMPT >>> Kill session hoàn tất.

PROMPT === 6. XÓA USER (SCHEMA) TOÀN BỘ ===
BEGIN
    EXECUTE IMMEDIATE 'DROP USER JOBVIET CASCADE';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -01918 THEN
        DBMS_OUTPUT.PUT_LINE('User không tồn tại hoặc đã bị xóa trước đó.');
    ELSE
        RAISE;
    END IF;
END;
/
PROMPT >>> DROP USER hoàn tất!

SELECT owner, table_name FROM all_tables WHERE owner = 'JOBVIET';

SELECT column_name FROM all_tab_columns
WHERE owner = 'JOBVIET' AND table_name = 'JOBS';

SELECT column_name FROM all_tab_columns
WHERE owner = 'JOBVIET' AND table_name = 'USERS';

SELECT column_name FROM all_tab_columns
WHERE owner = 'JOBVIET' AND table_name = 'EMPLOYERPROFILES';