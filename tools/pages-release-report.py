#!/usr/bin/env python3
"""Report GitHub release timings and public feature evidence using structured API records."""
import argparse
from datetime import datetime
import json
from math import ceil
from statistics import median
import subprocess
from urllib.request import Request, urlopen

FOCUSED_TARGET_SECONDS = 10 * 60
FULL_TARGET_SECONDS = 20 * 60
QUEUE_TARGET_SECONDS = 5 * 60

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
    artifacts = api(f"actions/runs/{run['id']}/artifacts?per_page=100")["artifacts"]
    def job(suffix):
        return next((j for j in jobs if j["name"].endswith(suffix) and j["conclusion"] != "skipped"), {})
    build, verify, publish = job("/ build"), job("/ verify-live"), job("/ publish")
    steps = build.get("steps", [])
    mode = next((s["name"] for s in steps if s["name"] in ("Prepare site files", "Prepare site files incrementally") and s["conclusion"]=="success"), None)
    full_checkout = any(s["name"] == "Checkout complete repository" and s["conclusion"] == "success" for s in steps)
    focused_checkout = any(s["name"] == "Fetch focused release files without R2-backed source trees" and s["conclusion"] == "success" for s in steps)
    scope = ("full" if full_checkout else "focused" if focused_checkout or (
        build.get("conclusion") == "success" and build.get("name") in ("paper3 / build", "site / build")
    ) else "unknown")
    deployed = next((s for s in publish.get("steps",[]) if s["name"] == "Deploy to GitHub Pages"), {})
    verified = verify.get("completed_at") if verify.get("conclusion") == "success" else None
    snapshot = job("/ snapshot")
    route = job("route")
    consolidated = run["conclusion"] == "cancelled" and not route.get("started_at")
    phase_seconds = {}
    successful_step_seconds = []
    for step in steps:
        if step["conclusion"] != "success":
            continue
        name = step["name"]
        duration = elapsed(step.get("started_at"), step.get("completed_at"))
        if duration is not None:
            successful_step_seconds.append((duration, name))
        if name.startswith(("Prepare site files", "Point public media", "Upload GitHub Pages", "Remove verified R2")):
            phase_seconds[name] = duration
    runner_seconds = sum(elapsed(job.get("started_at"), job.get("completed_at")) or 0 for job in jobs)
    reports.append(dict(run=run["run_number"],sha=run["head_sha"],url=run["html_url"],status=run["status"],
        conclusion=run["conclusion"],builder=build.get("name"),scope=scope,preparation=mode,deploy_step=deployed.get("conclusion"),
        outcome=("verified" if verified else "consolidated into latest pending candidate" if consolidated
                 else "published; verification outstanding" if deployed.get("conclusion")=="success"
                 else run["conclusion"] or run["status"]),
        consolidated_pending=consolidated,
        build_phases_s=phase_seconds,
        slowest_build_steps=[{"name": name, "seconds": seconds}
                             for seconds, name in sorted(successful_step_seconds, reverse=True)[:10]],
        created_at=run["created_at"],
        artifact_compressed_bytes=sum(item.get("size_in_bytes", 0) for item in artifacts if not item.get("expired")),
        runner_seconds=runner_seconds,
        route_s=elapsed(route.get("started_at"), route.get("completed_at")),
        publish_s=elapsed(deployed.get("started_at"),deployed.get("completed_at")),
        verify_s=elapsed(verify.get("started_at"), verify.get("completed_at")),
        snapshot_s=elapsed(snapshot.get("started_at"), snapshot.get("completed_at")),
        snapshot_completed_at=snapshot.get("completed_at") if snapshot.get("conclusion")=="success" else None,
        queue_s=elapsed(run["created_at"],route.get("started_at")),
        build_s=elapsed(build.get("started_at"),build.get("completed_at")),
        push_to_verified_s=elapsed(run["created_at"],verified),
        push_to_snapshot_s=elapsed(run["created_at"], snapshot.get("completed_at")) if snapshot.get("conclusion") == "success" else None,
        verified_at=verified))
result={"runs":reports,"unpublished_build_seconds":sum(r["build_s"] or 0 for r in reports if r["status"]=="completed" and not r["verified_at"] and r["deploy_step"]!="success")}
groups = {}
for row in reports:
    if row["push_to_verified_s"] is not None:
        groups.setdefault(row["scope"], []).append(row["push_to_verified_s"])
result["verified_push_to_live"] = {
    scope: {
        "count":len(times),
        "median_s":median(times),
        "p95_s":sorted(times)[ceil(len(times)*0.95)-1],
        "target_s":FOCUSED_TARGET_SECONDS if scope == "focused" else FULL_TARGET_SECONDS,
        "p95_target_met":sorted(times)[ceil(len(times)*0.95)-1] <= (
            FOCUSED_TARGET_SECONDS if scope == "focused" else FULL_TARGET_SECONDS
        ),
    }
    for scope,times in groups.items()
}
queue_times = [r["queue_s"] for r in reports if r["queue_s"] is not None]
result["queue_wait"] = {
    "count": len(queue_times),
    "median_s": median(queue_times) if queue_times else None,
    "p95_s": sorted(queue_times)[ceil(len(queue_times)*0.95)-1] if queue_times else None,
    "target_s": QUEUE_TARGET_SECONDS,
    "p95_target_met": bool(queue_times) and (
        sorted(queue_times)[ceil(len(queue_times)*0.95)-1] <= QUEUE_TARGET_SECONDS
    ),
}
finished = [r for r in reports if r["status"]=="completed"]
published = [r for r in finished if r["deploy_step"]=="success" and r["verified_at"]]
result["completed_run_count"] = len(finished)
result["consolidated_pending_run_count"] = sum(r["consolidated_pending"] for r in finished)
result["unexpected_cancelled_run_count"] = sum(
    r["conclusion"] == "cancelled" and not r["consolidated_pending"] for r in finished
)
result["cancellation_rate"] = (
    sum(r["conclusion"] == "cancelled" for r in finished) / len(finished) if finished else None
)
result["unexpected_cancellation_rate"] = (
    result["unexpected_cancelled_run_count"] / len(finished) if finished else None
)
result["runner_seconds"] = sum(r["runner_seconds"] for r in finished)
result["runner_minutes"] = result["runner_seconds"] / 60
result["artifact_compressed_bytes"] = [
    {"run": r["run"], "bytes": r["artifact_compressed_bytes"]}
    for r in reports if r["artifact_compressed_bytes"]
]
result["builder_seconds_per_verified_publication"] = (
    sum(r["build_s"] or 0 for r in finished) / len(published) if published else None
)
if args.feature:
    request=Request("https://edmundeducation.com/release.json?check="+str(int(datetime.now().timestamp())),headers={"Cache-Control":"no-cache"})
    with urlopen(request,timeout=15) as stream:
        live=json.load(stream)["release"]
    relation=api(f"compare/{args.feature}...{live}")["status"]
    result.update(public_sha=live,feature=args.feature,contains_feature=relation in ("identical","ahead"))
    if result["contains_feature"]:
        for r in reversed(reports):
            if r["verified_at"] and api(f"compare/{args.feature}...{r['sha']}")["status"] in ("identical","ahead"):
                result["containing_verified_release"] = {
                    "run": r["run"],
                    "sha": r["sha"],
                    "url": r["url"],
                    "verified_at": r["verified_at"],
                }
                if args.requested_at and timestamp(r["verified_at"])>=timestamp(args.requested_at):
                    result["request_to_first_observed_verified_s"]=elapsed(args.requested_at,r["verified_at"])
                break
print(json.dumps(result,indent=2))
