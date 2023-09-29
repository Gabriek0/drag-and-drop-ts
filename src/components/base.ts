type ComponentDTO = {
  elementId?: string;
  hostElementId: string;
  templateElementId: string;
  insertPosition: InsertPosition;
};

/**
 *
 * A generic component class that can be extended for creating custom components.
 * @template T - The type of the element that this component represents.
 * @template U - The type of the hostElement where this component will be attached.
 */
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
