"""Prefect 3.x nightly data pipeline for HomeBase."""

import subprocess
import os
import httpx
from prefect import flow, task
from prefect.schedules import CronSchedule


@task(name="ingest-toronto", retries=2)
def ingest_toronto() -> None:
    import sys
    sys.path.insert(0, os.path.dirname(__file__) + "/../ingestion")
    from ingest_toronto import run
    run()


@task(name="ingest-transit", retries=2)
def ingest_transit() -> None:
    import sys
    sys.path.insert(0, os.path.dirname(__file__) + "/../ingestion")
    from ingest_transit import run
    run()


@task(name="dbt-run", retries=1)
def dbt_run() -> None:
    dbt_dir = os.path.join(os.path.dirname(__file__), "../dbt")
    result = subprocess.run(
        ["dbt", "run", "--profiles-dir", dbt_dir],
        cwd=dbt_dir,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"dbt run failed:\n{result.stdout}\n{result.stderr}")


@task(name="dbt-test", retries=1)
def dbt_test() -> None:
    dbt_dir = os.path.join(os.path.dirname(__file__), "../dbt")
    result = subprocess.run(
        ["dbt", "test", "--profiles-dir", dbt_dir],
        cwd=dbt_dir,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"dbt test failed:\n{result.stdout}\n{result.stderr}")


def notify_slack(message: str) -> None:
    webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return
    try:
        httpx.post(webhook_url, json={"text": message}, timeout=10)
    except Exception:
        pass


@flow(
    name="homebase-nightly",
    description="Ingest listings, run dbt models, validate data quality",
)
def nightly_pipeline() -> None:
    try:
        ingest_toronto()
        ingest_transit()
        dbt_run()
        dbt_test()
    except Exception as exc:
        notify_slack(f":x: HomeBase nightly pipeline failed: {exc}")
        raise


if __name__ == "__main__":
    nightly_pipeline.serve(
        name="homebase-nightly-deployment",
        cron="0 2 * * *",
    )
