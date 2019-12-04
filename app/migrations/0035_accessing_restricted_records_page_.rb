Sequel.migration do
  up do
    self[:page].insert(slug: 'access-to-restricted-records-faq',
                       content: ('<h1>Access to Restricted Records FAQ</h1>' +
                         '<p>Some records at Queensland State Archives are subject to restricted access periods, and may be closed for up to 100 years. You may apply to the responsible agency for permission to access these records.</p>' +
                         '<p>Access is granted at the discretion of the responsible agency and some agencies may ask you to provide additional information before making a decision. Please give a reason for your request including if it is for a legal matter.</p>' +
                         '<h3>What happens after I submit my application to access restricted records?</h3>' +
                         '<p>If your request for access permission is successful, you will receive a notification from the responsible agency giving access to the specified record(s) for a specific period of time. Please contact Queensland State Archives to confirm we have also received a copy of this permission form prior to visiting. </p>' +
                         '<h3>Who has permission to access restricted records?</h3>' +
                         '<p>If your request for access permission is successful, you will receive a form from the responsible agency (called an \'Access to restricted records\' form) giving access to the specified records for a specific period of time. If you are the only person who applied and for whom access was granted, please do not invite others to view the records with you. If access permission is granted, Queensland State Archives supervises your access to these records. In some instances, an officer of the responsible agency may supervise your access to restricted records.</p>' +
                         '<h3>Am I allowed to discuss the contents of restricted records?</h3>' +
                         '<p>If you are the only person who has been granted access to specific restricted records you are not allowed to discuss the contents of the restricted records. If you are one of a group of researchers granted permission to access restricted records, you may not discuss the contents of these restricted records with researchers outside of your group.</p>' +
                         '<h3>May I copy restricted records?</h3>' +
                         '<p>You may only copy restricted records if your \'Access to restricted records\' form states that you have permission. Copying means photographing and requesting copies to be created by Queensland State Archives. Some responsible agencies may also consider note-taking to be a form of copying.</p>' +
                         '<h3>What about publishing and restricted records?</h3>' +
                         '<p>Publication of any public record subject to a restricted access period should never occur without the permission of the owner of the record. This includes providing copies of restricted records to other interested researchers. Contact the responsible agency for advice about reproducing or publishing content from restricted records.</p>' +
                         '<h3>More information?</h3>' +
                         '<p>Contact Queensland State Archives by phone on 07 30376 777 or by email at <a href="mailto:info@archives.qld.gov.au">info@archives.qld.gov.au</a> for further assistance.</p>'),
                       locked: 1,
                       hidden: 0,
                       deleted: 0,
                       create_time: 1574032180309,
                       created_by: 'Admin user')
  end
end
