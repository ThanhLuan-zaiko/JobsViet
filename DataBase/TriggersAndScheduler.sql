------------------------------------------------------------
-- TRIGGERS AND SCHEDULER JOB
-- Run this file after inserting initial data into the database.
-- Requires CREATE TRIGGER and EXECUTE ON DBMS_SCHEDULER privileges.
------------------------------------------------------------

------------------------------------------------------------
-- TRIGGER: TrgJobsModeration
-- On INSERT Jobs: Set PENDING_APPROVAL for non-Admin/Moderator, else OPEN.
------------------------------------------------------------
CREATE OR REPLACE TRIGGER TrgJobsModeration
BEFORE INSERT ON Jobs
FOR EACH ROW
DECLARE
  vRole VARCHAR2(50);
BEGIN
  SELECT Role INTO vRole FROM Users WHERE UserId = :NEW.PostedByUserId;

  IF vRole NOT IN ('Admin', 'Moderator') THEN
    :NEW.HiringStatus := 'PENDING_APPROVAL';
    :NEW.IsActive := 0;
  ELSE
    IF :NEW.HiringStatus IS NULL THEN
      :NEW.HiringStatus := 'OPEN';
    END IF;
    IF :NEW.IsActive IS NULL THEN
      :NEW.IsActive := 1;
    END IF;
  END IF;

  LogAudit(:NEW.PostedByUserId, 'JobPosted', 'Job', :NEW.JobId, 'Moderation applied');
END;
/
SHOW ERRORS TRIGGER TrgJobsModeration

------------------------------------------------------------
-- COMPOUND TRIGGER: CtApplicationsHireCount
-- Handles batch INSERT/UPDATE on Applications.Status to update Jobs.PositionsFilled safely.
------------------------------------------------------------
CREATE OR REPLACE TRIGGER CtApplicationsHireCount
FOR INSERT OR UPDATE OF Status ON Applications
COMPOUND TRIGGER
  TYPE tJobDelta IS TABLE OF NUMBER INDEX BY RAW; -- delta per JobId
  gDelta tJobDelta;

  BEFORE STATEMENT IS
  BEGIN
    gDelta.DELETE;
  END BEFORE STATEMENT;

  AFTER EACH ROW IS
    vJob RAW(16);
    vDelta NUMBER := 0;
  BEGIN
    vJob := :NEW.JobId;

    IF INSERTING THEN
      IF :NEW.Status = 'HIRED' THEN
        vDelta := 1;
      END IF;
    ELSIF UPDATING THEN
      IF NVL(:OLD.Status, 'APPLIED') <> 'HIRED' AND :NEW.Status = 'HIRED' THEN
        vDelta := 1;
      ELSIF :OLD.Status = 'HIRED' AND :NEW.Status <> 'HIRED' THEN
        vDelta := -1;
      END IF;
    END IF;

    IF vDelta <> 0 THEN
      IF gDelta.EXISTS(vJob) THEN
        gDelta(vJob) := gDelta(vJob) + vDelta;
      ELSE
        gDelta(vJob) := vDelta;
      END IF;
      -- Audit each record
      LogAudit(:NEW.CandidateId, 'ApplicationStatusChange', 'Application', :NEW.ApplicationId,
               'Job='||RAWTOHEX(vJob)||', delta='||vDelta||', newStatus='||:NEW.Status);
    END IF;
  END AFTER EACH ROW;

  AFTER STATEMENT IS
    vJob RAW(16);
  BEGIN
    -- Apply deltas
    vJob := gDelta.FIRST;
    WHILE vJob IS NOT NULL LOOP
      IF gDelta(vJob) <> 0 THEN
        UPDATE Jobs
           SET PositionsFilled = GREATEST(NVL(PositionsFilled,0) + gDelta(vJob), 0)
         WHERE JobId = vJob;

        -- Trigger auto-close if needed
        LogAudit(NULL, 'JobFilledDeltaApply', 'Job', vJob,
                 'Delta='||gDelta(vJob));
      END IF;
      vJob := gDelta.NEXT(vJob);
    END LOOP;
  END AFTER STATEMENT;
END CtApplicationsHireCount;
/
SHOW ERRORS TRIGGER CtApplicationsHireCount

------------------------------------------------------------
-- TRIGGER: TrgReportsAutoFlagJob
-- On INSERT Reports: If >=3 NEW reports on same Job, pause it.
------------------------------------------------------------
CREATE OR REPLACE TRIGGER TrgReportsAutoFlagJob
AFTER INSERT ON Reports
FOR EACH ROW
DECLARE
  vCount NUMBER;
  vThreshold NUMBER := 3; -- adjustable
BEGIN
  IF :NEW.TargetJobId IS NOT NULL THEN
    SELECT COUNT(*)
      INTO vCount
      FROM Reports
     WHERE TargetJobId = :NEW.TargetJobId
       AND Status = 'NEW';

    IF vCount >= vThreshold THEN
      UPDATE Jobs
         SET IsActive = 0,
             HiringStatus = 'PAUSED'
       WHERE JobId = :NEW.TargetJobId
         AND HiringStatus NOT IN ('CLOSED', 'REJECTED');

      LogAudit(:NEW.ReporterUserId, 'JobAutoPausedByReports', 'Job', :NEW.TargetJobId,
               'NewReports='||vCount||', Threshold='||vThreshold);
    END IF;
  END IF;
END;
/
SHOW ERRORS TRIGGER TrgReportsAutoFlagJob

------------------------------------------------------------
-- STATEMENT-LEVEL TRIGGER: TrgJobsAutoCloseOnFilled_Stmt
-- After UPDATE on Jobs PositionsFilled/Needed: Close if filled >= needed.
------------------------------------------------------------
CREATE OR REPLACE TRIGGER TrgJobsAutoCloseOnFilled_Stmt
AFTER UPDATE OF PositionsFilled, PositionsNeeded ON Jobs
DECLARE
  PRAGMA AUTONOMOUS_TRANSACTION; -- independent audit
  v_rows PLS_INTEGER;
BEGIN
  UPDATE Jobs j
     SET HiringStatus = 'CLOSED',
         IsActive = 0
   WHERE NVL(j.PositionsFilled,0) >= NVL(j.PositionsNeeded,0)
     AND j.HiringStatus <> 'CLOSED';

  v_rows := SQL%ROWCOUNT;

  IF v_rows > 0 THEN
    LogAudit(NULL, 'JobAutoCloseFilled_Batch', 'Job', NULL, 'Auto-closed '||v_rows||' job(s) where filled>=needed');
  END IF;
END;
/
SHOW ERRORS TRIGGER TrgJobsAutoCloseOnFilled_Stmt

------------------------------------------------------------
-- TRIGGER: TrgJobsStatusChangeNotify
-- On UPDATE Jobs HiringStatus: Notify the job poster.
------------------------------------------------------------
CREATE OR REPLACE TRIGGER TrgJobsStatusChangeNotify
AFTER UPDATE OF HiringStatus ON Jobs
FOR EACH ROW
BEGIN
  IF :OLD.HiringStatus <> :NEW.HiringStatus THEN
    INSERT INTO Notifications (UserId, Type, Title, Message, RelatedJobId)
    VALUES (:NEW.PostedByUserId, 'JobUpdate', 'Job Status Changed',
            'Your job "' || :NEW.Title || '" status changed to ' || :NEW.HiringStatus,
            :NEW.JobId);
  END IF;
END;
/
SHOW ERRORS TRIGGER TrgJobsStatusChangeNotify

------------------------------------------------------------
-- TRIGGER: TrgApplicationsStatusNotify
-- On UPDATE Applications Status: Notify the candidate.
------------------------------------------------------------
CREATE OR REPLACE TRIGGER TrgApplicationsStatusNotify
AFTER UPDATE OF Status ON Applications
FOR EACH ROW
BEGIN
  IF :OLD.Status <> :NEW.Status THEN
    INSERT INTO Notifications (UserId, Type, Title, Message, RelatedJobId, RelatedApplicationId)
    SELECT cp.UserId, 'ApplicationStatus', 'Application Status Update',
           'Your application for job "' || j.Title || '" has been ' || :NEW.Status,
           :NEW.JobId, :NEW.ApplicationId
    FROM CandidateProfiles cp, Jobs j
    WHERE cp.CandidateId = :NEW.CandidateId AND j.JobId = :NEW.JobId;
  END IF;
END;
/
SHOW ERRORS TRIGGER TrgApplicationsStatusNotify

------------------------------------------------------------
-- SCHEDULER JOB: CloseExpiredJobs
-- Closes jobs past DeadlineDate every 15 minutes.
------------------------------------------------------------
BEGIN
  -- Drop if exists
  BEGIN
    DBMS_SCHEDULER.DROP_JOB('CloseExpiredJobs', FORCE => TRUE);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  DBMS_SCHEDULER.CREATE_JOB (
    job_name        => 'CloseExpiredJobs',
    job_type        => 'PLSQL_BLOCK',
    job_action      => '
      BEGIN
        UPDATE Jobs
           SET HiringStatus = ''CLOSED'',
               IsActive = 0
         WHERE DeadlineDate IS NOT NULL
           AND DeadlineDate < TRUNC(SYSDATE)
           AND HiringStatus <> ''CLOSED'';
      END;',
    start_date      => SYSTIMESTAMP,
    repeat_interval => 'FREQ=MINUTELY;INTERVAL=15',
    enabled         => TRUE,
    comments        => 'Auto-close jobs after deadline.'
  );
END;
/

------------------------------------------------------------
-- SCHEDULER JOB: CleanupOldNotifications
-- Deletes notifications older than 30 days, runs daily.
------------------------------------------------------------
BEGIN
  -- Drop if exists
  BEGIN
    DBMS_SCHEDULER.DROP_JOB('CleanupOldNotifications', FORCE => TRUE);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  DBMS_SCHEDULER.CREATE_JOB (
    job_name        => 'CleanupOldNotifications',
    job_type        => 'PLSQL_BLOCK',
    job_action      => '
      BEGIN
        DELETE FROM Notifications
         WHERE CreatedAt < SYSDATE - 30;
      END;',
    start_date      => SYSTIMESTAMP,
    repeat_interval => 'FREQ=DAILY;BYHOUR=2', -- 2 AM daily
    enabled         => TRUE,
    comments        => 'Cleanup old notifications older than 30 days.'
  );
END;
/
-- Count queries for all 24 tables in JobApplication database

SELECT 'Users' AS TableName, COUNT(*) AS RecordCount FROM Users;
SELECT * FROM Users;
SELECT 'Roles' AS TableName, COUNT(*) AS RecordCount FROM Roles;
SELECT 'Permissions' AS TableName, COUNT(*) AS RecordCount FROM Permissions;
SELECT 'RolePermissions' AS TableName, COUNT(*) AS RecordCount FROM RolePermissions;
SELECT 'UserPermissions' AS TableName, COUNT(*) AS RecordCount FROM UserPermissions;
SELECT 'CandidateProfiles' AS TableName, COUNT(*) AS RecordCount FROM CandidateProfiles;
SELECT * FROM CandidateProfiles;
SELECT * FROM CandidateIMAGES;
SELECT 'EmployerProfiles' AS TableName, COUNT(*) AS RecordCount FROM EmployerProfiles;
SELECT * FROM EmployerProfiles;
SELECT * FROM EmployerImages;
SELECT 'Companies' AS TableName, COUNT(*) AS RecordCount FROM Companies;
SELECT * FROM Companies;
SELECT * FROM CompanyImages;
SELECT 'EmployerCompanies' AS TableName, COUNT(*) AS RecordCount FROM EmployerCompanies;
SELECT * FROM EmployerCompanies;
SELECT 'JobCategories' AS TableName, COUNT(*) AS RecordCount FROM JobCategories;
SELECT 'Jobs' AS TableName, COUNT(*) AS RecordCount FROM Jobs;
SELECT * FROM Jobs;
SELECT 'JobImages' AS TableName, COUNT(*) AS RecordCount FROM JobImages;
SELECT * FROM JobImages;
SELECT 'Resumes' AS TableName, COUNT(*) AS RecordCount FROM Resumes;
SELECT 'Applications' AS TableName, COUNT(*) AS RecordCount FROM Applications;
SELECT 'Reports' AS TableName, COUNT(*) AS RecordCount FROM Reports;
SELECT 'JobReviews' AS TableName, COUNT(*) AS RecordCount FROM JobReviews;
SELECT 'CompanyReviews' AS TableName, COUNT(*) AS RecordCount FROM CompanyReviews;
SELECT 'EmployerReviews' AS TableName, COUNT(*) AS RecordCount FROM EmployerReviews;
SELECT 'Notifications' AS TableName, COUNT(*) AS RecordCount FROM Notifications;
SELECT * FROM NOTIFICATIONS;
SELECT 'Messages' AS TableName, COUNT(*) AS RecordCount FROM Messages;
SELECT * FROM MESSAGES;
SELECT 'Blogs' AS TableName, COUNT(*) AS RecordCount FROM Blogs;
SELECT 'BlogImages' AS TableName, COUNT(*) AS RecordCount FROM BlogImages;
SELECT 'AuditLogs' AS TableName, COUNT(*) AS RecordCount FROM AuditLogs;
SELECT 'AuditErrors' AS TableName, COUNT(*) AS RecordCount FROM AuditErrors;
