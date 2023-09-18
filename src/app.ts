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
type Listener = (projects: Projects) => void;
type Listeners = Listener[];

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
// Project State Management Class
class ProjectState {
  private listeners: Listeners = []; // listeners list
  private projects: Projects = [];
  private static instance: ProjectState;

  private constructor() {}

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

  public addListener(listenerFunction: Listener) {
    this.listeners.push(listenerFunction);
  }
}

// global constant instantiating ProjectState class
const projectState = ProjectState.getSingleInstance();

// Project Input Class
class ProjectInput {
  // Main Elements
  element: HTMLFormElement;
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;

  // Inputs
  titleInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLTextAreaElement;

  constructor() {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-input")
    );

    this.hostElement = <HTMLDivElement>document.getElementById("app");

    const htmlContent = document.importNode(this.templateElement.content, true);

    this.element = <HTMLFormElement>htmlContent.firstElementChild;
    this.element.setAttribute("id", "user-input");

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
    this.attach();
  }

  @AutoBind
  private submitHandler(event: SubmitEvent) {
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

  private clearInputs() {
    this.titleInputElement.value = "";
    this.peopleInputElement.value = "";
    this.descriptionInputElement.value = "";
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

// Project List Class
class ProjectList {
  element: HTMLElement;
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;

  assignedProject: Projects;

  constructor(private elementId: ElementId) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-list")
    );
    this.hostElement = <HTMLDivElement>document.getElementById("app");
    this.assignedProject = [];

    const htmlContent = document.importNode(this.templateElement.content, true);
    this.element = <HTMLFormElement>htmlContent.firstElementChild;

    // element id will be dynamic
    this.element.id = `${this.elementId}-projects`;

    projectState.addListener((projects: Projects) => {
      const relevantProjects = projects.filter((project) => {
        if (this.elementId === "active") {
          return project.status === ProjectStatus.Active;
        }

        return project.status === ProjectStatus.Finished;
      });

      this.assignedProject = relevantProjects;
      this.renderProjects();
    });

    this.attach();
    this.renderInternalContentInLists();
  }

  // Methods
  private renderProjects() {
    const listElement = <HTMLUListElement>(
      document.getElementById(`${this.elementId}-project-list`)
    );

    while (listElement.firstChild) {
      listElement.removeChild(listElement.firstChild);
    }

    for (const projectItem of this.assignedProject) {
      const listItem = document.createElement("li");
      listItem.textContent = projectItem.title;
      listElement.appendChild(listItem);
    }
  }

  private renderInternalContentInLists() {
    const listId = `${this.elementId}-project-list`;
    const listTitle = `${this.elementId.toUpperCase()} PROJECTS`;

    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = listTitle;
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

const projectInputInstance = new ProjectInput();
const projectsListActiveInstance = new ProjectList("active");
const projectsListFinishedInstance = new ProjectList("finished");
