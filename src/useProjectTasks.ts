import { useCallback } from "react";
import useSWR from "swr";
import Mocks, { MockTask } from "./mocks";
import { Osdk } from "@osdk/client";
import { ExampleVi48osdkTodoProject, ExampleVi48osdkTodoTask } from "@tutorial-to-do-application/sdk";

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

  const createTask: (
    title: string,
  ) => Promise<MockTask["$primaryKey"] | undefined> = useCallback(
    async (title) => {
      if (project == null) {
        return undefined;
      }
      // Try to implement this with the Ontology SDK!
      const id = await Mocks.createTask({
        title,
        projectId: project.$primaryKey,
      });
      await mutate();
      return id;
    },
    [project, mutate],
  );

  const deleteTask: (task: MockTask) => Promise<void> = useCallback(
    async (task) => {
      if (project == null) {
        return;
      }
      await sleep(1000);
      // Try to implement this with the Ontology SDK!
      await Mocks.deleteTask(task.$primaryKey);
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
