class SitemapRefreshWorker < SidekiqWorker
  def perform
    Rails.application.load_tasks
    Rake::Task["sitemap:refresh"].invoke
  end
end
