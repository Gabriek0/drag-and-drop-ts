namespace App {
  export type Projects = Project[];
  type Listener<T> = (projects: T[]) => void;

  type MoveProjectDTO = {
    projectId: string;
    status: ProjectStatus;
  };

  // State Base Class
  abstract class State<T> {
    protected listeners: Listener<T>[] = [];

    constructor() {}

    public addListener(listenerFunction: Listener<T>) {
      this.listeners.push(listenerFunction);
    }
  }

  // Project State Management Class
  export class ProjectState extends State<Project> {
    //private listeners: Listeners = []; // listeners list
    private projects: Projects = [];
    private static instance: ProjectState;

    private constructor() {
      super();
    }

    static getSingleInstance() {
      if (!this.instance) {
        this.instance = new ProjectState();
        return this.instance;
      }

      return this.instance;
    }

    public addProject(project: Omit<Project, "id">): void {
      const id = Math.random().toString();
      const { title, people, description, status } = project;

      const newProject: Project = {
        id,
        title,
        description,
        people,
        status,
      };

      this.projects.push(newProject);
      this.updateListeners();
    }

    public moveProject(props: MoveProjectDTO): void {
      const project =
        this.projects.find((project) => project.id === props.projectId) ?? null;

      if (!project) return;
      if (project.status === props.status) return;

      project.status = props.status;
      this.updateListeners();
    }

    private updateListeners(): void {
      for (const listener of this.listeners) {
        // slice return a copy of array
        // this will be avoid bugs with the projects state
        // because will be a unique state for each
        listener(this.projects.slice());
      }
    }
  }

  // global constant instantiating ProjectState class
  export const projectState = ProjectState.getSingleInstance();
}
