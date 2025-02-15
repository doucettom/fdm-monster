import { authenticate, withPermission } from "@/middleware/authenticate";
import { createController } from "awilix-express";
import { AppConstants } from "@/server.constants";
import { PERMS } from "@/constants/authorization.constants";
import { validateInput } from "@/handlers/validators";
import { PrintCompletionSocketIoTask } from "@/tasks/print-completion.socketio.task";
import { Request, Response } from "express";
import { IPrintCompletionService } from "@/services/interfaces/print-completion.service";

export class PrintCompletionController {
  private printCompletionService: IPrintCompletionService;
  private printCompletionSocketIoTask: PrintCompletionSocketIoTask;

  constructor({
    printCompletionService,
    printCompletionSocketIoTask,
  }: {
    printCompletionService: IPrintCompletionService;
    printCompletionSocketIoTask: PrintCompletionSocketIoTask;
  }) {
    this.printCompletionService = printCompletionService;
    this.printCompletionSocketIoTask = printCompletionSocketIoTask;
  }

  /**
   * Not a production ready call, just for testing.
   */
  async test(req: Request, res: Response) {
    const result = await this.printCompletionService.loadPrintContexts();
    res.send(result);
  }

  contexts(req: Request, res: Response) {
    const contexts = this.printCompletionSocketIoTask.contexts;
    res.send(contexts);
  }

  async findCorrelatedEntries(req: Request, res: Response) {
    const { correlationId } = await validateInput(req.params, { correlationId: "required|string" });
    const result = await this.printCompletionService.findPrintCompletion(correlationId);
    res.send(result);
  }

  async list(req: Request, res: Response) {
    const completions = await this.printCompletionService.listGroupByPrinterStatus();
    res.send(completions);
  }
}

export default createController(PrintCompletionController)
  .prefix(AppConstants.apiRoute + "/print-completion")
  .before([authenticate()])
  .get("/", "list", withPermission(PERMS.PrintCompletion.List))
  .get("/test", "test", withPermission(PERMS.PrintCompletion.List))
  .get("/contexts", "contexts", withPermission(PERMS.PrintCompletion.List))
  .get("/:correlationId", "findCorrelatedEntries", withPermission(PERMS.PrintCompletion.Default));
