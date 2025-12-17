/* SCRIPT TẠO USER JOBVIET 
   Tương thích: DBeaver & Oracle Docker
*/
DECLARE
    v_user VARCHAR2(30) := 'JOBVIET';   -- Tên user
    v_pass VARCHAR2(30) := '123456';    -- Mật khẩu
    v_count NUMBER;
BEGIN
    -- 1. KIỂM TRA VÀ TẠO USER
    SELECT count(*) INTO v_count FROM all_users WHERE username = v_user;
    
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'CREATE USER ' || v_user || ' IDENTIFIED BY "' || v_pass || '" DEFAULT TABLESPACE users QUOTA UNLIMITED ON users';
        DBMS_OUTPUT.PUT_LINE('Result: Da tao user ' || v_user || ' thanh cong.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Result: User ' || v_user || ' da ton tai. Bo qua buoc tao.');
    END IF;

    -- 2. CẤP QUYỀN (GRANT)
    -- Cấp các quyền mạnh nhất cho môi trường Dev để không bị lỗi vặt
    EXECUTE IMMEDIATE 'GRANT CONNECT, RESOURCE TO ' || v_user;
    EXECUTE IMMEDIATE 'GRANT UNLIMITED TABLESPACE TO ' || v_user;
    EXECUTE IMMEDIATE 'GRANT CREATE SESSION TO ' || v_user;
    EXECUTE IMMEDIATE 'GRANT CREATE TABLE TO ' || v_user;
    EXECUTE IMMEDIATE 'GRANT CREATE VIEW TO ' || v_user;
    EXECUTE IMMEDIATE 'GRANT CREATE SEQUENCE TO ' || v_user;
    EXECUTE IMMEDIATE 'GRANT CREATE PROCEDURE TO ' || v_user;

    DBMS_OUTPUT.PUT_LINE('Result: Da cap quyen day du cho ' || v_user);

    -- 3. TẠO ROLE (Tùy chọn - đã sửa lỗi logic)
    SELECT count(*) INTO v_count FROM dba_roles WHERE role = 'APP_ROLE';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'CREATE ROLE APP_ROLE';
        EXECUTE IMMEDIATE 'GRANT CREATE SESSION, CREATE TABLE TO APP_ROLE';
        DBMS_OUTPUT.PUT_LINE('Result: Da tao role APP_ROLE.');
    END IF;
    
    -- Gán role cho user
    EXECUTE IMMEDIATE 'GRANT APP_ROLE TO ' || v_user;
    
    COMMIT;
END;

/* SCRIPT XÓA USER JOBVIET (CLEANUP)
   Lưu ý: Dữ liệu của user này sẽ mất hết
*/
DECLARE
    v_user VARCHAR2(30) := 'JOBVIET';
    v_count NUMBER;
BEGIN
    -- 1. KILL SESSION (Đuổi user ra khỏi hệ thống trước)
    FOR s IN (SELECT sid, serial# FROM v$session WHERE username = v_user) LOOP
        EXECUTE IMMEDIATE 'ALTER SYSTEM KILL SESSION ''' || s.sid || ',' || s.serial# || ''' IMMEDIATE';
        DBMS_OUTPUT.PUT_LINE('Da kill session: ' || s.sid);
    END LOOP;

    -- 2. XÓA USER
    SELECT count(*) INTO v_count FROM all_users WHERE username = v_user;
    
    IF v_count > 0 THEN
        EXECUTE IMMEDIATE 'DROP USER ' || v_user || ' CASCADE';
        DBMS_OUTPUT.PUT_LINE('Result: Da xoa user ' || v_user || ' thanh cong!');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Result: User ' || v_user || ' khong ton tai.');
    END IF;
END;

SELECT username, account_status FROM dba_users WHERE username = 'JOBVIET';

SELECT column_name FROM all_tab_columns
WHERE owner = 'JOBVIET';