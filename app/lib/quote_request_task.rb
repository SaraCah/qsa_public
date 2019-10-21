class QuoteRequestTask

  def self.run_tasks(tasks)
    results = []

    tasks.each do |task|
      # TODO:
      #
      #  * Grab the QuoteRequest ID from the blob
      #  * Look that up to get a list of Solr record IDs
      #  * Resolve those, coping with failure
      #  * Generate an email and log it (for now)
      #

      results << DeferredTaskRunner::TaskResult.new(task[:id], :success)
    end

    results
  end

end

