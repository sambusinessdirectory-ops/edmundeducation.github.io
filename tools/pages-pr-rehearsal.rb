# Execute the production checkout and Writing test commands in a fresh directory.
require "yaml"
require "tmpdir"
steps = YAML.safe_load_file(".github/workflows/pages.yml").fetch("jobs").fetch("build").fetch("steps")
def command(steps, name)
  steps.find { |step| step["name"] == name }.fetch("run")
end
checkout = command(steps, "Fetch focused release files without R2-backed source trees")
writing = command(steps, "Validate focused Writing release")
Dir.mktmpdir do |dir|
  Dir.chdir(dir) do
    system("bash", "-ec", checkout, exception: true)
    system("bash", "-ec", writing, exception: true)
    # Only after rehearsal, add inputs for the checks used by full releases.
    system("git", "sparse-checkout", "add", "/pwa-manifests/", "/workers/shared-answer-comparison.js", "/**/*.html", exception: true)
    system("bash", "tools/pages-early-checks.sh", exception: true)
  end
end
