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

    console.table({
      title: this.titleInputElement.value,
      description: this.descriptionInputElement.value,
      people: this.peopleInputElement.value,
    });
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectInputInstance = new ProjectInput();
