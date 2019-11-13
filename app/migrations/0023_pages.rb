Sequel.migration do
  up do
    create_table(:page) do
      primary_key :id

      String :slug, null: false
      String :content, null: false, text: true

      Integer :locked, null: false
      Integer :deleted, null: false

      Bignum :create_time, null: false
      String :created_by, null: false
    end

    self[:page].multi_insert([
      {
        slug: "terms-and-conditions",
        locked: 1,
        deleted: 0,
        create_time: java.lang.System.currentTimeMillis,
        created_by: 'Admin user',
        content: ('<h3>Terms and conditions</h3>' +
                  '<p>The personal information collected for QSA User Registration is used to:</p>' +
                  '<ul>' +
                  '<li>help ensure the protection of archival records held by QSA</li>' +
                  '<li>track the issue of records to our Reading Room, and</li>' +
                  '<li>assist us in planning and allocating resources.</li>' +
                  '</ul>' +
                  '<p>Personal information may also be used to notify of any changes to our services.' +
                  ' QSA will not disclose your personal information to any other third parties without your consent, unless authorised or required by law.' +
                  ' Under the <a href="https://www.legislation.qld.gov.au/view/html/inforce/current/act-2009-014"' +
                  ' rel="noopener noreferrer" target="_blank">Information Privacy Act 2009 (Qld)</a>' +
                  ' any personal information collected by QSA can, on the request of the individual,' +
                  ' be made available and any inaccurate information amended.' +
                  ' Our Reading Room Conditions of Entry provides more information on rules and procedures.</p><p><br></p>' +
                  '<p>By submitting this form you agree to the conditions above.</p>')
      },
      {
        slug: "proof-of-identity-statement",
        locked: 1,
        deleted: 0,
        create_time: java.lang.System.currentTimeMillis,
        created_by: 'Admin user',
        content: ('<h3>Proof of identity statement</h3>' +
                  '<p>On your first visit to Queensland State Archives you will be asked to show proof of identity,' +
                  ' in the form of documentation which includes your name and photograph (eg. Driving licence),' +
                  ' before original records can be issued.' +
                  ' We do not record or retain details of this identification document.</p>')
      },
    ])
  end
end
