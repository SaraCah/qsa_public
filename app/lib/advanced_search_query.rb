require 'json'

class AdvancedSearchQuery
  attr_reader :query_string

  # space and double quote are also meaningful, but let those through for now
  SOLR_CHARS = '+-&|!(){}[]^~*?:\\/'

  def self.parse(json)
    new(JSON.parse(json))
  end

  def initialize(query)
    @query_string = parse_query(query)
  end

  private

  def solr_escape(s)
    pattern = Regexp.quote(SOLR_CHARS)
    s.gsub(/([#{pattern}])/, '\\\\\1')
  end

  def combine_left_associative(clauses)
    if clauses.length < 3
      clauses.join(' ')
    else
      first_group = clauses.take(3).join(' ')
      remaining_groups = clauses.drop(3)

      remaining_groups.each_slice(2).reduce(first_group) do |result, (operator, clause)|
        "(%s) %s %s" % [result, operator, clause]
      end
    end
  end

  def parse_query(query)
    clauses = query['clauses'].each_with_index.map {|clause, idx|
      operator = clause.fetch('operator')
      negated = false

      if operator == 'NOT'
        # NOT isn't really a boolean operator--really means AND NOT.  We're not
        # judging.
        operator = 'AND'
        negated = true
      end

      [
        # combining operator if we're not on the first clause
        (idx == 0) ? '' : operator,

        # query
        "%s%s:(%s)" % [
          negated ? '-' : '',
          clause.fetch('field'),
          solr_escape(clause.fetch('query')),
        ]
      ]
    }.flatten.reject(&:empty?)

    combine_left_associative(clauses)
  end

end
