import { WorkerEntrypoint } from 'cloudflare:workers';
import scheduler, { processEmailJobs } from './index.js';
export default scheduler;
// Accessible only through an explicitly configured Cloudflare service binding.
export class FeedbackMailer extends WorkerEntrypoint {
  async deliver() { return processEmailJobs(this.env, 10); }
}
