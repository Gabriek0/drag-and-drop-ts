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

  private submitHandler(event: SubmitEvent) {
    event.preventDefault();

    console.table({
      title: this.titleInputElement.value,
      description: this.descriptionInputElement.value,
      people: this.peopleInputElement.value,
    });
  }

  private configure() {
    this.element.addEventListener("submit", (event) =>
      this.submitHandler(event)
    );
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectInputInstance = new ProjectInput();
