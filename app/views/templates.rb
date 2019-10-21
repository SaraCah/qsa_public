# You define templates with a name, a list of parameters they take, and an ERB
# file.
#
# If param ends with '?' it's allowed to be nil.
#
# If param is wrapped in an array, that's an array of something.  If you don't
# specify it, you get [].
#
# Partials would work the same way--just <%== Templates.emit(:partial_name) %>
#

Templates.define(:layout, [:title, :template, :template_args], "views/layout.erb.html")
Templates.define(:home, [], "views/home.html.erb")
Templates.define(:quote_request_email, [:user, :request_items, :create_time], "views/emails/quote_request.txt.erb")
