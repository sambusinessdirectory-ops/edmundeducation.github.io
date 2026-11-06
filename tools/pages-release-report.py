#!/usr/bin/env python3
"""Report GitHub release timings and public feature evidence using structured API records."""
import argparse
from datetime import datetime
import json
import subprocess
from urllib.request import Request, urlopen

def timestamp(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))

def elapsed(start, end):
    if start and end:
        return int((timestamp(end) - timestamp(start)).total_seconds())

def api(path):
    return json.loads(subprocess.check_output(["gh", "api", f"repos/{args.repo}/{path}"]))

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--repo", default="sambusinessdirectory-ops/edmundeducation.github.io")
parser.add_argument("--limit", type=int, choices=range(1,101), default=20, metavar="1..100")
parser.add_argument("--feature", help="Optional full commit ID to check against the live release")
parser.add_argument("--requested-at", help="ISO timestamp of the feature request, including timezone")
args = parser.parse_args()
runs = api(f"actions/workflows/pages-release-coordinator.yml/runs?per_page={args.limit}")["workflow_runs"]
reports = []
for run in runs:
    jobs = api(f"actions/runs/{run['id']}/jobs?per_page=100")["jobs"]
    def job(suffix):
        return next((j for j in jobs if j["name"].endswith(suffix) and j["conclusion"] != "skipped"), {})
    build, verify, publish = job("/ build"), job("/ verify-live"), job("/ publish")
    steps = build.get("steps", [])
    mode = next((s["name"] for s in steps if s["name"] in ("Prepare site files", "Prepare site files incrementally") and s["conclusion"]=="success"), None)
    scope = "full" if any(s["name"]=="Validate atomic email uploads and lost-response recovery" and s["conclusion"]=="success" for s in steps) else "focused" if build.get("conclusion")=="success" else "unknown"
    deployed = next((s for s in publish.get("steps",[]) if s["name"] == "Deploy to GitHub Pages"), {})
    verified = verify.get("completed_at") if verify.get("conclusion") == "success" else None
    snapshot = job("/ snapshot")
    phase_seconds = {}
    for step in steps:
        if step["conclusion"] != "success":
            continue
        name = step["name"]
        if name.startswith(("Prepare site files", "Point public media", "Upload GitHub Pages", "Remove verified R2")):
            phase_seconds[name] = elapsed(step.get("started_at"), step.get("completed_at"))
    reports.append(dict(run=run["run_number"],sha=run["head_sha"],url=run["html_url"],status=run["status"],
        conclusion=run["conclusion"],builder=build.get("name"),scope=scope,preparation=mode,deploy_step=deployed.get("conclusion"),
        outcome=("verified" if verified else "published; verification outstanding" if deployed.get("conclusion")=="success"
                 else run["conclusion"] or run["status"]),
        build_phases_s=phase_seconds, created_at=run["created_at"],
        publish_s=elapsed(deployed.get("started_at"),deployed.get("completed_at")),
        snapshot_completed_at=snapshot.get("completed_at") if snapshot.get("conclusion")=="success" else None,
        queue_s=elapsed(run["created_at"],job("route").get("started_at")),
        build_s=elapsed(build.get("started_at"),build.get("completed_at")),
        push_to_verified_s=elapsed(run["created_at"],verified),verified_at=verified))
result={"runs":reports,"unpublished_build_seconds":sum(r["build_s"] or 0 for r in reports if r["status"]=="completed" and not r["verified_at"] and r["deploy_step"]!="success")}
groups = {}
for row in reports:
    if row["push_to_verified_s"] is not None:
        groups.setdefault(row["scope"], []).append(row["push_to_verified_s"])
from statistics import median
from math import ceil
result["verified_push_to_live"] = {
    scope: {"count":len(times),"median_s":median(times),"p95_s":sorted(times)[ceil(len(times)*0.95)-1]}
    for scope,times in groups.items()
}
finished = [r for r in reports if r["status"]=="completed"]
published = [r for r in finished if r["deploy_step"]=="success" and r["verified_at"]]
result["completed_run_count"] = len(finished)
result["cancelled_run_count"] = sum(r["conclusion"]=="cancelled" for r in finished)
result["builder_seconds_per_verified_publication"] = (
    sum(r["build_s"] or 0 for r in finished) / len(published) if published else None
)
if args.feature:
    request=Request("https://edmundeducation.com/release.json?check="+str(int(datetime.now().timestamp())),headers={"Cache-Control":"no-cache"})
    with urlopen(request,timeout=15) as stream:
        live=json.load(stream)["release"]
    relation=api(f"compare/{args.feature}...{live}")["status"]
    result.update(public_sha=live,feature=args.feature,contains_feature=relation in ("identical","ahead"))
    if args.requested_at and result["contains_feature"]:
        for r in reversed(reports):
            if r["verified_at"] and api(f"compare/{args.feature}...{r['sha']}")["status"] in ("identical","ahead"):
                if timestamp(r["verified_at"])>=timestamp(args.requested_at):
                    result["request_to_first_observed_verified_s"]=elapsed(args.requested_at,r["verified_at"])
                    break
print(json.dumps(result,indent=2))
