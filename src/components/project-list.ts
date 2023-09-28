/// <reference path="base.ts" />
/// <reference path="project-item.ts" />

namespace App {
  type ElementId = "active" | "finished";

  // Project List Class
  export class ProjectList
    extends Component<HTMLElement, HTMLDivElement>
    implements DragTarget
  {
    assignedProject: Projects;
    projectInstances: ProjectItem[] = [];

    constructor(private elementId: ElementId) {
      super({
        elementId: `${elementId}-projects`,
        hostElementId: "app",
        insertPosition: "beforeend",
        templateElementId: "project-list",
      });

      this.assignedProject = [];

      this.configure();
      this.renderInternalContentInLists();
    }

    // Methods
    dragOverHandler(event: DragEvent) {
      if (!event.dataTransfer) return;
      if (event.dataTransfer.types[0] !== "text/plain") return;

      event.preventDefault();

      const listElement = this.element.querySelector("ul");
      listElement?.classList.add("droppable");
    }

    dragLeaveHandler(_: DragEvent) {
      const listElement = this.element.querySelector("ul");
      listElement?.classList.remove("droppable");
    }

    dropHandler(event: DragEvent) {
      if (!event.dataTransfer) return;

      const projectId = event.dataTransfer.getData("text/plain");
      const status =
        this.elementId === "active"
          ? ProjectStatus.Active
          : ProjectStatus.Finished;

      projectState.moveProject({
        projectId,
        status,
      });
    }

    configure(): void {
      this.element.addEventListener("dragover", (event) =>
        this.dragOverHandler(event)
      );
      this.element.addEventListener("dragleave", (event) =>
        this.dragLeaveHandler(event)
      );
      this.element.addEventListener("drop", (event) => this.dropHandler(event));

      projectState.addListener((projects: Projects) => {
        const relevantProjects = projects.filter((project) => {
          if (this.elementId === "active") {
            return project.status === ProjectStatus.Active;
          }

          return project.status === ProjectStatus.Finished;
        });

        this.assignedProject = relevantProjects;
        this.renderContent();
      });
    }

    renderContent(): void {
      <HTMLUListElement>(
        document.getElementById(`${this.elementId}-project-list`)
      );

      for (const instance of this.projectInstances) {
        instance.element.remove();
      }

      this.projectInstances = [];

      const listId = this.element.querySelector("ul");
      if (!listId) return;

      for (const project of this.assignedProject) {
        const projectInstance = new ProjectItem({
          hostElementId: listId.id,
          project,
        });

        this.projectInstances.push(projectInstance);
      }
    }

    private renderInternalContentInLists() {
      const listId = `${this.elementId}-project-list`;
      const listTitle = `${this.elementId.toUpperCase()} PROJECTS`;

      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector("h2")!.textContent = listTitle;
    }
  }
}
