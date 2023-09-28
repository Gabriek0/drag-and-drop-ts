namespace App {
  type ProjectItemDTO = {
    project: Project;
    hostElementId: string;
  };

  // Project Item Class
  export class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable
  {
    private project: Project;

    get persons(): string {
      if (this.project.people === 1) {
        return `${this.project.people} Person assigned`;
      }

      return `${this.project.people} Persons assigned`;
    }

    constructor(props: ProjectItemDTO) {
      super({
        insertPosition: "beforeend",
        hostElementId: props.hostElementId,
        templateElementId: "single-project",
      });

      this.project = props.project;

      this.configure();
      this.renderContent();
    }

    dragStartHandler(event: DragEvent): void {
      if (!event.dataTransfer) return;

      event.dataTransfer.setData("text/plain", this.project.id);
      event.dataTransfer.effectAllowed = "move";
    }

    dragEndHandler(event: DragEvent) {
      if (!event.dataTransfer) return;

      // event.dataTransfer.clearData("text/plain");
    }

    configure(): void {
      this.element.addEventListener("dragstart", (event) =>
        this.dragStartHandler(event)
      );
      this.element.addEventListener("dragend", (event) =>
        this.dragEndHandler(event)
      );
    }

    renderContent(): void {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("h3")!.textContent = this.persons;
      this.element.querySelector("p")!.textContent = this.project.description;
    }
  }
}
