# Check the contracts that every reusable Pages artifact builder must honor.
require "yaml"
require "open3"

verify_checkout = ARGV == ["--check-inputs"]
abort "Usage: ruby tools/check-pages-build-environment.rb [--check-inputs]" unless ARGV.empty? || verify_checkout

workflows = Dir[".github/workflows/*.{yml,yaml}"].to_h do |path|
  [path, YAML.safe_load(File.read(path))]
end
coordinator = workflows.fetch(".github/workflows/pages-release-coordinator.yml")
unless coordinator["concurrency"] == { "group" => "pages-release-main", "queue" => "single", "cancel-in-progress" => false }
  abort "Pages releases must keep one active and only the latest pending candidate"
end
rehearsal = workflows.fetch(".github/workflows/pages-queue-rehearsal.yml").fetch("concurrency")
unless rehearsal.reject { |key, _| key == "group" } == coordinator.fetch("concurrency").reject { |key, _| key == "group" } &&
    rehearsal.fetch("group").start_with?("pages-rehearsal-")
  abort "Isolated rehearsal must exercise the production queue settings in its own group"
end
builders = coordinator.fetch("jobs").values.map { |job| job["uses"] }.compact.map { |path| path.delete_prefix("./") }
builders.delete(".github/workflows/publish-pages-artifact.yml")
workflows.each do |path, workflow|
  # Ruby's YAML parser also accepts the YAML 1.1 spelling of the 'on' key as true.
  triggers = workflow["on"] || workflow[true]
  outputs = triggers.dig("workflow_call", "outputs") if triggers.is_a?(Hash) && triggers["workflow_call"].is_a?(Hash)
  builders << path if outputs.is_a?(Hash) && outputs.key?("artifact_name")
end
abort "No Pages builders found" if builders.empty?

manifest = "tools/pages-validation-paths"
paths = File.readlines(manifest, chomp: true)
%w[/.github/workflows/ /tools/install-pages-browsers.sh /tools/pages-validation-paths /tools/check-pages-build-environment.rb /paper3/reader-batch.zip /paper3/index.html /paper3/2013-b1/index.html].each do |required|
  abort "#{manifest} must include #{required}" unless paths.include?(required)
end
paths.each do |pattern|
  abort "Expected an anchored repository path: #{pattern}" unless pattern.match?(%r{\A/(?:[\w.-]+/)*[\w.-]+/?\z}) && (pattern.split("/") & [".", ".."]).empty?
  path = pattern.delete_prefix("/").delete_suffix("/")
  files, status = Open3.capture2("git", "ls-files", "-z", "--", path)
  abort "#{manifest} references missing input #{path}" unless status.success? && !files.empty?
  if verify_checkout
    files.split("\0").each do |file|
      abort "Validation input missing from checkout: #{file}" unless File.file?(file)
    end
  end
end

builders.uniq.each do |path|
  workflows.fetch(path).fetch("jobs").each do |name, job|
    abort "#{path}: build scheduling belongs to the coordinator" if job.key?("concurrency")
    abort "#{path}: #{name} must use the supported ubuntu-24.04 runner" unless job["runs-on"] == "ubuntu-24.04"
    job.fetch("steps").each do |step|
      command = step.fetch("run", "")
      if command.match?(/(?:npm|npx|pnpm|yarn).*\bplaywright\b|\.bin\/playwright\s+install/)
        abort "#{path}: use tools/install-pages-browsers.sh for browser setup"
      end
      if step.fetch("with", {}).key?("sparse-checkout")
        abort "#{path}: source sparse checkouts must include #{manifest}"
      end
      if command.include?("git sparse-checkout disable")
        abort "#{path}: full artifact hydration must reject remaining sparse state" unless command.include?("Full artifact preparation cannot use a sparse checkout")
        abort "#{path}: full artifact hydration must verify every tracked path" unless command.include?('git ls-tree -rz --name-only "${GITHUB_SHA}"')
        next
      end
      next unless command.include?("core.sparseCheckout") || command.include?(".git/info/sparse-checkout")
      append = command.lines.index { |line| line.strip == 'git show "${GITHUB_SHA}:tools/pages-validation-paths" >> .git/info/sparse-checkout' }
      checkout = command.lines.index { |line| line.match?(/^\s*git checkout /) }
      verify = command.lines.index { |line| line.strip == "ruby tools/check-pages-build-environment.rb --check-inputs" }
      abort "#{path}: append and verify shared inputs around checkout" unless append && checkout && verify && append < checkout && checkout < verify
    end
  end
end
puts "Verified Pages build environment for #{builders.uniq.sort.join(', ')}"
