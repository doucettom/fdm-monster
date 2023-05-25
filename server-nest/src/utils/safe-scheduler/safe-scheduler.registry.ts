import { Injectable, Logger } from "@nestjs/common";
import { CronJob } from "cron";
import { DUPLICATE_SCHEDULER, NO_SCHEDULER_FOUND } from "@nestjs/schedule/dist/schedule.messages";
import { InjectSentry, SentryService } from "@ntegral/nestjs-sentry";
import { errorSummary } from "@/utils/error.utils";

// Overrides SchedulerRegistry
@Injectable()
export class SafeSchedulerRegistry {
  /**
   * @deprecated Use the `doesExist` method instead.
   */
  // TODO(v2): drop this.
  doesExists = this.doesExist;
  private readonly logger = new Logger(SafeSchedulerRegistry.name);
  private readonly cronJobs = new Map<string, CronJob>();
  private readonly timeouts = new Map<string, any>();
  private readonly intervals = new Map<string, any>();

  constructor(@InjectSentry() private sentry: SentryService) {}

  doesExist(type: "cron" | "timeout" | "interval", name: string) {
    switch (type) {
      case "cron":
        return this.cronJobs.has(name);
      case "interval":
        return this.intervals.has(name);
      case "timeout":
        return this.timeouts.has(name);
      default:
        return false;
    }
  }

  getCronJob(name: string) {
    const ref = this.cronJobs.get(name);
    if (!ref) {
      throw new Error(NO_SCHEDULER_FOUND("Cron Job", name));
    }
    return ref;
  }

  getInterval(name: string) {
    const ref = this.intervals.get(name);
    if (typeof ref === "undefined") {
      throw new Error(NO_SCHEDULER_FOUND("Interval", name));
    }
    return ref;
  }

  getTimeout(name: string) {
    const ref = this.timeouts.get(name);
    if (typeof ref === "undefined") {
      throw new Error(NO_SCHEDULER_FOUND("Timeout", name));
    }
    return ref;
  }

  addCronJob(name: string, job: CronJob) {
    const ref = this.cronJobs.get(name);
    if (ref) {
      throw new Error(DUPLICATE_SCHEDULER("Cron Job", name));
    }

    job.fireOnTick = this.wrapFunctionInTryCatchBlocks(job.fireOnTick, job);
    this.cronJobs.set(name, job);
  }

  addInterval<T = any>(name: string, intervalId: T) {
    const ref = this.intervals.get(name);
    if (ref) {
      throw new Error(DUPLICATE_SCHEDULER("Interval", name));
    }
    this.intervals.set(name, intervalId);
  }

  addTimeout<T = any>(name: string, timeoutId: T) {
    const ref = this.timeouts.get(name);
    if (ref) {
      throw new Error(DUPLICATE_SCHEDULER("Timeout", name));
    }
    this.timeouts.set(name, timeoutId);
  }

  getCronJobs(): Map<string, CronJob> {
    return this.cronJobs;
  }

  deleteCronJob(name: string) {
    const cronJob = this.getCronJob(name);
    cronJob.stop();
    this.cronJobs.delete(name);
  }

  getIntervals(): string[] {
    return [...this.intervals.keys()];
  }

  deleteInterval(name: string) {
    const interval = this.getInterval(name);
    clearInterval(interval);
    this.intervals.delete(name);
  }

  getTimeouts(): string[] {
    return [...this.timeouts.keys()];
  }

  deleteTimeout(name: string) {
    const timeout = this.getTimeout(name);
    clearTimeout(timeout);
    this.timeouts.delete(name);
  }

  private wrapFunctionInTryCatchBlocks(methodRef: Function, instance: object): Function {
    return async (...args: unknown[]) => {
      try {
        await methodRef.call(instance, ...args);
      } catch (e) {
        this.logger.error(`Error in dynamically added Cron/Interval/Timeout task - ${errorSummary(e)}`);
        this.sentry.instance().captureException(e);
      }
    };
  }
}
