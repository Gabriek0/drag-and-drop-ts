// Interfaces
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  max?: number;
  min?: number;
}

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

    console.table({
      title,
      description,
      people,
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

const projectInputInstance = new ProjectInput();
