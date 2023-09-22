// Interface Drag & Drop

// This interface will be to ProjectItem class
interface Draggable {
  dragStartHandler: (event: DragEvent) => void;
  dragEndHandler: (event: DragEvent) => void;
}

// This interface will be to ProjectList Class
/**
 *
 * @param dropHandler The element was dropped
 * @param dropOverHandler The element is being dragged
 * @param dropLeaveHandler The visual feedback to user, if element is draggable into the blocked area
 */
interface DragTarget {
  dropHandler: (event: DragEvent) => void;
  dragOverHandler: (event: DragEvent) => void;
  dragLeaveHandler: (event: DragEvent) => void;
}

// Types
enum ProjectStatus {
  Active,
  Finished,
}

type Project = {
  id: string;
  title: string;
  description: string;
  people: number;
  status: ProjectStatus;
};

type Validatable = {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  max?: number;
  min?: number;
};

type ElementId = "active" | "finished";
type Projects = Project[];
type Listener<T> = (projects: T[]) => void;

// type Listeners = Listener[];

type ComponentDTO = {
  elementId?: string;
  hostElementId: string;
  templateElementId: string;
  insertPosition: InsertPosition;
};

type StateDTO<T> = {
  listeners: Listener<T>;
};

type ProjectItemDTO = {
  project: Project;
  hostElementId: string;
};

// Decorators
// method decorators use three parameters, target, methodName, and descriptor.
function AutoBind(_: any, __: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedPropertyDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const bindFunction = originalMethod.bind(this);

      return bindFunction;
    },
  };

  return adjustedPropertyDescriptor;
}

// Functions
function validate(validatable: Validatable) {
  const {
    value: prevValue,
    required,
    minLength,
    maxLength,
    min,
    max,
  } = validatable;

  let isValid: boolean = true;
  let value = prevValue;

  const isString = typeof value === "string";
  const isNumber = typeof value === "number";

  const hasMinLength = minLength != null;
  const hasMaxLength = maxLength != null;

  const hasMin = min != null;
  const hasMax = max != null;

  if (required) {
    isValid = value.toString().length > 0;
  }

  if (isString) {
    value = value.toString().trim();

    if (hasMinLength) {
      isValid = value.length > minLength;
    }

    if (hasMaxLength) {
      isValid = value.length < maxLength;
    }
  }

  if (isNumber) {
    value = Number(value);

    if (hasMin) {
      isValid = value > min;
    }

    if (hasMax) {
      isValid = value < max;
    }
  }

  return isValid;
}

// Classes
// Component Base Class
/**
 *
 * A generic component class that can be extended for creating custom components.
 * @template T - The type of the element that this component represents.
 * @template U - The type of the hostElement where this component will be attached.
 */
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  element: T;
  hostElement: U;
  templateElement: HTMLTemplateElement;

  constructor(props: ComponentDTO) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById(props.templateElementId)
    );

    this.hostElement = <U>document.getElementById(props.hostElementId);

    const htmlContent = document.importNode(this.templateElement.content, true);

    this.element = <T>htmlContent.firstElementChild;

    if (props.elementId) this.element.id = props.elementId;

    this.attach(props.insertPosition);
  }

  private attach(position: InsertPosition) {
    this.hostElement.insertAdjacentElement(position, this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// State Base Class
abstract class State<T> {
  protected listeners: Listener<T>[] = [];

  constructor() {}

  public addListener(listenerFunction: Listener<T>) {
    this.listeners.push(listenerFunction);
  }
}

// Project State Management Class
class ProjectState extends State<Project> {
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

  public addProject(project: Omit<Project, "id">) {
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

    for (const listener of this.listeners) {
      // slice return a copy of array
      // this will be avoid bugs with the projects state
      // because will be a unique state for each
      listener(this.projects.slice());
    }
  }
}

// global constant instantiating ProjectState class
const projectState = ProjectState.getSingleInstance();

// Project Input Class
class ProjectInput extends Component<HTMLFormElement, HTMLDivElement> {
  // Inputs
  titleInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLTextAreaElement;

  constructor() {
    super({
      hostElementId: "app",
      elementId: "user-input",
      insertPosition: "afterbegin",
      templateElementId: "project-input",
    });

    this.titleInputElement = <HTMLInputElement>(
      this.element.querySelector("#title")
    );

    this.peopleInputElement = <HTMLInputElement>(
      this.element.querySelector("#people")
    );

    this.descriptionInputElement = <HTMLTextAreaElement>(
      this.element.querySelector("#description")
    );

    // Call methods
    this.configure();
  }

  configure(): void {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent(): void {}

  @AutoBind
  private submitHandler(event: SubmitEvent): void {
    event.preventDefault();

    const inputs = this.gatherUserInput();
    const isArray = Array.isArray(inputs);

    if (!isArray) return;

    const [title, description, people] = inputs;

    projectState.addProject({
      title: title,
      description: description,
      people: people,
      status: ProjectStatus.Active,
    });

    this.clearInputs();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredPeople = this.peopleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;

    const title = validate({ value: enteredTitle, required: true });
    const description = validate({
      value: enteredDescription,
      required: true,
      minLength: 5,
    });
    const people = validate({
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 10,
    });

    const isValid = title && description && people;

    if (isValid) return [enteredTitle, enteredDescription, +enteredPeople];

    return alert("There are fields empty or invalid.");
  }

  private clearInputs(): void {
    this.titleInputElement.value = "";
    this.peopleInputElement.value = "";
    this.descriptionInputElement.value = "";
  }
}

// Project Item Class
class ProjectItem
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

  dragStartHandler(event: DragEvent) {
    console.log("DragStart", event);
  }
  dragEndHandler(event: DragEvent) {
    console.log("DragEnd", event);
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

// Project List Class
class ProjectList extends Component<HTMLElement, HTMLDivElement> {
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
  configure(): void {
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
    <HTMLUListElement>document.getElementById(`${this.elementId}-project-list`);

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

      // const listItem = document.createElement("li");
      // listItem.textContent = projectItem.title;
      // listElement.appendChild(listItem);
    }
  }

  private renderInternalContentInLists() {
    const listId = `${this.elementId}-project-list`;
    const listTitle = `${this.elementId.toUpperCase()} PROJECTS`;

    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = listTitle;
  }
}

const projectInputInstance = new ProjectInput();
const projectsListActiveInstance = new ProjectList("active");
const projectsListFinishedInstance = new ProjectList("finished");
