namespace App {
  // Types
  export enum ProjectStatus {
    Active,
    Finished,
  }

  export type Project = {
    id: string;
    title: string;
    description: string;
    people: number;
    status: ProjectStatus;
  };
}
