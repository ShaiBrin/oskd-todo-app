import { useCallback } from "react";
import useSWR from "swr";
import Mocks, { MockTask } from "./mocks";
import { Osdk } from "@osdk/client";
import { exampleVi48CreateOsdkTodoTask, exampleVi48DeleteOsdkTodoTask, ExampleVi48osdkTodoProject, ExampleVi48osdkTodoTask } from "@tutorial-to-do-application/sdk";
import { client } from "./client";

export function useProjectTasks(project: Osdk.Instance<ExampleVi48osdkTodoProject> | undefined) {
  const { data, isLoading, isValidating, error, mutate } = useSWR<
    Osdk.Instance<ExampleVi48osdkTodoTask>[]
  >(
    project != null ? `projects/${project.id}/tasks` : null,
    async () => {
      if (project == null) {
        return [];
      }
      const tasks = [];
      for await (const task of project.$link.exampleVi48OsdkTodoTasks.asyncIter()) {
          tasks.push(task);
      }
      return tasks;
    },
  );

  function getLocalDate(date: Date) {
    const offset = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offset).toISOString().split("T")[0];
  }

  const createTask: (
    title: string,
    description?: string,
  ) => Promise<Osdk.Instance<ExampleVi48osdkTodoTask>["$primaryKey"] | undefined> = useCallback(
    async (title, description) => {
      if (project == null) {
        return undefined;
      }

      const startDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(startDate.getDate() + 7);
      const result = await client(exampleVi48CreateOsdkTodoTask).applyAction(
        {
          title,
          description,
          start_date: getLocalDate(startDate),
          due_date: getLocalDate(dueDate),
          status: "IN PROGRESS",
          project_id: project.$primaryKey,
        },
        { $returnEdits: true },
      );

      if (result.type !== "edits") {
        throw new Error("Expected edits to be returned");
      }

      await mutate();
      return result.addedObjects![0].primaryKey as Osdk.Instance<ExampleVi48osdkTodoTask>["$primaryKey"];
    },
    [project, mutate],
);

const deleteTask: (task: Osdk.Instance<ExampleVi48osdkTodoTask>) => Promise<void> = useCallback(
  async (task) => {
    if (project == null) {
      return;
    }
    await client(exampleVi48DeleteOsdkTodoTask).applyAction({
      "osdkTodoTask": task,
    });
    await mutate();
  },
  [project, mutate],
);

  return {
    tasks: data,
    isLoading,
    isValidating,
    isError: error,
    createTask,
    deleteTask,
  };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
