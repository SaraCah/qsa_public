Sequel.migration do
  up do
    self[:page].insert(
      slug: 'the-australian-series-system',
      content: ('<h1>The Australian Series System</h1>' +
                '<h2>Agency</h2>' +
                '<p><span>An agency is an administrative unit which exists as a separate entity. Agencies can be Government departments, statutory authorities, courts, schools or commissions. In the case of large institutions, sections or units can be separated into separate agencies.&nbsp; The agency is documented to give a context which provides an overview of what the agency did, what functions it administered. This will assist in finding and understanding records that were produced by the agency in carrying out its functions. An agency will usually have its own recordkeeping system/s and the records that are created are grouped in series.&nbsp;</span></p>' +
                '<p><span>Agencies are linked to related agencies, functions administered and records created by relationships, all of which can be explored via links in the system.</span></p>' +
                '<p><span>&nbsp;[Insert Agency example from QSA]</span></p>' +
                '<h2>Function</h2>' +
                '<p><span>Functions are the areas of responsibility of Government that are managed by one or more agencies. Functions describe the roles and activities and are linked to the government agency that administered them across time.&nbsp; A function can consist of a specific activity, or several related activities.&nbsp;</span></p>' +
                '<p><span>Functions are generally more stable and persistent than the departments, ministries and administrative units that are created to implement them.</span></p>' +
                '<p><span>Many functions have a formal basis for their establishment often from legislation in the form of a mandate for a government agency to \'do something\'. The function entity is a structured way of describing what government did over time.&nbsp;</span></p>' +
                '<p><span>Functions are linked to agencies which administered them at various times, and to records which document how the function was carried out. The links are identified in relationships which can be explored following links in the system.&nbsp;</span></p>' +
                '<p><span>[Insert Function example from QSA]&nbsp;</span></p>' +
                '<h2>Mandate</h2>' +
                '<p><span>Mandates document how agencies are authorised, established and abolished, how authority is delegated and the powers to perform functions are prescribed to agencies. In the Queensland State Archive mandates are represented as legislation and are authorised by Government through Administrative Arrangement Orders. It is the mandate that establishes the functions which agencies undertake their work as part of their role in government.</span></p>' +
                '<p><span>Mandates are linked to functions, agencies and records via relationships which can be explored in the system via links.</span></p>' +
                '<p><span>[Insert Mandate example QSA]</span></p>' +
                '<h2>Series</h2>' +
                '<p><span>A series is a group of records which have been created by an agency and stored in a recordkeeping system or&nbsp; in a particular arrangement for control or useability by the agency. The records in the series have been accumulated over time by the same function/s. The series will describe what a researcher would expect to find documented in the records. The functions that a series documents generally will remain the same during the period that the records were created. A series is either created by one or more agency over time, and once the agency ceases, a nominated \'Responsible Agency\' is assigned to exercise access control of the records.&nbsp;</span></p>' +
                '<p><span>Specific records items are always linked to a series. Exploring via series allows an overview of what to expect in the records themselves.&nbsp;</span></p>' +
                '<p><span>Series are linked to the agency that created, and the agency responsible for, them. They are also linked to records items that are contained, and also to functions and mandates that are documented in records items. All these links are done via relationships which can be explored in the system.</span></p>' +
                '<p><span>[Insert Series example QSA]</span></p>'),
      locked: 0,
      hidden: 0,
      deleted: 0,
      create_time: 1574032180309,
      created_by: 'Admin user'
    )
  end
end
