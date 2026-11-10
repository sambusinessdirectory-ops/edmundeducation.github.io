'use strict';

const FINAL_ERRORS = new Set([
  'deployment_failed',
  'deployment_content_failed',
  'deployment_cancelled',
  'deployment_lost',
]);

module.exports = async function deployPagesLongPoll({
  github,
  context,
  core,
  artifactName,
  maxAttempts = 90,
  intervalMs = 10000,
  sleep = delay => new Promise(resolve => setTimeout(resolve, delay)),
}) {
  const { data } = await github.rest.actions.listWorkflowRunArtifacts({
    ...context.repo,
    run_id: context.runId,
    per_page: 100,
  });
  const artifacts = data.artifacts.filter(artifact => artifact.name === artifactName && !artifact.expired);
  if (artifacts.length !== 1) {
    throw new Error(`Expected one active Pages artifact named ${artifactName}; found ${artifacts.length}.`);
  }

  const idToken = await core.getIDToken();
  const { data: deployment } = await github.request('POST /repos/{owner}/{repo}/pages/deployments', {
    ...context.repo,
    artifact_id: artifacts[0].id,
    pages_build_version: context.sha,
    oidc_token: idToken,
  });
  const deploymentId = deployment.id || deployment.status_url?.split('/').pop() || context.sha;
  core.info(`Created Pages deployment ${deploymentId} for ${context.sha}.`);
  core.setOutput('pending', 'true');

  let apiErrors = 0;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await sleep(intervalMs);
    try {
      const { data: status } = await github.request(
        'GET /repos/{owner}/{repo}/pages/deployments/{deploymentId}',
        { ...context.repo, deploymentId },
      );
      apiErrors = 0;
      core.info(`Pages deployment ${deploymentId}: ${status.status} (${attempt}/${maxAttempts}).`);
      if (status.status === 'succeed') {
        core.setOutput('pending', 'false');
        core.setOutput('page_url', status.page_url || deployment.page_url || '');
        return status;
      }
      if (FINAL_ERRORS.has(status.status)) {
        core.setOutput('pending', 'false');
        throw new Error(`Pages deployment ${deploymentId} ended with ${status.status}.`);
      }
    } catch (error) {
      if (/ended with deployment_/.test(error.message)) throw error;
      apiErrors += 1;
      core.warning(`Pages status request ${attempt} failed (${apiErrors}/30): ${error.message}`);
      if (apiErrors >= 30) throw error;
    }
  }

  throw new Error(
    `Pages deployment ${deploymentId} remained active after ${maxAttempts * intervalMs} ms. ` +
    'It was deliberately left running so reconciliation cannot be disrupted by cancellation.',
  );
};
