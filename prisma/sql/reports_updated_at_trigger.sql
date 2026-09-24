CREATE OR REPLACE FUNCTION public.touch_report_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    target_report_id BIGINT;
BEGIN
    CASE TG_TABLE_NAME

        -- Direct children of reports
        WHEN 'report_sources' THEN
            target_report_id := NEW.report_id;

        WHEN 'reported_devices' THEN
            target_report_id := NEW.report_id;

        -- Children of reported_devices
        WHEN 'reported_issues' THEN
            SELECT report_id
              INTO target_report_id
              FROM public.reported_devices
             WHERE id = NEW.reported_device_id;

        WHEN 'reported_other_device_names' THEN
            SELECT report_id
              INTO target_report_id
              FROM public.reported_devices
             WHERE id = NEW.reported_device_id;

        -- Child of reported_other_device_names
        WHEN 'reported_name_verifications' THEN
            SELECT rd.report_id
              INTO target_report_id
              FROM public.reported_other_device_names rodn
              JOIN public.reported_devices rd
                ON rd.id = rodn.reported_device_id
             WHERE rodn.id = NEW.reported_other_name_id;

        -- Child of reported_name_verifications
        WHEN 'reported_name_verification_sources' THEN
            SELECT rd.report_id
              INTO target_report_id
              FROM public.reported_name_verifications rnv
              JOIN public.reported_other_device_names rodn
                ON rodn.id = rnv.reported_other_name_id
              JOIN public.reported_devices rd
                ON rd.id = rodn.reported_device_id
             WHERE rnv.id = NEW.verification_id;

        ELSE
            RAISE EXCEPTION
                'touch_report_updated_at() called for unsupported table %',
                TG_TABLE_NAME;
    END CASE;

    UPDATE public.reports
       SET updated_at = CURRENT_TIMESTAMP
     WHERE id = target_report_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_report_from_report_sources
ON public.report_sources;

CREATE TRIGGER touch_report_from_report_sources
AFTER INSERT OR UPDATE ON public.report_sources
FOR EACH ROW
EXECUTE FUNCTION public.touch_report_updated_at();


DROP TRIGGER IF EXISTS touch_report_from_reported_devices
ON public.reported_devices;

CREATE TRIGGER touch_report_from_reported_devices
AFTER INSERT OR UPDATE ON public.reported_devices
FOR EACH ROW
EXECUTE FUNCTION public.touch_report_updated_at();


DROP TRIGGER IF EXISTS touch_report_from_reported_issues
ON public.reported_issues;

CREATE TRIGGER touch_report_from_reported_issues
AFTER INSERT OR UPDATE ON public.reported_issues
FOR EACH ROW
EXECUTE FUNCTION public.touch_report_updated_at();


DROP TRIGGER IF EXISTS touch_report_from_reported_other_device_names
ON public.reported_other_device_names;

CREATE TRIGGER touch_report_from_reported_other_device_names
AFTER INSERT OR UPDATE ON public.reported_other_device_names
FOR EACH ROW
EXECUTE FUNCTION public.touch_report_updated_at();


DROP TRIGGER IF EXISTS touch_report_from_name_verifications
ON public.reported_name_verifications;

CREATE TRIGGER touch_report_from_name_verifications
AFTER INSERT OR UPDATE ON public.reported_name_verifications
FOR EACH ROW
EXECUTE FUNCTION public.touch_report_updated_at();


DROP TRIGGER IF EXISTS touch_report_from_name_verification_sources
ON public.reported_name_verification_sources;

CREATE TRIGGER touch_report_from_name_verification_sources
AFTER INSERT OR UPDATE ON public.reported_name_verification_sources
FOR EACH ROW
EXECUTE FUNCTION public.touch_report_updated_at();
