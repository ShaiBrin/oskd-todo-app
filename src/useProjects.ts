import { useCallback } from "react";
import useSWR from "swr";
import Mocks, { MockProject } from "./mocks";
import { Osdk, PageResult } from "@osdk/client";
import { exampleVi48CreateOsdkTodoProject, exampleVi48DeleteOsdkTodoProject, ExampleVi48osdkTodoProject } from "@tutorial-to-do-application/sdk";
import { client } from "./client";

function useProjects() {
  const { data, isLoading, isValidating, error, mutate } = useSWR<Osdk.Instance<ExampleVi48osdkTodoProject>[]>(
    "projects",
    async () => {
        try {
            const result: PageResult<Osdk.Instance<ExampleVi48osdkTodoProject>> = await client(ExampleVi48osdkTodoProject).fetchPage({
                $orderBy: {"name": "asc"},
                $pageSize: 50,
            });
            return result.data;
        } catch (error) {
            console.error("Failed to fetch projects", error);
            return [];
        }
    },
);

  const createProject: (name: string) => Promise<Osdk.Instance<ExampleVi48osdkTodoProject>["$primaryKey"]> = useCallback(
    async (name) => {
        const result = await client(exampleVi48CreateOsdkTodoProject).applyAction(
            { name, budget: 50 },
            { $returnEdits: true },
        );
      if (result.type !== "edits") {
            throw new Error("Expected edits to be returned");
        }
        await mutate();
        return result.addedObjects![0].primaryKey as Osdk.Instance<ExampleVi48osdkTodoProject>["$primaryKey"];
    },
    [mutate],
  );

  const deleteProject: (project: Osdk.Instance<ExampleVi48osdkTodoProject>) => Promise<void> = useCallback(
    async (project) => {
      await client(exampleVi48DeleteOsdkTodoProject).applyAction({
        "osdkTodoProject": project,
      });
      await mutate();
    },
    [mutate],
);

  return {
    projects: data,
    isLoading,
    isValidating,
    isError: error,
    createProject,
    deleteProject,
  };
}

export default useProjects;
