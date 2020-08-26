-- PROCEDURE: ciam.delete_all_records_for_a_hcp_user(uuid)

-- DROP PROCEDURE ciam.delete_all_records_for_a_hcp_user(uuid);

CREATE OR REPLACE PROCEDURE ciam.delete_all_records_for_a_hcp_user(
	hcp_id uuid)
LANGUAGE 'plpgsql'

AS $BODY$
begin
    -- delete consents of the given hcp user 
    delete from ciam.hcp_consents where user_id = hcp_id;
	
	-- delete password history of the given hcp user
	delete from ciam.password_history where user_id = hcp_id;
	
	-- delete all logs related to the given hcp user
	delete from ciam.audits where object_id = hcp_id::text;

    -- delete the hcp profile of the given hcp_id
    delete from ciam.hcp_profiles where id = hcp_id;

    commit;
end;$BODY$;
