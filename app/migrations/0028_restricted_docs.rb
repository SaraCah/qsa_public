Sequel.migration do
  up do
    self[:page].insert(slug: 'restricted-access',
                       content: ('<h1>Restricted Access</h1>' +
                                 '<p>In general, the records at Queensland State Archives are open to everyone. ' +
                                 'However, some records have been restricted by the agency that transferred them for reasons of personal privacy' +
                                 ' or commercial sensitivity. You can apply for permission to view these records.</p>' +
                                 '<p>In some cases, records have been restricted by Queensland State Archives due to the condition' +
                                 ' of the record, obsolescent formats, or the item being part of an exhibition.</p>'),
                       locked: 1,
                       hidden: 0,
                       deleted: 0,
                       create_time: 1574032180309,
                       created_by: 'Admin user')


    self[:page].insert(
      slug: 'how-do-i-order-restricted-records',
      content: ('<h1>How do I order restricted records?</h1>' +
                '<p>Restrictions on accessing records are administered by the agency responsible for these records. ' +
                'You will need to apply to that agency for permission to view and copy a record with restricted access. ' +
                'You can do this by clicking on the \'Request to view in Reading Room\' button and providing the information requested. ' +
                'The agency will notify you directly once they have made a decision.</p>'),
      locked: 1,
      hidden: 0,
      deleted: 0,
      create_time: 1574032180309,
      created_by: 'Admin user'
    )
  end
end
