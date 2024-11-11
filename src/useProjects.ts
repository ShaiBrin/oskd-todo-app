import { useCallback } from "react";
import useSWR from "swr";
import Mocks, { MockProject } from "./mocks";
import { Osdk, PageResult } from "@osdk/client";
import { ExampleVi48osdkTodoProject } from "@tutorial-to-do-application/sdk";
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

  const createProject: (name: string) => Promise<MockProject["$primaryKey"]> =
    useCallback(
      async (name) => {
        // Try to implement this with the Ontology SDK!
        const id = await Mocks.createProject({ name });
        await mutate();
        return id;
      },
      [mutate],
    );

  const deleteProject: (project: MockProject) => Promise<void> = useCallback(
    async (project) => {
      // Try to implement this with the Ontology SDK!
      await Mocks.deleteProject(project.$primaryKey);
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
