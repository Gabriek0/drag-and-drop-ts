/// <reference path="base.ts" />

namespace App {
  // Project Input Class
  export class ProjectInput extends Component<HTMLFormElement, HTMLDivElement> {
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
}
