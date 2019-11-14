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
      {
        slug: "user-contributions-tagging",
        locked: 1,
        deleted: 0,
        create_time: java.lang.System.currentTimeMillis,
        created_by: 'Admin user',
        content: (
          "<h1><span>User Contributions - Tagging&nbsp;</span></h1>" +
          "<h2><span>What is tagging?</span></h2>" +
          "<p><span>A tag is a keyword or short phrase to describe or categorise a catalogue entry to:</span></p>" +
          "<ul><li><span>help you find it again</span></li><li><span>help other researchers find entries that may be of interest to them</span></li><li><span>improve brief official descriptions</span></li></ul>" +
          "<p><span>Tags may, for example, modernise historical terms, expand a brief catalogue description by adding keywords to identify material found in a document, standardise terms, and bring related entries together.</span></p>" +
          "<p><span>To help our users more easily find records within our collection of over 3.3 million records, QSA adds additional information, known as metadata, to describe a record. However, we are unable to add more descriptive information so this is where our users can help. You can add metadata to records and this will help make it easier for other users to find records - this is called tagging.</span></p>" +
          "<h2><span>Are tags verified?&nbsp;</span></h2>" +
          "<p><span>User contributions are clearly distinct from QSA's official information and may be identified as user tags, user contributions, comments or similar phrases. QSA does not necessarily agree with, support or promote any opinion or representation in tags and cannot vouch for their accuracy. As QSA does not check tags for accuracy, we recommend that users seek more information or verification before acting on the information. If you find any tags which you believe are incorrect or inappropriate, please click on the 'flag as inappropriate' link to alert the QSA administrator.&nbsp;</span></p>" +
          "<h2><span>How to tag records</span></h2>" +
          "<p><span>All tags are public and searchable, and will display on the relevant page about that record.&nbsp;</span></p><p><span>Helpful tags could include:</span></p>" +
          "<ol>" +
          "<li><span>Homonyms: words with the same spelling but different meanings - eg. bat (mammal) and bat (sporting equipment)</span></li>" +
          "<li><span>Synonyms: a word or phrase that has the same or nearly the same meaning as another - eg. war and conflict</span></li>" +
          "<li><span>People and places - eg. Sir Thomas Brisbane; Texas (Queensland, Australia); Texas (USA)</span></li>" +
          "</ol>" +
          "<p><span>Your tags should relate to the topic and we recommend that your tags don't contain:</span></p>" +
          "<ul><li><span>any personal information relating to you</span></li>" +
          "<li><span>use language that is offensive, inflammatory or provocative</span></li>" +
          "<li><span>information about living people without their written consent or in breach of the </span><em>Privacy Act 2009 (Qld)</em></li>" +
          "<li><span>any information you have seen in closed records (even if you have permission to access a closed record from the agency responsible for that record)</span></li>" +
          "</ul>" +
          "<p><span>QSA uses obscenity filter to manage spam words. If you want to enter a valid tag which is being rejected, please contact us on </span><a href=\"mailto:feedback@archives.qld.gov.au\" rel=\"noopener noreferrer\" target=\"_blank\">feedback@archives.qld.gov.au</a><span> to request an administrator to review the filter terms and requested tag.</span></p>"
        ),
      },
      {
        slug: "welcome",
        locked: 1,
        deleted: 0,
        create_time: java.lang.System.currentTimeMillis,
        created_by: 'Admin user',
        content: (
          "<p>To search, enter a word, phrase or Previous System location number in the box below. Further information can be found in the ArchivesSearch Help Guide.</p>"
        ),
      },
      {
        slug: "sidebar-top",
        locked: 1,
        deleted: 0,
        create_time: java.lang.System.currentTimeMillis,
        created_by: 'Admin user',
        content: ""
      },
      {
        slug: "sidebar-bottom",
        locked: 1,
        deleted: 0,
        create_time: java.lang.System.currentTimeMillis,
        created_by: 'Admin user',
        content: ""
      },
    ])
  end
end
